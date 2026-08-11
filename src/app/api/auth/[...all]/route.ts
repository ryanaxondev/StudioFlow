import { toNextJsHandler } from "better-auth/next-js";

import { systemClock } from "../../../../lib/clock";
import { ACCESS_VERIFY_RATE_LIMIT } from "../../../../modules/auth/constants";
import {
  createRateLimitKey,
  consumeAuthenticationRateLimit,
  readRequestIp,
} from "../../../../modules/auth/rate-limit";
import { normalizeReturnTo } from "../../../../modules/auth/redirects";
import { getStudioFlowAuth } from "../../../../modules/auth/server/auth";
import { getApplicationDatabase } from "../../../../server/database";

const publicGetPaths = new Set(["/magic-link/verify"]);
const publicPostPaths = new Set(["/sign-out"]);

function authPath(request: Request): string {
  const pathname = new URL(request.url).pathname;
  return pathname.slice("/api/auth".length) || "/";
}

function notFound(): Response {
  return new Response(null, { status: 404 });
}

export async function GET(request: Request): Promise<Response> {
  const path = authPath(request);
  if (!publicGetPaths.has(path)) {
    return notFound();
  }

  const result = await consumeAuthenticationRateLimit(
    getApplicationDatabase(),
    {
      keys: [createRateLimitKey("verify-ip", readRequestIp(request.headers))],
      rule: ACCESS_VERIFY_RATE_LIMIT,
      clock: systemClock,
    },
  );

  if (!result.allowed) {
    const requestedUrl = new URL(request.url);
    const returnTo = normalizeReturnTo(
      requestedUrl.searchParams.get("callbackURL"),
    );
    const recoveryUrl = new URL("/recover-access", request.url);
    recoveryUrl.searchParams.set("state", "rate-limited");
    recoveryUrl.searchParams.set("returnTo", returnTo);
    return Response.redirect(recoveryUrl, 302);
  }

  return toNextJsHandler(getStudioFlowAuth()).GET(request);
}

export async function POST(request: Request): Promise<Response> {
  if (!publicPostPaths.has(authPath(request))) {
    return notFound();
  }

  return toNextJsHandler(getStudioFlowAuth()).POST(request);
}
