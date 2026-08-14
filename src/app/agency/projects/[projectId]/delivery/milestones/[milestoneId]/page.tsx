import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../../../../modules/auth/components/session-refresh";
import { MilestoneDetailControls } from "../../../../../../../modules/milestones/components/milestone-detail-controls";
import { getAgencyMilestoneDetail } from "../../../../../../../modules/milestones/queries";
import { AgencyProjectNavigation } from "../../../../../../../modules/projects/components/agency-project-navigation";
import {
  getAgencyProjectDetail,
  listAgencyProjectActivity,
} from "../../../../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string; milestoneId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function stateLabel(state: string, published: boolean): string {
  if (!published) return "Draft";
  return state
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function activityLabel(eventType: string): string {
  const suffix = eventType.startsWith("milestone.")
    ? eventType.slice("milestone.".length)
    : eventType;
  return suffix
    .replaceAll("_", " ")
    .replace(/^\w/, (value) => value.toUpperCase());
}

export default async function AgencyMilestoneDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ projectId, milestoneId }, parameters] = await Promise.all([
    params,
    searchParams,
  ]);
  const uuid = z.string().uuid();
  if (
    !uuid.safeParse(projectId).success ||
    !uuid.safeParse(milestoneId).success
  ) {
    notFound();
  }
  const requestedWorkspaceId = firstValue(parameters.workspaceId);

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) {
    redirect(
      `/access?returnTo=${encodeURIComponent(`/agency/projects/${projectId}/delivery/milestones/${milestoneId}`)}`,
    );
  }

  const [projectResult, milestoneResult] = await Promise.all([
    getAgencyProjectDetail(database, actor, projectId),
    getAgencyMilestoneDetail(database, actor, projectId, milestoneId),
  ]);
  if (
    projectResult.status === "not-found" ||
    milestoneResult.status === "not-found"
  ) {
    notFound();
  }
  if (
    projectResult.status === "denied" ||
    milestoneResult.status === "denied"
  ) {
    redirect("/access-denied");
  }

  const { detail, scope } = projectResult;
  const { milestone, plan } = milestoneResult;
  if (requestedWorkspaceId && requestedWorkspaceId !== detail.workspaceId) {
    notFound();
  }

  const activity = (await listAgencyProjectActivity(database, scope, 50))
    .filter(
      (event) =>
        event.subjectType === "MILESTONE" &&
        event.subjectId === milestone.milestoneId,
    )
    .slice(0, 10);

  return (
    <main className="ops-workspace ops-milestone-detail-page">
      <SessionRefresh
        returnTo={`/agency/projects/${projectId}/delivery/milestones/${milestoneId}?workspaceId=${encodeURIComponent(detail.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link
          href={`/agency/projects/${projectId}/delivery?workspaceId=${detail.workspaceId}`}
        >
          ← Delivery Plan
        </Link>
      </div>

      <header className="ops-page-header ops-milestone-detail-header">
        <div>
          <p className="ops-page-kicker">
            Milestone {String(milestone.position).padStart(2, "0")} ·{" "}
            {detail.title}
          </p>
          <h1>{milestone.title}</h1>
          <p>
            {milestone.purpose ??
              milestone.clientDescription ??
              "Purpose not set."}
          </p>
        </div>
        <span
          className="ops-status-chip ops-status-chip-large"
          data-tone={milestone.state === "ACTIVE" ? "active" : "neutral"}
        >
          {stateLabel(milestone.state, Boolean(milestone.publishedAt))}
        </span>
      </header>

      <AgencyProjectNavigation
        projectId={projectId}
        workspaceId={detail.workspaceId}
        lifecycle={detail.lifecycle}
        current="delivery"
        canManageSettings={plan.permissions.canEditProjectSettings}
      />

      <section className="ops-milestone-detail-grid">
        <article className="ops-project-settings-card ops-milestone-context-card">
          <p className="ops-section-label">Client-facing context</p>
          <h2>{milestone.clientDescription ?? "Description not set"}</h2>
          <dl className="ops-milestone-facts">
            <div>
              <dt>Planned start</dt>
              <dd>{formatDate(milestone.plannedStartDate)}</dd>
            </div>
            <div>
              <dt>Planned end</dt>
              <dd>{formatDate(milestone.plannedEndDate)}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>
                {milestone.publishedAt ? "Client-visible" : "Agency-only"}
              </dd>
            </div>
            <div>
              <dt>Lifecycle</dt>
              <dd>
                {stateLabel(milestone.state, Boolean(milestone.publishedAt))}
              </dd>
            </div>
          </dl>
        </article>

        <article className="ops-project-settings-card ops-milestone-requirements-card">
          <p className="ops-section-label">Completion requirements</p>
          <h2>M10 completion boundary</h2>
          <p>
            No authoritative Client Action or Deliverable blockers exist yet.
            M11 and M13 extend the same completion evaluator without changing
            this lifecycle command surface.
          </p>
          <div className="ops-project-callout">
            <strong>Current criteria</strong>
            <span>
              Base Milestone lifecycle is eligible for standard completion.
            </span>
          </div>
        </article>
      </section>

      <section className="ops-project-settings-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Controls</p>
            <h2>Milestone management</h2>
          </div>
        </div>
        <MilestoneDetailControls
          projectId={projectId}
          projectRowVersion={detail.rowVersion}
          projectLifecycle={detail.lifecycle}
          milestone={milestone}
          permissions={plan.permissions}
        />
      </section>

      <section className="ops-project-settings-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Activity</p>
            <h2>Milestone history</h2>
          </div>
          <span className="ops-section-meta">{activity.length}</span>
        </div>
        <div className="ops-project-activity-list">
          {activity.length ? (
            activity.map((event) => (
              <div key={event.activityEventId}>
                <span
                  className="ops-project-activity-mark"
                  aria-hidden="true"
                />
                <div>
                  <strong>{event.actorName}</strong>
                  <span>{activityLabel(event.eventType)}</span>
                  <small>{event.occurredAt.toLocaleString("en")}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="ops-project-empty-copy">No Milestone Activity yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
