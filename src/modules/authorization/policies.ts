import type { WorkspaceRole } from "../../db/schema";
import type {
  ActorContext,
  AuthorizedWorkspaceScope,
  AuthorizationCapability,
  AuthorizationDenialReason,
  CapabilityResult,
  ProjectPolicySubject,
} from "./types";

export type WorkspacePolicy<
  Capability extends AuthorizationCapability = AuthorizationCapability,
> = (actor: ActorContext, workspaceId: string) => CapabilityResult<Capability>;

const agencyDeliveryRoles: ReadonlySet<WorkspaceRole> = new Set([
  "AGENCY_OWNER",
  "DELIVERY_MANAGER",
]);
const workspaceOwnerRoles: ReadonlySet<WorkspaceRole> = new Set([
  "AGENCY_OWNER",
]);
const agencyWorkspaceRoles: ReadonlySet<WorkspaceRole> = new Set([
  "AGENCY_OWNER",
  "DELIVERY_MANAGER",
  "AGENCY_MEMBER",
]);

function allow<Capability extends AuthorizationCapability>(
  capability: Capability,
): CapabilityResult<Capability> {
  return { allowed: true, capability };
}

function deny<Capability extends AuthorizationCapability>(
  capability: Capability,
  reason: AuthorizationDenialReason,
): CapabilityResult<Capability> {
  return { allowed: false, capability, reason };
}

function workspaceRole(
  actor: ActorContext,
  workspaceId: string,
): WorkspaceRole | null {
  return (
    actor.workspaceMemberships.find(
      (membership) => membership.workspaceId === workspaceId,
    )?.role ?? null
  );
}

function workspaceRolePolicy<Capability extends AuthorizationCapability>(
  actor: ActorContext,
  workspaceId: string,
  capability: Capability,
  allowedRoles: ReadonlySet<WorkspaceRole>,
): CapabilityResult<Capability> {
  const role = workspaceRole(actor, workspaceId);
  if (!role) {
    return deny(capability, "NO_WORKSPACE_MEMBERSHIP");
  }

  return allowedRoles.has(role)
    ? allow(capability)
    : deny(capability, "ROLE_FORBIDDEN");
}

export function canViewAgencyWorkspace(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"VIEW_AGENCY_WORKSPACE"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "VIEW_AGENCY_WORKSPACE",
    agencyWorkspaceRoles,
  );
}

export function canViewAgencyDelivery(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"VIEW_AGENCY_DELIVERY"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "VIEW_AGENCY_DELIVERY",
    agencyDeliveryRoles,
  );
}

export function canManageWorkspace(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"MANAGE_WORKSPACE"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "MANAGE_WORKSPACE",
    workspaceOwnerRoles,
  );
}

export function canManageAgencyMembers(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"MANAGE_AGENCY_MEMBERS"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "MANAGE_AGENCY_MEMBERS",
    workspaceOwnerRoles,
  );
}

export function canCreateClientOrganization(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"CREATE_CLIENT_ORGANIZATION"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "CREATE_CLIENT_ORGANIZATION",
    agencyDeliveryRoles,
  );
}

export function canViewClientOrganizations(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"VIEW_CLIENT_ORGANIZATIONS"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "VIEW_CLIENT_ORGANIZATIONS",
    agencyDeliveryRoles,
  );
}

export function canViewClientOrganization(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"VIEW_CLIENT_ORGANIZATION"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "VIEW_CLIENT_ORGANIZATION",
    workspaceOwnerRoles,
  );
}

export function canManageClientMembers(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"MANAGE_CLIENT_MEMBERS"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "MANAGE_CLIENT_MEMBERS",
    workspaceOwnerRoles,
  );
}

export function canCreateProject(
  actor: ActorContext,
  workspaceId: string,
): CapabilityResult<"CREATE_PROJECT"> {
  return workspaceRolePolicy(
    actor,
    workspaceId,
    "CREATE_PROJECT",
    agencyDeliveryRoles,
  );
}

export function canViewProject(
  actor: ActorContext,
  subject: ProjectPolicySubject,
): CapabilityResult<"VIEW_PROJECT"> {
  const workspaceMembership = actor.workspaceMemberships.find(
    (membership) => membership.workspaceId === subject.workspaceId,
  );
  const actorAssignment = subject.actorAssignment;

  if (workspaceMembership?.role === "AGENCY_OWNER") {
    return allow("VIEW_PROJECT");
  }

  if (actorAssignment?.kind === "AGENCY") {
    if (!workspaceMembership) {
      return deny("VIEW_PROJECT", "NO_WORKSPACE_MEMBERSHIP");
    }

    const validAgencyAssignment =
      workspaceMembership.role === "DELIVERY_MANAGER"
        ? actorAssignment.role === "DELIVERY_MANAGER" ||
          actorAssignment.role === "AGENCY_MEMBER"
        : workspaceMembership.role === "AGENCY_MEMBER" &&
          actorAssignment.role === "AGENCY_MEMBER";

    return validAgencyAssignment
      ? allow("VIEW_PROJECT")
      : deny("VIEW_PROJECT", "PROJECT_CONTEXT_MISMATCH");
  }

  if (actorAssignment?.kind === "CLIENT") {
    if (subject.lifecycle === "DRAFT") {
      return deny("VIEW_PROJECT", "PROJECT_DRAFT_AGENCY_ONLY");
    }

    const hasClientMembership = actor.clientMemberships.some(
      (membership) =>
        membership.clientOrganizationId ===
        actorAssignment.clientOrganizationId,
    );

    return hasClientMembership
      ? allow("VIEW_PROJECT")
      : deny("VIEW_PROJECT", "PROJECT_CONTEXT_MISMATCH");
  }

  return deny("VIEW_PROJECT", "PROJECT_ASSIGNMENT_REQUIRED");
}

function projectAgencyManagerPolicy<Capability extends AuthorizationCapability>(
  actor: ActorContext,
  subject: ProjectPolicySubject,
  capability: Capability,
): CapabilityResult<Capability> {
  const workspaceMembership = actor.workspaceMemberships.find(
    (membership) => membership.workspaceId === subject.workspaceId,
  );

  if (workspaceMembership?.role === "AGENCY_OWNER") {
    return allow(capability);
  }

  if (!workspaceMembership) {
    return deny(capability, "NO_WORKSPACE_MEMBERSHIP");
  }

  if (
    workspaceMembership.role === "DELIVERY_MANAGER" &&
    subject.actorAssignment?.kind === "AGENCY" &&
    subject.actorAssignment.role === "DELIVERY_MANAGER"
  ) {
    return allow(capability);
  }

  return deny(capability, "PROJECT_ASSIGNMENT_REQUIRED");
}

export function canEditProjectSettings(
  actor: ActorContext,
  subject: ProjectPolicySubject,
): CapabilityResult<"EDIT_PROJECT_SETTINGS"> {
  return projectAgencyManagerPolicy(actor, subject, "EDIT_PROJECT_SETTINGS");
}

export function canManageProjectMembers(
  actor: ActorContext,
  subject: ProjectPolicySubject,
): CapabilityResult<"MANAGE_PROJECT_MEMBERS"> {
  return projectAgencyManagerPolicy(actor, subject, "MANAGE_PROJECT_MEMBERS");
}

export function canDeleteDraftProject(
  actor: ActorContext,
  subject: ProjectPolicySubject,
): CapabilityResult<"DELETE_DRAFT_PROJECT"> {
  if (subject.lifecycle !== "DRAFT") {
    return deny("DELETE_DRAFT_PROJECT", "ROLE_FORBIDDEN");
  }

  return projectAgencyManagerPolicy(actor, subject, "DELETE_DRAFT_PROJECT");
}

export function canEnterClientPortal(
  actor: ActorContext,
): CapabilityResult<"ENTER_CLIENT_PORTAL"> {
  return actor.clientMemberships.length > 0
    ? allow("ENTER_CLIENT_PORTAL")
    : deny("ENTER_CLIENT_PORTAL", "NO_CLIENT_MEMBERSHIP");
}

export function toAuthorizedWorkspaceScope<
  Capability extends AuthorizationCapability,
>(
  result: CapabilityResult<Capability>,
  workspaceId: string,
): AuthorizedWorkspaceScope<Capability> | null {
  return result.allowed ? { workspaceId, capability: result.capability } : null;
}

export type RoleBasedLanding = Readonly<{
  surface: "AGENCY_DELIVERY" | "AGENCY_PROJECTS" | "CLIENT_PORTAL" | "ACCOUNT";
  href: string;
  label: string;
}>;

export function resolveRoleBasedLanding(actor: ActorContext): RoleBasedLanding {
  const deliveryMembership = actor.workspaceMemberships.find(
    (membership) =>
      canViewAgencyDelivery(actor, membership.workspaceId).allowed,
  );
  if (deliveryMembership) {
    return {
      surface: "AGENCY_DELIVERY",
      href: `/agency?workspaceId=${encodeURIComponent(deliveryMembership.workspaceId)}`,
      label: "Open Agency Workspace",
    };
  }

  const agencyMembership = actor.workspaceMemberships.find(
    (membership) =>
      canViewAgencyWorkspace(actor, membership.workspaceId).allowed,
  );
  if (agencyMembership) {
    return {
      surface: "AGENCY_PROJECTS",
      href: `/agency/projects?workspaceId=${encodeURIComponent(agencyMembership.workspaceId)}`,
      label: "Open assigned Projects",
    };
  }

  if (canEnterClientPortal(actor).allowed) {
    return {
      surface: "CLIENT_PORTAL",
      href: "/portal",
      label: "Open Client Portal",
    };
  }

  return { surface: "ACCOUNT", href: "/account", label: "Return to account" };
}
