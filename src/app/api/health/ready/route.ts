import { createReadinessPayload } from "../../../../lib/health";
import { getServerEnvironment } from "../../../../server/env";

export function GET(): Response {
  try {
    const environment = getServerEnvironment();

    return Response.json(createReadinessPayload(environment));
  } catch {
    return Response.json(
      {
        status: "not_ready",
        service: "web",
      },
      {
        status: 503,
      },
    );
  }
}
