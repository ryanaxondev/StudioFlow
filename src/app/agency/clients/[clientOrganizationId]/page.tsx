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
    { requestedWorkspaceId, policy: canViewClientOrganization },
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

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/clients/${clientOrganizationId}?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>{detail.name}</h1>
          <p>
            {selected.workspaceName} · {detail.status}
          </p>
        </div>
        <nav aria-label="Client Organization utilities">
          <Link href={`/agency/clients?workspaceId=${selected.workspaceId}`}>
            All clients
          </Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      <section
        className="management-panel"
        aria-labelledby="organization-summary-heading"
      >
        <h2 id="organization-summary-heading">Organization summary</h2>
        <p className="management-muted">
          Client membership context is active. Project records begin in M09 and
          are intentionally not shown here yet.
        </p>
      </section>

      {canManage ? (
        <ClientMemberManagement
          workspaceId={selected.workspaceId}
          clientOrganizationId={detail.clientOrganizationId}
          detail={detail}
        />
      ) : (
        <section className="management-panel">
          <p className="management-muted">
            This Client Organization is available as read-only context.
          </p>
        </section>
      )}
    </main>
  );
}
