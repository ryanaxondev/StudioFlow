import type { CapabilityResult } from "./types";

export function createAuthorizationLogContext(
  result: CapabilityResult,
  surface: string,
): Readonly<Record<string, string>> {
  return result.allowed
    ? { surface, capability: result.capability, outcome: "allowed" }
    : {
        surface,
        capability: result.capability,
        outcome: "denied",
        reason: result.reason,
      };
}
