import { and, eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientMembers,
  clientOrganizations,
  workspaceMembers,
  type WorkspaceRole,
} from "../../db/schema";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";
import {
  canCreateClientOrganization,
  canManageAgencyMembers,
  canManageClientMembers,
} from "../authorization/policies";
import { authorizeWorkspaceCapability } from "../authorization/server/authorization";
import type { ActorContext } from "../authorization/types";

export async function createClientOrganization(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
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
    await authorizeWorkspaceCapability(
      db,
      options.actor,
      options.workspaceId,
      canCreateClientOrganization,
    );

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
    actor: ActorContext;
    workspaceId: string;
    targetUserId: string;
    role: WorkspaceRole;
  }>,
): Promise<boolean> {
  if (options.actor.userId === options.targetUserId) {
    throw new Error("Agency Owner cannot change their own Workspace role.");
  }

  return withTransaction(options.database, async ({ db }) => {
    await authorizeWorkspaceCapability(
      db,
      options.actor,
      options.workspaceId,
      canManageAgencyMembers,
    );

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
    actor: ActorContext;
    workspaceId: string;
    targetUserId: string;
    clock?: Clock;
  }>,
): Promise<boolean> {
  if (options.actor.userId === options.targetUserId) {
    throw new Error(
      "Agency Owner cannot revoke their own Workspace membership.",
    );
  }

  const clock = options.clock ?? systemClock;

  return withTransaction(options.database, async ({ db }) => {
    await authorizeWorkspaceCapability(
      db,
      options.actor,
      options.workspaceId,
      canManageAgencyMembers,
    );

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
    actor: ActorContext;
    workspaceId: string;
    clientOrganizationId: string;
    targetUserId: string;
    clock?: Clock;
  }>,
): Promise<boolean> {
  const clock = options.clock ?? systemClock;

  return withTransaction(options.database, async ({ db }) => {
    await authorizeWorkspaceCapability(
      db,
      options.actor,
      options.workspaceId,
      canManageClientMembers,
    );

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
