import { z } from "zod";

import { getCurrentStudioFlowSession } from "../../../../modules/auth/server/session";
import { getInvitationPresentation } from "../../../../modules/invitations/presentation";
import { getApplicationDatabase } from "../../../../server/database";
import { logger } from "../../../../server/observability/logger";

const requestSchema = z.object({
  token: z.string().min(1).max(512),
});

export async function POST(request: Request): Promise<Response> {
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
    const [presentation, session] = await Promise.all([
      getInvitationPresentation(getApplicationDatabase(), parsed.data.token),
      getCurrentStudioFlowSession(request.headers),
    ]);

    if (
      presentation.state === "valid" &&
      session &&
      presentation.invitedEmail &&
      session.user.email.trim().toLowerCase() !== presentation.invitedEmail
    ) {
      return Response.json({
        status: "wrong-account",
        authenticated: true,
      });
    }

    return Response.json({
      status: presentation.state,
      authenticated: Boolean(session),
      accountMatches:
        Boolean(session) &&
        Boolean(presentation.invitedEmail) &&
        session?.user.email.trim().toLowerCase() === presentation.invitedEmail,
      membershipType: presentation.membershipType,
      intendedRole: presentation.intendedRole,
      workspaceName: presentation.workspaceName,
      clientOrganizationName: presentation.clientOrganizationName,
      expiresAt: presentation.expiresAt?.toISOString(),
      identityExists: presentation.identityExists,
    });
  } catch {
    logger.error("invitation.presentation_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
