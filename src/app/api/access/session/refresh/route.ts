import { systemClock } from "../../../../../lib/clock";
import { parseAuthenticationEnvironment } from "../../../../../modules/auth/environment";
import { hasTrustedAuthenticationOrigin } from "../../../../../modules/auth/origin";
import { getStudioFlowAuth } from "../../../../../modules/auth/server/auth";
import { validateStoredSession } from "../../../../../modules/auth/session-policy";
import { getApplicationDatabase } from "../../../../../server/database";
import { logger } from "../../../../../server/observability/logger";

function responseWithAuthenticationCookies(
  status: number,
  sourceHeaders: Headers,
): Response {
  const headers = new Headers({
    "cache-control": "no-store",
    pragma: "no-cache",
  });

  for (const cookie of sourceHeaders.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }

  return new Response(null, { status, headers });
}

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

  try {
    const authentication = getStudioFlowAuth();
    const database = getApplicationDatabase();
    const current = await authentication.api.getSession({
      headers: request.headers,
      query: {
        disableRefresh: true,
      },
      returnHeaders: true,
    });

    if (!current.response) {
      return responseWithAuthenticationCookies(401, current.headers);
    }

    const valid = await validateStoredSession(
      database,
      current.response.session.id,
      current.response.user.id,
      systemClock.now(),
      { revokeInvalid: false },
    );

    if (!valid) {
      const signedOut = await authentication.api.signOut({
        headers: request.headers,
        asResponse: true,
      });
      return responseWithAuthenticationCookies(401, signedOut.headers);
    }

    const refreshed = await authentication.api.getSession({
      headers: request.headers,
      returnHeaders: true,
    });

    if (!refreshed.response) {
      return responseWithAuthenticationCookies(401, refreshed.headers);
    }

    return responseWithAuthenticationCookies(204, refreshed.headers);
  } catch {
    logger.error("authentication.session_refresh_failed");
    return Response.json({ status: "service-error" }, { status: 503 });
  }
}
