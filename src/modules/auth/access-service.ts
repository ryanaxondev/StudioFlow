import { eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { users } from "../../db/schema";
import type { Clock } from "../../lib/clock";
import { ACCESS_REQUEST_RATE_LIMIT } from "./constants";
import {
  createRateLimitKey,
  consumeAuthenticationRateLimit,
} from "./rate-limit";
import { buildRecoveryPath, normalizeReturnTo } from "./redirects";

export type AccessLinkRequestResult =
  | Readonly<{ status: "request-sent" }>
  | Readonly<{ status: "rate-limited"; retryAfterSeconds: number }>;

export async function requestAccessLink(
  options: Readonly<{
    database: DatabaseClient;
    email: string;
    returnTo?: string;
    requestIp: string;
    requestHeaders: Headers;
    clock: Clock;
    issueMagicLink(
      input: Readonly<{
        email: string;
        callbackURL: string;
        errorCallbackURL: string;
        headers: Headers;
      }>,
    ): Promise<void>;
  }>,
): Promise<AccessLinkRequestResult> {
  const email = options.email.trim().toLowerCase();
  const returnTo = normalizeReturnTo(options.returnTo);
  const rateLimit = await consumeAuthenticationRateLimit(options.database, {
    keys: [
      createRateLimitKey("email", email),
      createRateLimitKey("ip", options.requestIp),
    ],
    rule: ACCESS_REQUEST_RATE_LIMIT,
    clock: options.clock,
  });

  if (!rateLimit.allowed) {
    return {
      status: "rate-limited",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  const [user] = await options.database.db
    .select({
      id: users.id,
      disabledAt: users.disabledAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.disabledAt) {
    return { status: "request-sent" };
  }

  try {
    await options.issueMagicLink({
      email,
      callbackURL: returnTo,
      errorCallbackURL: buildRecoveryPath(returnTo),
      headers: options.requestHeaders,
    });
  } catch {
    return { status: "request-sent" };
  }

  return { status: "request-sent" };
}
