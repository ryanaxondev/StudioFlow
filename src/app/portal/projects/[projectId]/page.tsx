import {
  FolderOpenIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
} from "@phosphor-icons/react/ssr";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { getClientMilestonePlan } from "../../../../modules/milestones/queries";
import { ClientProjectNavigation } from "../../../../modules/projects/components/client-project-navigation";
import { ClientProjectTimeline } from "../../../../modules/projects/components/client-project-timeline";
import {
  getClientProjectDetail,
  listClientProjectActivity,
  type ClientProjectActivityListItem,
  type ClientProjectLifecycle,
} from "../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string }>;
}>;

function lifecycleLabel(value: ClientProjectLifecycle): string {
  if (value === "PAST") return "Past";
  return value
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

function formatActivityDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function activityLabel(event: ClientProjectActivityListItem): string {
  const labels: Record<string, string> = {
    "project.published": "shared the Project with your team",
    "project.activated": "moved the Project into active delivery",
    "milestone.published": "published a Milestone",
    "milestone.activated": "started a Milestone",
    "milestone.completed": "completed a Milestone",
    "milestone.cancelled": "cancelled a Milestone",
    "milestone.sequence_reordered": "updated the published Milestone sequence",
  };
  return labels[event.eventType] ?? "updated shared Project delivery";
}

export default async function ClientProjectOverviewPage({ params }: PageProps) {
  const { projectId } = await params;
  if (!z.string().uuid().safeParse(projectId).success) notFound();

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) {
    redirect(
      `/access?returnTo=${encodeURIComponent(`/portal/projects/${projectId}`)}`,
    );
  }

  const [projectResult, planResult] = await Promise.all([
    getClientProjectDetail(database, actor, projectId),
    getClientMilestonePlan(database, actor, projectId),
  ]);
  if (
    projectResult.status === "not-found" ||
    planResult.status === "not-found"
  ) {
    notFound();
  }
  if (projectResult.status === "denied" || planResult.status === "denied") {
    redirect("/access-denied");
  }

  const { detail, scope } = projectResult;
  const { milestones } = planResult.plan;
  const activity = await listClientProjectActivity(database, scope, 6);
  const activeMilestone = milestones.find(
    (milestone) => milestone.state === "ACTIVE",
  );
  const completedMilestones = milestones.filter(
    (milestone) => milestone.state === "COMPLETED",
  );
  const progressPercent = milestones.length
    ? Math.round((completedMilestones.length / milestones.length) * 100)
    : 0;

  return (
    <main className="client-page client-project-overview-page">
      <SessionRefresh returnTo={`/portal/projects/${projectId}`} />

      <div className="client-detail-back">
        <Link href="/portal/projects">← Projects</Link>
      </div>

      <header className="client-project-hero">
        <div>
          <p className="client-page-kicker">
            {detail.agencyName} · {detail.clientOrganizationName}
          </p>
          <h1>{detail.title}</h1>
          <p>
            {detail.clientSummary ??
              "Your agency has not added a client-facing Project summary yet."}
          </p>
        </div>
        <span
          className="client-lifecycle-chip"
          data-state={detail.lifecycle.toLowerCase()}
        >
          {lifecycleLabel(detail.lifecycle)}
        </span>
      </header>

      <ClientProjectNavigation projectId={projectId} current="overview" />

      <section
        className="client-project-summary-grid"
        aria-label="Project summary"
      >
        <article className="client-project-focus-card">
          <span className="client-panel-icon" data-tone="accent">
            <ClockCountdownIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Current attention</p>
            <h2>No published request is waiting on you</h2>
            <p>
              {activeMilestone
                ? `${activeMilestone.title} is the current delivery phase. You can review its published context now.`
                : "There is no Active Milestone requiring your attention right now."}
            </p>
            {activeMilestone ? (
              <Link
                className="client-primary-action"
                href={`/portal/projects/${projectId}/milestones/${activeMilestone.milestoneId}`}
              >
                Open current Milestone
              </Link>
            ) : null}
          </div>
        </article>

        <article className="client-project-stat-card">
          <span className="client-panel-icon">
            <CheckCircleIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Progress</p>
            <strong>
              {completedMilestones.length} of {milestones.length}
            </strong>
            <span>published Milestones complete</span>
          </div>
        </article>

        <article className="client-project-stat-card">
          <span className="client-panel-icon">
            <FolderOpenIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Target</p>
            <strong>{formatDate(detail.targetCompletionDate)}</strong>
            <span>Project target completion</span>
          </div>
        </article>
      </section>

      <section
        className="client-project-progress"
        aria-labelledby="client-progress-heading"
      >
        <div className="client-section-heading">
          <div>
            <p className="client-section-label">Delivery plan</p>
            <h2 id="client-progress-heading">Milestone timeline</h2>
          </div>
          <span>{progressPercent}% complete</span>
        </div>
        {milestones.length ? (
          <ClientProjectTimeline
            projectId={projectId}
            milestones={milestones}
          />
        ) : (
          <div className="client-inline-empty client-surface-empty">
            <strong>No published Milestones</strong>
            <span>The delivery sequence is not available yet.</span>
          </div>
        )}
      </section>

      <section className="client-project-overview-columns">
        <article className="client-project-surface-card">
          <div className="client-section-heading">
            <div>
              <p className="client-section-label">Recent decisions</p>
              <h2>Decision history</h2>
            </div>
          </div>
          <div className="client-inline-empty">
            <strong>No published decisions yet</strong>
            <span>
              Formal review decisions will collect here when they exist.
            </span>
          </div>
        </article>

        <article className="client-project-surface-card">
          <div className="client-section-heading">
            <div>
              <p className="client-section-label">Recent activity</p>
              <h2>Shared updates</h2>
            </div>
            <span>{activity.length}</span>
          </div>
          {activity.length ? (
            <div className="client-project-activity-list">
              {activity.map((event) => (
                <div key={event.activityEventId}>
                  <span className="client-activity-mark" aria-hidden="true" />
                  <div>
                    <strong>{event.actorName}</strong>
                    <span>{activityLabel(event)}</span>
                    <small>{formatActivityDate(event.occurredAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="client-inline-empty">
              <strong>No shared activity yet</strong>
              <span>Only client-visible delivery history appears here.</span>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
