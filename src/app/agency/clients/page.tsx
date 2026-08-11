import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientOrganizationCreateForm } from "../../../modules/agency/components/client-organization-create-form";
import { SessionRefresh } from "../../../modules/auth/components/session-refresh";
import { getCurrentStudioFlowSession } from "../../../modules/auth/server/session";
import {
  listClientOrganizationsForWorkspace,
  resolveAgencyWorkspaceSelection,
} from "../../../modules/memberships/queries";
import { workspaceClientManagerRoles } from "../../../modules/memberships/service";
import { getApplicationDatabase } from "../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClientOrganizationsPage({
  searchParams,
}: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const session = await getCurrentStudioFlowSession(requestHeaders);

  if (!session) {
    const returnTo = requestedWorkspaceId
      ? `/agency/clients?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : "/agency/clients";
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const database = getApplicationDatabase();
  const selection = await resolveAgencyWorkspaceSelection(database, {
    userId: session.user.id,
    requestedWorkspaceId,
    allowedRoles: workspaceClientManagerRoles,
  });

  if (!selection) {
    redirect("/account");
  }

  const organizations = await listClientOrganizationsForWorkspace(
    database,
    selection.selected.workspaceId,
  );

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/clients?workspaceId=${encodeURIComponent(selection.selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Client Organizations</h1>
          <p>{selection.selected.workspaceName}</p>
        </div>
        <nav aria-label="Workspace utilities">
          {selection.selected.role === "AGENCY_OWNER" ? (
            <Link
              href={`/agency/settings/members?workspaceId=${selection.selected.workspaceId}`}
            >
              Agency Members
            </Link>
          ) : null}
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
              href={`/agency/clients?workspaceId=${workspace.workspaceId}`}
            >
              {workspace.workspaceName}
            </Link>
          ))}
        </nav>
      ) : null}

      <section
        className="management-panel"
        aria-labelledby="create-client-heading"
      >
        <h2 id="create-client-heading">Create Client Organization</h2>
        <ClientOrganizationCreateForm
          workspaceId={selection.selected.workspaceId}
        />
      </section>

      <section
        className="management-panel"
        aria-labelledby="client-list-heading"
      >
        <h2 id="client-list-heading">Organizations</h2>
        {organizations.length === 0 ? (
          <p className="management-muted">No Client Organizations yet.</p>
        ) : (
          <div className="management-list">
            {organizations.map((organization) => (
              <Link
                className="management-row management-row-link"
                key={organization.clientOrganizationId}
                href={`/agency/clients/${organization.clientOrganizationId}?workspaceId=${selection.selected.workspaceId}`}
              >
                <div>
                  <strong>{organization.name}</strong>
                  <span>
                    {organization.activeMemberCount} active member
                    {organization.activeMemberCount === 1 ? "" : "s"}
                  </span>
                </div>
                <span>{organization.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
