import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StudioFlowMark } from "../../components/brand/studioflow-mark";
import {
  toAgencyContextProjection,
  toClientContextProjection,
} from "../../modules/authorization/projections";
import { resolveRoleBasedLanding } from "../../modules/authorization/policies";
import { buildActorContext } from "../../modules/authorization/server/authorization";
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

  const database = getApplicationDatabase();
  const [actor, contextDetails] = await Promise.all([
    buildActorContext(database, {
      userId: session.user.id,
      sessionId: session.session.id,
    }),
    listActiveMembershipContextDetails(database, session.user.id),
  ]);
  const workspaceContexts = contextDetails.workspaceMemberships.map(
    toAgencyContextProjection,
  );
  const clientContexts = contextDetails.clientMemberships.map(
    toClientContextProjection,
  );
  const landing = resolveRoleBasedLanding(actor);

  return (
    <main className="account-experience">
      <SessionRefresh />
      <div className="account-frame">
        <header className="account-topbar">
          <Link className="account-brand" href="/" aria-label="StudioFlow home">
            <StudioFlowMark />
            <strong>StudioFlow</strong>
          </Link>
          {landing.surface === "ACCOUNT" ? (
            <Link className="account-back-link" href="/">
              <span>Return to product</span>
              <ArrowUpRightIcon aria-hidden="true" weight="bold" />
            </Link>
          ) : (
            <Link className="account-back-link" href={landing.href}>
              <span>{landing.label}</span>
              <ArrowUpRightIcon aria-hidden="true" weight="bold" />
            </Link>
          )}
        </header>

        <div className="account-layout">
          <aside className="account-sidebar">
            <p className="ops-page-kicker">Settings</p>
            <h1>Account</h1>
            <p>Identity, workspace context, and secure session access.</p>
            <nav aria-label="Account sections">
              <a href="#profile">Profile</a>
              <a href="#workspaces">Workspaces</a>
              <a href="#clients">Client access</a>
              <a href="#session">Session</a>
            </nav>
          </aside>

          <div className="account-content">
            <section
              className="account-section"
              id="profile"
              aria-labelledby="account-profile-heading"
            >
              <div className="account-section-heading">
                <div>
                  <p className="ops-section-label">Profile</p>
                  <h2 id="account-profile-heading">Identity</h2>
                </div>
              </div>
              <dl className="account-detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{session.user.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{session.user.email}</dd>
                </div>
              </dl>
            </section>

            <section
              className="account-section"
              id="workspaces"
              aria-labelledby="workspace-context-heading"
            >
              <div className="account-section-heading">
                <div>
                  <p className="ops-section-label">Workspaces</p>
                  <h2 id="workspace-context-heading">Agency context</h2>
                </div>
                <span>{workspaceContexts.length} active</span>
              </div>
              {workspaceContexts.length === 0 ? (
                <div className="account-empty-row">
                  No active Agency Workspace membership.
                </div>
              ) : (
                <div className="account-context-list-obsidian">
                  {workspaceContexts.map((membership) => (
                    <article key={membership.workspaceId}>
                      <span className="account-context-mark" aria-hidden="true">
                        {membership.workspaceName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <strong>{membership.workspaceName}</strong>
                        <span>{workspaceRoleLabel(membership.role)}</span>
                      </div>
                      <span className="ops-status-chip" data-tone="success">
                        Active
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section
              className="account-section"
              id="clients"
              aria-labelledby="client-context-heading"
            >
              <div className="account-section-heading">
                <div>
                  <p className="ops-section-label">Client access</p>
                  <h2 id="client-context-heading">Client organizations</h2>
                </div>
                <span>{clientContexts.length} active</span>
              </div>
              {clientContexts.length === 0 ? (
                <div className="account-empty-row">
                  No active Client Organization membership.
                </div>
              ) : (
                <div className="account-context-list-obsidian">
                  {clientContexts.map((membership) => (
                    <article key={membership.clientOrganizationId}>
                      <span
                        className="account-context-mark account-context-mark-client"
                        aria-hidden="true"
                      >
                        {membership.clientOrganizationName
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                      <div>
                        <strong>{membership.clientOrganizationName}</strong>
                        <span>{membership.workspaceName}</span>
                      </div>
                      <span className="ops-status-chip" data-tone="success">
                        Active
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section
              className="account-section account-session-section"
              id="session"
              aria-labelledby="session-heading"
            >
              <div className="account-section-heading">
                <div>
                  <p className="ops-section-label">Access</p>
                  <h2 id="session-heading">Session</h2>
                </div>
              </div>
              <div className="account-session-row">
                <div>
                  <strong>Secure workspace session</strong>
                  <span>
                    Signing out ends this StudioFlow session on the current
                    device.
                  </span>
                </div>
                <div className="account-signout">
                  <SignOutButton />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
