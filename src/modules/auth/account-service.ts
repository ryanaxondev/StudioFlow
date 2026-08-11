import { eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { sessions, users } from "../../db/schema";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";

export async function disableAccount(
  database: DatabaseClient,
  userId: string,
  clock: Clock,
): Promise<boolean> {
  return withTransaction(database, async ({ db }) => {
    const now = clock.now();
    const disabledUsers = await db
      .update(users)
      .set({
        disabledAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (disabledUsers.length === 0) {
      return false;
    }

    await db.delete(sessions).where(eq(sessions.userId, userId));
    return true;
  });
}

export async function revokeUserSessions(
  database: DatabaseClient,
  userId: string,
): Promise<void> {
  await database.db.delete(sessions).where(eq(sessions.userId, userId));
}
