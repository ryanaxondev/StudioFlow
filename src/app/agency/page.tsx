import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canViewAgencyDelivery } from "../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { listAgencyDeliveryProjects } from "../../modules/projects/queries";
import { getApplicationDatabase } from "../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function lifecycleLabel(lifecycle: string): string {
  return lifecycle
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTargetDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

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
  const deliveryProjects = await listAgencyDeliveryProjects(
    database,
    actor,
    selected.scope,
  );
  const lifecycleCounts = {
    DRAFT: deliveryProjects.filter((project) => project.lifecycle === "DRAFT")
      .length,
    ONBOARDING: deliveryProjects.filter(
      (project) => project.lifecycle === "ONBOARDING",
    ).length,
    ACTIVE: deliveryProjects.filter((project) => project.lifecycle === "ACTIVE")
      .length,
    HANDOFF: deliveryProjects.filter(
      (project) => project.lifecycle === "HANDOFF",
    ).length,
  };
  const draftProjects = deliveryProjects.filter(
    (project) => project.lifecycle === "DRAFT" && project.canManageProject,
  );
  const datedProjects = deliveryProjects
    .filter((project) => project.targetCompletionDate)
    .sort((left, right) =>
      String(left.targetCompletionDate).localeCompare(
        String(right.targetCompletionDate),
      ),
    );
  const activeMilestoneProjects = deliveryProjects.filter(
    (project) => project.activeMilestoneId && project.activeMilestoneTitle,
  );

  const pulseMetrics = [
    { label: "Draft setup", tone: "attention", value: lifecycleCounts.DRAFT },
    {
      label: "Onboarding",
      tone: "waiting",
      value: lifecycleCounts.ONBOARDING,
    },
    {
      label: "Active delivery",
      tone: "active",
      value: lifecycleCounts.ACTIVE,
    },
    { label: "Handoff", tone: "neutral", value: lifecycleCounts.HANDOFF },
  ] as const;

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
            Project lifecycle, responsibility, and delivery context across{" "}
            {selected.workspaceName}.
          </p>
        </div>
        <Link
          className="ops-primary-action"
          href={`/agency/projects/new?workspaceId=${selected.workspaceId}`}
        >
          New project
        </Link>
      </header>

      <section
        className="delivery-pulse"
        aria-labelledby="delivery-pulse-heading"
      >
        <div className="ops-section-heading">
          <div>
            <span className="ops-section-label">Delivery pulse</span>
            <h2 id="delivery-pulse-heading">Lifecycle summary</h2>
          </div>
          <span className="ops-section-meta">
            {deliveryProjects.length} visible{" "}
            {deliveryProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>
        <div className="delivery-metrics">
          {pulseMetrics.map((metric) => (
            <div
              className="delivery-metric"
              data-tone={metric.tone}
              key={metric.label}
            >
              <span>{metric.label}</span>
              <strong className="tabular-nums">{metric.value}</strong>
            </div>
          ))}
        </div>
        {deliveryProjects.length === 0 ? (
          <p className="delivery-pulse-empty-note">
            Delivery lifecycle activates when the first Project Draft is
            created.
          </p>
        ) : null}
      </section>

      <section className="delivery-brief-grid" aria-label="Delivery brief">
        <article className="delivery-brief-panel">
          <div className="ops-section-heading ops-section-heading-compact">
            <div>
              <span className="ops-section-label">Priority</span>
              <h2>Draft setup</h2>
            </div>
            <span className="ops-count-badge">{draftProjects.length}</span>
          </div>
          {draftProjects[0] ? (
            <Link
              className="delivery-inline-empty delivery-inline-link"
              href={`/agency/projects/${draftProjects[0].projectId}/setup?workspaceId=${selected.workspaceId}`}
            >
              <span
                className="delivery-empty-glyph"
                data-tone="neutral"
                aria-hidden="true"
              />
              <div>
                <strong>{draftProjects[0].title}</strong>
                <span>
                  Resume setup for {draftProjects[0].clientOrganizationName}.
                </span>
              </div>
            </Link>
          ) : (
            <div className="delivery-inline-empty">
              <span
                className="delivery-empty-glyph"
                data-tone="success"
                aria-hidden="true"
              />
              <div>
                <strong>No Draft setup waiting</strong>
                <span>New Project Drafts will surface here.</span>
              </div>
            </div>
          )}
        </article>

        <article className="delivery-brief-panel">
          <div className="ops-section-heading ops-section-heading-compact">
            <div>
              <span className="ops-section-label">Current delivery</span>
              <h2>Active Milestone</h2>
            </div>
            <span className="ops-count-badge">
              {activeMilestoneProjects.length}
            </span>
          </div>
          {activeMilestoneProjects[0] ? (
            <Link
              className="delivery-inline-empty delivery-inline-link"
              href={`/agency/projects/${activeMilestoneProjects[0].projectId}/delivery/milestones/${activeMilestoneProjects[0].activeMilestoneId}?workspaceId=${selected.workspaceId}`}
            >
              <span
                className="delivery-empty-glyph"
                data-tone="success"
                aria-hidden="true"
              />
              <div>
                <strong>
                  {activeMilestoneProjects[0].activeMilestoneTitle}
                </strong>
                <span>{activeMilestoneProjects[0].title}</span>
              </div>
            </Link>
          ) : (
            <div className="delivery-inline-empty">
              <span
                className="delivery-empty-glyph"
                data-tone="neutral"
                aria-hidden="true"
              />
              <div>
                <strong>No Active Milestone</strong>
                <span>Published delivery work will surface here.</span>
              </div>
            </div>
          )}
        </article>

        <article className="delivery-brief-panel">
          <div className="ops-section-heading ops-section-heading-compact">
            <div>
              <span className="ops-section-label">Timeline</span>
              <h2>Nearest target</h2>
            </div>
            <span className="ops-count-badge">{datedProjects.length}</span>
          </div>
          {datedProjects[0] ? (
            <div className="delivery-inline-empty">
              <span
                className="delivery-empty-glyph"
                data-tone="neutral"
                aria-hidden="true"
              />
              <div>
                <strong>{datedProjects[0].title}</strong>
                <span>
                  Target completion{" "}
                  {formatTargetDate(datedProjects[0].targetCompletionDate!)}.
                </span>
              </div>
            </div>
          ) : (
            <div className="delivery-inline-empty">
              <span
                className="delivery-empty-glyph"
                data-tone="neutral"
                aria-hidden="true"
              />
              <div>
                <strong>No target dates yet</strong>
                <span>
                  Project targets will collect here as setup continues.
                </span>
              </div>
            </div>
          )}
        </article>
      </section>

      <section
        className="delivery-table-section"
        aria-labelledby="active-delivery-heading"
      >
        <div className="ops-section-heading">
          <div>
            <span className="ops-section-label">Portfolio</span>
            <h2 id="active-delivery-heading">Delivery portfolio</h2>
          </div>
        </div>
        <div
          className="delivery-table"
          role="table"
          aria-label="Delivery projects"
        >
          <div className="delivery-table-row delivery-table-header" role="row">
            <span role="columnheader">Project</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">Owner</span>
            <span role="columnheader">Updated</span>
            <span role="columnheader">Status</span>
          </div>
          {deliveryProjects.length === 0 ? (
            <div className="delivery-table-empty" role="row">
              <div role="cell">
                <span className="delivery-table-empty-mark" aria-hidden="true">
                  +
                </span>
                <div>
                  <strong>No delivery Projects yet</strong>
                  <span>Create a Draft to establish delivery context.</span>
                </div>
              </div>
            </div>
          ) : (
            deliveryProjects.map((project) => {
              const row = (
                <>
                  <span role="cell" className="ops-table-primary">
                    <strong>{project.title}</strong>
                    <small>Project</small>
                  </span>
                  <span role="cell">{project.clientOrganizationName}</span>
                  <span role="cell">{lifecycleLabel(project.lifecycle)}</span>
                  <span role="cell">{project.deliveryManagerName}</span>
                  <span role="cell">{formatDate(project.updatedAt)}</span>
                  <span role="cell">
                    <span
                      className="ops-status-chip"
                      data-tone={
                        project.lifecycle === "DRAFT" ? "neutral" : "success"
                      }
                    >
                      {project.lifecycle === "DRAFT" ? "Setup" : "Tracked"}
                    </span>
                  </span>
                </>
              );

              const projectHref =
                project.lifecycle === "DRAFT" && project.canManageProject
                  ? `/agency/projects/${project.projectId}/setup?workspaceId=${selected.workspaceId}`
                  : `/agency/projects/${project.projectId}?workspaceId=${selected.workspaceId}`;

              return (
                <Link
                  className="delivery-table-row delivery-table-project-row"
                  role="row"
                  key={project.projectId}
                  href={projectHref}
                >
                  {row}
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
