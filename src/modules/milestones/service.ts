import { and, eq } from "drizzle-orm";
import type { PoolClient } from "pg";

import type { DatabaseClient } from "../../db/client";
import { incrementRowVersion } from "../../db/row-version";
import {
  milestones as milestoneTable,
  projects,
  type MilestoneState,
  type ProjectLifecycle,
  type WorkspaceRole,
} from "../../db/schema";
import type {
  TransactionContext,
  TransactionDatabase,
} from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import {
  canEditMilestoneDraft,
  canManageMilestoneLifecycle,
  canMoveProjectToActive,
  canPublishMilestone,
  canPublishProject,
} from "../authorization/policies";
import type { ActorContext } from "../authorization/types";
import { authorizeProjectCapability } from "../projects/authorization";
import { runProjectCommand } from "../projects/command-transaction";
import { ProjectDomainError } from "../projects/errors";
import { evaluateMilestoneCompletionCriteria } from "./completion-criteria";

type LockedProject = Readonly<{
  id: string;
  workspaceId: string;
  clientOrganizationId: string;
  clientSummary: string | null;
  targetCompletionDate: string | null;
  lifecycle: ProjectLifecycle;
  deliveryManagerUserId: string;
  clientApproverUserId: string | null;
  rowVersion: number;
}>;

type LockedMilestone = Readonly<{
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  purpose: string | null;
  clientDescription: string | null;
  position: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  state: MilestoneState;
  publishedAt: Date | null;
  activatedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  rowVersion: number;
}>;

export type MilestoneMutationResult = Readonly<{
  projectId: string;
  projectRowVersion: number;
  milestoneId: string;
  milestoneRowVersion: number;
}>;

export type ProjectPublicationResult = Readonly<{
  projectId: string;
  projectRowVersion: number;
  activeMilestoneId: string;
}>;

function requiredTrimmed(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new ProjectDomainError("INVALID_REQUEST");
  return trimmed;
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
  plannedEndDate: string | null,
): void {
  if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
}

function assertMilestoneEditingLifecycle(project: LockedProject): void {
  if (
    project.lifecycle !== "DRAFT" &&
    project.lifecycle !== "ONBOARDING" &&
    project.lifecycle !== "ACTIVE"
  ) {
    throw new ProjectDomainError("INVALID_STATE");
  }
}

function assertPublishedMilestoneLifecycle(project: LockedProject): void {
  if (project.lifecycle !== "ONBOARDING" && project.lifecycle !== "ACTIVE") {
    throw new ProjectDomainError("INVALID_STATE");
  }
}

function assertExpectedRowVersion(actual: number, expected: number): void {
  if (!Number.isInteger(expected) || expected < 1) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }
  if (actual !== expected) {
    throw new ProjectDomainError("ROW_VERSION_CONFLICT");
  }
}

async function lockProject(
  client: PoolClient,
  projectId: string,
): Promise<LockedProject> {
  const result = await client.query<{
    id: string;
    workspace_id: string;
    client_organization_id: string;
    client_summary: string | null;
    target_completion_date: string | null;
    lifecycle: ProjectLifecycle;
    delivery_manager_user_id: string;
    client_approver_user_id: string | null;
    row_version: number;
  }>(
    `SELECT id,
            workspace_id,
            client_organization_id,
            client_summary,
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
    clientSummary: row.client_summary,
    targetCompletionDate: row.target_completion_date,
    lifecycle: row.lifecycle,
    deliveryManagerUserId: row.delivery_manager_user_id,
    clientApproverUserId: row.client_approver_user_id,
    rowVersion: row.row_version,
  };
}

function mapMilestoneRow(row: {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  purpose: string | null;
  client_description: string | null;
  position: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  state: MilestoneState;
  published_at: Date | null;
  activated_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  row_version: number;
}): LockedMilestone {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    title: row.title,
    purpose: row.purpose,
    clientDescription: row.client_description,
    position: row.position,
    plannedStartDate: row.planned_start_date,
    plannedEndDate: row.planned_end_date,
    state: row.state,
    publishedAt: row.published_at,
    activatedAt: row.activated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    rowVersion: row.row_version,
  };
}

async function lockMilestone(
  client: PoolClient,
  projectId: string,
  milestoneId: string,
): Promise<LockedMilestone> {
  const result = await client.query<{
    id: string;
    workspace_id: string;
    project_id: string;
    title: string;
    purpose: string | null;
    client_description: string | null;
    position: number;
    planned_start_date: string | null;
    planned_end_date: string | null;
    state: MilestoneState;
    published_at: Date | null;
    activated_at: Date | null;
    completed_at: Date | null;
    cancelled_at: Date | null;
    row_version: number;
  }>(
    `SELECT id,
            workspace_id,
            project_id,
            title,
            purpose,
            client_description,
            position,
            planned_start_date::text AS planned_start_date,
            planned_end_date::text AS planned_end_date,
            state,
            published_at,
            activated_at,
            completed_at,
            cancelled_at,
            row_version
       FROM milestones
      WHERE project_id = $1
        AND id = $2
      FOR UPDATE`,
    [projectId, milestoneId],
  );

  const row = result.rows[0];
  if (!row) throw new ProjectDomainError("MILESTONE_NOT_FOUND");
  return mapMilestoneRow(row);
}

async function lockProjectMilestones(
  client: PoolClient,
  projectId: string,
): Promise<readonly LockedMilestone[]> {
  const result = await client.query<{
    id: string;
    workspace_id: string;
    project_id: string;
    title: string;
    purpose: string | null;
    client_description: string | null;
    position: number;
    planned_start_date: string | null;
    planned_end_date: string | null;
    state: MilestoneState;
    published_at: Date | null;
    activated_at: Date | null;
    completed_at: Date | null;
    cancelled_at: Date | null;
    row_version: number;
  }>(
    `SELECT id,
            workspace_id,
            project_id,
            title,
            purpose,
            client_description,
            position,
            planned_start_date::text AS planned_start_date,
            planned_end_date::text AS planned_end_date,
            state,
            published_at,
            activated_at,
            completed_at,
            cancelled_at,
            row_version
       FROM milestones
      WHERE project_id = $1
      ORDER BY position, id
      FOR UPDATE`,
    [projectId],
  );

  return result.rows.map(mapMilestoneRow);
}

async function actorWorkspaceRole(
  client: PoolClient,
  actor: ActorContext,
  workspaceId: string,
): Promise<WorkspaceRole> {
  const result = await client.query<{ role: WorkspaceRole }>(
    `SELECT wm.role
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
      WHERE wm.workspace_id = $1
        AND wm.user_id = $2
        AND wm.status = 'ACTIVE'
        AND u.disabled_at IS NULL
      LIMIT 1`,
    [workspaceId, actor.userId],
  );
  const role = result.rows[0]?.role;
  if (!role) throw new ProjectDomainError("ACTOR_UNAVAILABLE");
  return role;
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

async function clientVisibleMilestoneOrdinal(
  client: PoolClient,
  projectId: string,
  position: number,
): Promise<number> {
  const result = await client.query<{ ordinal: number }>(
    `SELECT count(*)::int AS ordinal
       FROM milestones
      WHERE project_id = $1
        AND published_at IS NOT NULL
        AND position <= $2`,
    [projectId, position],
  );
  const ordinal = result.rows[0]?.ordinal;
  if (!ordinal || ordinal < 1) {
    throw new ProjectDomainError("MILESTONE_SEQUENCE_INVALID");
  }
  return ordinal;
}

async function assertRequiredProjectAuthorities(
  client: PoolClient,
  project: LockedProject,
): Promise<void> {
  if (!project.clientApproverUserId) {
    throw new ProjectDomainError("PUBLICATION_REQUIREMENTS_MISSING");
  }

  const result = await client.query<{
    delivery_ok: boolean;
    approver_ok: boolean;
  }>(
    `SELECT
       EXISTS (
         SELECT 1
           FROM project_members pm
           JOIN workspace_members wm
             ON wm.workspace_id = pm.workspace_id
            AND wm.user_id = pm.user_id
            AND wm.status = 'ACTIVE'
            AND wm.role IN ('AGENCY_OWNER', 'DELIVERY_MANAGER')
           JOIN users u
             ON u.id = pm.user_id
            AND u.disabled_at IS NULL
          WHERE pm.workspace_id = $1
            AND pm.project_id = $2
            AND pm.user_id = $3
            AND pm.side = 'AGENCY'
            AND pm.project_role = 'DELIVERY_MANAGER'
            AND pm.status = 'ACTIVE'
       ) AS delivery_ok,
       EXISTS (
         SELECT 1
           FROM project_members pm
           JOIN client_members cm
             ON cm.workspace_id = pm.workspace_id
            AND cm.client_organization_id = $4
            AND cm.user_id = pm.user_id
            AND cm.status = 'ACTIVE'
           JOIN client_organizations co
             ON co.workspace_id = cm.workspace_id
            AND co.id = cm.client_organization_id
            AND co.status = 'ACTIVE'
           JOIN users u
             ON u.id = pm.user_id
            AND u.disabled_at IS NULL
          WHERE pm.workspace_id = $1
            AND pm.project_id = $2
            AND pm.user_id = $5
            AND pm.side = 'CLIENT'
            AND pm.project_role = 'CLIENT_APPROVER'
            AND pm.status = 'ACTIVE'
       ) AS approver_ok`,
    [
      project.workspaceId,
      project.id,
      project.deliveryManagerUserId,
      project.clientOrganizationId,
      project.clientApproverUserId,
    ],
  );

  const row = result.rows[0];
  if (!row?.delivery_ok || !row.approver_ok) {
    throw new ProjectDomainError("PUBLICATION_REQUIREMENTS_MISSING");
  }
}

export async function createMilestoneDraft(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    title: string;
    purpose?: string | null;
    clientDescription?: string | null;
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    expectedProjectRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  const title = requiredTrimmed(options.title);
  const purpose = optionalTrimmed(options.purpose);
  const clientDescription = optionalTrimmed(options.clientDescription);
  const plannedStartDate = normalizeDate(options.plannedStartDate);
  const plannedEndDate = normalizeDate(options.plannedEndDate);
  validateDateOrder(plannedStartDate, plannedEndDate);

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.create-draft",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      title,
      purpose,
      clientDescription,
      plannedStartDate,
      plannedEndDate,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canEditMilestoneDraft,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertMilestoneEditingLifecycle(project);

      const current = await lockProjectMilestones(
        transaction.client,
        project.id,
      );
      const position =
        current.reduce(
          (highest, milestone) => Math.max(highest, milestone.position),
          0,
        ) + 1;

      const [created] = await transaction.db
        .insert(milestoneTable)
        .values({
          workspaceId: project.workspaceId,
          projectId: project.id,
          title,
          purpose,
          clientDescription,
          position,
          plannedStartDate,
          plannedEndDate,
          state: "PLANNED",
          publishedAt: null,
          rowVersion: 1,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: milestoneTable.id,
          rowVersion: milestoneTable.rowVersion,
        });
      if (!created) throw new ProjectDomainError("MILESTONE_NOT_FOUND");

      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.draft_created",
        visibility: "AGENCY_ONLY",
        subjectType: "MILESTONE",
        subjectId: created.id,
        summaryKey: "activity.milestone.draft_created",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { position },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: created.id,
        milestoneRowVersion: created.rowVersion,
      };
    },
  });
}

export async function updateMilestoneDraft(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    title: string;
    purpose?: string | null;
    clientDescription?: string | null;
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  const title = requiredTrimmed(options.title);
  const purpose = optionalTrimmed(options.purpose);
  const clientDescription = optionalTrimmed(options.clientDescription);
  const plannedStartDate = normalizeDate(options.plannedStartDate);
  const plannedEndDate = normalizeDate(options.plannedEndDate);
  validateDateOrder(plannedStartDate, plannedEndDate);

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.update-draft",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      title,
      purpose,
      clientDescription,
      plannedStartDate,
      plannedEndDate,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canEditMilestoneDraft,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertMilestoneEditingLifecycle(project);
      const milestone = await lockMilestone(
        transaction.client,
        project.id,
        options.milestoneId,
      );
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (milestone.state !== "PLANNED" || milestone.publishedAt) {
        throw new ProjectDomainError("INVALID_STATE");
      }

      if (
        milestone.title === title &&
        milestone.purpose === purpose &&
        milestone.clientDescription === clientDescription &&
        milestone.plannedStartDate === plannedStartDate &&
        milestone.plannedEndDate === plannedEndDate
      ) {
        return {
          projectId: project.id,
          projectRowVersion: project.rowVersion,
          milestoneId: milestone.id,
          milestoneRowVersion: milestone.rowVersion,
        };
      }

      const [updated] = await transaction.db
        .update(milestoneTable)
        .set({
          title,
          purpose,
          clientDescription,
          plannedStartDate,
          plannedEndDate,
          rowVersion: incrementRowVersion(milestoneTable.rowVersion),
          updatedAt: now,
        })
        .where(
          and(
            eq(milestoneTable.id, milestone.id),
            eq(milestoneTable.projectId, project.id),
          ),
        )
        .returning({ rowVersion: milestoneTable.rowVersion });
      if (!updated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");

      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.draft_updated",
        visibility: "AGENCY_ONLY",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.draft_updated",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion: updated.rowVersion,
      };
    },
  });
}

export async function reorderMilestones(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    orderedMilestoneIds: readonly string[];
    expectedProjectRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<Readonly<{ projectId: string; projectRowVersion: number }>> {
  const orderedMilestoneIds = [...options.orderedMilestoneIds];
  if (
    orderedMilestoneIds.length === 0 ||
    new Set(orderedMilestoneIds).size !== orderedMilestoneIds.length
  ) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.reorder",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      orderedMilestoneIds,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canEditMilestoneDraft,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertMilestoneEditingLifecycle(project);
      const allMilestones = await lockProjectMilestones(
        transaction.client,
        project.id,
      );
      const planned = allMilestones.filter(
        (milestone) => milestone.state === "PLANNED",
      );
      const plannedIds = new Set(planned.map((milestone) => milestone.id));
      if (
        orderedMilestoneIds.length !== planned.length ||
        orderedMilestoneIds.some((id) => !plannedIds.has(id))
      ) {
        throw new ProjectDomainError("MILESTONE_SEQUENCE_INVALID");
      }

      const positionSlots = planned
        .map((milestone) => milestone.position)
        .sort((left, right) => left - right);
      const currentOrder = [...planned]
        .sort((left, right) => left.position - right.position)
        .map((milestone) => milestone.id);
      const milestoneById = new Map(
        planned.map((milestone) => [milestone.id, milestone] as const),
      );
      const publishedMilestoneIds = new Set(
        planned
          .filter((milestone) => milestone.publishedAt !== null)
          .map((milestone) => milestone.id),
      );
      const publishedOrderBefore = currentOrder.filter((id) =>
        publishedMilestoneIds.has(id),
      );
      const publishedOrderAfter = orderedMilestoneIds.filter((id) =>
        publishedMilestoneIds.has(id),
      );
      const publishedOrderChanged =
        publishedOrderBefore.length === publishedOrderAfter.length &&
        publishedOrderBefore.some(
          (milestoneId, index) => milestoneId !== publishedOrderAfter[index],
        );

      if (
        currentOrder.every(
          (milestoneId, index) => milestoneId === orderedMilestoneIds[index],
        )
      ) {
        return { projectId: project.id, projectRowVersion: project.rowVersion };
      }

      const publishedPlanAffected = orderedMilestoneIds.some(
        (milestoneId, index) => {
          if (!publishedMilestoneIds.has(milestoneId)) return false;
          const milestone = milestoneById.get(milestoneId);
          const targetPosition = positionSlots[index];
          return (
            !milestone ||
            targetPosition == null ||
            milestone.position !== targetPosition
          );
        },
      );
      if (publishedPlanAffected) {
        await authorizeProjectCapability(
          transaction,
          options.actor,
          options.projectId,
          canPublishMilestone,
        );
      }

      await transaction.client.query(
        "SET CONSTRAINTS milestones_project_position_unique DEFERRED",
      );
      for (const [index, milestoneId] of orderedMilestoneIds.entries()) {
        const targetPosition = positionSlots[index];
        const milestone = milestoneById.get(milestoneId);
        if (targetPosition == null || !milestone) {
          throw new ProjectDomainError("MILESTONE_SEQUENCE_INVALID");
        }
        if (milestone.position === targetPosition) continue;

        await transaction.db
          .update(milestoneTable)
          .set({
            position: targetPosition,
            rowVersion: incrementRowVersion(milestoneTable.rowVersion),
            updatedAt: now,
          })
          .where(
            and(
              eq(milestoneTable.id, milestoneId),
              eq(milestoneTable.projectId, project.id),
            ),
          );
      }

      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      const actorRoleSnapshot = await actorWorkspaceRole(
        transaction.client,
        options.actor,
        project.workspaceId,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.sequence_reordered_internal",
        visibility: "AGENCY_ONLY",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.milestone.sequence_reordered",
        actorRoleSnapshot,
        metadata: { orderedMilestoneIds },
      });

      if (publishedOrderChanged) {
        await recordActivity({
          workspaceId: project.workspaceId,
          projectId: project.id,
          eventType: "milestone.sequence_reordered",
          visibility: "CLIENT_VISIBLE",
          subjectType: "PROJECT",
          subjectId: project.id,
          summaryKey: "activity.milestone.sequence_reordered",
          actorRoleSnapshot,
          metadata: { orderedMilestoneIds: publishedOrderAfter },
        });
      }

      return { projectId: project.id, projectRowVersion };
    },
  });
}

export async function publishProject(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    expectedProjectRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<ProjectPublicationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.publish",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity, enqueueOutbox }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canPublishProject,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      if (project.lifecycle !== "DRAFT") {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (!project.clientSummary?.trim() || !project.targetCompletionDate) {
        throw new ProjectDomainError("PUBLICATION_REQUIREMENTS_MISSING");
      }
      await assertRequiredProjectAuthorities(transaction.client, project);

      const plan = await lockProjectMilestones(transaction.client, project.id);
      if (
        plan.length === 0 ||
        plan.some(
          (milestone) =>
            milestone.state !== "PLANNED" || milestone.publishedAt !== null,
        )
      ) {
        throw new ProjectDomainError("PUBLICATION_REQUIREMENTS_MISSING");
      }
      const firstMilestone = plan[0];
      if (!firstMilestone) {
        throw new ProjectDomainError("PUBLICATION_REQUIREMENTS_MISSING");
      }

      const [activated] = await transaction.db
        .update(milestoneTable)
        .set({
          publishedAt: now,
          state: "ACTIVE",
          activatedAt: now,
          rowVersion: incrementRowVersion(milestoneTable.rowVersion),
          updatedAt: now,
        })
        .where(
          and(
            eq(milestoneTable.id, firstMilestone.id),
            eq(milestoneTable.projectId, project.id),
          ),
        )
        .returning({ rowVersion: milestoneTable.rowVersion });
      if (!activated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");

      const remainingMilestoneIds = plan
        .slice(1)
        .map((milestone) => milestone.id);
      for (const milestoneId of remainingMilestoneIds) {
        const updated = await transaction.db
          .update(milestoneTable)
          .set({
            publishedAt: now,
            rowVersion: incrementRowVersion(milestoneTable.rowVersion),
            updatedAt: now,
          })
          .where(
            and(
              eq(milestoneTable.id, milestoneId),
              eq(milestoneTable.projectId, project.id),
            ),
          )
          .returning({ id: milestoneTable.id });
        if (updated.length !== 1) {
          throw new ProjectDomainError("MILESTONE_SEQUENCE_INVALID");
        }
      }

      const [publishedProject] = await transaction.db
        .update(projects)
        .set({
          lifecycle: "ONBOARDING",
          rowVersion: incrementRowVersion(projects.rowVersion),
          updatedAt: now,
        })
        .where(eq(projects.id, project.id))
        .returning({ rowVersion: projects.rowVersion });
      if (!publishedProject) throw new ProjectDomainError("PROJECT_NOT_FOUND");

      const actorRoleSnapshot = await actorWorkspaceRole(
        transaction.client,
        options.actor,
        project.workspaceId,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.published",
        visibility: "CLIENT_VISIBLE",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.published",
        actorRoleSnapshot,
        metadata: {
          lifecycle: "ONBOARDING",
          publishedMilestoneCount: plan.length,
        },
      });
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.activated",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: firstMilestone.id,
        summaryKey: "activity.milestone.activated",
        actorRoleSnapshot,
        metadata: { ordinal: 1 },
      });
      await enqueueOutbox({
        workspaceId: project.workspaceId,
        aggregateType: "PROJECT",
        aggregateId: project.id,
        eventType: "project.published",
        payload: {
          schemaVersion: 1,
          projectId: project.id,
          clientOrganizationId: project.clientOrganizationId,
          clientApproverUserId: project.clientApproverUserId,
          publishedAt: now.toISOString(),
        },
      });

      return {
        projectId: project.id,
        projectRowVersion: publishedProject.rowVersion,
        activeMilestoneId: firstMilestone.id,
      };
    },
  });
}

export async function publishMilestone(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.publish",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canPublishMilestone,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertPublishedMilestoneLifecycle(project);
      const milestone = await lockMilestone(
        transaction.client,
        project.id,
        options.milestoneId,
      );
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (milestone.state !== "PLANNED" || milestone.publishedAt) {
        throw new ProjectDomainError("INVALID_STATE");
      }

      const [updated] = await transaction.db
        .update(milestoneTable)
        .set({
          publishedAt: now,
          rowVersion: incrementRowVersion(milestoneTable.rowVersion),
          updatedAt: now,
        })
        .where(eq(milestoneTable.id, milestone.id))
        .returning({ rowVersion: milestoneTable.rowVersion });
      if (!updated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");

      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      const ordinal = await clientVisibleMilestoneOrdinal(
        transaction.client,
        project.id,
        milestone.position,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.published",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.published",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { ordinal },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion: updated.rowVersion,
      };
    },
  });
}

export async function activateMilestone(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.activate",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageMilestoneLifecycle,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertPublishedMilestoneLifecycle(project);
      const plan = await lockProjectMilestones(transaction.client, project.id);
      const milestone = plan.find(
        (candidate) => candidate.id === options.milestoneId,
      );
      if (!milestone) throw new ProjectDomainError("MILESTONE_NOT_FOUND");
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (milestone.state !== "PLANNED" || !milestone.publishedAt) {
        throw new ProjectDomainError("INVALID_STATE");
      }
      if (plan.some((candidate) => candidate.state === "ACTIVE")) {
        throw new ProjectDomainError("ACTIVE_MILESTONE_EXISTS");
      }
      if (
        plan.some(
          (candidate) =>
            candidate.position < milestone.position &&
            candidate.state !== "COMPLETED" &&
            candidate.state !== "CANCELLED",
        )
      ) {
        throw new ProjectDomainError("MILESTONE_SEQUENCE_BLOCKED");
      }
      const ordinal = plan.filter(
        (candidate) =>
          candidate.publishedAt !== null &&
          candidate.position <= milestone.position,
      ).length;
      if (ordinal < 1) {
        throw new ProjectDomainError("MILESTONE_SEQUENCE_INVALID");
      }

      const [updated] = await transaction.db
        .update(milestoneTable)
        .set({
          state: "ACTIVE",
          activatedAt: now,
          rowVersion: incrementRowVersion(milestoneTable.rowVersion),
          updatedAt: now,
        })
        .where(eq(milestoneTable.id, milestone.id))
        .returning({ rowVersion: milestoneTable.rowVersion });
      if (!updated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");
      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );

      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.activated",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.activated",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { ordinal },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion: updated.rowVersion,
      };
    },
  });
}

async function completeMilestoneState(
  input: Readonly<{
    transaction: TransactionContext;
    milestone: LockedMilestone;
    now: Date;
    overrideReason: string | null;
  }>,
): Promise<number> {
  const [updated] = await input.transaction.db
    .update(milestoneTable)
    .set({
      state: "COMPLETED",
      completedAt: input.now,
      completionOverrideReason: input.overrideReason,
      rowVersion: incrementRowVersion(milestoneTable.rowVersion),
      updatedAt: input.now,
    })
    .where(eq(milestoneTable.id, input.milestone.id))
    .returning({ rowVersion: milestoneTable.rowVersion });
  if (!updated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");
  return updated.rowVersion;
}

export async function completeMilestone(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.complete",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageMilestoneLifecycle,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertPublishedMilestoneLifecycle(project);
      const milestone = await lockMilestone(
        transaction.client,
        project.id,
        options.milestoneId,
      );
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (milestone.state !== "ACTIVE" || !milestone.publishedAt) {
        throw new ProjectDomainError("INVALID_STATE");
      }

      const criteria = await evaluateMilestoneCompletionCriteria(transaction, {
        workspaceId: project.workspaceId,
        projectId: project.id,
        milestoneId: milestone.id,
      });
      if (!criteria.satisfied) {
        throw new ProjectDomainError("MILESTONE_COMPLETION_BLOCKED");
      }

      const milestoneRowVersion = await completeMilestoneState({
        transaction,
        milestone,
        now,
        overrideReason: null,
      });
      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.completed",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.completed",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { completionMode: "STANDARD" },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion,
      };
    },
  });
}

export async function completeMilestoneWithOverride(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    reason: string;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  const reason = requiredTrimmed(options.reason);

  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.complete-with-override",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      reason,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageMilestoneLifecycle,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertPublishedMilestoneLifecycle(project);
      const milestone = await lockMilestone(
        transaction.client,
        project.id,
        options.milestoneId,
      );
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (milestone.state !== "ACTIVE" || !milestone.publishedAt) {
        throw new ProjectDomainError("INVALID_STATE");
      }

      const criteria = await evaluateMilestoneCompletionCriteria(transaction, {
        workspaceId: project.workspaceId,
        projectId: project.id,
        milestoneId: milestone.id,
      });
      const milestoneRowVersion = await completeMilestoneState({
        transaction,
        milestone,
        now,
        overrideReason: reason,
      });
      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      const actorRoleSnapshot = await actorWorkspaceRole(
        transaction.client,
        options.actor,
        project.workspaceId,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.completed",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.completed",
        actorRoleSnapshot,
        metadata: { completionMode: "OVERRIDE" },
      });
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.completion_overridden",
        visibility: "AGENCY_ONLY",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.completion_overridden",
        actorRoleSnapshot,
        metadata: {
          reason,
          blockers: criteria.blockers.map((blocker) => ({
            source: blocker.source,
            sourceId: blocker.sourceId,
            reason: blocker.reason,
          })),
        },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion,
      };
    },
  });
}

export async function cancelMilestone(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    milestoneId: string;
    expectedProjectRowVersion: number;
    expectedMilestoneRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<MilestoneMutationResult> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "milestone.cancel",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      milestoneId: options.milestoneId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
      expectedMilestoneRowVersion: options.expectedMilestoneRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canManageMilestoneLifecycle,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      assertPublishedMilestoneLifecycle(project);
      const milestone = await lockMilestone(
        transaction.client,
        project.id,
        options.milestoneId,
      );
      assertExpectedRowVersion(
        milestone.rowVersion,
        options.expectedMilestoneRowVersion,
      );
      if (
        !milestone.publishedAt ||
        (milestone.state !== "PLANNED" && milestone.state !== "ACTIVE")
      ) {
        throw new ProjectDomainError("INVALID_STATE");
      }

      const previousState = milestone.state;
      const [updated] = await transaction.db
        .update(milestoneTable)
        .set({
          state: "CANCELLED",
          cancelledAt: now,
          rowVersion: incrementRowVersion(milestoneTable.rowVersion),
          updatedAt: now,
        })
        .where(eq(milestoneTable.id, milestone.id))
        .returning({ rowVersion: milestoneTable.rowVersion });
      if (!updated) throw new ProjectDomainError("MILESTONE_NOT_FOUND");
      const projectRowVersion = await touchProject(
        transaction.db,
        project.id,
        now,
      );
      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "milestone.cancelled",
        visibility: "CLIENT_VISIBLE",
        subjectType: "MILESTONE",
        subjectId: milestone.id,
        summaryKey: "activity.milestone.cancelled",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { previousState },
      });

      return {
        projectId: project.id,
        projectRowVersion,
        milestoneId: milestone.id,
        milestoneRowVersion: updated.rowVersion,
      };
    },
  });
}

export async function moveProjectToActive(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    projectId: string;
    expectedProjectRowVersion: number;
    idempotencyKey: string;
    clock?: Clock;
  }>,
): Promise<Readonly<{ projectId: string; projectRowVersion: number }>> {
  return runProjectCommand({
    database: options.database,
    actor: options.actor,
    commandType: "project.move-to-active",
    idempotencyKey: options.idempotencyKey,
    request: {
      projectId: options.projectId,
      expectedProjectRowVersion: options.expectedProjectRowVersion,
    },
    clock: options.clock,
    execute: async ({ transaction, now, recordActivity }) => {
      await authorizeProjectCapability(
        transaction,
        options.actor,
        options.projectId,
        canMoveProjectToActive,
      );
      const project = await lockProject(transaction.client, options.projectId);
      assertExpectedRowVersion(
        project.rowVersion,
        options.expectedProjectRowVersion,
      );
      if (project.lifecycle !== "ONBOARDING") {
        throw new ProjectDomainError("INVALID_STATE");
      }

      const active = await transaction.client.query<{ id: string }>(
        `SELECT id
           FROM milestones
          WHERE workspace_id = $1
            AND project_id = $2
            AND state = 'ACTIVE'
            AND published_at IS NOT NULL
          LIMIT 1
          FOR UPDATE`,
        [project.workspaceId, project.id],
      );
      if (!active.rows[0]) {
        throw new ProjectDomainError("ACTIVE_MILESTONE_REQUIRED");
      }

      // M11 extends this transition with required onboarding Client Action
      // criteria. In M10 no such authoritative obligations exist yet.
      const [updated] = await transaction.db
        .update(projects)
        .set({
          lifecycle: "ACTIVE",
          rowVersion: incrementRowVersion(projects.rowVersion),
          updatedAt: now,
        })
        .where(eq(projects.id, project.id))
        .returning({ rowVersion: projects.rowVersion });
      if (!updated) throw new ProjectDomainError("PROJECT_NOT_FOUND");

      await recordActivity({
        workspaceId: project.workspaceId,
        projectId: project.id,
        eventType: "project.activated",
        visibility: "CLIENT_VISIBLE",
        subjectType: "PROJECT",
        subjectId: project.id,
        summaryKey: "activity.project.activated",
        actorRoleSnapshot: await actorWorkspaceRole(
          transaction.client,
          options.actor,
          project.workspaceId,
        ),
        metadata: { previousLifecycle: "ONBOARDING", lifecycle: "ACTIVE" },
      });

      return { projectId: project.id, projectRowVersion: updated.rowVersion };
    },
  });
}
