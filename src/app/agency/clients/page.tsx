import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClientOrganizationCreateForm } from "../../../modules/agency/components/client-organization-create-form";
import {
  canCreateClientOrganization,
  canManageAgencyMembers,
  canViewClientOrganization,
  canViewClientOrganizations,
} from "../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../modules/auth/components/session-refresh";
import { listClientOrganizationsForWorkspace } from "../../../modules/memberships/queries";
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
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    const returnTo = requestedWorkspaceId
      ? `/agency/clients?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : "/agency/clients";
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    { requestedWorkspaceId, policy: canViewClientOrganizations },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.clients.collection");
    redirect("/access-denied");
  }

  const { selected, options } = result.selection;
  const organizations = await listClientOrganizationsForWorkspace(
    database,
    selected.scope,
  );
  const canManageMembers = canManageAgencyMembers(
    actor,
    selected.workspaceId,
  ).allowed;
  const canCreateClient = canCreateClientOrganization(
    actor,
    selected.workspaceId,
  ).allowed;
  const canOpenClientDetail = canViewClientOrganization(
    actor,
    selected.workspaceId,
  ).allowed;

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/clients?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Client Organizations</h1>
          <p>{selected.workspaceName}</p>
        </div>
        <nav aria-label="Workspace utilities">
          {canManageMembers ? (
            <Link
              href={`/agency/settings/members?workspaceId=${selected.workspaceId}`}
            >
              Agency Members
            </Link>
          ) : null}
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
              href={`/agency/clients?workspaceId=${workspace.workspaceId}`}
            >
              {workspace.workspaceName}
            </Link>
          ))}
        </nav>
      ) : null}

      {canCreateClient ? (
        <section
          className="management-panel"
          aria-labelledby="create-client-heading"
        >
          <h2 id="create-client-heading">Create Client Organization</h2>
          <ClientOrganizationCreateForm
            workspaceId={selected.workspaceId}
            openCreatedOrganization={canOpenClientDetail}
          />
        </section>
      ) : null}

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
                href={`/agency/clients/${organization.clientOrganizationId}?workspaceId=${selected.workspaceId}`}
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
