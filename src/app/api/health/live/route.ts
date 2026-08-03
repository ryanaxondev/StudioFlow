import { createLivenessPayload } from "../../../../lib/health";

export function GET(): Response {
  return Response.json(createLivenessPayload());
}
