import { and, asc, desc, eq, isNull } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  activityEvents,
  clientMembers,
  clientOrganizations,
  projectMembers,
  projects,
  users,
  workspaceMembers,
  type ActivityMetadata,
  type ProjectLifecycle,
  type ProjectRole,
} from "../../db/schema";
import {
  canEditProjectSettings,
  canViewProject,
} from "../authorization/policies";
import type {
  ActorContext,
  AuthorizedProjectScope,
  AuthorizedWorkspaceScope,
} from "../authorization/types";
import { resolveProjectAuthorization } from "./authorization";

export type AgencyProjectListItem = Readonly<{
  projectId: string;
  title: string;
  clientOrganizationName: string;
  lifecycle: ProjectLifecycle;
  deliveryManagerName: string;
  targetCompletionDate: string | null;
  updatedAt: Date;
  rowVersion: number;
  canManageProject: boolean;
  activeMilestoneId: string | null;
  activeMilestoneTitle: string | null;
  completedMilestoneCount: number;
  publishedMilestoneCount: number;
}>;

async function listAgencyProjectsForWorkspace(
  database: DatabaseClient,
  actor: ActorContext,
  workspaceId: string,
): Promise<readonly AgencyProjectListItem[]> {
  const result = await database.pool.query<{
    project_id: string;
    title: string;
    client_organization_name: string;
    lifecycle: ProjectLifecycle;
    delivery_manager_name: string;
    target_completion_date: string | null;
    updated_at: Date;
    row_version: number;
    can_manage_project: boolean;
    active_milestone_id: string | null;
    active_milestone_title: string | null;
    completed_milestone_count: number;
    published_milestone_count: number;
  }>(
    `SELECT p.id AS project_id,
            p.title,
            co.name AS client_organization_name,
            p.lifecycle,
            dm.display_name AS delivery_manager_name,
            p.target_completion_date::text AS target_completion_date,
            p.updated_at,
            p.row_version,
            active_milestone.id AS active_milestone_id,
            active_milestone.title AS active_milestone_title,
            milestone_counts.completed_count AS completed_milestone_count,
            milestone_counts.published_count AS published_milestone_count,
            (
              actor_membership.role = 'AGENCY_OWNER'
              OR (
                actor_membership.role = 'DELIVERY_MANAGER'
                AND EXISTS (
                  SELECT 1
                    FROM project_members manager_pm
                   WHERE manager_pm.workspace_id = p.workspace_id
                     AND manager_pm.project_id = p.id
                     AND manager_pm.user_id = actor_membership.user_id
                     AND manager_pm.side = 'AGENCY'
                     AND manager_pm.project_role = 'DELIVERY_MANAGER'
                     AND manager_pm.status = 'ACTIVE'
                )
              )
            ) AS can_manage_project
       FROM projects p
       JOIN client_organizations co
         ON co.workspace_id = p.workspace_id
        AND co.id = p.client_organization_id
       JOIN users dm
         ON dm.id = p.delivery_manager_user_id
       LEFT JOIN LATERAL (
         SELECT m.id, m.title
           FROM milestones m
          WHERE m.workspace_id = p.workspace_id
            AND m.project_id = p.id
            AND m.state = 'ACTIVE'
            AND m.published_at IS NOT NULL
          ORDER BY m.position
          LIMIT 1
       ) active_milestone ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) FILTER (WHERE m.state = 'COMPLETED')::int AS completed_count,
                COUNT(*) FILTER (WHERE m.published_at IS NOT NULL)::int AS published_count
           FROM milestones m
          WHERE m.workspace_id = p.workspace_id
            AND m.project_id = p.id
       ) milestone_counts ON TRUE
       JOIN workspace_members actor_membership
         ON actor_membership.workspace_id = p.workspace_id
        AND actor_membership.user_id = $2
        AND actor_membership.status = 'ACTIVE'
       JOIN users actor
         ON actor.id = actor_membership.user_id
        AND actor.disabled_at IS NULL
      WHERE p.workspace_id = $1
        AND p.lifecycle <> 'ARCHIVED'
        AND (
          actor_membership.role = 'AGENCY_OWNER'
          OR (
            actor_membership.role = 'DELIVERY_MANAGER'
            AND EXISTS (
              SELECT 1
                FROM project_members pm
               WHERE pm.workspace_id = p.workspace_id
                 AND pm.project_id = p.id
                 AND pm.user_id = actor_membership.user_id
                 AND pm.side = 'AGENCY'
                 AND pm.project_role IN ('DELIVERY_MANAGER', 'AGENCY_MEMBER')
                 AND pm.status = 'ACTIVE'
            )
          )
          OR (
            actor_membership.role = 'AGENCY_MEMBER'
            AND EXISTS (
              SELECT 1
                FROM project_members pm
               WHERE pm.workspace_id = p.workspace_id
                 AND pm.project_id = p.id
                 AND pm.user_id = actor_membership.user_id
                 AND pm.side = 'AGENCY'
                 AND pm.project_role = 'AGENCY_MEMBER'
                 AND pm.status = 'ACTIVE'
            )
          )
        )
      ORDER BY p.updated_at DESC, p.title, p.id`,
    [workspaceId, actor.userId],
  );

  return result.rows.map((row) => ({
    projectId: row.project_id,
    title: row.title,
    clientOrganizationName: row.client_organization_name,
    lifecycle: row.lifecycle,
    deliveryManagerName: row.delivery_manager_name,
    targetCompletionDate: row.target_completion_date,
    updatedAt: row.updated_at,
    rowVersion: row.row_version,
    canManageProject: row.can_manage_project,
    activeMilestoneId: row.active_milestone_id,
    activeMilestoneTitle: row.active_milestone_title,
    completedMilestoneCount: row.completed_milestone_count ?? 0,
    publishedMilestoneCount: row.published_milestone_count ?? 0,
  }));
}

export function listAgencyProjects(
  database: DatabaseClient,
  actor: ActorContext,
  scope: AuthorizedWorkspaceScope<"VIEW_AGENCY_WORKSPACE">,
): Promise<readonly AgencyProjectListItem[]> {
  return listAgencyProjectsForWorkspace(database, actor, scope.workspaceId);
}

export function listAgencyDeliveryProjects(
  database: DatabaseClient,
  actor: ActorContext,
  scope: AuthorizedWorkspaceScope<"VIEW_AGENCY_DELIVERY">,
): Promise<readonly AgencyProjectListItem[]> {
  return listAgencyProjectsForWorkspace(database, actor, scope.workspaceId);
}

export type AgencyProjectDetail = Readonly<{
  projectId: string;
  workspaceId: string;
  clientOrganizationId: string;
  clientOrganizationName: string;
  title: string;
  clientSummary: string | null;
  lifecycle: ProjectLifecycle;
  plannedStartDate: string | null;
  targetCompletionDate: string | null;
  deliveryManagerUserId: string;
  deliveryManagerName: string;
  clientApproverUserId: string | null;
  clientApproverName: string | null;
  rowVersion: number;
  updatedAt: Date;
  members: readonly Readonly<{
    userId: string;
    name: string;
    side: "AGENCY" | "CLIENT";
    projectRole: ProjectRole;
  }>[];
}>;

export async function getAgencyProjectDetail(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
): Promise<
  | Readonly<{
      status: "allowed";
      detail: AgencyProjectDetail;
      scope: AuthorizedProjectScope<"VIEW_PROJECT">;
    }>
  | Readonly<{ status: "denied" }>
  | Readonly<{ status: "not-found" }>
> {
  const authorization = await resolveProjectAuthorization(
    database,
    actor,
    projectId,
    canViewProject,
  );
  if (authorization.status === "denied") return { status: "denied" };
  if (authorization.status === "not-found") return { status: "not-found" };
  const hasAgencyMembership = actor.workspaceMemberships.some(
    (membership) => membership.workspaceId === authorization.scope.workspaceId,
  );
  if (
    !hasAgencyMembership ||
    authorization.scope.actorAssignment?.kind === "CLIENT"
  ) {
    return { status: "denied" };
  }

  const [row] = await database.db
    .select({
      projectId: projects.id,
      workspaceId: projects.workspaceId,
      clientOrganizationId: projects.clientOrganizationId,
      clientOrganizationName: clientOrganizations.name,
      title: projects.title,
      clientSummary: projects.clientSummary,
      lifecycle: projects.lifecycle,
      plannedStartDate: projects.plannedStartDate,
      targetCompletionDate: projects.targetCompletionDate,
      deliveryManagerUserId: projects.deliveryManagerUserId,
      clientApproverUserId: projects.clientApproverUserId,
      rowVersion: projects.rowVersion,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(
      clientOrganizations,
      and(
        eq(clientOrganizations.workspaceId, projects.workspaceId),
        eq(clientOrganizations.id, projects.clientOrganizationId),
      ),
    )
    .where(
      and(
        eq(projects.id, authorization.scope.projectId),
        eq(projects.workspaceId, authorization.scope.workspaceId),
      ),
    )
    .limit(1);
  if (!row) return { status: "not-found" };

  const [memberRows, deliveryManagerRows, approverRows] = await Promise.all([
    database.db
      .select({
        userId: projectMembers.userId,
        name: users.name,
        side: projectMembers.side,
        projectRole: projectMembers.projectRole,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(
        and(
          eq(projectMembers.workspaceId, row.workspaceId),
          eq(projectMembers.projectId, row.projectId),
          eq(projectMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      )
      .orderBy(
        asc(projectMembers.side),
        asc(projectMembers.projectRole),
        asc(users.name),
      ),
    database.db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, row.deliveryManagerUserId))
      .limit(1),
    row.clientApproverUserId
      ? database.db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, row.clientApproverUserId))
          .limit(1)
      : Promise.resolve([] as { name: string }[]),
  ]);

  return {
    status: "allowed",
    scope: authorization.scope,
    detail: {
      ...row,
      deliveryManagerName: deliveryManagerRows[0]?.name ?? "Unknown member",
      clientApproverName: approverRows[0]?.name ?? null,
      members: memberRows,
    },
  };
}

export type ProjectSettingsCandidates = Readonly<{
  agency: readonly Readonly<{
    userId: string;
    name: string;
    workspaceRole: "AGENCY_OWNER" | "DELIVERY_MANAGER" | "AGENCY_MEMBER";
  }>[];
  client: readonly Readonly<{ userId: string; name: string }>[];
}>;

export async function getProjectSettingsCandidates(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
): Promise<
  | Readonly<{
      status: "allowed";
      candidates: ProjectSettingsCandidates;
      scope: AuthorizedProjectScope<"EDIT_PROJECT_SETTINGS">;
    }>
  | Readonly<{ status: "denied" }>
  | Readonly<{ status: "not-found" }>
> {
  const authorization = await resolveProjectAuthorization(
    database,
    actor,
    projectId,
    canEditProjectSettings,
  );
  if (authorization.status === "denied") return { status: "denied" };
  if (authorization.status === "not-found") return { status: "not-found" };

  const [agency, client] = await Promise.all([
    database.db
      .select({
        userId: workspaceMembers.userId,
        name: users.name,
        workspaceRole: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(
        and(
          eq(workspaceMembers.workspaceId, authorization.scope.workspaceId),
          eq(workspaceMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      )
      .orderBy(asc(users.name)),
    database.db
      .select({ userId: clientMembers.userId, name: users.name })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId))
      .where(
        and(
          eq(clientMembers.workspaceId, authorization.scope.workspaceId),
          eq(
            clientMembers.clientOrganizationId,
            authorization.scope.clientOrganizationId,
          ),
          eq(clientMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      )
      .orderBy(asc(users.name)),
  ]);

  return {
    status: "allowed",
    candidates: { agency, client },
    scope: authorization.scope,
  };
}

export type ClientProjectLifecycle =
  "ONBOARDING" | "ACTIVE" | "HANDOFF" | "COMPLETED" | "CANCELLED" | "PAST";

function toClientProjectLifecycle(
  lifecycle: Exclude<ProjectLifecycle, "DRAFT">,
): ClientProjectLifecycle {
  return lifecycle === "ARCHIVED" ? "PAST" : lifecycle;
}

export type ClientProjectListItem = Readonly<{
  projectId: string;
  title: string;
  clientOrganizationName: string;
  agencyName: string;
  lifecycle: ClientProjectLifecycle;
  clientSummary: string | null;
  targetCompletionDate: string | null;
  currentMilestoneId: string | null;
  currentMilestoneTitle: string | null;
  currentMilestoneState: "ACTIVE" | null;
  completedMilestoneCount: number;
  publishedMilestoneCount: number;
  clientVisibleUpdatedAt: Date;
}>;

export async function listClientProjects(
  database: DatabaseClient,
  actor: ActorContext,
): Promise<readonly ClientProjectListItem[]> {
  const result = await database.pool.query<{
    project_id: string;
    title: string;
    client_organization_name: string;
    agency_name: string;
    lifecycle: Exclude<ProjectLifecycle, "DRAFT">;
    client_summary: string | null;
    target_completion_date: string | null;
    current_milestone_id: string | null;
    current_milestone_title: string | null;
    completed_milestone_count: number;
    published_milestone_count: number;
    client_visible_updated_at: Date;
  }>(
    `SELECT p.id AS project_id,
            p.title,
            co.name AS client_organization_name,
            w.name AS agency_name,
            p.lifecycle,
            p.client_summary,
            p.target_completion_date::text AS target_completion_date,
            active_milestone.id AS current_milestone_id,
            active_milestone.title AS current_milestone_title,
            milestone_counts.completed_count AS completed_milestone_count,
            milestone_counts.published_count AS published_milestone_count,
            COALESCE(client_activity.occurred_at, p.created_at) AS client_visible_updated_at
       FROM project_members pm
       JOIN users actor
         ON actor.id = pm.user_id
        AND actor.disabled_at IS NULL
       JOIN projects p
         ON p.workspace_id = pm.workspace_id
        AND p.id = pm.project_id
       JOIN client_members cm
         ON cm.workspace_id = p.workspace_id
        AND cm.client_organization_id = p.client_organization_id
        AND cm.user_id = pm.user_id
        AND cm.status = 'ACTIVE'
       JOIN client_organizations co
         ON co.workspace_id = p.workspace_id
        AND co.id = p.client_organization_id
        AND co.status = 'ACTIVE'
       JOIN workspaces w
         ON w.id = p.workspace_id
       LEFT JOIN LATERAL (
         SELECT m.id, m.title
           FROM milestones m
          WHERE m.workspace_id = p.workspace_id
            AND m.project_id = p.id
            AND m.published_at IS NOT NULL
            AND m.state = 'ACTIVE'
          ORDER BY m.position, m.id
          LIMIT 1
       ) active_milestone ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) FILTER (WHERE m.state = 'COMPLETED')::int AS completed_count,
                COUNT(*)::int AS published_count
           FROM milestones m
          WHERE m.workspace_id = p.workspace_id
            AND m.project_id = p.id
            AND m.published_at IS NOT NULL
       ) milestone_counts ON TRUE
       LEFT JOIN LATERAL (
         SELECT MAX(ae.occurred_at) AS occurred_at
           FROM activity_events ae
          WHERE ae.workspace_id = p.workspace_id
            AND ae.project_id = p.id
            AND ae.visibility = 'CLIENT_VISIBLE'
            AND (
              ae.subject_type <> 'MILESTONE'
              OR EXISTS (
                SELECT 1
                  FROM milestones visible_milestone
                 WHERE visible_milestone.workspace_id = ae.workspace_id
                   AND visible_milestone.project_id = ae.project_id
                   AND visible_milestone.id = ae.subject_id
                   AND visible_milestone.published_at IS NOT NULL
              )
            )
       ) client_activity ON TRUE
      WHERE pm.user_id = $1
        AND pm.side = 'CLIENT'
        AND pm.project_role IN ('CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR')
        AND pm.status = 'ACTIVE'
        AND p.lifecycle <> 'DRAFT'
      ORDER BY COALESCE(client_activity.occurred_at, p.created_at) DESC, p.title, p.id`,
    [actor.userId],
  );

  return result.rows.map((row) => ({
    projectId: row.project_id,
    title: row.title,
    clientOrganizationName: row.client_organization_name,
    agencyName: row.agency_name,
    lifecycle: toClientProjectLifecycle(row.lifecycle),
    clientSummary: row.client_summary,
    targetCompletionDate: row.target_completion_date,
    currentMilestoneId: row.current_milestone_id,
    currentMilestoneTitle: row.current_milestone_title,
    currentMilestoneState: row.current_milestone_id ? "ACTIVE" : null,
    completedMilestoneCount: row.completed_milestone_count ?? 0,
    publishedMilestoneCount: row.published_milestone_count ?? 0,
    clientVisibleUpdatedAt: row.client_visible_updated_at,
  }));
}

export type ClientProjectDetail = Readonly<{
  projectId: string;
  title: string;
  clientOrganizationName: string;
  agencyName: string;
  clientSummary: string | null;
  lifecycle: ClientProjectLifecycle;
  plannedStartDate: string | null;
  targetCompletionDate: string | null;
  currentUserRole: "CLIENT_APPROVER" | "CLIENT_CONTRIBUTOR";
}>;

export async function getClientProjectDetail(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
): Promise<
  | Readonly<{
      status: "allowed";
      detail: ClientProjectDetail;
      scope: AuthorizedProjectScope<"VIEW_PROJECT">;
    }>
  | Readonly<{ status: "denied" }>
  | Readonly<{ status: "not-found" }>
> {
  const authorization = await resolveProjectAuthorization(
    database,
    actor,
    projectId,
    canViewProject,
  );
  if (authorization.status === "denied") return { status: "denied" };
  if (authorization.status === "not-found") return { status: "not-found" };
  const actorAssignment = authorization.scope.actorAssignment;
  if (actorAssignment?.kind !== "CLIENT") {
    return { status: "denied" };
  }

  const detailResult = await database.pool.query<{
    project_id: string;
    title: string;
    client_organization_name: string;
    agency_name: string;
    client_summary: string | null;
    lifecycle: Exclude<ProjectLifecycle, "DRAFT">;
    planned_start_date: string | null;
    target_completion_date: string | null;
  }>(
    `SELECT p.id AS project_id,
            p.title,
            co.name AS client_organization_name,
            w.name AS agency_name,
            p.client_summary,
            p.lifecycle,
            p.planned_start_date::text AS planned_start_date,
            p.target_completion_date::text AS target_completion_date
       FROM projects p
       JOIN client_organizations co
         ON co.workspace_id = p.workspace_id
        AND co.id = p.client_organization_id
        AND co.status = 'ACTIVE'
       JOIN workspaces w
         ON w.id = p.workspace_id
      WHERE p.workspace_id = $1
        AND p.id = $2
        AND p.lifecycle <> 'DRAFT'
      LIMIT 1`,
    [authorization.scope.workspaceId, authorization.scope.projectId],
  );
  const row = detailResult.rows[0];

  if (!row) return { status: "not-found" };

  return {
    status: "allowed",
    scope: authorization.scope,
    detail: {
      projectId: row.project_id,
      title: row.title,
      clientOrganizationName: row.client_organization_name,
      agencyName: row.agency_name,
      clientSummary: row.client_summary,
      lifecycle: toClientProjectLifecycle(row.lifecycle),
      plannedStartDate: row.planned_start_date,
      targetCompletionDate: row.target_completion_date,
      currentUserRole: actorAssignment.role,
    },
  };
}

export type ProjectActivityListItem = Readonly<{
  activityEventId: string;
  eventType: string;
  visibility: "CLIENT_VISIBLE" | "AGENCY_ONLY";
  actorName: string;
  actorRole: string | null;
  subjectType: string;
  subjectId: string;
  summaryKey: string;
  metadata: ActivityMetadata;
  occurredAt: Date;
}>;

export async function listAgencyProjectActivity(
  database: DatabaseClient,
  scope: AuthorizedProjectScope<"VIEW_PROJECT">,
  limit = 50,
): Promise<readonly ProjectActivityListItem[]> {
  return database.db
    .select({
      activityEventId: activityEvents.id,
      eventType: activityEvents.eventType,
      visibility: activityEvents.visibility,
      actorName: activityEvents.actorNameSnapshot,
      actorRole: activityEvents.actorRoleSnapshot,
      subjectType: activityEvents.subjectType,
      subjectId: activityEvents.subjectId,
      summaryKey: activityEvents.summaryKey,
      metadata: activityEvents.metadata,
      occurredAt: activityEvents.occurredAt,
    })
    .from(activityEvents)
    .where(
      and(
        eq(activityEvents.workspaceId, scope.workspaceId),
        eq(activityEvents.projectId, scope.projectId),
      ),
    )
    .orderBy(desc(activityEvents.occurredAt), desc(activityEvents.id))
    .limit(Math.max(1, Math.min(limit, 100)));
}

export type ClientProjectActivityListItem = Readonly<{
  activityEventId: string;
  eventType: string;
  actorName: string;
  subjectType: string;
  subjectId: string;
  summaryKey: string;
  occurredAt: Date;
}>;

export async function listClientProjectActivity(
  database: DatabaseClient,
  scope: AuthorizedProjectScope<"VIEW_PROJECT">,
  limit = 50,
): Promise<readonly ClientProjectActivityListItem[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const result = await database.pool.query<{
    activity_event_id: string;
    event_type: string;
    actor_name: string;
    subject_type: string;
    subject_id: string;
    summary_key: string;
    occurred_at: Date;
  }>(
    `SELECT ae.id AS activity_event_id,
            ae.event_type,
            ae.actor_name_snapshot AS actor_name,
            ae.subject_type,
            ae.subject_id,
            ae.summary_key,
            ae.occurred_at
       FROM activity_events ae
      WHERE ae.workspace_id = $1
        AND ae.project_id = $2
        AND ae.visibility = 'CLIENT_VISIBLE'
        AND (
          ae.subject_type <> 'MILESTONE'
          OR EXISTS (
            SELECT 1
              FROM milestones m
             WHERE m.workspace_id = ae.workspace_id
               AND m.project_id = ae.project_id
               AND m.id = ae.subject_id
               AND m.published_at IS NOT NULL
          )
        )
      ORDER BY ae.occurred_at DESC, ae.id DESC
      LIMIT $3`,
    [scope.workspaceId, scope.projectId, boundedLimit],
  );

  return result.rows.map((row) => ({
    activityEventId: row.activity_event_id,
    eventType: row.event_type,
    actorName: row.actor_name,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    summaryKey: row.summary_key,
    occurredAt: row.occurred_at,
  }));
}

export type ProjectCreationCandidates = Readonly<{
  clients: readonly Readonly<{
    clientOrganizationId: string;
    name: string;
  }>[];
  deliveryManagers: readonly Readonly<{
    userId: string;
    name: string;
    workspaceRole: "AGENCY_OWNER" | "DELIVERY_MANAGER";
  }>[];
}>;

export async function getProjectCreationCandidates(
  database: DatabaseClient,
  scope: AuthorizedWorkspaceScope<"CREATE_PROJECT">,
): Promise<ProjectCreationCandidates> {
  const [clients, agencyCandidates] = await Promise.all([
    database.db
      .select({
        clientOrganizationId: clientOrganizations.id,
        name: clientOrganizations.name,
      })
      .from(clientOrganizations)
      .where(
        and(
          eq(clientOrganizations.workspaceId, scope.workspaceId),
          eq(clientOrganizations.status, "ACTIVE"),
        ),
      )
      .orderBy(asc(clientOrganizations.name), asc(clientOrganizations.id)),
    database.db
      .select({
        userId: workspaceMembers.userId,
        name: users.name,
        workspaceRole: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(
        and(
          eq(workspaceMembers.workspaceId, scope.workspaceId),
          eq(workspaceMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      )
      .orderBy(asc(users.name), asc(users.id)),
  ]);

  return {
    clients,
    deliveryManagers: agencyCandidates.filter(
      (
        candidate,
      ): candidate is Readonly<{
        userId: string;
        name: string;
        workspaceRole: "AGENCY_OWNER" | "DELIVERY_MANAGER";
      }> =>
        candidate.workspaceRole === "AGENCY_OWNER" ||
        candidate.workspaceRole === "DELIVERY_MANAGER",
    ),
  };
}

export async function listAgencyProjectsForClientOrganization(
  database: DatabaseClient,
  actor: ActorContext,
  scope:
    | AuthorizedWorkspaceScope<"VIEW_CLIENT_ORGANIZATION">
    | AuthorizedWorkspaceScope<"VIEW_AGENCY_WORKSPACE">,
  clientOrganizationId: string,
): Promise<readonly AgencyProjectListItem[]> {
  const projectsInWorkspace = await listAgencyProjectsForWorkspace(
    database,
    actor,
    scope.workspaceId,
  );
  const [organization] = await database.db
    .select({ id: clientOrganizations.id })
    .from(clientOrganizations)
    .where(
      and(
        eq(clientOrganizations.workspaceId, scope.workspaceId),
        eq(clientOrganizations.id, clientOrganizationId),
      ),
    )
    .limit(1);

  if (!organization) return [];

  const projectIds = await database.db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.workspaceId, scope.workspaceId),
        eq(projects.clientOrganizationId, clientOrganizationId),
      ),
    );

  const visibleIds = new Set(projectIds.map((project) => project.id));
  return projectsInWorkspace.filter((project) =>
    visibleIds.has(project.projectId),
  );
}
