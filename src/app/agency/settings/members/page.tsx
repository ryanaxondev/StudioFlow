import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { WorkspaceMemberManagement } from "../../../../modules/agency/components/workspace-member-management";
import { canManageAgencyMembers } from "../../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { listWorkspaceMemberManagementState } from "../../../../modules/memberships/queries";
import { getApplicationDatabase } from "../../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgencyMembersPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    const returnTo = requestedWorkspaceId
      ? `/agency/settings/members?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : "/agency/settings/members";
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    { requestedWorkspaceId, policy: canManageAgencyMembers },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.members");
    redirect("/access-denied");
  }

  const { selected, options } = result.selection;
  const state = await listWorkspaceMemberManagementState(
    database,
    selected.scope,
    new Date(),
  );

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/settings/members?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Agency Members</h1>
          <p>{selected.workspaceName}</p>
        </div>
        <nav aria-label="Workspace utilities">
          <Link href={`/agency/clients?workspaceId=${selected.workspaceId}`}>
            Clients
          </Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      {options.length > 1 ? (
        <nav className="management-contexts" aria-label="Workspace context">
          {options.map((workspace) => (
            <Link
              key={workspace.workspaceId}
              aria-current={
                workspace.workspaceId === selected.workspaceId
                  ? "page"
                  : undefined
              }
              href={`/agency/settings/members?workspaceId=${workspace.workspaceId}`}
            >
              {workspace.workspaceName}
            </Link>
          ))}
        </nav>
      ) : null}

      <WorkspaceMemberManagement
        workspaceId={selected.workspaceId}
        currentUserId={actor.userId}
        members={state.members}
        invitations={state.invitations}
      />
    </main>
  );
}
