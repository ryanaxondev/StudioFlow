import { z } from "zod";

import { systemClock } from "../../../../lib/clock";
import { buildActorContext } from "../../../../modules/authorization/server/authorization";
import { parseAuthenticationEnvironment } from "../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../modules/auth/origin";
import { getCurrentStudioFlowSession } from "../../../../modules/auth/server/session";
import {
  acceptInvitation,
  InvitationError,
} from "../../../../modules/invitations/service";
import { getApplicationDatabase } from "../../../../server/database";
import { logger } from "../../../../server/observability/logger";

const requestSchema = z.object({
  token: z.string().min(1).max(512),
});

const statusByError = {
  INVALID: "invalid",
  EXPIRED: "expired",
  REVOKED: "revoked",
  ALREADY_ACCEPTED: "already-accepted",
  WRONG_ACCOUNT: "wrong-account",
  TARGET_UNAVAILABLE: "target-unavailable",
  PENDING_EXISTS: "service-error",
  ALREADY_MEMBER: "already-member",
  FORBIDDEN: "forbidden",
} as const;

export async function POST(request: Request): Promise<Response> {
  const environment = parseAuthenticationEnvironment(process.env);
  if (
    !hasTrustedAuthenticationOrigin(
      request.headers,
      environment.BETTER_AUTH_URL,
    )
  ) {
    return Response.json({ status: "forbidden" }, { status: 403 });
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

  const session = await getCurrentStudioFlowSession(request.headers);
  if (!session) {
    return Response.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }

  try {
    const database = getApplicationDatabase();
    const actor = await buildActorContext(database, {
      userId: session.user.id,
      sessionId: session.session.id,
    });
    const result = await acceptInvitation({
      database,
      actor,
      token: parsed.data.token,
      clock: systemClock,
    });

    return Response.json({ status: result.status, destination: "/account" });
  } catch (error) {
    if (error instanceof InvitationError) {
      const status = statusByError[error.code];
      const httpStatus =
        error.code === "FORBIDDEN"
          ? 403
          : error.code === "WRONG_ACCOUNT"
            ? 409
            : 400;
      return Response.json({ status }, { status: httpStatus });
    }

    logger.error("invitation.acceptance_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
