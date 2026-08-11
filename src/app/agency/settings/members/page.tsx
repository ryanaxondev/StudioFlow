import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { WorkspaceMemberManagement } from "../../../../modules/agency/components/workspace-member-management";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { getCurrentStudioFlowSession } from "../../../../modules/auth/server/session";
import {
  listWorkspaceMemberManagementState,
  resolveAgencyWorkspaceSelection,
} from "../../../../modules/memberships/queries";
import { workspaceOwnerRoles } from "../../../../modules/memberships/service";
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
  const session = await getCurrentStudioFlowSession(requestHeaders);

  if (!session) {
    const returnTo = requestedWorkspaceId
      ? `/agency/settings/members?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : "/agency/settings/members";
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const database = getApplicationDatabase();
  const selection = await resolveAgencyWorkspaceSelection(database, {
    userId: session.user.id,
    requestedWorkspaceId,
    allowedRoles: workspaceOwnerRoles,
  });

  if (!selection) {
    redirect("/account");
  }

  const state = await listWorkspaceMemberManagementState(
    database,
    selection.selected.workspaceId,
    new Date(),
  );

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/settings/members?workspaceId=${encodeURIComponent(selection.selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Agency Members</h1>
          <p>{selection.selected.workspaceName}</p>
        </div>
        <nav aria-label="Workspace utilities">
          <Link
            href={`/agency/clients?workspaceId=${selection.selected.workspaceId}`}
          >
            Clients
          </Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      {selection.options.length > 1 ? (
        <nav className="management-contexts" aria-label="Workspace context">
          {selection.options.map((workspace) => (
            <Link
              key={workspace.workspaceId}
              aria-current={
                workspace.workspaceId === selection.selected.workspaceId
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
        workspaceId={selection.selected.workspaceId}
        currentUserId={session.user.id}
        members={state.members}
        invitations={state.invitations}
      />
    </main>
  );
}
