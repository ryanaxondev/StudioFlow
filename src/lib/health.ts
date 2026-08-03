import type { ServerEnvironment } from "./env-schema";

export function createLivenessPayload() {
  return {
    status: "ok",
    service: "web",
  } as const;
}

export function createReadinessPayload(environment: ServerEnvironment) {
  return {
    status: "ready",
    service: "web",
    environment: environment.NODE_ENV,
  } as const;
}
