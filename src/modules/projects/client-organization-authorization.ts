import { and, eq, isNull, ne } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientOrganizations,
  projectMembers,
  projects,
  users,
  workspaceMembers,
} from "../../db/schema";
import type { TransactionDatabase } from "../../db/transactions";
import type { ActorContext, CapabilityResult } from "../authorization/types";
import { AuthorizationError } from "../authorization/types";

type ClientOrganizationCapability =
  "VIEW_CLIENT_ORGANIZATION" | "MANAGE_CLIENT_MEMBERS";

export type ClientOrganizationAuthorizationResult<
  Capability extends ClientOrganizationCapability,
> =
  | Readonly<{
      status: "allowed";
      capability: Capability;
      workspaceId: string;
      clientOrganizationId: string;
    }>
  | Readonly<{ status: "denied"; result: CapabilityResult<Capability> }>
  | Readonly<{ status: "not-found" }>;

function denial<Capability extends ClientOrganizationCapability>(
  capability: Capability,
  reason:
    | "NO_WORKSPACE_MEMBERSHIP"
    | "ROLE_FORBIDDEN"
    | "PROJECT_ASSIGNMENT_REQUIRED",
): CapabilityResult<Capability> {
  return { allowed: false, capability, reason };
}

async function resolveWithDatabase<
  Capability extends ClientOrganizationCapability,
>(
  db: TransactionDatabase,
  actor: ActorContext,
  workspaceId: string,
  clientOrganizationId: string,
  capability: Capability,
): Promise<ClientOrganizationAuthorizationResult<Capability>> {
  const [organization] = await db
    .select({
      id: clientOrganizations.id,
      status: clientOrganizations.status,
    })
    .from(clientOrganizations)
    .where(
      and(
        eq(clientOrganizations.workspaceId, workspaceId),
        eq(clientOrganizations.id, clientOrganizationId),
      ),
    )
    .limit(1);

  if (!organization) return { status: "not-found" };

  const [membership] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, actor.userId),
        eq(workspaceMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);

  if (!membership) {
    return {
      status: "denied",
      result: denial(capability, "NO_WORKSPACE_MEMBERSHIP"),
    };
  }

  if (membership.role === "AGENCY_OWNER") {
    return {
      status: "allowed",
      capability,
      workspaceId,
      clientOrganizationId,
    };
  }

  if (membership.role !== "DELIVERY_MANAGER") {
    return {
      status: "denied",
      result: denial(capability, "ROLE_FORBIDDEN"),
    };
  }

  if (organization.status !== "ACTIVE") {
    return {
      status: "denied",
      result: denial(capability, "PROJECT_ASSIGNMENT_REQUIRED"),
    };
  }

  const [assignment] = await db
    .select({ projectId: projects.id })
    .from(projects)
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.workspaceId, projects.workspaceId),
        eq(projectMembers.projectId, projects.id),
      ),
    )
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        eq(projects.clientOrganizationId, clientOrganizationId),
        ne(projects.lifecycle, "ARCHIVED"),
        eq(projects.deliveryManagerUserId, actor.userId),
        eq(projectMembers.userId, actor.userId),
        eq(projectMembers.side, "AGENCY"),
        eq(projectMembers.projectRole, "DELIVERY_MANAGER"),
        eq(projectMembers.status, "ACTIVE"),
      ),
    )
    .limit(1);

  if (!assignment) {
    return {
      status: "denied",
      result: denial(capability, "PROJECT_ASSIGNMENT_REQUIRED"),
    };
  }

  return {
    status: "allowed",
    capability,
    workspaceId,
    clientOrganizationId,
  };
}

export function resolveClientOrganizationAuthorization<
  Capability extends ClientOrganizationCapability,
>(
  database: DatabaseClient,
  actor: ActorContext,
  input: Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
    capability: Capability;
  }>,
): Promise<ClientOrganizationAuthorizationResult<Capability>> {
  return resolveWithDatabase(
    database.db,
    actor,
    input.workspaceId,
    input.clientOrganizationId,
    input.capability,
  );
}

export async function authorizeClientOrganizationCapability<
  Capability extends ClientOrganizationCapability,
>(
  db: TransactionDatabase,
  actor: ActorContext,
  input: Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
    capability: Capability;
  }>,
): Promise<
  Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
    capability: Capability;
  }>
> {
  const result = await resolveWithDatabase(
    db,
    actor,
    input.workspaceId,
    input.clientOrganizationId,
    input.capability,
  );

  if (result.status === "allowed") return result;
  if (result.status === "not-found") {
    throw new AuthorizationError(input.capability, "PROJECT_CONTEXT_MISMATCH");
  }

  if (!result.result.allowed) {
    throw new AuthorizationError(
      result.result.capability,
      result.result.reason,
    );
  }

  throw new Error("Client Organization authorization could not be resolved.");
}

export async function listAssignedDeliveryManagerClientOrganizationIds(
  database: DatabaseClient,
  actor: ActorContext,
  workspaceId: string,
): Promise<ReadonlySet<string>> {
  const [membership] = await database.db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, actor.userId),
        eq(workspaceMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);

  if (membership?.role !== "DELIVERY_MANAGER") return new Set();

  const rows = await database.db
    .select({ clientOrganizationId: projects.clientOrganizationId })
    .from(projects)
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.workspaceId, projects.workspaceId),
        eq(projectMembers.projectId, projects.id),
      ),
    )
    .innerJoin(
      clientOrganizations,
      and(
        eq(clientOrganizations.workspaceId, projects.workspaceId),
        eq(clientOrganizations.id, projects.clientOrganizationId),
        eq(clientOrganizations.status, "ACTIVE"),
      ),
    )
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        ne(projects.lifecycle, "ARCHIVED"),
        eq(projects.deliveryManagerUserId, actor.userId),
        eq(projectMembers.userId, actor.userId),
        eq(projectMembers.side, "AGENCY"),
        eq(projectMembers.projectRole, "DELIVERY_MANAGER"),
        eq(projectMembers.status, "ACTIVE"),
      ),
    );

  return new Set(rows.map((row) => row.clientOrganizationId));
}
