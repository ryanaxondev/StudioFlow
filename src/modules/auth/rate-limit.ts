import { createHash } from "node:crypto";

import type { Clock } from "../../lib/clock";
import type { DatabaseClient } from "../../db/client";
import { withTransaction } from "../../db/transactions";

const rateLimitPrefix = "studioflow:auth-rate-limit:";

export type AuthenticationRateLimitRule = Readonly<{
  windowSeconds: number;
  maxAttempts: number;
}>;

export type AuthenticationRateLimitResult =
  | Readonly<{ allowed: true }>
  | Readonly<{ allowed: false; retryAfterSeconds: number }>;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createRateLimitKey(
  dimension: "email" | "ip" | "verify-ip",
  value: string,
): string {
  return `${rateLimitPrefix}${dimension}:${digest(value.trim().toLowerCase())}`;
}

export function isAuthenticationRateLimitIdentifier(
  identifier: string,
): boolean {
  return identifier.startsWith(rateLimitPrefix);
}

export function readRequestIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")?.trim();
  if (forwardedFor && !forwardedFor.includes(",")) {
    return forwardedFor;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && !realIp.includes(",")) {
    return realIp;
  }

  return "unknown";
}

export async function consumeAuthenticationRateLimit(
  database: DatabaseClient,
  options: Readonly<{
    keys: readonly string[];
    rule: AuthenticationRateLimitRule;
    clock: Clock;
  }>,
): Promise<AuthenticationRateLimitResult> {
  const keys = [...new Set(options.keys)].sort();
  if (keys.length === 0) {
    return { allowed: true };
  }

  const now = options.clock.now();
  const expiresAt = new Date(now.getTime() + options.rule.windowSeconds * 1000);

  return withTransaction(database, async ({ client }) => {
    for (const key of keys) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    }

    await client.query(
      `DELETE FROM verifications
        WHERE identifier = ANY($1::text[])
          AND identifier LIKE $2
          AND expires_at <= $3`,
      [keys, `${rateLimitPrefix}%`, now],
    );

    const counts = await client.query<{
      identifier: string;
      attempt_count: string;
      earliest_expiry: Date;
    }>(
      `SELECT identifier,
              count(*)::text AS attempt_count,
              min(expires_at) AS earliest_expiry
         FROM verifications
        WHERE identifier = ANY($1::text[])
          AND identifier LIKE $2
          AND expires_at > $3
        GROUP BY identifier`,
      [keys, `${rateLimitPrefix}%`, now],
    );

    const limited = counts.rows
      .filter((row) => Number(row.attempt_count) >= options.rule.maxAttempts)
      .sort(
        (left, right) =>
          left.earliest_expiry.getTime() - right.earliest_expiry.getTime(),
      )[0];

    if (limited) {
      return {
        allowed: false as const,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((limited.earliest_expiry.getTime() - now.getTime()) / 1000),
        ),
      };
    }

    for (const key of keys) {
      await client.query(
        `INSERT INTO verifications (identifier, value, expires_at, created_at, updated_at)
         VALUES ($1, 'attempt', $2, $3, $3)`,
        [key, expiresAt, now],
      );
    }

    return { allowed: true as const };
  });
}
