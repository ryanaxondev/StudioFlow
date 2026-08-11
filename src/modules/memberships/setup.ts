import { eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { users, workspaceMembers, workspaces } from "../../db/schema";
import type { TransactionDatabase } from "../../db/transactions";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";

async function requireActiveUser(
  db: TransactionDatabase,
  userId: string,
): Promise<void> {
  const [user] = await db
    .select({ id: users.id, disabledAt: users.disabledAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.disabledAt) {
    throw new Error("Active user identity is required.");
  }
}

export async function createWorkspaceForControlledSetup(
  options: Readonly<{
    database: DatabaseClient;
    ownerUserId: string;
    name: string;
    description?: string | null;
    timezone: string;
    displayCurrency: string;
    clock?: Clock;
  }>,
): Promise<Readonly<{ workspaceId: string }>> {
  const clock = options.clock ?? systemClock;
  const now = clock.now();
  const name = options.name.trim();
  const timezone = options.timezone.trim();
  const displayCurrency = options.displayCurrency.trim().toUpperCase();

  if (!name || !timezone) {
    throw new Error("Workspace name and timezone are required.");
  }

  return withTransaction(options.database, async ({ db }) => {
    await requireActiveUser(db, options.ownerUserId);

    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        description: options.description?.trim() || null,
        timezone,
        displayCurrency,
        createdAt: now,
      })
      .returning({ id: workspaces.id });

    if (!workspace) {
      throw new Error("Workspace creation did not return an id.");
    }

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: options.ownerUserId,
      role: "AGENCY_OWNER",
      status: "ACTIVE",
      joinedAt: now,
    });

    return { workspaceId: workspace.id };
  });
}
