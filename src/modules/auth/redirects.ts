import { DEFAULT_AUTHENTICATED_DESTINATION } from "./constants";

export function normalizeReturnTo(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_AUTHENTICATED_DESTINATION;
  }

  const candidate = value.trim();
  if (
    candidate.length === 0 ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return DEFAULT_AUTHENTICATED_DESTINATION;
  }

  try {
    const parsed = new URL(candidate, "http://studioflow.local");
    if (parsed.origin !== "http://studioflow.local") {
      return DEFAULT_AUTHENTICATED_DESTINATION;
    }

    if (parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")) {
      return DEFAULT_AUTHENTICATED_DESTINATION;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_AUTHENTICATED_DESTINATION;
  }
}

export function buildRecoveryPath(returnTo: string): string {
  const parameters = new URLSearchParams({
    state: "unknown-link",
    returnTo: normalizeReturnTo(returnTo),
  });

  return `/recover-access?${parameters.toString()}`;
}
