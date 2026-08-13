import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AgencyShell } from "../../components/shell/agency-shell";
import { canViewAgencyWorkspace } from "../../modules/authorization/policies";
import { toAgencyNavigationProjection } from "../../modules/authorization/projections";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
} from "../../modules/authorization/server/authorization";
import { listActiveMembershipContextDetails } from "../../modules/memberships/queries";
import { getApplicationDatabase } from "../../server/database";

export default async function ProtectedAgencyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    redirect(`/access?returnTo=${encodeURIComponent("/agency")}`);
  }

  const workspaceId = actor.workspaceMemberships[0]?.workspaceId;
  const result = canViewAgencyWorkspace(
    actor,
    workspaceId ?? "00000000-0000-0000-0000-000000000000",
  );
  if (!result.allowed) {
    logAuthorizationDenied(result, "agency.layout");
    redirect("/access-denied");
  }

  const contexts = await listActiveMembershipContextDetails(
    database,
    actor.userId,
  );
  const workspaces = contexts.workspaceMemberships.map((workspace) => ({
    workspaceId: workspace.workspaceId,
    workspaceName: workspace.workspaceName,
    role: workspace.role,
    ...toAgencyNavigationProjection(actor, workspace),
  }));

  return <AgencyShell workspaces={workspaces}>{children}</AgencyShell>;
}
