import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { getAgencyMilestonePlan } from "../../../../modules/milestones/queries";
import { AgencyProjectNavigation } from "../../../../modules/projects/components/agency-project-navigation";
import { ProjectStageAction } from "../../../../modules/projects/components/project-stage-action";
import {
  getAgencyProjectDetail,
  listAgencyProjectActivity,
} from "../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function lifecycleLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function activityLabel(eventType: string): string {
  const labels: Record<string, string> = {
    "project.created": "created the Project",
    "project.identity_updated": "updated Project context",
    "project.delivery_manager_reassigned": "changed the Delivery Manager",
    "project.client_approver_reassigned": "changed the Client Approver",
    "project.member_assigned": "added Project access",
    "project.member_removed": "removed Project access",
    "project.published": "published the Project",
    "project.activated": "moved the Project to Active",
    "milestone.draft_created": "created a Milestone Draft",
    "milestone.draft_updated": "updated a Milestone Draft",
    "milestone.published": "published a Milestone",
    "milestone.activated": "activated a Milestone",
    "milestone.completed": "completed a Milestone",
    "milestone.completion_overridden": "completed a Milestone with an override",
    "milestone.cancelled": "cancelled a Milestone",
    "milestone.sequence_reordered": "reordered the client Milestone plan",
    "milestone.sequence_reordered_internal":
      "reordered agency-only Milestone Drafts",
  };
  return labels[eventType] ?? eventType.replaceAll(".", " ");
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

export default async function AgencyProjectOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ projectId }, parameters] = await Promise.all([params, searchParams]);
  if (!z.string().uuid().safeParse(projectId).success) notFound();
  const requestedWorkspaceId = firstValue(parameters.workspaceId);

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) {
    redirect(
      `/access?returnTo=${encodeURIComponent(`/agency/projects/${projectId}`)}`,
    );
  }

  const [projectResult, planResult] = await Promise.all([
    getAgencyProjectDetail(database, actor, projectId),
    getAgencyMilestonePlan(database, actor, projectId),
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
  const { plan } = planResult;
  if (requestedWorkspaceId && requestedWorkspaceId !== detail.workspaceId) {
    notFound();
  }

  if (detail.lifecycle === "DRAFT" && plan.permissions.canPublishProject) {
    redirect(
      `/agency/projects/${projectId}/setup?workspaceId=${encodeURIComponent(detail.workspaceId)}`,
    );
  }

  const activity = await listAgencyProjectActivity(database, scope, 8);
  const activeMilestone = plan.milestones.find(
    (milestone) => milestone.state === "ACTIVE",
  );
  const publishedMilestones = plan.milestones.filter(
    (milestone) => milestone.publishedAt,
  );
  const completedMilestones = publishedMilestones.filter(
    (milestone) => milestone.state === "COMPLETED",
  );
  const progress = publishedMilestones.length
    ? `${completedMilestones.length} of ${publishedMilestones.length}`
    : "Not published";

  return (
    <main className="ops-workspace ops-project-overview-page">
      <SessionRefresh
        returnTo={`/agency/projects/${projectId}?workspaceId=${encodeURIComponent(detail.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link href={`/agency/projects?workspaceId=${detail.workspaceId}`}>
          ← Projects
        </Link>
      </div>

      <header className="ops-page-header ops-project-overview-header">
        <div>
          <p className="ops-page-kicker">{detail.clientOrganizationName}</p>
          <h1>{detail.title}</h1>
          <p>{detail.clientSummary ?? "Client-facing summary not set."}</p>
        </div>
        <span
          className="ops-status-chip ops-status-chip-large"
          data-tone={detail.lifecycle === "ACTIVE" ? "active" : "neutral"}
        >
          {lifecycleLabel(detail.lifecycle)}
        </span>
      </header>

      <AgencyProjectNavigation
        projectId={projectId}
        workspaceId={detail.workspaceId}
        lifecycle={detail.lifecycle}
        current="overview"
        canManageSettings={plan.permissions.canEditProjectSettings}
      />

      <section
        className="ops-project-overview-grid"
        aria-label="Project summary"
      >
        <article className="ops-project-overview-card ops-project-overview-card-primary">
          <p className="ops-section-label">Current delivery context</p>
          <h2>{activeMilestone?.title ?? "No Active Milestone"}</h2>
          <p>
            {activeMilestone?.clientDescription ??
              activeMilestone?.purpose ??
              "The delivery sequence has not reached an Active Milestone yet."}
          </p>
          {activeMilestone ? (
            <Link
              className="ops-primary-action"
              href={`/agency/projects/${projectId}/delivery/milestones/${activeMilestone.milestoneId}?workspaceId=${detail.workspaceId}`}
            >
              Open Active Milestone
            </Link>
          ) : (
            <Link
              className="ops-secondary-action"
              href={`/agency/projects/${projectId}/delivery?workspaceId=${detail.workspaceId}`}
            >
              Open Delivery Plan
            </Link>
          )}
        </article>

        <article className="ops-project-overview-card">
          <p className="ops-section-label">Progress</p>
          <strong className="ops-project-metric">{progress}</strong>
          <span>published Milestones completed</span>
        </article>

        <article className="ops-project-overview-card">
          <p className="ops-section-label">Target</p>
          <strong>{formatDate(detail.targetCompletionDate)}</strong>
          <span>Project target completion</span>
        </article>

        <article className="ops-project-overview-card">
          <p className="ops-section-label">Delivery Manager</p>
          <strong>{detail.deliveryManagerName}</strong>
          <span>
            {detail.clientApproverName
              ? `Client Approver: ${detail.clientApproverName}`
              : "Client Approver not assigned"}
          </span>
        </article>
      </section>

      {detail.lifecycle === "ONBOARDING" &&
      plan.permissions.canManageLifecycle ? (
        <section className="ops-project-settings-card ops-onboarding-transition-card">
          <div>
            <p className="ops-section-label">Onboarding</p>
            <h2>Ready for Active delivery?</h2>
            <p>
              M10 requires an Active Milestone. M11 will extend this transition
              with authoritative onboarding Client Action criteria.
            </p>
          </div>
          <ProjectStageAction
            projectId={projectId}
            rowVersion={detail.rowVersion}
          />
        </section>
      ) : null}

      <section className="ops-project-overview-columns">
        <article className="ops-project-settings-card">
          <div className="ops-section-heading">
            <div>
              <p className="ops-section-label">People</p>
              <h2>Project team</h2>
            </div>
            <span className="ops-section-meta">{detail.members.length}</span>
          </div>
          <div className="ops-project-member-list ops-project-overview-people">
            {detail.members.map((member) => (
              <article key={`${member.side}-${member.userId}`}>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.projectRole.replaceAll("_", " ")}</span>
                </div>
                <span className="ops-status-chip" data-tone="neutral">
                  {member.side === "AGENCY" ? "Agency" : "Client"}
                </span>
              </article>
            ))}
          </div>
        </article>

        <article className="ops-project-settings-card">
          <div className="ops-section-heading">
            <div>
              <p className="ops-section-label">Activity</p>
              <h2>Recent activity</h2>
            </div>
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
                    <small>{formatActivityDate(event.occurredAt)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="ops-project-empty-copy">No Project Activity yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
