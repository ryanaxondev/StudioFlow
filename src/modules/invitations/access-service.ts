import { eq } from "drizzle-orm";
import { z } from "zod";

import type { DatabaseClient } from "../../db/client";
import { users } from "../../db/schema";
import type { Clock } from "../../lib/clock";
import { requestAccessLink } from "../auth/access-service";
import { getInvitationPresentation } from "./presentation";

const displayNameSchema = z.string().trim().min(1).max(120);

export type InvitationAccessResult =
  | Readonly<{ status: "name-required" }>
  | Readonly<{ status: "request-sent" }>
  | Readonly<{ status: "rate-limited"; retryAfterSeconds: number }>
  | Readonly<{
      status:
        | "invalid"
        | "expired"
        | "revoked"
        | "already-accepted"
        | "target-unavailable";
    }>;

export async function prepareInvitationAccess(
  options: Readonly<{
    database: DatabaseClient;
    token: string;
    displayName?: string;
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
): Promise<InvitationAccessResult> {
  const presentation = await getInvitationPresentation(
    options.database,
    options.token,
    options.clock,
  );

  if (presentation.state !== "valid") {
    const mappedState =
      presentation.state === "accepted"
        ? "already-accepted"
        : presentation.state;
    return { status: mappedState };
  }

  if (!presentation.invitedEmail) {
    return { status: "invalid" };
  }

  const email = presentation.invitedEmail;
  const [existingUser] = await options.database.db
    .select({ id: users.id, disabledAt: users.disabledAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingUser) {
    const parsedName = displayNameSchema.safeParse(options.displayName);
    if (!parsedName.success) {
      return { status: "name-required" };
    }

    await options.database.db
      .insert(users)
      .values({
        name: parsedName.data,
        email,
        emailVerified: false,
        emailVerifiedAt: null,
        createdAt: options.clock.now(),
        updatedAt: options.clock.now(),
      })
      .onConflictDoNothing({ target: users.email });
  }

  const returnTo = `/invite/${encodeURIComponent(options.token)}`;
  const accessResult = await requestAccessLink({
    database: options.database,
    email,
    returnTo,
    requestIp: options.requestIp,
    requestHeaders: options.requestHeaders,
    clock: options.clock,
    issueMagicLink: options.issueMagicLink,
  });

  if (accessResult.status === "rate-limited") {
    return accessResult;
  }

  return { status: "request-sent" };
}
