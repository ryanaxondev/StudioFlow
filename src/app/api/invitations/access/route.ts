import { z } from "zod";

import { systemClock } from "../../../../lib/clock";
import { parseAuthenticationEnvironment } from "../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../modules/auth/origin";
import { readRequestIp } from "../../../../modules/auth/rate-limit";
import { getStudioFlowAuth } from "../../../../modules/auth/server/auth";
import { prepareInvitationAccess } from "../../../../modules/invitations/access-service";
import { getApplicationDatabase } from "../../../../server/database";
import { logger } from "../../../../server/observability/logger";

const requestSchema = z.object({
  token: z.string().min(1).max(512),
  displayName: z.string().max(120).optional(),
});

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

  try {
    const authentication = getStudioFlowAuth();
    const result = await prepareInvitationAccess({
      database: getApplicationDatabase(),
      token: parsed.data.token,
      displayName: parsed.data.displayName,
      requestIp: readRequestIp(request.headers),
      requestHeaders: request.headers,
      clock: systemClock,
      issueMagicLink: async ({
        email,
        callbackURL,
        errorCallbackURL,
        headers,
      }) => {
        await authentication.api.signInMagicLink({
          body: { email, callbackURL, errorCallbackURL },
          headers,
        });
      },
    });

    if (result.status === "rate-limited") {
      return Response.json(
        { status: result.status },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }

    return Response.json({ status: result.status });
  } catch {
    logger.error("invitation.access_request_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
