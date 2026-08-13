import type { QueryResult, QueryResultRow } from "pg";

import type { DatabaseClient } from "../../db/client";
import type {
  ProjectLifecycle,
  ProjectRole,
  WorkspaceRole,
} from "../../db/schema";
import type { TransactionContext } from "../../db/transactions";
import type {
  ActorContext,
  AuthorizedProjectScope,
  AuthorizationCapability,
  CapabilityResult,
  ProjectActorAssignment,
  ProjectPolicySubject,
} from "../authorization/types";
import { AuthorizationError } from "../authorization/types";

export type ProjectPolicy<Capability extends AuthorizationCapability> = (
  actor: ActorContext,
  subject: ProjectPolicySubject,
) => CapabilityResult<Capability>;

type ProjectQueryClient = Readonly<{
  query<Row extends QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<Row>>;
}>;

type ProjectAuthorizationRow = QueryResultRow & {
  workspace_id: string;
  client_organization_id: string;
  lifecycle: ProjectLifecycle;
  actor_disabled_at: Date | null;
  workspace_role: WorkspaceRole | null;
  client_member_active: boolean;
  client_organization_active: boolean;
  project_side: "AGENCY" | "CLIENT" | null;
  project_role: ProjectRole | null;
};

async function loadProjectAuthorizationRow(
  client: ProjectQueryClient,
  projectId: string,
  actorUserId: string,
): Promise<ProjectAuthorizationRow | null> {
  const result = await client.query<ProjectAuthorizationRow>(
    `SELECT p.workspace_id,
            p.client_organization_id,
            p.lifecycle,
            actor.disabled_at AS actor_disabled_at,
            wm.role AS workspace_role,
            (cm.user_id IS NOT NULL) AS client_member_active,
            (co.id IS NOT NULL) AS client_organization_active,
            pm.side AS project_side,
            pm.project_role AS project_role
       FROM projects p
       LEFT JOIN users actor
         ON actor.id = $2
       LEFT JOIN workspace_members wm
         ON wm.workspace_id = p.workspace_id
        AND wm.user_id = $2
        AND wm.status = 'ACTIVE'
        AND actor.disabled_at IS NULL
       LEFT JOIN client_organizations co
         ON co.workspace_id = p.workspace_id
        AND co.id = p.client_organization_id
        AND co.status = 'ACTIVE'
       LEFT JOIN client_members cm
         ON cm.workspace_id = p.workspace_id
        AND cm.client_organization_id = p.client_organization_id
        AND cm.user_id = $2
        AND cm.status = 'ACTIVE'
        AND actor.disabled_at IS NULL
       LEFT JOIN project_members pm
         ON pm.workspace_id = p.workspace_id
        AND pm.project_id = p.id
        AND pm.user_id = $2
        AND pm.status = 'ACTIVE'
        AND actor.disabled_at IS NULL
      WHERE p.id = $1
      LIMIT 1`,
    [projectId, actorUserId],
  );

  return result.rows[0] ?? null;
}

function assignmentFromRow(
  row: ProjectAuthorizationRow,
): ProjectActorAssignment {
  if (row.project_side === "AGENCY") {
    if (
      row.project_role === "DELIVERY_MANAGER" ||
      row.project_role === "AGENCY_MEMBER"
    ) {
      return { kind: "AGENCY", role: row.project_role };
    }
    return null;
  }

  if (row.project_side === "CLIENT") {
    if (
      row.project_role === "CLIENT_APPROVER" ||
      row.project_role === "CLIENT_CONTRIBUTOR"
    ) {
      return {
        kind: "CLIENT",
        clientOrganizationId: row.client_organization_id,
        role: row.project_role,
      };
    }
  }

  return null;
}

function authoritativeActorFromRow(
  actor: ActorContext,
  row: ProjectAuthorizationRow,
): ActorContext {
  const active = row.actor_disabled_at === null;
  const workspaceMemberships = actor.workspaceMemberships.filter(
    (membership) => membership.workspaceId !== row.workspace_id,
  );
  const clientMemberships = actor.clientMemberships.filter(
    (membership) =>
      membership.clientOrganizationId !== row.client_organization_id,
  );

  return {
    ...actor,
    workspaceMemberships:
      active && row.workspace_role
        ? [
            ...workspaceMemberships,
            { workspaceId: row.workspace_id, role: row.workspace_role },
          ]
        : workspaceMemberships,
    clientMemberships:
      active && row.client_member_active && row.client_organization_active
        ? [
            ...clientMemberships,
            { clientOrganizationId: row.client_organization_id },
          ]
        : clientMemberships,
  };
}

function subjectFromRow(row: ProjectAuthorizationRow): ProjectPolicySubject {
  return {
    workspaceId: row.workspace_id,
    lifecycle: row.lifecycle,
    actorAssignment: assignmentFromRow(row),
  };
}

function scopeFromAllowed<Capability extends AuthorizationCapability>(
  projectId: string,
  row: ProjectAuthorizationRow,
  result: Extract<CapabilityResult<Capability>, { allowed: true }>,
): AuthorizedProjectScope<Capability> {
  return {
    workspaceId: row.workspace_id,
    projectId,
    clientOrganizationId: row.client_organization_id,
    lifecycle: row.lifecycle,
    actorAssignment: assignmentFromRow(row),
    capability: result.capability,
  };
}

export type ProjectAuthorizationResult<
  Capability extends AuthorizationCapability,
> =
  | Readonly<{
      status: "allowed";
      scope: AuthorizedProjectScope<Capability>;
    }>
  | Readonly<{
      status: "denied";
      result: CapabilityResult<Capability>;
    }>
  | Readonly<{ status: "not-found" }>;

export async function resolveProjectAuthorization<
  Capability extends AuthorizationCapability,
>(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
  policy: ProjectPolicy<Capability>,
): Promise<ProjectAuthorizationResult<Capability>> {
  const row = await loadProjectAuthorizationRow(
    database.pool,
    projectId,
    actor.userId,
  );
  if (!row) return { status: "not-found" };

  const authoritativeActor = authoritativeActorFromRow(actor, row);
  const hasKnownTenantContext =
    authoritativeActor.workspaceMemberships.some(
      (membership) => membership.workspaceId === row.workspace_id,
    ) ||
    authoritativeActor.clientMemberships.some(
      (membership) =>
        membership.clientOrganizationId === row.client_organization_id,
    );

  if (!hasKnownTenantContext) {
    return { status: "not-found" };
  }

  const result = policy(authoritativeActor, subjectFromRow(row));
  if (!result.allowed) return { status: "denied", result };

  return {
    status: "allowed",
    scope: scopeFromAllowed(projectId, row, result),
  };
}

export async function authorizeProjectCapability<
  Capability extends AuthorizationCapability,
>(
  transaction: TransactionContext,
  actor: ActorContext,
  projectId: string,
  policy: ProjectPolicy<Capability>,
): Promise<AuthorizedProjectScope<Capability>> {
  const row = await loadProjectAuthorizationRow(
    transaction.client,
    projectId,
    actor.userId,
  );
  if (!row) {
    const fallback = policy(actor, {
      workspaceId: "00000000-0000-0000-0000-000000000000",
      lifecycle: "DRAFT",
      actorAssignment: null,
    });
    throw new AuthorizationError(
      fallback.capability,
      "PROJECT_CONTEXT_MISMATCH",
    );
  }

  const authoritativeActor = authoritativeActorFromRow(actor, row);
  const result = policy(authoritativeActor, subjectFromRow(row));
  if (!result.allowed) {
    throw new AuthorizationError(result.capability, result.reason);
  }

  return scopeFromAllowed(projectId, row, result);
}
