import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientMembers,
  clientOrganizations,
  users,
  workspaceMembers,
  workspaces,
  type WorkspaceRole,
} from "../../db/schema";
import type { TransactionDatabase } from "../../db/transactions";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";

const clientManagerRoles = new Set<WorkspaceRole>([
  "AGENCY_OWNER",
  "DELIVERY_MANAGER",
]);

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

export async function requireActiveWorkspaceRole(
  db: TransactionDatabase,
  input: Readonly<{
    workspaceId: string;
    userId: string;
    allowedRoles: ReadonlySet<WorkspaceRole>;
  }>,
): Promise<WorkspaceRole> {
  const [membership] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, input.workspaceId),
        eq(workspaceMembers.userId, input.userId),
        eq(workspaceMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);

  if (!membership || !input.allowedRoles.has(membership.role)) {
    throw new Error("Active Workspace management membership is required.");
  }

  return membership.role;
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

export async function createClientOrganization(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    name: string;
    clock?: Clock;
  }>,
): Promise<Readonly<{ clientOrganizationId: string }>> {
  const clock = options.clock ?? systemClock;
  const name = options.name.trim();

  if (!name) {
    throw new Error("Client Organization name is required.");
  }

  return withTransaction(options.database, async ({ db }) => {
    await requireActiveWorkspaceRole(db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: clientManagerRoles,
    });

    const [organization] = await db
      .insert(clientOrganizations)
      .values({
        workspaceId: options.workspaceId,
        name,
        status: "ACTIVE",
        createdAt: clock.now(),
      })
      .returning({ id: clientOrganizations.id });

    if (!organization) {
      throw new Error("Client Organization creation did not return an id.");
    }

    return { clientOrganizationId: organization.id };
  });
}

export async function changeWorkspaceMembershipRole(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    targetUserId: string;
    role: WorkspaceRole;
  }>,
): Promise<boolean> {
  if (options.actorUserId === options.targetUserId) {
    throw new Error("Agency Owner cannot change their own Workspace role.");
  }

  return withTransaction(options.database, async ({ db }) => {
    await requireActiveWorkspaceRole(db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: workspaceOwnerRoles,
    });

    const updated = await db
      .update(workspaceMembers)
      .set({ role: options.role })
      .where(
        and(
          eq(workspaceMembers.workspaceId, options.workspaceId),
          eq(workspaceMembers.userId, options.targetUserId),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      )
      .returning({ userId: workspaceMembers.userId });

    return updated.length === 1;
  });
}

export async function revokeWorkspaceMembership(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    targetUserId: string;
    clock?: Clock;
  }>,
): Promise<boolean> {
  if (options.actorUserId === options.targetUserId) {
    throw new Error(
      "Agency Owner cannot revoke their own Workspace membership.",
    );
  }

  const clock = options.clock ?? systemClock;

  return withTransaction(options.database, async ({ db }) => {
    await requireActiveWorkspaceRole(db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: new Set<WorkspaceRole>(["AGENCY_OWNER"]),
    });

    const updated = await db
      .update(workspaceMembers)
      .set({
        status: "REVOKED",
        revokedAt: clock.now(),
      })
      .where(
        and(
          eq(workspaceMembers.workspaceId, options.workspaceId),
          eq(workspaceMembers.userId, options.targetUserId),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      )
      .returning({ userId: workspaceMembers.userId });

    return updated.length === 1;
  });
}

export async function revokeClientMembership(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    clientOrganizationId: string;
    targetUserId: string;
    clock?: Clock;
  }>,
): Promise<boolean> {
  const clock = options.clock ?? systemClock;

  return withTransaction(options.database, async ({ db }) => {
    await requireActiveWorkspaceRole(db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: clientManagerRoles,
    });

    const [organization] = await db
      .select({ id: clientOrganizations.id })
      .from(clientOrganizations)
      .where(
        and(
          eq(clientOrganizations.id, options.clientOrganizationId),
          eq(clientOrganizations.workspaceId, options.workspaceId),
          eq(clientOrganizations.status, "ACTIVE"),
        ),
      )
      .limit(1);

    if (!organization) {
      throw new Error(
        "Client Organization is not available in this Workspace.",
      );
    }

    const updated = await db
      .update(clientMembers)
      .set({
        status: "REVOKED",
        revokedAt: clock.now(),
      })
      .where(
        and(
          eq(clientMembers.workspaceId, options.workspaceId),
          eq(clientMembers.clientOrganizationId, options.clientOrganizationId),
          eq(clientMembers.userId, options.targetUserId),
          eq(clientMembers.status, "ACTIVE"),
        ),
      )
      .returning({ id: clientMembers.id });

    return updated.length === 1;
  });
}

export type ActiveMembershipContexts = Readonly<{
  workspaceMemberships: readonly Readonly<{
    workspaceId: string;
    role: WorkspaceRole;
  }>[];
  clientMemberships: readonly Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
  }>[];
}>;

export async function resolveActiveMembershipContexts(
  database: DatabaseClient,
  userId: string,
): Promise<ActiveMembershipContexts> {
  const [workspaceRows, clientRows] = await Promise.all([
    database.db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      ),
    database.db
      .select({
        workspaceId: clientMembers.workspaceId,
        clientOrganizationId: clientMembers.clientOrganizationId,
      })
      .from(clientMembers)
      .innerJoin(
        clientOrganizations,
        and(
          eq(clientOrganizations.id, clientMembers.clientOrganizationId),
          eq(clientOrganizations.workspaceId, clientMembers.workspaceId),
        ),
      )
      .where(
        and(
          eq(clientMembers.userId, userId),
          eq(clientMembers.status, "ACTIVE"),
          eq(clientOrganizations.status, "ACTIVE"),
        ),
      ),
  ]);

  return {
    workspaceMemberships: workspaceRows,
    clientMemberships: clientRows,
  };
}

export const workspaceOwnerRoles: ReadonlySet<WorkspaceRole> = new Set([
  "AGENCY_OWNER",
]);
export const workspaceClientManagerRoles: ReadonlySet<WorkspaceRole> =
  clientManagerRoles;
