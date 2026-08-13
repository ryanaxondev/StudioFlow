import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { canViewAgencyDelivery } from "../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { getApplicationDatabase } from "../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const pulseMetrics = [
  { label: "Needs attention", tone: "attention" },
  { label: "Waiting on client", tone: "waiting" },
  { label: "Active delivery", tone: "active" },
  { label: "At risk", tone: "risk" },
] as const;

export default async function AgencyLandingPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) redirect(`/access?returnTo=${encodeURIComponent("/agency")}`);

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    {
      requestedWorkspaceId,
      policy: canViewAgencyDelivery,
    },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.delivery");
    redirect("/access-denied");
  }

  const { selected } = result.selection;
  return (
    <main className="ops-workspace ops-delivery-page">
      <SessionRefresh
        returnTo={`/agency?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <header className="ops-page-header">
        <div>
          <p className="ops-page-kicker">Operational workspace</p>
          <h1>Delivery</h1>
          <p>
            Health, responsibility, and client handoffs across{" "}
            {selected.workspaceName}.
          </p>
        </div>
      </header>

      <section
        className="delivery-pulse"
        aria-labelledby="delivery-pulse-heading"
      >
        <div className="ops-section-heading">
          <div>
            <span className="ops-section-label">Delivery pulse</span>
            <h2 id="delivery-pulse-heading">Operational health</h2>
          </div>
          <span className="ops-section-meta">Across current client work</span>
        </div>
        <div className="delivery-metrics">
          {pulseMetrics.map((metric) => (
            <div
              className="delivery-metric"
              data-tone={metric.tone}
              key={metric.label}
            >
              <span>{metric.label}</span>
              <strong className="tabular-nums">—</strong>
            </div>
          ))}
        </div>
        <p className="delivery-pulse-empty-note">
          Delivery health activates when project work begins.
        </p>
      </section>

      <section className="delivery-brief-grid" aria-label="Delivery brief">
        <article className="delivery-brief-panel">
          <div className="ops-section-heading ops-section-heading-compact">
            <div>
              <span className="ops-section-label">Priority</span>
              <h2>Needs attention</h2>
            </div>
            <span className="ops-count-badge">0</span>
          </div>
          <div className="delivery-inline-empty">
            <span
              className="delivery-empty-glyph"
              data-tone="success"
              aria-hidden="true"
            />
            <div>
              <strong>Nothing needs intervention</strong>
              <span>
                Risks, blocked approvals, and stale handoffs will surface here.
              </span>
            </div>
          </div>
        </article>

        <article className="delivery-brief-panel">
          <div className="ops-section-heading ops-section-heading-compact">
            <div>
              <span className="ops-section-label">Timeline</span>
              <h2>Upcoming</h2>
            </div>
            <span className="ops-count-badge">0</span>
          </div>
          <div className="delivery-inline-empty">
            <span
              className="delivery-empty-glyph"
              data-tone="neutral"
              aria-hidden="true"
            />
            <div>
              <strong>No upcoming handoffs</strong>
              <span>
                Client reviews and delivery checkpoints will collect here.
              </span>
            </div>
          </div>
        </article>
      </section>

      <section
        className="delivery-table-section"
        aria-labelledby="active-delivery-heading"
      >
        <div className="ops-section-heading">
          <div>
            <span className="ops-section-label">Portfolio</span>
            <h2 id="active-delivery-heading">Active delivery</h2>
          </div>
        </div>
        <div
          className="delivery-table"
          role="table"
          aria-label="Active delivery projects"
        >
          <div className="delivery-table-row delivery-table-header" role="row">
            <span role="columnheader">Project</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">Owner</span>
            <span role="columnheader">Updated</span>
            <span role="columnheader">Health</span>
          </div>
          <div className="delivery-table-empty" role="row">
            <div role="cell">
              <span className="delivery-table-empty-mark" aria-hidden="true">
                +
              </span>
              <div>
                <strong>No active delivery yet</strong>
                <span>
                  Project activity will appear here when delivery work is
                  active.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
