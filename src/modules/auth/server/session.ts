import "server-only";

import { systemClock } from "../../../lib/clock";
import { getApplicationDatabase } from "../../../server/database";
import { validateStoredSession } from "../session-policy";
import { getStudioFlowAuth } from "./auth";

export async function getCurrentStudioFlowSession(requestHeaders: Headers) {
  const authentication = getStudioFlowAuth();
  const session = await authentication.api.getSession({
    headers: requestHeaders,
    query: {
      disableRefresh: true,
    },
  });

  if (!session) {
    return null;
  }

  const valid = await validateStoredSession(
    getApplicationDatabase(),
    session.session.id,
    session.user.id,
    systemClock.now(),
  );

  return valid ? session : null;
}
