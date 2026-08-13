import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import type { TransactionDatabase } from "../../db/transactions";
import { incrementRowVersion } from "../../db/row-version";
import {
  clientMembers,
  clientOrganizations,
  projectMembers,
  projects,
  users,
  workspaceMembers,
  type ProjectRole,
  type WorkspaceRole,
} from "../../db/schema";
import type { Clock } from "../../lib/clock";
import {
  canCreateProject,
  canDeleteDraftProject,
  canEditProjectSettings,
  canManageProjectMembers,
} from "../authorization/policies";
import { authorizeWorkspaceCapability } from "../authorization/server/authorization";
import type { ActorContext } from "../authorization/types";
import { authorizeProjectCapability } from "./authorization";
import { runProjectCommand } from "./command-transaction";
import { ProjectDomainError } from "./errors";

type LockedProject = Readonly<{
  id: string;
  workspaceId: string;
  clientOrganizationId: string;
  title: string;
  clientSummary: string | null;
  plannedStartDate: string | null;
  targetCompletionDate: string | null;
  lifecycle:
    | "DRAFT"
    | "ONBOARDING"
    | "ACTIVE"
    | "HANDOFF"
    | "COMPLETED"
    | "CANCELLED"
    | "ARCHIVED";
  deliveryManagerUserId: string;
  clientApproverUserId: string | null;
  rowVersion: number;
}>;

type ProjectMutationResult = Readonly<{
  projectId: string;
  rowVersion: number;
}>;

function requireTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new ProjectDomainError("INVALID_REQUEST");
  return title;
}

function optionalTrimmed(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
  return value;
}

function validateDateOrder(
  plannedStartDate: string | null,
  targetCompletionDate: string | null,
): void {
  if (
    plannedStartDate &&
    targetCompletionDate &&
    targetCompletionDate < plannedStartDate
  ) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
}

async function lockProject(
  client: import("pg").PoolClient,
  projectId: string,
): Promise<LockedProject> {
  const result = await client.query<{
    id: string;
    workspace_id: string;
    client_organization_id: string;
    title: string;
    client_summary: string | null;
    planned_start_date: string | null;
    target_completion_date: string | null;
    lifecycle: LockedProject["lifecycle"];
    delivery_manager_user_id: string;
    client_approver_user_id: string | null;
    row_version: number;
  }>(
    `SELECT id,
            workspace_id,
            client_organization_id,
            title,
            client_summary,
            planned_start_date::text AS planned_start_date,
            target_completion_date::text AS target_completion_date,
            lifecycle,
            delivery_manager_user_id,
            client_approver_user_id,
            row_version
       FROM projects
      WHERE id = $1
      FOR UPDATE`,
    [projectId],
  );
  const row = result.rows[0];
  if (!row) throw new ProjectDomainError("PROJECT_NOT_FOUND");
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    clientOrganizationId: row.client_organization_id,
    title: row.title,
    clientSummary: row.client_summary,
    plannedStartDate: row.planned_start_date,
    targetCompletionDate: row.target_completion_date,
    lifecycle: row.lifecycle,
    deliveryManagerUserId: row.delivery_manager_user_id,
    clientApproverUserId: row.client_approver_user_id,
    rowVersion: row.row_version,
  };
}

function assertExpectedRowVersion(
  project: LockedProject,
  expected: number,
): void {
  if (!Number.isInteger(expected) || expected < 1) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
  if (project.rowVersion !== expected) {
    throw new ProjectDomainError("ROW_VERSION_CONFLICT");
  }
}

async function activeWorkspaceMember(
  db: TransactionDatabase,
  workspaceId: string,
  userId: string,
): Promise<Readonly<{ role: WorkspaceRole; name: string }> | null> {
  const [row] = await db
    .select({ role: workspaceMembers.role, name: users.name })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function activeClientMember(
  db: TransactionDatabase,
  workspaceId: string,
  clientOrganizationId: string,
  userId: string,
): Promise<Readonly<{ name: string }> | null> {
  const [row] = await db
    .select({ name: users.name })
    .from(clientMembers)
    .innerJoin(
      clientOrganizations,
      and(
        eq(clientOrganizations.workspaceId, clientMembers.workspaceId),
        eq(clientOrganizations.id, clientMembers.clientOrganizationId),
        eq(clientOrganizations.status, "ACTIVE"),
      ),
    )
    .innerJoin(users, eq(users.id, clientMembers.userId))
    .where(
      and(
        eq(clientMembers.workspaceId, workspaceId),
        eq(clientMembers.clientOrganizationId, clientOrganizationId),
        eq(clientMembers.userId, userId),
        eq(clientMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function actorWorkspaceRole(
  db: TransactionDatabase,
  actor: ActorContext,
  workspaceId: string,
): Promise<WorkspaceRole> {
  const membership = await activeWorkspaceMember(db, workspaceId, actor.userId);
  if (!membership) throw new ProjectDomainError("ACTOR_UNAVAILABLE");
  return membership.role;
}

async function touchProject(
  db: TransactionDatabase,
  projectId: string,
  now: Date,
): Promise<number> {
  const [updated] = await db
    .update(projects)
    .set({
      rowVersion: incrementRowVersion(projects.rowVersion),
      updatedAt: now,
    })
    .where(eq(projects.id, projectId))
    .returning({ rowVersion: projects.rowVersion });
  if (!updated) throw new ProjectDomainError("PROJECT_NOT_FOUND");
  return updated.rowVersion;
}

async function currentProjectMembership(
  db: TransactionDatabase,
  project: LockedProject,
  userId: string,
): Promise<Readonly<{
  projectRole: ProjectRole;
  status: "ACTIVE" | "REVOKED";
}> | null> {
  const [row] = await db
    .select({
      projectRole: projectMembers.projectRole,
      status: projectMembers.status,
    })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.workspaceId, project.workspaceId),
        eq(projectMembers.projectId, project.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function upsertProjectMembership(
  db: TransactionDatabase,
  input: Readonly<{
    project: LockedProject;
    userId: string;
    side: "AGENCY" | "CLIENT";
    projectRole: ProjectRole;
    now: Date;
  }>,
): Promise<void> {
  await db
    .insert(projectMembers)
    .values({
      workspaceId: input.project.workspaceId,
      projectId: input.project.id,
      userId: input.userId,
      side: input.side,
      projectRole: input.projectRole,
      status: "ACTIVE",
      joinedAt: input.now,
      revokedAt: null,
    })
    .onConflictDoUpdate({
      target: [
        projectMembers.workspaceId,
        projectMembers.projectId,
        projectMembers.userId,
      ],
      set: {
        side: input.side,
        projectRole: input.projectRole,
        status: "ACTIVE",
        joinedAt: input.now,
        revokedAt: null,
      },
    });
}

export async function createDraftProject(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    workspaceId: string;
    clientOrganizationId: string;
    title: string;
    deliveryManagerUserId: string;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  const title = requireTitle(options.title);

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.create-draft",
    idempotencyKey: options.idempotencyKey,
    request: {
      workspaceId: options.workspaceId,
      clientOrganizationId: options.clientOrganizationId,
      title,
      deliveryManagerUserId: options.deliveryManagerUserId,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeWorkspaceCapability(
        transaction.db,
        options.actor,
        options.workspaceId,
        canCreateProject,
      );

      const [organization] = await transaction.db
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
        throw new ProjectDomainError("CLIENT_ORGANIZATION_UNAVAILABLE");
      }

      const deliveryManager = await activeWorkspaceMember(
        transaction.db,
        options.workspaceId,
        options.deliveryManagerUserId,
      );
      if (
        !deliveryManager ||
        (deliveryManager.role !== "AGENCY_OWNER" &&
          deliveryManager.role !== "DELIVERY_MANAGER")
      ) {
        throw new ProjectDomainError("INVALID_MEMBER");
      }

      const [project] = await transaction.db
        .insert(projects)
        .values({
          workspaceId: options.workspaceId,
          clientOrganizationId: options.clientOrganizationId,
          title,
          lifecycle: "DRAFT",
          deliveryManagerUserId: options.deliveryManagerUserId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: projects.id, rowVersion: projects.rowVersion });
      if (!project) throw new Error("Project creation returned no id.");

      await transaction.db.insert(projectMembers).values({
        workspaceId: options.workspaceId,
        projectId: project.id,
        userId: options.deliveryManagerUserId,
        side: "AGENCY",
        projectRole: "DELIVERY_MANAGER",
        status: "ACTIVE",
        joinedAt: now,
      });

      await recordActivity({
        workspaceId: options.workspaceId,
        projectId: project.id,
        eventType: "project.created",
        visibility: "AGENCY_ONLY",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.created",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          options.workspaceId,
        ),
        metadata: { lifecycle: "DRAFT" },
      });

      return { projectId: project.id, rowVersion: project.rowVersion };
    },
  });
}

export async function updateDraftProjectIdentity(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    title: string;
    clientSummary?: string | null;
    plannedStartDate?: string | null;
    targetCompletionDate?: string | null;
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  const title = requireTitle(options.title);
  const clientSummary = optionalTrimmed(options.clientSummary);
  const plannedStartDate = normalizeDate(options.plannedStartDate);
  const targetCompletionDate = normalizeDate(options.targetCompletionDate);
  validateDateOrder(plannedStartDate, targetCompletionDate);

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.update-draft-identity",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      title,
      clientSummary,
      plannedStartDate,
      targetCompletionDate,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canEditProjectSettings,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (
        project.title === title &&
        project.clientSummary === clientSummary &&
        project.plannedStartDate === plannedStartDate &&
        project.targetCompletionDate === targetCompletionDate
      ) {
        return { projectId: project.id, rowVersion: project.rowVersion };
      }

      const [updated] = await transaction.db
        .update(projects)
        .set({
          title,
          clientSummary,
          plannedStartDate,
          targetCompletionDate,
          rowVersion: incrementRowVersion(projects.rowVersion),
          updatedAt: now,
        })
        .where(eq(projects.id, project.id))
        .returning({ rowVersion: projects.rowVersion });
      if (!updated) throw new ProjectDomainError("PROJECT_NOT_FOUND");

      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.identity_updated",
        visibility: "AGENCY_ONLY",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.identity_updated",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          project.workspaceId,
        ),
        metadata: {},
      });

      return { projectId: project.id, rowVersion: updated.rowVersion };
    },
  });
}

export async function assignProjectMember(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    userId: string;
    projectRole: "AGENCY_MEMBER" | "CLIENT_CONTRIBUTOR";
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.assign-member",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      userId: options.userId,
      projectRole: options.projectRole,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageProjectMembers,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (
        project.deliveryManagerUserId === options.userId ||
        project.clientApproverUserId === options.userId
      ) {
        throw new ProjectDomainError("REQUIRED_ROLE");
      }

      const current = await currentProjectMembership(
        transaction.db,
        project,
        options.userId,
      );
      if (
        current?.status === "ACTIVE" &&
        current.projectRole === options.projectRole
      ) {
        return { projectId: project.id, rowVersion: project.rowVersion };
      }

      if (options.projectRole === "AGENCY_MEMBER") {
        if (
          !(await activeWorkspaceMember(
            transaction.db,
            project.workspaceId,
            options.userId,
          ))
        ) {
          throw new ProjectDomainError("INVALID_MEMBER");
        }
        await upsertProjectMembership(transaction.db, {
          project,
          userId: options.userId,
          side: "AGENCY",
          projectRole: "AGENCY_MEMBER",
          now,
        });
      } else {
        if (
          !(await activeClientMember(
            transaction.db,
            project.workspaceId,
            project.clientOrganizationId,
            options.userId,
          ))
        ) {
          throw new ProjectDomainError("INVALID_MEMBER");
        }
        await upsertProjectMembership(transaction.db, {
          project,
          userId: options.userId,
          side: "CLIENT",
          projectRole: "CLIENT_CONTRIBUTOR",
          now,
        });
      }

      const rowVersion = await touchProject(transaction.db, project.id, now);
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.member_assigned",
        visibility: "AGENCY_ONLY",
        subjectType: "USER",
        subjectId: options.userId,
        summaryKey: "activity.project.member_assigned",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          project.workspaceId,
        ),
        metadata: { projectRole: options.projectRole },
      });
      return { projectId: project.id, rowVersion };
    },
  });
}

export async function removeProjectMember(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    userId: string;
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.remove-member",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      userId: options.userId,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageProjectMembers,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (
        project.deliveryManagerUserId === options.userId ||
        project.clientApproverUserId === options.userId
      ) {
        throw new ProjectDomainError("REQUIRED_ROLE");
      }

      const [removed] = await transaction.db
        .update(projectMembers)
        .set({ status: "REVOKED", revokedAt: now })
        .where(
          and(
            eq(projectMembers.workspaceId, project.workspaceId),
            eq(projectMembers.projectId, project.id),
            eq(projectMembers.userId, options.userId),
            eq(projectMembers.status, "ACTIVE"),
          ),
        )
        .returning({ projectRole: projectMembers.projectRole });
      if (!removed) {
        return { projectId: project.id, rowVersion: project.rowVersion };
      }

      const rowVersion = await touchProject(transaction.db, project.id, now);
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.member_removed",
        visibility: "AGENCY_ONLY",
        subjectType: "USER",
        subjectId: options.userId,
        summaryKey: "activity.project.member_removed",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          project.workspaceId,
        ),
        metadata: { previousProjectRole: removed.projectRole },
      });
      return { projectId: project.id, rowVersion };
    },
  });
}

export async function reassignDeliveryManager(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    deliveryManagerUserId: string;
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.reassign-delivery-manager",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      deliveryManagerUserId: options.deliveryManagerUserId,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageProjectMembers,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (project.deliveryManagerUserId === options.deliveryManagerUserId) {
        return { projectId: project.id, rowVersion: project.rowVersion };
      }

      const target = await activeWorkspaceMember(
        transaction.db,
        project.workspaceId,
        options.deliveryManagerUserId,
      );
      if (
        !target ||
        (target.role !== "AGENCY_OWNER" && target.role !== "DELIVERY_MANAGER")
      ) {
        throw new ProjectDomainError("INVALID_MEMBER");
      }

      await transaction.db
        .update(projectMembers)
        .set({ projectRole: "AGENCY_MEMBER" })
        .where(
          and(
            eq(projectMembers.workspaceId, project.workspaceId),
            eq(projectMembers.projectId, project.id),
            eq(projectMembers.userId, project.deliveryManagerUserId),
            eq(projectMembers.status, "ACTIVE"),
          ),
        );

      await upsertProjectMembership(transaction.db, {
        project,
        userId: options.deliveryManagerUserId,
        side: "AGENCY",
        projectRole: "DELIVERY_MANAGER",
        now,
      });

      const [updated] = await transaction.db
        .update(projects)
        .set({
          deliveryManagerUserId: options.deliveryManagerUserId,
          rowVersion: incrementRowVersion(projects.rowVersion),
          updatedAt: now,
        })
        .where(eq(projects.id, project.id))
        .returning({ rowVersion: projects.rowVersion });
      if (!updated) throw new ProjectDomainError("PROJECT_NOT_FOUND");

      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.delivery_manager_reassigned",
        visibility: "AGENCY_ONLY",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.delivery_manager_reassigned",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          project.workspaceId,
        ),
        metadata: {
          previousUserId: project.deliveryManagerUserId,
          newUserId: options.deliveryManagerUserId,
        },
      });

      return { projectId: project.id, rowVersion: updated.rowVersion };
    },
  });
}

export async function reassignClientApprover(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    clientApproverUserId: string;
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.reassign-client-approver",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      clientApproverUserId: options.clientApproverUserId,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageProjectMembers,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (project.clientApproverUserId === options.clientApproverUserId) {
        return { projectId: project.id, rowVersion: project.rowVersion };
      }

      if (
        !(await activeClientMember(
          transaction.db,
          project.workspaceId,
          project.clientOrganizationId,
          options.clientApproverUserId,
        ))
      ) {
        throw new ProjectDomainError("INVALID_MEMBER");
      }

      if (project.clientApproverUserId) {
        await transaction.db
          .update(projectMembers)
          .set({ projectRole: "CLIENT_CONTRIBUTOR" })
          .where(
            and(
              eq(projectMembers.workspaceId, project.workspaceId),
              eq(projectMembers.projectId, project.id),
              eq(projectMembers.userId, project.clientApproverUserId),
              eq(projectMembers.status, "ACTIVE"),
            ),
          );
      }

      await upsertProjectMembership(transaction.db, {
        project,
        userId: options.clientApproverUserId,
        side: "CLIENT",
        projectRole: "CLIENT_APPROVER",
        now,
      });

      const [updated] = await transaction.db
        .update(projects)
        .set({
          clientApproverUserId: options.clientApproverUserId,
          rowVersion: incrementRowVersion(projects.rowVersion),
          updatedAt: now,
        })
        .where(eq(projects.id, project.id))
        .returning({ rowVersion: projects.rowVersion });
      if (!updated) throw new ProjectDomainError("PROJECT_NOT_FOUND");

      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.client_approver_reassigned",
        visibility: "AGENCY_ONLY",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.client_approver_reassigned",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.db,
          options.actor,
          project.workspaceId,
        ),
        metadata: {
          previousUserId: project.clientApproverUserId,
          newUserId: options.clientApproverUserId,
        },
      });

      return { projectId: project.id, rowVersion: updated.rowVersion };
    },
  });
}

export async function deleteEligibleDraftProject(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    expectedRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<Readonly<{ projectId: string; deleted: true }>> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.delete-eligible-draft",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      expectedRowVersion: options.expectedRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canDeleteDraftProject,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(project, options.expectedRowVersion);
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("DELETE_NOT_ELIGIBLE");
      }

      const clientActivity = await transaction.client.query<{
        exists: boolean;
      }>(
        `SELECT EXISTS (
           SELECT 1
             FROM activity_events
            WHERE workspace_id = $1
              AND project_id = $2
              AND (
                visibility = 'CLIENT_VISIBLE'
                OR actor_role_snapshot IN ('CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR')
              )
         ) AS exists`,
        [project.workspaceId, project.id],
      );
      if (clientActivity.rows[0]?.exists) {
        throw new ProjectDomainError("DELETE_NOT_ELIGIBLE");
      }

      await transaction.client.query(
        "SELECT set_config('studioflow.activity_hard_delete_project_id', $1, true)",
        [project.id],
      );
      const deleted = await transaction.db
        .delete(projects)
        .where(eq(projects.id, project.id))
        .returning({ id: projects.id });
      if (deleted.length !== 1) {
        throw new ProjectDomainError("PROJECT_NOT_FOUND");
      }

      return { projectId: project.id, deleted: true as const };
    },
  });
}
