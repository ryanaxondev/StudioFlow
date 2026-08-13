import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { ClientMemberManagement } from "../../../../modules/agency/components/client-member-management";
import {
  canManageClientMembers,
  canViewClientOrganization,
} from "../../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { getClientOrganizationDetail } from "../../../../modules/memberships/queries";
import { getApplicationDatabase } from "../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ clientOrganizationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClientOrganizationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ clientOrganizationId }, parameters] = await Promise.all([
    params,
    searchParams,
  ]);
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  if (!z.string().uuid().safeParse(clientOrganizationId).success) notFound();

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    const returnTo = requestedWorkspaceId
      ? `/agency/clients/${clientOrganizationId}?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : `/agency/clients/${clientOrganizationId}`;
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    {
      requestedWorkspaceId,
      policy: canViewClientOrganization,
    },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.client-organization.detail");
    redirect("/access-denied");
  }

  const { selected } = result.selection;
  const detail = await getClientOrganizationDetail(database, {
    scope: selected.scope,
    clientOrganizationId,
    now: new Date(),
  });
  if (!detail) notFound();

  const canManage = canManageClientMembers(actor, selected.workspaceId).allowed;
  const pendingInvitationCount = detail.invitations.filter(
    (invitation) => invitation.status === "PENDING",
  ).length;

  return (
    <main className="ops-workspace ops-client-detail-page">
      <SessionRefresh
        returnTo={`/agency/clients/${clientOrganizationId}?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link href={`/agency/clients?workspaceId=${selected.workspaceId}`}>
          ← Clients
        </Link>
      </div>

      <header className="ops-page-header ops-detail-header">
        <div>
          <p className="ops-page-kicker">Client organization</p>
          <h1>{detail.name}</h1>
          <p>
            Client access, membership, and delivery context in{" "}
            {selected.workspaceName}.
          </p>
        </div>
        <span
          className="ops-status-chip ops-status-chip-large"
          data-tone={detail.status === "ACTIVE" ? "success" : "neutral"}
        >
          {detail.status === "ACTIVE" ? "Active" : "Archived"}
        </span>
      </header>

      <nav
        className="ops-detail-tabs"
        aria-label="Client organization sections"
      >
        <a href="#overview">Overview</a>
        <a href="#members">Members</a>
        <a href="#access">Access</a>
      </nav>

      <section
        className="ops-detail-overview"
        id="overview"
        aria-labelledby="overview-heading"
      >
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Overview</p>
            <h2 id="overview-heading">Organization context</h2>
          </div>
        </div>

        <div className="ops-detail-metrics">
          <article>
            <span>Active members</span>
            <strong>{detail.members.length}</strong>
          </article>
          <article>
            <span>Pending invitations</span>
            <strong>{pendingInvitationCount}</strong>
          </article>
          <article>
            <span>Projects</span>
            <strong>—</strong>
          </article>
          <article>
            <span>Workspace</span>
            <strong className="ops-detail-metric-text">
              {selected.workspaceName}
            </strong>
          </article>
        </div>
      </section>

      <section
        className="ops-detail-projects"
        aria-labelledby="client-projects-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div>
            <p className="ops-section-label">Delivery</p>
            <h2 id="client-projects-heading">Projects</h2>
          </div>
          <span className="ops-section-meta">No active delivery yet</span>
        </div>
        <div className="ops-data-table ops-client-projects-table">
          <div className="ops-data-table-row ops-data-table-header">
            <span>Project</span>
            <span>Stage</span>
            <span>Owner</span>
            <span>Health</span>
          </div>
          <div className="ops-data-table-empty ops-data-table-empty-compact">
            <div className="ops-empty-symbol" aria-hidden="true">
              +
            </div>
            <div>
              <strong>No projects connected yet</strong>
              <span>
                Delivery relationships will collect here as client work becomes
                active.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ops-detail-management"
        id="members"
        aria-labelledby="client-team-heading"
      >
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">People</p>
            <h2 id="client-team-heading">Client team</h2>
          </div>
          <span className="ops-section-meta">
            {canManage ? "Manage access" : "Read-only context"}
          </span>
        </div>

        {canManage ? (
          <ClientMemberManagement
            workspaceId={selected.workspaceId}
            clientOrganizationId={detail.clientOrganizationId}
            detail={detail}
          />
        ) : (
          <div className="ops-readonly-note" id="access">
            <strong>Read-only access</strong>
            <span>
              This client organization is visible in your current delivery
              context.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
