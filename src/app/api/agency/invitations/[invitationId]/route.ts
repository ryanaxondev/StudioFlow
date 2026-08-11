import { z } from "zod";

import {
  parseAuthenticationEnvironment,
  parseAuthenticationMessageEnvironment,
} from "../../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../../modules/auth/origin";
import { getCurrentStudioFlowSession } from "../../../../../modules/auth/server/session";
import {
  InvitationError,
  resendInvitation,
  revokeInvitation,
} from "../../../../../modules/invitations/service";
import { getApplicationDatabase } from "../../../../../server/database";
import { logger } from "../../../../../server/observability/logger";

const requestSchema = z.object({
  action: z.enum(["resend", "revoke"]),
});

type RouteContext = Readonly<{
  params: Promise<{ invitationId: string }>;
}>;

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
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

  const { invitationId } = await context.params;
  if (!z.string().uuid().safeParse(invitationId).success) {
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

  try {
    if (parsed.data.action === "revoke") {
      const revoked = await revokeInvitation({
        database: getApplicationDatabase(),
        actorUserId: session.user.id,
        invitationId,
      });
      return Response.json({ status: revoked ? "revoked" : "unchanged" });
    }

    const messageEnvironment = parseAuthenticationMessageEnvironment(
      process.env,
    );
    const result = await resendInvitation({
      database: getApplicationDatabase(),
      actorUserId: session.user.id,
      invitationId,
      delivery: {
        baseUrl: authenticationEnvironment.BETTER_AUTH_URL,
        encryptionSecret: messageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
      },
    });

    return Response.json({
      status: "resent",
      invitationId: result.invitationId,
    });
  } catch (error) {
    if (error instanceof InvitationError) {
      const status = error.code.toLowerCase().replaceAll("_", "-");
      return Response.json(
        { status },
        { status: error.code === "FORBIDDEN" ? 403 : 409 },
      );
    }

    logger.error("invitation.management_update_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
