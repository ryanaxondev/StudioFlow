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
    {
      requestedWorkspaceId,
      policy: canManageAgencyMembers,
    },
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
  const pendingInvitationCount = state.invitations.filter(
    (invitation) => invitation.status === "PENDING",
  ).length;

  return (
    <main className="ops-workspace ops-members-page">
      <SessionRefresh
        returnTo={`/agency/settings/members?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <header className="ops-page-header ops-collection-header">
        <div>
          <p className="ops-page-kicker">Workspace access</p>
          <h1>Agency members</h1>
          <p>People, roles, and invitations for {selected.workspaceName}.</p>
        </div>
      </header>

      {options.length > 1 ? (
        <nav className="ops-context-switcher" aria-label="Workspace context">
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

      <div className="ops-people-pulse" aria-label="Membership summary">
        <div>
          <span>Active members</span>
          <strong>{state.members.length}</strong>
        </div>
        <div>
          <span>Pending invitations</span>
          <strong>{pendingInvitationCount}</strong>
        </div>
        <div>
          <span>Workspace</span>
          <strong className="ops-people-pulse-text">
            {selected.workspaceName}
          </strong>
        </div>
      </div>

      <WorkspaceMemberManagement
        workspaceId={selected.workspaceId}
        currentUserId={actor.userId}
        members={state.members}
        invitations={state.invitations}
      />
    </main>
  );
}
