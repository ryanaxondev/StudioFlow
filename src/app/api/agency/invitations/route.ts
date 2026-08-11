import { z } from "zod";

import {
  parseAuthenticationEnvironment,
  parseAuthenticationMessageEnvironment,
} from "../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../modules/auth/origin";
import { getCurrentStudioFlowSession } from "../../../../modules/auth/server/session";
import {
  inviteClientMember,
  inviteWorkspaceMember,
  InvitationError,
} from "../../../../modules/invitations/service";
import {
  requireActiveWorkspaceRole,
  workspaceClientManagerRoles,
  workspaceOwnerRoles,
} from "../../../../modules/memberships/service";
import { getApplicationDatabase } from "../../../../server/database";
import { logger } from "../../../../server/observability/logger";

const requestSchema = z.discriminatedUnion("membershipType", [
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

function invitationErrorResponse(error: InvitationError): Response {
  const status =
    error.code === "PENDING_EXISTS"
      ? "pending-exists"
      : error.code === "ALREADY_MEMBER"
        ? "already-member"
        : error.code === "TARGET_UNAVAILABLE"
          ? "target-unavailable"
          : "forbidden";
  return Response.json(
    { status },
    { status: status === "forbidden" ? 403 : 409 },
  );
}

export async function POST(request: Request): Promise<Response> {
  const authenticationEnvironment = parseAuthenticationEnvironment(process.env);
  if (
    !hasTrustedAuthenticationOrigin(
      request.headers,
      authenticationEnvironment.BETTER_AUTH_URL,
    )
  ) {
    return Response.json({ status: "forbidden" }, { status: 403 });
  }

  const session = await getCurrentStudioFlowSession(request.headers);
  if (!session) {
    return Response.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ status: "invalid-request" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ status: "invalid-request" }, { status: 400 });
  }

  const database = getApplicationDatabase();
  try {
    await requireActiveWorkspaceRole(database.db, {
      workspaceId: parsed.data.workspaceId,
      userId: session.user.id,
      allowedRoles:
        parsed.data.membershipType === "WORKSPACE_MEMBER"
          ? workspaceOwnerRoles
          : workspaceClientManagerRoles,
    });
  } catch {
    return Response.json({ status: "forbidden" }, { status: 403 });
  }

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
            actorUserId: session.user.id,
            workspaceId: parsed.data.workspaceId,
            email: parsed.data.email,
            role: parsed.data.role,
            delivery,
          })
        : await inviteClientMember({
            database,
            actorUserId: session.user.id,
            workspaceId: parsed.data.workspaceId,
            clientOrganizationId: parsed.data.clientOrganizationId,
            email: parsed.data.email,
            delivery,
          });

    return Response.json({
      status: "invitation-sent",
      invitationId: result.invitationId,
    });
  } catch (error) {
    if (error instanceof InvitationError) {
      return invitationErrorResponse(error);
    }

    logger.error("invitation.management_create_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
