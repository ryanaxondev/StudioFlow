"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  logAuthorizationDenied,
  getCurrentActorContext,
} from "../authorization/server/authorization";
import { AuthorizationError } from "../authorization/types";
import {
  parseAuthenticationEnvironment,
  parseAuthenticationMessageEnvironment,
} from "../auth/environment";
import {
  inviteClientMember,
  inviteWorkspaceMember,
  InvitationError,
  resendInvitation,
  revokeInvitation,
} from "../invitations/service";
import {
  changeWorkspaceMembershipRole,
  createClientOrganization,
  revokeClientMembership,
  revokeWorkspaceMembership,
  RequiredProjectAuthorityError,
} from "../memberships/service";
import { getApplicationDatabase } from "../../server/database";
import { logger } from "../../server/observability/logger";

export type AgencyActionResult<T extends string = string> = Readonly<{
  ok: boolean;
  status: T;
  id?: string;
}>;

const createClientOrganizationSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
});

const inviteSchema = z.discriminatedUnion("membershipType", [
  z.object({
    membershipType: z.literal("WORKSPACE_MEMBER"),
    workspaceId: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(["AGENCY_OWNER", "DELIVERY_MANAGER", "AGENCY_MEMBER"]),
  }),
  z.object({
    membershipType: z.literal("CLIENT_MEMBER"),
    workspaceId: z.string().uuid(),
    clientOrganizationId: z.string().uuid(),
    email: z.string().email(),
  }),
]);

const invitationUpdateSchema = z.object({
  invitationId: z.string().uuid(),
  action: z.enum(["resend", "revoke"]),
});

const workspaceMemberUpdateSchema = z.discriminatedUnion("action", [
  z.object({
    workspaceId: z.string().uuid(),
    targetUserId: z.string().uuid(),
    action: z.literal("revoke"),
  }),
  z.object({
    workspaceId: z.string().uuid(),
    targetUserId: z.string().uuid(),
    action: z.literal("change-role"),
    role: z.enum(["AGENCY_OWNER", "DELIVERY_MANAGER", "AGENCY_MEMBER"]),
  }),
]);

const clientMemberRevokeSchema = z.object({
  workspaceId: z.string().uuid(),
  clientOrganizationId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

async function currentActor() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  return { actor, database };
}

function authorizationFailure(
  error: AuthorizationError,
  surface: string,
): AgencyActionResult<"forbidden"> {
  logAuthorizationDenied(
    {
      allowed: false,
      capability: error.capability,
      reason: error.reason,
    },
    surface,
  );
  return { ok: false, status: "forbidden" };
}

export async function createClientOrganizationAction(
  input: unknown,
): Promise<AgencyActionResult> {
  const parsed = createClientOrganizationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const result = await createClientOrganization({
      database,
      actor,
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
    });
    revalidatePath("/agency/clients");
    return { ok: true, status: "created", id: result.clientOrganizationId };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationFailure(error, "agency.client-organization.create");
    }
    logger.error("client_organization.create_failed");
    return { ok: false, status: "service-error" };
  }
}

export async function createInvitationAction(
  input: unknown,
): Promise<AgencyActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  const authenticationEnvironment = parseAuthenticationEnvironment(process.env);
  const messageEnvironment = parseAuthenticationMessageEnvironment(process.env);
  const delivery = {
    baseUrl: authenticationEnvironment.BETTER_AUTH_URL,
    encryptionSecret: messageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
  };

  try {
    const result =
      parsed.data.membershipType === "WORKSPACE_MEMBER"
        ? await inviteWorkspaceMember({
            database,
            actor,
            workspaceId: parsed.data.workspaceId,
            email: parsed.data.email,
            role: parsed.data.role,
            delivery,
          })
        : await inviteClientMember({
            database,
            actor,
            workspaceId: parsed.data.workspaceId,
            clientOrganizationId: parsed.data.clientOrganizationId,
            email: parsed.data.email,
            delivery,
          });

    revalidatePath("/agency/settings/members");
    revalidatePath("/agency/clients");
    return { ok: true, status: "invitation-sent", id: result.invitationId };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationFailure(error, "agency.invitation.create");
    }
    if (error instanceof InvitationError) {
      const status =
        error.code === "PENDING_EXISTS"
          ? "pending-exists"
          : error.code === "ALREADY_MEMBER"
            ? "already-member"
            : error.code === "TARGET_UNAVAILABLE"
              ? "target-unavailable"
              : "forbidden";
      return { ok: false, status };
    }
    logger.error("invitation.management_create_failed");
    return { ok: false, status: "service-error" };
  }
}

export async function updateInvitationAction(
  input: unknown,
): Promise<AgencyActionResult> {
  const parsed = invitationUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    if (parsed.data.action === "revoke") {
      const revoked = await revokeInvitation({
        database,
        actor,
        invitationId: parsed.data.invitationId,
      });
      revalidatePath("/agency/settings/members");
      revalidatePath("/agency/clients");
      return { ok: true, status: revoked ? "revoked" : "unchanged" };
    }

    const authenticationEnvironment = parseAuthenticationEnvironment(
      process.env,
    );
    const messageEnvironment = parseAuthenticationMessageEnvironment(
      process.env,
    );
    const result = await resendInvitation({
      database,
      actor,
      invitationId: parsed.data.invitationId,
      delivery: {
        baseUrl: authenticationEnvironment.BETTER_AUTH_URL,
        encryptionSecret: messageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
      },
    });
    revalidatePath("/agency/settings/members");
    revalidatePath("/agency/clients");
    return { ok: true, status: "resent", id: result.invitationId };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationFailure(error, "agency.invitation.update");
    }
    if (error instanceof InvitationError) {
      return {
        ok: false,
        status: error.code.toLowerCase().replaceAll("_", "-"),
      };
    }
    logger.error("invitation.management_update_failed");
    return { ok: false, status: "service-error" };
  }
}

export async function updateWorkspaceMemberAction(
  input: unknown,
): Promise<AgencyActionResult> {
  const parsed = workspaceMemberUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };
  if (actor.userId === parsed.data.targetUserId) {
    return { ok: false, status: "cannot-modify-current-account" };
  }

  try {
    if (parsed.data.action === "change-role") {
      const updated = await changeWorkspaceMembershipRole({
        database,
        actor,
        workspaceId: parsed.data.workspaceId,
        targetUserId: parsed.data.targetUserId,
        role: parsed.data.role,
      });
      revalidatePath("/agency/settings/members");
      return { ok: true, status: updated ? "role-updated" : "unchanged" };
    }

    const revoked = await revokeWorkspaceMembership({
      database,
      actor,
      workspaceId: parsed.data.workspaceId,
      targetUserId: parsed.data.targetUserId,
    });
    revalidatePath("/agency/settings/members");
    return { ok: true, status: revoked ? "revoked" : "unchanged" };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationFailure(error, "agency.workspace-member.update");
    }
    if (error instanceof RequiredProjectAuthorityError) {
      return { ok: false, status: "required-project-authority" };
    }
    logger.error("workspace_membership.update_failed");
    return { ok: false, status: "service-error" };
  }
}

export async function revokeClientMemberAction(
  input: unknown,
): Promise<AgencyActionResult> {
  const parsed = clientMemberRevokeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: "invalid-request" };

  const { actor, database } = await currentActor();
  if (!actor) return { ok: false, status: "authentication-required" };

  try {
    const revoked = await revokeClientMembership({
      database,
      actor,
      workspaceId: parsed.data.workspaceId,
      clientOrganizationId: parsed.data.clientOrganizationId,
      targetUserId: parsed.data.targetUserId,
    });
    revalidatePath("/agency/clients");
    return { ok: true, status: revoked ? "revoked" : "unchanged" };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return authorizationFailure(error, "agency.client-member.revoke");
    }
    if (error instanceof RequiredProjectAuthorityError) {
      return { ok: false, status: "required-project-authority" };
    }
    logger.error("client_membership.revoke_failed");
    return { ok: false, status: "service-error" };
  }
}
