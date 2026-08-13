"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getApplicationDatabase } from "../../server/database";
import { logger } from "../../server/observability/logger";
import { getCurrentActorContext } from "../authorization/server/authorization";
import { AuthorizationError } from "../authorization/types";
import { ProjectDomainError } from "./errors";
import {
  assignProjectMember,
  createDraftProject,
  deleteEligibleDraftProject,
  reassignClientApprover,
  reassignDeliveryManager,
  removeProjectMember,
  updateDraftProjectIdentity,
} from "./service";

export type ProjectActionResult = Readonly<{
  ok: boolean;
  status: string;
  projectId?: string;
  rowVersion?: number;
}>;

const uuid = z.string().uuid();
const rowVersion = z.number().int().positive();
const idempotencyKey = z.string().trim().min(8).max(160);

const createSchema = z.object({
  workspaceId: uuid,
  clientOrganizationId: uuid,
  title: z.string().trim().min(1).max(240),
  deliveryManagerUserId: uuid,
  idempotencyKey,
});

const identitySchema = z.object({
  projectId: uuid,
  title: z.string().trim().min(1).max(240),
  clientSummary: z.string().max(5000).nullable().optional(),
  plannedStartDate: z.string().nullable().optional(),
  targetCompletionDate: z.string().nullable().optional(),
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

const assignSchema = z.object({
  projectId: uuid,
  userId: uuid,
  projectRole: z.enum(["AGENCY_MEMBER", "CLIENT_CONTRIBUTOR"]),
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

const removeSchema = z.object({
  projectId: uuid,
  userId: uuid,
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

const deliveryManagerSchema = z.object({
  projectId: uuid,
  deliveryManagerUserId: uuid,
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

const clientApproverSchema = z.object({
  projectId: uuid,
  clientApproverUserId: uuid,
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

const deleteSchema = z.object({
  projectId: uuid,
  expectedRowVersion: rowVersion,
  idempotencyKey,
});

async function currentActor() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  return { actor, database };
}

function failureFrom(error: unknown): ProjectActionResult {
  if (error instanceof AuthorizationError) {
    return { ok: false, status: "forbidden" };
  }
  if (error instanceof ProjectDomainError) {
    return {
      ok: false,
      status: error.code.toLowerCase().replaceAll("_", "-"),
    };
  }

  logger.error("project.action_failed");
  return { ok: false, status: "service-error" };
}

function revalidateProject(projectId: string): void {
  revalidatePath("/agency");
  revalidatePath("/agency/projects");
  revalidatePath(`/agency/projects/${projectId}/setup`);
  revalidatePath(`/agency/projects/${projectId}/settings`);
  revalidatePath(`/agency/projects/${projectId}/settings/people`);
  revalidatePath(`/agency/projects/${projectId}/settings/lifecycle`);
  revalidatePath("/agency/clients");
}

export async function createDraftProjectAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await createDraftProject({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return {
      ok: true,
      status: "created",
      projectId: result.projectId,
      rowVersion: result.rowVersion,
    };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function updateDraftProjectIdentityAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = identitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await updateDraftProjectIdentity({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "saved", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function assignProjectMemberAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await assignProjectMember({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "member-assigned", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function removeProjectMemberAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await removeProjectMember({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "member-removed", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function reassignDeliveryManagerAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = deliveryManagerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await reassignDeliveryManager({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "delivery-manager-updated", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function reassignClientApproverAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = clientApproverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await reassignClientApprover({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "client-approver-updated", ...result };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function deleteDraftProjectAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await deleteEligibleDraftProject({
      database,
      actor,
      ...parsed.data,
    });
    revalidateProject(result.projectId);
    return { ok: true, status: "deleted", projectId: result.projectId };
  } catch (error) {
    return failureFrom(error);
  }
}
