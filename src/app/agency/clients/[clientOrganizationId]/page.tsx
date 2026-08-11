import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { ClientMemberManagement } from "../../../../modules/agency/components/client-member-management";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { getCurrentStudioFlowSession } from "../../../../modules/auth/server/session";
import {
  getClientOrganizationDetail,
  resolveAgencyWorkspaceSelection,
} from "../../../../modules/memberships/queries";
import { workspaceClientManagerRoles } from "../../../../modules/memberships/service";
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
  if (!z.string().uuid().safeParse(clientOrganizationId).success) {
    notFound();
  }

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const session = await getCurrentStudioFlowSession(requestHeaders);

  if (!session) {
    const returnTo = requestedWorkspaceId
      ? `/agency/clients/${clientOrganizationId}?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : `/agency/clients/${clientOrganizationId}`;
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

  const detail = await getClientOrganizationDetail(database, {
    workspaceId: selection.selected.workspaceId,
    clientOrganizationId,
    now: new Date(),
  });

  if (!detail) {
    redirect(`/agency/clients?workspaceId=${selection.selected.workspaceId}`);
  }

  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/clients/${clientOrganizationId}?workspaceId=${encodeURIComponent(selection.selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>{detail.name}</h1>
          <p>
            {selection.selected.workspaceName} · {detail.status}
          </p>
        </div>
        <nav aria-label="Client Organization utilities">
          <Link
            href={`/agency/clients?workspaceId=${selection.selected.workspaceId}`}
          >
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

      <ClientMemberManagement
        workspaceId={selection.selected.workspaceId}
        clientOrganizationId={detail.clientOrganizationId}
        detail={detail}
      />
    </main>
  );
}
