import type { ProjectLifecycle, WorkspaceRole } from "../../db/schema";

export type ActorContext = Readonly<{
  userId: string;
  sessionId: string;
  workspaceMemberships: readonly Readonly<{
    workspaceId: string;
    role: WorkspaceRole;
  }>[];
  clientMemberships: readonly Readonly<{
    clientOrganizationId: string;
  }>[];
  demoInstanceId?: string;
}>;

export type AuthorizationCapability =
  | "VIEW_AGENCY_WORKSPACE"
  | "VIEW_AGENCY_DELIVERY"
  | "MANAGE_WORKSPACE"
  | "MANAGE_AGENCY_MEMBERS"
  | "CREATE_CLIENT_ORGANIZATION"
  | "VIEW_CLIENT_ORGANIZATIONS"
  | "VIEW_CLIENT_ORGANIZATION"
  | "MANAGE_CLIENT_MEMBERS"
  | "CREATE_PROJECT"
  | "VIEW_PROJECT"
  | "EDIT_PROJECT_SETTINGS"
  | "MANAGE_PROJECT_MEMBERS"
  | "DELETE_DRAFT_PROJECT"
  | "ENTER_CLIENT_PORTAL";

export type AuthorizationDenialReason =
  | "NO_WORKSPACE_MEMBERSHIP"
  | "ROLE_FORBIDDEN"
  | "NO_CLIENT_MEMBERSHIP"
  | "PROJECT_ASSIGNMENT_REQUIRED"
  | "PROJECT_CONTEXT_MISMATCH"
  | "PROJECT_DRAFT_AGENCY_ONLY";

export type CapabilityResult<
  Capability extends AuthorizationCapability = AuthorizationCapability,
> =
  | Readonly<{
      allowed: true;
      capability: Capability;
    }>
  | Readonly<{
      allowed: false;
      capability: Capability;
      reason: AuthorizationDenialReason;
    }>;

export type ProjectActorAssignment =
  | Readonly<{
      kind: "AGENCY";
      role: "DELIVERY_MANAGER" | "AGENCY_MEMBER";
    }>
  | Readonly<{
      kind: "CLIENT";
      clientOrganizationId: string;
      role: "CLIENT_APPROVER" | "CLIENT_CONTRIBUTOR";
    }>
  | null;

export type ProjectPolicySubject = Readonly<{
  workspaceId: string;
  lifecycle: ProjectLifecycle;
  actorAssignment: ProjectActorAssignment;
}>;

export type AuthorizedProjectScope<
  Capability extends AuthorizationCapability = AuthorizationCapability,
> = Readonly<{
  workspaceId: string;
  projectId: string;
  clientOrganizationId: string;
  lifecycle: ProjectLifecycle;
  actorAssignment: ProjectActorAssignment;
  capability: Capability;
}>;

export type AuthorizedWorkspaceScope<
  Capability extends AuthorizationCapability = AuthorizationCapability,
> = Readonly<{
  workspaceId: string;
  capability: Capability;
}>;

export class AuthorizationError extends Error {
  constructor(
    readonly capability: AuthorizationCapability,
    readonly reason: AuthorizationDenialReason,
  ) {
    super("The authenticated actor is not authorized for this operation.");
    this.name = "AuthorizationError";
  }
}
