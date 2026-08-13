import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClientOrganizationCreateForm } from "../../../modules/agency/components/client-organization-create-form";
import {
  canCreateClientOrganization,
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
import { listAssignedDeliveryManagerClientOrganizationIds } from "../../../modules/projects/client-organization-authorization";
import { getApplicationDatabase } from "../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function statusLabel(status: "ACTIVE" | "ARCHIVED"): string {
  return status === "ACTIVE" ? "Active" : "Archived";
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
    {
      requestedWorkspaceId,
      policy: canViewClientOrganizations,
    },
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
  const canCreateClient = canCreateClientOrganization(
    actor,
    selected.workspaceId,
  ).allowed;
  const canOpenEveryClientDetail = canViewClientOrganization(
    actor,
    selected.workspaceId,
  ).allowed;
  const assignedClientOrganizationIds =
    await listAssignedDeliveryManagerClientOrganizationIds(
      database,
      actor,
      selected.workspaceId,
    );

  return (
    <main className="ops-workspace ops-collection-page">
      <SessionRefresh
        returnTo={`/agency/clients?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <header className="ops-page-header ops-collection-header">
        <div>
          <p className="ops-page-kicker">Relationships</p>
          <h1>Clients</h1>
          <p>
            Organizations connected to {selected.workspaceName} and their access
            context.
          </p>
        </div>
        {canCreateClient ? (
          <details className="ops-create-disclosure">
            <summary className="ops-primary-action">Add client</summary>
            <div className="ops-create-popover">
              <div className="ops-create-popover-copy">
                <span className="ops-section-label">New organization</span>
                <strong>Add a client organization</strong>
                <p>
                  Create the client context first. Delivery work can be
                  connected later.
                </p>
              </div>
              <ClientOrganizationCreateForm
                workspaceId={selected.workspaceId}
                openCreatedOrganization={canOpenEveryClientDetail}
              />
            </div>
          </details>
        ) : null}
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
              href={`/agency/clients?workspaceId=${workspace.workspaceId}`}
            >
              {workspace.workspaceName}
            </Link>
          ))}
        </nav>
      ) : null}

      <section
        className="ops-collection-section"
        aria-labelledby="clients-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div>
            <p className="ops-section-label">Organizations</p>
            <h2 id="clients-heading">Client organizations</h2>
          </div>
          <span className="ops-section-meta">
            {organizations.length}{" "}
            {organizations.length === 1 ? "client" : "clients"}
          </span>
        </div>

        <div
          className="ops-data-table ops-clients-table"
          aria-label="Client organizations"
        >
          <div className="ops-data-table-row ops-data-table-header">
            <span>Client</span>
            <span>Members</span>
            <span>Projects</span>
            <span>Status</span>
          </div>

          {organizations.length === 0 ? (
            <div className="ops-data-table-empty">
              <div
                className="ops-empty-symbol ops-empty-symbol-client"
                aria-hidden="true"
              >
                C
              </div>
              <div>
                <strong>No client organizations yet</strong>
                <span>
                  Add the first client to establish a secure organization
                  context.
                </span>
              </div>
            </div>
          ) : (
            organizations.map((organization) => {
              const canOpenClientDetail =
                canOpenEveryClientDetail ||
                assignedClientOrganizationIds.has(
                  organization.clientOrganizationId,
                );
              const rowContent = (
                <>
                  <span className="ops-table-primary">
                    <strong>{organization.name}</strong>
                    <small>Client organization</small>
                  </span>
                  <span>{organization.activeMemberCount}</span>
                  <span>{organization.projectCount}</span>
                  <span>
                    <span
                      className="ops-status-chip"
                      data-tone={
                        organization.status === "ACTIVE" ? "success" : "neutral"
                      }
                    >
                      {statusLabel(organization.status)}
                    </span>
                  </span>
                </>
              );

              return canOpenClientDetail ? (
                <Link
                  className="ops-data-table-row ops-data-table-link"
                  key={organization.clientOrganizationId}
                  href={`/agency/clients/${organization.clientOrganizationId}?workspaceId=${selected.workspaceId}`}
                >
                  {rowContent}
                </Link>
              ) : (
                <div
                  className="ops-data-table-row ops-data-table-static"
                  key={organization.clientOrganizationId}
                >
                  {rowContent}
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
