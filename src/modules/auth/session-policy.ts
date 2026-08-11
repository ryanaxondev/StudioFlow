import { and, eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { sessions, users } from "../../db/schema";
import { SESSION_ABSOLUTE_EXPIRES_IN_MS } from "./constants";

export function isPastAbsoluteSessionExpiry(
  createdAt: Date,
  now: Date,
): boolean {
  return now.getTime() - createdAt.getTime() >= SESSION_ABSOLUTE_EXPIRES_IN_MS;
}

export async function validateStoredSession(
  database: DatabaseClient,
  sessionId: string,
  userId: string,
  now: Date,
  options: Readonly<{ revokeInvalid?: boolean }> = {},
): Promise<boolean> {
  const [record] = await database.db
    .select({
      id: sessions.id,
      createdAt: sessions.createdAt,
      disabledAt: users.disabledAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);

  if (!record) {
    return false;
  }

  if (record.disabledAt || isPastAbsoluteSessionExpiry(record.createdAt, now)) {
    if (options.revokeInvalid !== false) {
      await database.db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    return false;
  }

  return true;
}
