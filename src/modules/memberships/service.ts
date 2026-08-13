import { and, eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientMembers,
  clientOrganizations,
  projects,
  workspaceMembers,
  type WorkspaceRole,
} from "../../db/schema";
import {
  withTransaction,
  type TransactionDatabase,
} from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";
import {
  canCreateClientOrganization,
  canManageAgencyMembers,
} from "../authorization/policies";
import { authorizeWorkspaceCapability } from "../authorization/server/authorization";
import type { ActorContext } from "../authorization/types";
import { authorizeClientOrganizationCapability } from "../projects/client-organization-authorization";

export class RequiredProjectAuthorityError extends Error {
  constructor() {
    super(
      "The membership cannot change while this person holds required Project authority.",
    );
    this.name = "RequiredProjectAuthorityError";
  }
}

async function assertWorkspaceAuthorityCanChange(
  db: TransactionDatabase,
  workspaceId: string,
  userId: string,
  nextRole: WorkspaceRole | null,
): Promise<void> {
  if (nextRole === "AGENCY_OWNER" || nextRole === "DELIVERY_MANAGER") return;

  const [required] = await db
    .select({ projectId: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        eq(projects.deliveryManagerUserId, userId),
      ),
    )
    .limit(1);

  if (required) throw new RequiredProjectAuthorityError();
}

async function assertClientAuthorityCanBeRevoked(
  db: TransactionDatabase,
  workspaceId: string,
  clientOrganizationId: string,
  userId: string,
): Promise<void> {
  const [required] = await db
    .select({ projectId: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        eq(projects.clientOrganizationId, clientOrganizationId),
        eq(projects.clientApproverUserId, userId),
      ),
    )
    .limit(1);

  if (required) throw new RequiredProjectAuthorityError();
}

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
    await assertWorkspaceAuthorityCanChange(
      db,
      options.workspaceId,
      options.targetUserId,
      options.role,
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
    await assertWorkspaceAuthorityCanChange(
      db,
      options.workspaceId,
      options.targetUserId,
      null,
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
    await authorizeClientOrganizationCapability(db, options.actor, {
      workspaceId: options.workspaceId,
      clientOrganizationId: options.clientOrganizationId,
      capability: "MANAGE_CLIENT_MEMBERS",
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

    await assertClientAuthorityCanBeRevoked(
      db,
      options.workspaceId,
      options.clientOrganizationId,
      options.targetUserId,
    );

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
