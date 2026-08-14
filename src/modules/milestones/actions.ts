"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getApplicationDatabase } from "../../server/database";
import { logger } from "../../server/observability/logger";
import { getCurrentActorContext } from "../authorization/server/authorization";
import { AuthorizationError } from "../authorization/types";
import { ProjectDomainError } from "../projects/errors";
import {
  activateMilestone,
  cancelMilestone,
  completeMilestone,
  completeMilestoneWithOverride,
  createMilestoneDraft,
  moveProjectToActive,
  publishMilestone,
  publishProject,
  reorderMilestones,
  updateMilestoneDraft,
} from "./service";

export type MilestoneActionResult = Readonly<{
  ok: boolean;
  status: string;
  projectId?: string;
  projectRowVersion?: number;
  milestoneId?: string;
  milestoneRowVersion?: number;
  activeMilestoneId?: string;
}>;

const uuid = z.string().uuid();
const rowVersion = z.number().int().positive();
const idempotencyKey = z.string().trim().min(8).max(160);
const optionalDate = z.string().trim().nullable().optional();

const createSchema = z.object({
  projectId: uuid,
  title: z.string().trim().min(1).max(240),
  purpose: z.string().max(5000).nullable().optional(),
  clientDescription: z.string().max(5000).nullable().optional(),
  plannedStartDate: optionalDate,
  plannedEndDate: optionalDate,
  expectedProjectRowVersion: rowVersion,
  idempotencyKey,
});

const updateSchema = createSchema.extend({
  milestoneId: uuid,
  expectedMilestoneRowVersion: rowVersion,
});

const reorderSchema = z.object({
  projectId: uuid,
  orderedMilestoneIds: z.array(uuid).min(1),
  expectedProjectRowVersion: rowVersion,
  idempotencyKey,
});

const projectCommandSchema = z.object({
  projectId: uuid,
  expectedProjectRowVersion: rowVersion,
  idempotencyKey,
});

const milestoneCommandSchema = projectCommandSchema.extend({
  milestoneId: uuid,
  expectedMilestoneRowVersion: rowVersion,
});

const overrideSchema = milestoneCommandSchema.extend({
  reason: z.string().trim().min(1).max(5000),
});

async function currentActor() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  return { actor, database };
}

function failureFrom(error: unknown): MilestoneActionResult {
  if (error instanceof AuthorizationError) {
    return { ok: false, status: "forbidden" };
  }
  if (error instanceof ProjectDomainError) {
    return {
      ok: false,
      status: error.code.toLowerCase().replaceAll("_", "-"),
    };
  }
  logger.error("milestone.action_failed");
  return { ok: false, status: "service-error" };
}

function revalidateProject(projectId: string): void {
  revalidatePath("/agency");
  revalidatePath("/agency/projects");
  revalidatePath(`/agency/projects/${projectId}`);
  revalidatePath(`/agency/projects/${projectId}/setup`);
  revalidatePath(`/agency/projects/${projectId}/delivery`);
  revalidatePath(`/agency/projects/${projectId}/settings`);
}

export async function createMilestoneDraftAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await createMilestoneDraft({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "milestone-created", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function updateMilestoneDraftAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await updateMilestoneDraft({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "milestone-saved", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function reorderMilestonesAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await reorderMilestones({ database, actor, ...parsed.data });
    revalidateProject(result.projectId);
    return { ok: true, status: "milestones-reordered", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function publishProjectAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = projectCommandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await publishProject({ database, actor, ...parsed.data });
    revalidateProject(result.projectId);
    return { ok: true, status: "project-published", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

async function runMilestoneCommand(
  input: unknown,
  command:
    | typeof publishMilestone
    | typeof activateMilestone
    | typeof completeMilestone
    | typeof cancelMilestone,
  successStatus: string,
): Promise<MilestoneActionResult> {
  const parsed = milestoneCommandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await command({ database, actor, ...parsed.data });
    revalidateProject(result.projectId);
    revalidatePath(
      `/agency/projects/${result.projectId}/delivery/milestones/${result.milestoneId}`,
    );
    return { ok: true, status: successStatus, ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function publishMilestoneAction(input: unknown) {
  return runMilestoneCommand(input, publishMilestone, "milestone-published");
}

export async function activateMilestoneAction(input: unknown) {
  return runMilestoneCommand(input, activateMilestone, "milestone-activated");
}

export async function completeMilestoneAction(input: unknown) {
  return runMilestoneCommand(input, completeMilestone, "milestone-completed");
}

export async function cancelMilestoneAction(input: unknown) {
  return runMilestoneCommand(input, cancelMilestone, "milestone-cancelled");
}

export async function completeMilestoneWithOverrideAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await completeMilestoneWithOverride({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    revalidatePath(
      `/agency/projects/${result.projectId}/delivery/milestones/${result.milestoneId}`,
    );
    return { ok: true, status: "milestone-completed-with-override", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function moveProjectToActiveAction(
  input: unknown,
): Promise<MilestoneActionResult> {
  const parsed = projectCommandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };
  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  try {
    const result = await moveProjectToActive({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "project-active", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}
