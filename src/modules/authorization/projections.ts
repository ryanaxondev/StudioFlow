import type {
  ClientContextDetail,
  WorkspaceContextDetail,
} from "../memberships/queries";

export type AgencyContextProjection = Readonly<{
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceContextDetail["role"];
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

export function toClientContextProjection(
  context: ClientContextDetail,
): ClientContextProjection {
  return {
    clientOrganizationId: context.clientOrganizationId,
    clientOrganizationName: context.clientOrganizationName,
    workspaceName: context.workspaceName,
  };
}
