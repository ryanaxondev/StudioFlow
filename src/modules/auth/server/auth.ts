import "server-only";

import { and, eq, isNull, ne } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { magicLink } from "better-auth/plugins";

import type { DatabaseClient } from "../../../db/client";
import { accounts, sessions, users, verifications } from "../../../db/schema";
import type { Clock } from "../../../lib/clock";
import { systemClock } from "../../../lib/clock";
import { getApplicationDatabase } from "../../../server/database";
import {
  MAGIC_LINK_EXPIRES_IN_SECONDS,
  SESSION_ROLLING_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from "../constants";
import type { AuthenticationEmailSender } from "../email";
import { createQueuedAuthenticationEmailSender } from "../email-outbox";
import {
  parseAuthenticationEnvironment,
  parseAuthenticationMessageEnvironment,
  type AuthenticationEnvironment,
} from "../environment";

export type CreateStudioFlowAuthOptions = Readonly<{
  database: DatabaseClient;
  environment: AuthenticationEnvironment;
  emailSender: AuthenticationEmailSender;
  clock?: Clock;
}>;

export function createStudioFlowAuth(options: CreateStudioFlowAuthOptions) {
  const clock = options.clock ?? systemClock;

  return betterAuth({
    appName: "StudioFlow",
    baseURL: options.environment.BETTER_AUTH_URL,
    secret: options.environment.BETTER_AUTH_SECRET,
    database: drizzleAdapter(options.database.db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    advanced: {
      cookiePrefix: "studioflow",
      useSecureCookies: options.environment.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: options.environment.NODE_ENV === "production",
      },
      database: {
        generateId: "uuid",
      },
    },
    session: {
      expiresIn: SESSION_ROLLING_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
      cookieCache: {
        enabled: false,
      },
    },
    rateLimit: {
      enabled: false,
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const [user] = await options.database.db
              .select({
                disabledAt: users.disabledAt,
              })
              .from(users)
              .where(eq(users.id, session.userId))
              .limit(1);

            if (!user || user.disabledAt) {
              return false;
            }

            return { data: session };
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (context) => {
        if (context.path !== "/magic-link/verify") {
          return;
        }

        const authenticatedUser = context.context.newSession?.user;
        if (!authenticatedUser) {
          return;
        }

        const now = clock.now();
        await options.database.db
          .update(users)
          .set({
            emailVerifiedAt: now,
            updatedAt: now,
          })
          .where(
            and(
              eq(users.id, authenticatedUser.id),
              isNull(users.emailVerifiedAt),
            ),
          );

        const authenticatedSession = context.context.newSession?.session;
        if (authenticatedSession) {
          await options.database.db
            .delete(sessions)
            .where(
              and(
                eq(sessions.userId, authenticatedUser.id),
                ne(sessions.id, authenticatedSession.id),
              ),
            );
        }
      }),
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
        disableSignUp: true,
        storeToken: "hashed",
        async sendMagicLink({ email, url }) {
          await options.emailSender.sendMagicLink({
            to: email,
            url,
          });
        },
      }),
    ],
  });
}

export type StudioFlowAuth = ReturnType<typeof createStudioFlowAuth>;

const globalAuthentication = globalThis as typeof globalThis & {
  studioflowAuthentication?: StudioFlowAuth;
};

export function getStudioFlowAuth(): StudioFlowAuth {
  if (!globalAuthentication.studioflowAuthentication) {
    const database = getApplicationDatabase();
    const environment = parseAuthenticationEnvironment(process.env);
    globalAuthentication.studioflowAuthentication = createStudioFlowAuth({
      database,
      environment,
      emailSender: createQueuedAuthenticationEmailSender(
        database,
        parseAuthenticationMessageEnvironment(process.env),
      ),
      clock: systemClock,
    });
  }

  return globalAuthentication.studioflowAuthentication;
}
