import {
  canManageAgencyMembers,
  canViewAgencyDelivery,
  canViewAgencyWorkspace,
  canViewClientOrganizations,
} from "./policies";
import type { ActorContext } from "./types";
import type {
  ClientContextDetail,
  WorkspaceContextDetail,
} from "../memberships/queries";

export type AgencyContextProjection = Readonly<{
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceContextDetail["role"];
}>;

export type AgencyNavigationProjection = Readonly<{
  canViewDelivery: boolean;
  canViewProjects: boolean;
  canViewClients: boolean;
  canManageMembers: boolean;
  defaultPath:
    | "/agency"
    | "/agency/projects"
    | "/agency/clients"
    | "/agency/settings/members";
}>;

export type ClientContextProjection = Readonly<{
  clientOrganizationId: string;
  clientOrganizationName: string;
  workspaceName: string;
}>;

export function toAgencyContextProjection(
  context: WorkspaceContextDetail,
): AgencyContextProjection {
  return {
    workspaceId: context.workspaceId,
    workspaceName: context.workspaceName,
    role: context.role,
  };
}

export function toAgencyNavigationProjection(
  actor: ActorContext,
  context: WorkspaceContextDetail,
): AgencyNavigationProjection {
  const canViewDelivery = canViewAgencyDelivery(
    actor,
    context.workspaceId,
  ).allowed;
  const canViewProjects = canViewAgencyWorkspace(
    actor,
    context.workspaceId,
  ).allowed;
  const canViewClients = canViewClientOrganizations(
    actor,
    context.workspaceId,
  ).allowed;
  const canManageMembers = canManageAgencyMembers(
    actor,
    context.workspaceId,
  ).allowed;

  const defaultPath = canViewDelivery
    ? "/agency"
    : canViewProjects
      ? "/agency/projects"
      : canViewClients
        ? "/agency/clients"
        : "/agency/settings/members";

  return {
    canViewDelivery,
    canViewProjects,
    canViewClients,
    canManageMembers,
    defaultPath,
  };
}

export function toClientContextProjection(
  context: ClientContextDetail,
): ClientContextProjection {
  return {
    clientOrganizationId: context.clientOrganizationId,
    clientOrganizationName: context.clientOrganizationName,
    workspaceName: context.workspaceName,
  };
}
