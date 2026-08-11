import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { SignOutButton } from "../../modules/auth/components/sign-out-button";
import { getCurrentStudioFlowSession } from "../../modules/auth/server/session";
import { listActiveMembershipContextDetails } from "../../modules/memberships/queries";
import { getApplicationDatabase } from "../../server/database";

function workspaceRoleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AccountPage() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const session = await getCurrentStudioFlowSession(requestHeaders);

  if (!session) {
    redirect("/access?returnTo=/account");
  }

  const contexts = await listActiveMembershipContextDetails(
    getApplicationDatabase(),
    session.user.id,
  );
  const agencyDestination = contexts.workspaceMemberships.find((membership) =>
    ["AGENCY_OWNER", "DELIVERY_MANAGER"].includes(membership.role),
  );

  return (
    <main className="auth-shell">
      <SessionRefresh />
      <section
        className="auth-card auth-card-wide"
        aria-labelledby="account-heading"
      >
        <p className="auth-brand">StudioFlow</p>
        <h1 id="account-heading">Account and Product Context</h1>

        <dl className="auth-identity-list">
          <div>
            <dt>Name</dt>
            <dd>{session.user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.user.email}</dd>
          </div>
        </dl>

        <section
          className="account-context-section"
          aria-labelledby="workspace-context-heading"
        >
          <h2 id="workspace-context-heading">Workspace contexts</h2>
          {contexts.workspaceMemberships.length === 0 ? (
            <p className="management-muted">
              No active Agency Workspace membership.
            </p>
          ) : (
            <div className="account-context-list">
              {contexts.workspaceMemberships.map((membership) => (
                <article key={membership.workspaceId}>
                  <strong>{membership.workspaceName}</strong>
                  <span>{workspaceRoleLabel(membership.role)}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="account-context-section"
          aria-labelledby="client-context-heading"
        >
          <h2 id="client-context-heading">Client contexts</h2>
          {contexts.clientMemberships.length === 0 ? (
            <p className="management-muted">
              No active Client Organization membership.
            </p>
          ) : (
            <div className="account-context-list">
              {contexts.clientMemberships.map((membership) => (
                <article key={membership.clientOrganizationId}>
                  <strong>{membership.clientOrganizationName}</strong>
                  <span>{membership.workspaceName}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="auth-actions">
          {agencyDestination ? (
            <Link
              className="auth-primary-link"
              href={`/agency/clients?workspaceId=${agencyDestination.workspaceId}`}
            >
              Open Agency Workspace
            </Link>
          ) : (
            <Link className="auth-text-link" href="/">
              Return to product
            </Link>
          )}
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
