import { z } from "zod";

import { parseAuthenticationEnvironment } from "../../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../../modules/auth/origin";
import { getCurrentStudioFlowSession } from "../../../../../modules/auth/server/session";
import {
  changeWorkspaceMembershipRole,
  requireActiveWorkspaceRole,
  revokeWorkspaceMembership,
  workspaceOwnerRoles,
} from "../../../../../modules/memberships/service";
import { getApplicationDatabase } from "../../../../../server/database";
import { logger } from "../../../../../server/observability/logger";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    workspaceId: z.string().uuid(),
    action: z.literal("revoke"),
  }),
  z.object({
    workspaceId: z.string().uuid(),
    action: z.literal("change-role"),
    role: z.enum(["AGENCY_OWNER", "DELIVERY_MANAGER", "AGENCY_MEMBER"]),
  }),
]);

type RouteContext = Readonly<{ params: Promise<{ userId: string }> }>;

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const environment = parseAuthenticationEnvironment(process.env);
  if (
    !hasTrustedAuthenticationOrigin(
      request.headers,
      environment.BETTER_AUTH_URL,
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

  const { userId } = await context.params;
  if (!z.string().uuid().safeParse(userId).success) {
    return Response.json({ status: "invalid-request" }, { status: 400 });
  }
  if (userId === session.user.id) {
    return Response.json(
      { status: "cannot-modify-current-account" },
      { status: 409 },
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
      allowedRoles: workspaceOwnerRoles,
    });
  } catch {
    return Response.json({ status: "forbidden" }, { status: 403 });
  }

  try {
    if (parsed.data.action === "change-role") {
      const updated = await changeWorkspaceMembershipRole({
        database,
        actorUserId: session.user.id,
        workspaceId: parsed.data.workspaceId,
        targetUserId: userId,
        role: parsed.data.role,
      });
      return Response.json({
        status: updated ? "role-updated" : "unchanged",
      });
    }

    const revoked = await revokeWorkspaceMembership({
      database,
      actorUserId: session.user.id,
      workspaceId: parsed.data.workspaceId,
      targetUserId: userId,
    });
    return Response.json({ status: revoked ? "revoked" : "unchanged" });
  } catch {
    logger.error("workspace_membership.update_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
