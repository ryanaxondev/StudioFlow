import { z } from "zod";

import { parseAuthenticationEnvironment } from "../../../../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../../../../modules/auth/origin";
import { getCurrentStudioFlowSession } from "../../../../../../../modules/auth/server/session";
import {
  requireActiveWorkspaceRole,
  revokeClientMembership,
  workspaceClientManagerRoles,
} from "../../../../../../../modules/memberships/service";
import { getApplicationDatabase } from "../../../../../../../server/database";
import { logger } from "../../../../../../../server/observability/logger";

const requestSchema = z.object({
  workspaceId: z.string().uuid(),
  action: z.literal("revoke"),
});

type RouteContext = Readonly<{
  params: Promise<{ clientOrganizationId: string; userId: string }>;
}>;

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

  const { clientOrganizationId, userId } = await context.params;
  if (
    !z.string().uuid().safeParse(clientOrganizationId).success ||
    !z.string().uuid().safeParse(userId).success
  ) {
    return Response.json({ status: "invalid-request" }, { status: 400 });
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
      allowedRoles: workspaceClientManagerRoles,
    });
  } catch {
    return Response.json({ status: "forbidden" }, { status: 403 });
  }

  try {
    const revoked = await revokeClientMembership({
      database,
      actorUserId: session.user.id,
      workspaceId: parsed.data.workspaceId,
      clientOrganizationId,
      targetUserId: userId,
    });
    return Response.json({ status: revoked ? "revoked" : "unchanged" });
  } catch {
    logger.error("client_membership.revoke_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
