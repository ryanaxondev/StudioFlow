export type ProjectDomainErrorCode =
  | "ACTOR_UNAVAILABLE"
  | "CLIENT_ORGANIZATION_UNAVAILABLE"
  | "DELETE_NOT_ELIGIBLE"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_MEMBER"
  | "INVALID_REQUEST"
  | "INVALID_STATE"
  | "PROJECT_NOT_FOUND"
  | "REQUIRED_ROLE"
  | "ROW_VERSION_CONFLICT";

export class ProjectDomainError extends Error {
  constructor(readonly code: ProjectDomainErrorCode) {
    super("The Project command could not be completed.");
    this.name = "ProjectDomainError";
  }
}
