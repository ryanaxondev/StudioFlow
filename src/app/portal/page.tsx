import {
  CheckCircleIcon,
  ClockCountdownIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react/ssr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toClientContextProjection } from "../../modules/authorization/projections";
import { getCurrentActorContext } from "../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { listActiveMembershipContextDetails } from "../../modules/memberships/queries";
import { getApplicationDatabase } from "../../server/database";

export default async function ClientPortalHomePage() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) redirect(`/access?returnTo=${encodeURIComponent("/portal")}`);

  const details = await listActiveMembershipContextDetails(
    database,
    actor.userId,
  );
  const contexts = details.clientMemberships.map(toClientContextProjection);
  const primaryContext = contexts[0];

  return (
    <main className="client-page client-home-page">
      <SessionRefresh returnTo="/portal" />

      <header className="client-page-header">
        <p className="client-page-kicker">Client workspace</p>
        <h1>Your delivery workspace</h1>
        <p>
          Review the work shared with you, keep handoffs visible, and follow
          project progress without internal agency noise.
        </p>
      </header>

      <section className="client-context-overview" aria-label="Access context">
        <div>
          <span>Organization</span>
          <strong>
            {primaryContext?.clientOrganizationName ?? "Client organization"}
          </strong>
        </div>
        <div>
          <span>Agency</span>
          <strong>{primaryContext?.workspaceName ?? "StudioFlow"}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong className="client-connected-status">
            <span aria-hidden="true" /> Connected
          </strong>
        </div>
      </section>

      <section className="client-attention-grid" aria-label="Client activity">
        <article className="client-attention-panel">
          <div className="client-panel-heading">
            <span className="client-panel-icon" data-tone="accent">
              <CheckCircleIcon aria-hidden="true" weight="regular" />
            </span>
            <div>
              <p className="client-section-label">Review</p>
              <h2>Needs your attention</h2>
            </div>
          </div>
          <div className="client-inline-empty">
            <strong>Nothing is waiting on you</strong>
            <span>Client decisions and approvals will surface here.</span>
          </div>
        </article>

        <article className="client-attention-panel">
          <div className="client-panel-heading">
            <span className="client-panel-icon">
              <ClockCountdownIcon aria-hidden="true" weight="regular" />
            </span>
            <div>
              <p className="client-section-label">Timeline</p>
              <h2>Upcoming</h2>
            </div>
          </div>
          <div className="client-inline-empty">
            <strong>No upcoming handoffs</strong>
            <span>
              Shared checkpoints and delivery moments will collect here.
            </span>
          </div>
        </article>
      </section>

      <section
        className="client-project-preview"
        aria-labelledby="client-project-preview-heading"
      >
        <div className="client-section-heading">
          <div>
            <p className="client-section-label">Projects</p>
            <h2 id="client-project-preview-heading">Shared work</h2>
          </div>
        </div>
        <div className="client-project-table">
          <div
            className="client-project-row client-project-row-header"
            aria-hidden="true"
          >
            <span>Project</span>
            <span>Stage</span>
            <span>Next step</span>
            <span>Status</span>
          </div>
          <div className="client-project-empty">
            <span className="client-empty-icon" aria-hidden="true">
              <FolderOpenIcon weight="regular" />
            </span>
            <div>
              <strong>No shared projects yet</strong>
              <span>
                Projects will appear here when delivery work is shared with this
                organization.
              </span>
            </div>
          </div>
        </div>
      </section>

      {contexts.length > 1 ? (
        <section
          className="client-access-contexts"
          aria-labelledby="client-access-contexts-heading"
        >
          <div className="client-section-heading">
            <div>
              <p className="client-section-label">Access</p>
              <h2 id="client-access-contexts-heading">Client organizations</h2>
            </div>
            <span>{contexts.length} active</span>
          </div>
          <div className="client-context-list">
            {contexts.map((context) => (
              <article key={context.clientOrganizationId}>
                <span className="client-context-avatar" aria-hidden="true">
                  {context.clientOrganizationName.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{context.clientOrganizationName}</strong>
                  <span>{context.workspaceName}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
