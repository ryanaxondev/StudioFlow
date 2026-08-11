import { z } from "zod";

import { systemClock } from "../../../../lib/clock";
import { requestAccessLink } from "../../../../modules/auth/access-service";
import { parseAuthenticationEnvironment } from "../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../modules/auth/origin";
import { readRequestIp } from "../../../../modules/auth/rate-limit";
import { getStudioFlowAuth } from "../../../../modules/auth/server/auth";
import { getApplicationDatabase } from "../../../../server/database";
import { logger } from "../../../../server/observability/logger";

const requestSchema = z.object({
  email: z.string().email(),
  returnTo: z.string().optional(),
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
    const result = await requestAccessLink({
      database: getApplicationDatabase(),
      email: parsed.data.email,
      returnTo: parsed.data.returnTo,
      requestIp: readRequestIp(request.headers),
      requestHeaders: request.headers,
      clock: systemClock,
      issueMagicLink: async ({
        email,
        callbackURL,
        errorCallbackURL,
        headers,
      }) => {
        try {
          await authentication.api.signInMagicLink({
            body: {
              email,
              callbackURL,
              errorCallbackURL,
            },
            headers,
          });
        } catch (error) {
          logger.error("authentication.magic_link_delivery_failed");
          throw error;
        }
      },
    });

    if (result.status === "rate-limited") {
      return Response.json(
        { status: result.status },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
          },
        },
      );
    }

    return Response.json({ status: result.status });
  } catch {
    logger.error("authentication.access_request_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
