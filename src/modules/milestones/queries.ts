import { and, asc, eq, isNotNull } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { milestones, type MilestoneState } from "../../db/schema";
import {
  canEditMilestoneDraft,
  canEditProjectSettings,
  canManageMilestoneLifecycle,
  canPublishMilestone,
  canPublishProject,
  canViewProject,
} from "../authorization/policies";
import type {
  ActorContext,
  AuthorizationCapability,
  AuthorizedProjectScope,
} from "../authorization/types";
import {
  resolveProjectAuthorization,
  type ProjectPolicy,
} from "../projects/authorization";

export type AgencyMilestoneListItem = Readonly<{
  milestoneId: string;
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
  completionOverrideReason: string | null;
  rowVersion: number;
}>;

export type AgencyMilestonePermissions = Readonly<{
  canEditDraft: boolean;
  canEditProjectSettings: boolean;
  canPublishProject: boolean;
  canPublishMilestone: boolean;
  canManageLifecycle: boolean;
}>;

export type AgencyMilestonePlan = Readonly<{
  scope: AuthorizedProjectScope<"VIEW_PROJECT">;
  milestones: readonly AgencyMilestoneListItem[];
  permissions: AgencyMilestonePermissions;
}>;

async function capabilityAllowed<Capability extends AuthorizationCapability>(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
  policy: ProjectPolicy<Capability>,
): Promise<boolean> {
  const result = await resolveProjectAuthorization(
    database,
    actor,
    projectId,
    policy,
  );
  return result.status === "allowed";
}

export async function getAgencyMilestonePlan(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
): Promise<
  | Readonly<{ status: "allowed"; plan: AgencyMilestonePlan }>
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

  const [
    rows,
    canEditDraft,
    canEditProjectSettingsResult,
    canPublishProjectResult,
    canPublishMilestoneResult,
    canManageLifecycle,
  ] = await Promise.all([
    database.db
      .select({
        milestoneId: milestones.id,
        title: milestones.title,
        purpose: milestones.purpose,
        clientDescription: milestones.clientDescription,
        position: milestones.position,
        plannedStartDate: milestones.plannedStartDate,
        plannedEndDate: milestones.plannedEndDate,
        state: milestones.state,
        publishedAt: milestones.publishedAt,
        activatedAt: milestones.activatedAt,
        completedAt: milestones.completedAt,
        cancelledAt: milestones.cancelledAt,
        completionOverrideReason: milestones.completionOverrideReason,
        rowVersion: milestones.rowVersion,
      })
      .from(milestones)
      .where(
        and(
          eq(milestones.workspaceId, authorization.scope.workspaceId),
          eq(milestones.projectId, authorization.scope.projectId),
        ),
      )
      .orderBy(asc(milestones.position), asc(milestones.id)),
    capabilityAllowed(database, actor, projectId, canEditMilestoneDraft),
    capabilityAllowed(database, actor, projectId, canEditProjectSettings),
    capabilityAllowed(database, actor, projectId, canPublishProject),
    capabilityAllowed(database, actor, projectId, canPublishMilestone),
    capabilityAllowed(database, actor, projectId, canManageMilestoneLifecycle),
  ]);

  return {
    status: "allowed",
    plan: {
      scope: authorization.scope,
      milestones: rows,
      permissions: {
        canEditDraft,
        canEditProjectSettings: canEditProjectSettingsResult,
        canPublishProject: canPublishProjectResult,
        canPublishMilestone: canPublishMilestoneResult,
        canManageLifecycle,
      },
    },
  };
}

export async function getAgencyMilestoneDetail(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
  milestoneId: string,
): Promise<
  | Readonly<{
      status: "allowed";
      milestone: AgencyMilestoneListItem;
      plan: AgencyMilestonePlan;
    }>
  | Readonly<{ status: "denied" }>
  | Readonly<{ status: "not-found" }>
> {
  const planResult = await getAgencyMilestonePlan(database, actor, projectId);
  if (planResult.status !== "allowed") return planResult;
  const milestone = planResult.plan.milestones.find(
    (item) => item.milestoneId === milestoneId,
  );
  if (!milestone) return { status: "not-found" };
  return { status: "allowed", milestone, plan: planResult.plan };
}

export type ClientMilestoneListItem = Readonly<{
  milestoneId: string;
  title: string;
  purpose: string | null;
  clientDescription: string | null;
  ordinal: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  state: MilestoneState;
  activatedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
}>;

export type ClientMilestonePlan = Readonly<{
  scope: AuthorizedProjectScope<"VIEW_PROJECT">;
  milestones: readonly ClientMilestoneListItem[];
}>;

export async function getClientMilestonePlan(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
): Promise<
  | Readonly<{ status: "allowed"; plan: ClientMilestonePlan }>
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
  if (authorization.scope.actorAssignment?.kind !== "CLIENT") {
    return { status: "denied" };
  }

  const rows = await database.db
    .select({
      milestoneId: milestones.id,
      title: milestones.title,
      purpose: milestones.purpose,
      clientDescription: milestones.clientDescription,
      plannedStartDate: milestones.plannedStartDate,
      plannedEndDate: milestones.plannedEndDate,
      state: milestones.state,
      activatedAt: milestones.activatedAt,
      completedAt: milestones.completedAt,
      cancelledAt: milestones.cancelledAt,
    })
    .from(milestones)
    .where(
      and(
        eq(milestones.workspaceId, authorization.scope.workspaceId),
        eq(milestones.projectId, authorization.scope.projectId),
        // Published Milestones are the only client-visible delivery plan.
        // Raw positions remain server-only so hidden Draft gaps cannot leak.
        isNotNull(milestones.publishedAt),
      ),
    )
    .orderBy(asc(milestones.position), asc(milestones.id));

  return {
    status: "allowed",
    plan: {
      scope: authorization.scope,
      milestones: rows.map((row, index) => ({ ...row, ordinal: index + 1 })),
    },
  };
}

export async function getClientMilestoneDetail(
  database: DatabaseClient,
  actor: ActorContext,
  projectId: string,
  milestoneId: string,
): Promise<
  | Readonly<{
      status: "allowed";
      milestone: ClientMilestoneListItem;
      plan: ClientMilestonePlan;
    }>
  | Readonly<{ status: "denied" }>
  | Readonly<{ status: "not-found" }>
> {
  const planResult = await getClientMilestonePlan(database, actor, projectId);
  if (planResult.status !== "allowed") return planResult;
  const milestone = planResult.plan.milestones.find(
    (item) => item.milestoneId === milestoneId,
  );
  if (!milestone) return { status: "not-found" };
  return { status: "allowed", milestone, plan: planResult.plan };
}
