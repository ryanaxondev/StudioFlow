import { eq, notLike } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { disableAccount } from "../../src/modules/auth/account-service";
import { requestAccessLink } from "../../src/modules/auth/access-service";
import type { AuthenticationEmailSender } from "../../src/modules/auth/email";
import {
  AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
  createQueuedAuthenticationEmailSender,
  revealAuthenticationMagicLink,
} from "../../src/modules/auth/email-outbox";
import { createStudioFlowAuth } from "../../src/modules/auth/server/auth";
import { validateStoredSession } from "../../src/modules/auth/session-policy";
import {
  createRateLimitKey,
  consumeAuthenticationRateLimit,
} from "../../src/modules/auth/rate-limit";
import { ACCESS_REQUEST_RATE_LIMIT } from "../../src/modules/auth/constants";
import {
  outboxEvents,
  sessions,
  users,
  verifications,
} from "../../src/db/schema";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const baseUrl = "http://127.0.0.1:3000";
const testEnvironment = {
  NODE_ENV: "test" as const,
  BETTER_AUTH_URL: baseUrl,
  BETTER_AUTH_SECRET: "studioflow-authentication-test-secret-1234567890",
};

class RecordingEmailSender implements AuthenticationEmailSender {
  readonly messages: { to: string; url: string }[] = [];

  async sendMagicLink(message: { to: string; url: string }): Promise<void> {
    this.messages.push(message);
  }
}

function requestHeaders(ip = "203.0.113.10"): Headers {
  return new Headers({
    origin: baseUrl,
    referer: `${baseUrl}/access`,
    "x-forwarded-for": ip,
  });
}

function sessionCookie(response: Response): string {
  const setCookie = response.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/studioflow\.session_token=[^;,\s]+/);

  if (!match) {
    throw new Error("Expected a StudioFlow session cookie.");
  }

  return match[0];
}

describe("M05 authentication foundation", () => {
  let testDatabase: MigratedTestDatabase;

  beforeAll(async () => {
    testDatabase = await createMigratedTestDatabase();
  });

  beforeEach(async () => {
    const client = await testDatabase.database.pool.connect();
    try {
      await resetPublicSchemaData(client);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    await testDatabase?.drop();
  });

  async function createUser(email = "member@example.com") {
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({
        name: "StudioFlow Member",
        email,
      })
      .returning({ id: users.id, email: users.email });

    return user!;
  }

  function createAuthentication(emailSender: AuthenticationEmailSender) {
    return createStudioFlowAuth({
      database: testDatabase.database,
      environment: testEnvironment,
      emailSender,
      clock: createFixedClock("2026-08-09T21:00:00.000Z"),
    });
  }

  async function requestLink(options?: {
    email?: string;
    returnTo?: string;
    ip?: string;
    sender?: RecordingEmailSender;
  }) {
    const sender = options?.sender ?? new RecordingEmailSender();
    const authentication = createAuthentication(sender);
    const headers = requestHeaders(options?.ip);
    const result = await requestAccessLink({
      database: testDatabase.database,
      email: options?.email ?? "member@example.com",
      returnTo: options?.returnTo,
      requestIp: options?.ip ?? "203.0.113.10",
      requestHeaders: headers,
      clock: createFixedClock("2026-08-09T21:00:00.000Z"),
      issueMagicLink: async ({
        email,
        callbackURL,
        errorCallbackURL,
        headers: authHeaders,
      }) => {
        await authentication.api.signInMagicLink({
          body: {
            email,
            callbackURL,
            errorCallbackURL,
          },
          headers: authHeaders,
        });
      },
    });

    return { authentication, result, sender };
  }

  async function verifyLink(
    authentication: ReturnType<typeof createAuthentication>,
    url: string,
  ) {
    return authentication.handler(
      new Request(url, {
        method: "GET",
        headers: requestHeaders(),
        redirect: "manual",
      }),
    );
  }

  it("requests a 15-minute Magic Link and stores only its hash", async () => {
    await createUser();
    const before = Date.now();
    const { result, sender } = await requestLink({
      returnTo: "/account?from=access#identity",
    });

    expect(result).toEqual({ status: "request-sent" });
    expect(sender.messages).toHaveLength(1);
    expect(sender.messages[0]?.to).toBe("member@example.com");

    const link = new URL(sender.messages[0]!.url);
    const rawToken = link.searchParams.get("token");
    expect(rawToken).toBeTruthy();
    expect(link.searchParams.get("callbackURL")).toBe(
      "/account?from=access#identity",
    );

    const [verification] = await testDatabase.database.db
      .select()
      .from(verifications)
      .where(notLike(verifications.identifier, "studioflow:auth-rate-limit:%"));

    expect(verification).toBeDefined();
    expect(verification!.identifier).not.toContain(rawToken!);
    expect(verification!.value).not.toContain(rawToken!);
    expect(verification!.expiresAt.getTime()).toBeGreaterThanOrEqual(
      before + 14 * 60 * 1000,
    );
    expect(verification!.expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + 16 * 60 * 1000,
    );
  });

  it("queues protected Magic Link delivery without plaintext credentials", async () => {
    const user = await createUser();
    const messageEnvironment = {
      NODE_ENV: "test" as const,
      AUTH_MESSAGE_ENCRYPTION_SECRET:
        "studioflow-authentication-message-test-secret-1234567890",
    };
    const authentication = createAuthentication(
      createQueuedAuthenticationEmailSender(
        testDatabase.database,
        messageEnvironment,
      ),
    );

    const result = await requestAccessLink({
      database: testDatabase.database,
      email: user.email,
      returnTo: "/account",
      requestIp: "203.0.113.14",
      requestHeaders: requestHeaders("203.0.113.14"),
      clock: createFixedClock("2026-08-09T21:00:00.000Z"),
      issueMagicLink: async ({
        email,
        callbackURL,
        errorCallbackURL,
        headers,
      }) => {
        await authentication.api.signInMagicLink({
          body: { email, callbackURL, errorCallbackURL },
          headers,
        });
      },
    });

    expect(result).toEqual({ status: "request-sent" });

    const [event] = await testDatabase.database.db.select().from(outboxEvents);
    expect(event).toBeDefined();
    expect(event!.aggregateType).toBe("user");
    expect(event!.aggregateId).toBe(user.id);
    expect(event!.eventType).toBe(AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT);

    const serializedPayload = JSON.stringify(event!.payload);
    expect(serializedPayload).not.toContain(user.email);

    const revealed = revealAuthenticationMagicLink(
      event!.payload,
      messageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
    );
    const rawToken = new URL(revealed.url).searchParams.get("token");
    expect(revealed.to).toBe(user.email);
    expect(rawToken).toBeTruthy();
    expect(serializedPayload).not.toContain(rawToken!);
  });

  it("rejects an expired Magic Link", async () => {
    await createUser();
    const sender = new RecordingEmailSender();
    const { authentication } = await requestLink({ sender });

    await testDatabase.database.db
      .update(verifications)
      .set({ expiresAt: new Date(Date.now() - 1_000) })
      .where(notLike(verifications.identifier, "studioflow:auth-rate-limit:%"));

    const response = await verifyLink(authentication, sender.messages[0]!.url);
    const location = response.headers.get("location") ?? "";

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(location).toContain("error=INVALID_TOKEN");

    const storedSessions = await testDatabase.database.db
      .select()
      .from(sessions);
    expect(storedSessions).toHaveLength(0);
  });

  it("consumes a Magic Link once and creates a database session", async () => {
    const user = await createUser();
    const sender = new RecordingEmailSender();
    const { authentication } = await requestLink({ sender });

    const firstResponse = await verifyLink(
      authentication,
      sender.messages[0]!.url,
    );
    expect(firstResponse.status).toBeGreaterThanOrEqual(300);
    expect(firstResponse.status).toBeLessThan(400);

    const firstSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(firstSessions).toHaveLength(1);

    const [verifiedUser] = await testDatabase.database.db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    expect(verifiedUser!.emailVerified).toBe(true);
    expect(verifiedUser!.emailVerifiedAt?.toISOString()).toBe(
      "2026-08-09T21:00:00.000Z",
    );

    const secondResponse = await verifyLink(
      authentication,
      sender.messages[0]!.url,
    );
    expect(secondResponse.headers.get("location") ?? "").toContain(
      "error=INVALID_TOKEN",
    );

    const secondSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(secondSessions).toHaveLength(1);
  });

  it("binds a Magic Link to the email it was issued for", async () => {
    const intendedUser = await createUser("member@example.com");
    const otherUser = await createUser("other@example.com");
    const sender = new RecordingEmailSender();
    const { authentication } = await requestLink({
      email: intendedUser.email,
      sender,
    });

    await verifyLink(authentication, sender.messages[0]!.url);

    const intendedSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, intendedUser.id));
    const otherSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, otherUser.id));

    expect(intendedSessions).toHaveLength(1);
    expect(otherSessions).toHaveLength(0);
  });

  it("does not create or email an unknown account", async () => {
    const sender = new RecordingEmailSender();
    const { result } = await requestLink({
      email: "unknown@example.com",
      sender,
    });

    expect(result).toEqual({ status: "request-sent" });
    expect(sender.messages).toHaveLength(0);

    const storedUsers = await testDatabase.database.db.select().from(users);
    expect(storedUsers).toHaveLength(0);

    const authVerifications = await testDatabase.database.db
      .select()
      .from(verifications)
      .where(notLike(verifications.identifier, "studioflow:auth-rate-limit:%"));
    expect(authVerifications).toHaveLength(0);
  });

  it("keeps provider delivery failures indistinguishable from unknown accounts", async () => {
    await createUser();
    const result = await requestAccessLink({
      database: testDatabase.database,
      email: "member@example.com",
      requestIp: "203.0.113.15",
      requestHeaders: requestHeaders("203.0.113.15"),
      clock: createFixedClock("2026-08-09T21:00:00.000Z"),
      issueMagicLink: async () => {
        throw new Error("simulated provider failure");
      },
    });

    expect(result).toEqual({ status: "request-sent" });
  });

  it("rotates the session after a later Magic Link authentication", async () => {
    const user = await createUser();
    const sender = new RecordingEmailSender();
    const first = await requestLink({ sender, ip: "203.0.113.11" });
    await verifyLink(first.authentication, sender.messages[0]!.url);

    const [firstSession] = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));

    const second = await requestLink({ sender, ip: "203.0.113.12" });
    await verifyLink(second.authentication, sender.messages[1]!.url);

    const storedSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));

    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0]!.token).not.toBe(firstSession!.token);
  });

  it("refreshes the rolling session expiry after updateAge", async () => {
    const user = await createUser();
    const sender = new RecordingEmailSender();
    const { authentication } = await requestLink({ sender });
    const verifyResponse = await verifyLink(
      authentication,
      sender.messages[0]!.url,
    );
    const cookie = sessionCookie(verifyResponse);
    const beforeRefresh = new Date();

    await testDatabase.database.db
      .update(sessions)
      .set({
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
      .where(eq(sessions.userId, user.id));

    const readOnly = await authentication.api.getSession({
      headers: new Headers({ cookie }),
      query: {
        disableRefresh: true,
      },
      returnHeaders: true,
    });
    expect(readOnly.response?.user.id).toBe(user.id);
    expect(readOnly.headers.getSetCookie()).toHaveLength(0);

    const [beforeProviderRefresh] = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(beforeProviderRefresh!.expiresAt.getTime()).toBeLessThan(
      beforeRefresh.getTime() + 2 * 60 * 60 * 1000,
    );

    const refreshedSession = await authentication.api.getSession({
      headers: new Headers({ cookie }),
      returnHeaders: true,
    });
    expect(refreshedSession.response?.user.id).toBe(user.id);
    expect(
      refreshedSession.headers
        .getSetCookie()
        .some((value) => value.includes("studioflow.session_token=")),
    ).toBe(true);

    const [refreshed] = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(refreshed!.expiresAt.getTime()).toBeGreaterThan(
      beforeRefresh.getTime() + 13 * 24 * 60 * 60 * 1000,
    );
  });

  it("deletes a session after the 30-day absolute lifetime", async () => {
    const user = await createUser();
    const [session] = await testDatabase.database.db
      .insert(sessions)
      .values({
        userId: user.id,
        token: "absolute-expiry-session",
        expiresAt: new Date("2026-09-30T00:00:00.000Z"),
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      })
      .returning();

    const valid = await validateStoredSession(
      testDatabase.database,
      session!.id,
      user.id,
      new Date("2026-08-01T00:00:00.000Z"),
    );

    expect(valid).toBe(false);
    const remaining = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, session!.id));
    expect(remaining).toHaveLength(0);
  });

  it("disables an account and revokes all sessions immediately", async () => {
    const user = await createUser();
    const issuedSender = new RecordingEmailSender();
    const issued = await requestLink({
      sender: issuedSender,
      ip: "203.0.113.19",
    });

    await testDatabase.database.db.insert(sessions).values({
      userId: user.id,
      token: "session-before-disable",
      expiresAt: new Date("2026-09-01T00:00:00.000Z"),
    });

    const disabled = await disableAccount(
      testDatabase.database,
      user.id,
      createFixedClock("2026-08-09T21:00:00.000Z"),
    );
    expect(disabled).toBe(true);

    const [storedUser] = await testDatabase.database.db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    expect(storedUser!.disabledAt?.toISOString()).toBe(
      "2026-08-09T21:00:00.000Z",
    );

    const storedSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(storedSessions).toHaveLength(0);

    await verifyLink(issued.authentication, issuedSender.messages[0]!.url);
    const postDisableSessions = await testDatabase.database.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(postDisableSessions).toHaveLength(0);

    const sender = new RecordingEmailSender();
    const { result } = await requestLink({ sender, ip: "203.0.113.20" });
    expect(result).toEqual({ status: "request-sent" });
    expect(sender.messages).toHaveLength(0);
  });

  it("preserves safe local destinations and rejects external destinations", async () => {
    await createUser();
    const safeSender = new RecordingEmailSender();
    await requestLink({
      sender: safeSender,
      returnTo: "/account?section=identity#email",
      ip: "203.0.113.30",
    });
    const safeUrl = new URL(safeSender.messages[0]!.url);
    expect(safeUrl.searchParams.get("callbackURL")).toBe(
      "/account?section=identity#email",
    );

    const unsafeSender = new RecordingEmailSender();
    await requestLink({
      sender: unsafeSender,
      returnTo: "https://attacker.example/collect",
      ip: "203.0.113.31",
    });
    const unsafeUrl = new URL(unsafeSender.messages[0]!.url);
    expect(unsafeUrl.searchParams.get("callbackURL")).toBe("/account");
  });

  it("enforces the PostgreSQL-backed email and IP request limit", async () => {
    const clock = createFixedClock("2026-08-09T21:00:00.000Z");
    const keys = [
      createRateLimitKey("email", "limit@example.com"),
      createRateLimitKey("ip", "203.0.113.40"),
    ];

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        consumeAuthenticationRateLimit(testDatabase.database, {
          keys,
          rule: ACCESS_REQUEST_RATE_LIMIT,
          clock,
        }),
      ).resolves.toEqual({ allowed: true });
    }

    const limited = await consumeAuthenticationRateLimit(
      testDatabase.database,
      {
        keys,
        rule: ACCESS_REQUEST_RATE_LIMIT,
        clock,
      },
    );
    expect(limited).toMatchObject({
      allowed: false,
      retryAfterSeconds: 60,
    });

    const stored = await testDatabase.database.db
      .select({ identifier: verifications.identifier })
      .from(verifications);
    expect(stored).toHaveLength(10);
    expect(
      stored.every(({ identifier }) =>
        identifier.startsWith("studioflow:auth-rate-limit:"),
      ),
    ).toBe(true);
    expect(
      stored.some(({ identifier }) => identifier.includes("limit@example.com")),
    ).toBe(false);
    expect(
      stored.some(({ identifier }) => identifier.includes("203.0.113.40")),
    ).toBe(false);
  });
});
