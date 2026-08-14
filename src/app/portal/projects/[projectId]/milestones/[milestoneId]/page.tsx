import {
  CheckCircleIcon,
  ClockCountdownIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react/ssr";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../../../modules/auth/components/session-refresh";
import { getClientMilestoneDetail } from "../../../../../../modules/milestones/queries";
import { ClientProjectNavigation } from "../../../../../../modules/projects/components/client-project-navigation";
import { getClientProjectDetail } from "../../../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string; milestoneId: string }>;
}>;

function stateLabel(value: string): string {
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

export default async function ClientMilestoneDetailPage({ params }: PageProps) {
  const { projectId, milestoneId } = await params;
  const uuid = z.string().uuid();
  if (
    !uuid.safeParse(projectId).success ||
    !uuid.safeParse(milestoneId).success
  ) {
    notFound();
  }

  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) {
    redirect(
      `/access?returnTo=${encodeURIComponent(`/portal/projects/${projectId}/milestones/${milestoneId}`)}`,
    );
  }

  const [projectResult, milestoneResult] = await Promise.all([
    getClientProjectDetail(database, actor, projectId),
    getClientMilestoneDetail(database, actor, projectId, milestoneId),
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

  const { detail } = projectResult;
  const { milestone } = milestoneResult;

  return (
    <main className="client-page client-milestone-detail-page">
      <SessionRefresh
        returnTo={`/portal/projects/${projectId}/milestones/${milestoneId}`}
      />

      <div className="client-detail-back">
        <Link href={`/portal/projects/${projectId}`}>← Project overview</Link>
      </div>

      <header className="client-project-hero client-milestone-hero">
        <div>
          <p className="client-page-kicker">
            Milestone {String(milestone.ordinal).padStart(2, "0")} ·{" "}
            {detail.title}
          </p>
          <h1>{milestone.title}</h1>
          <p>
            {milestone.clientDescription ??
              milestone.purpose ??
              "Published Milestone context is available without an additional description."}
          </p>
        </div>
        <span
          className="client-lifecycle-chip"
          data-state={milestone.state.toLowerCase()}
        >
          {stateLabel(milestone.state)}
        </span>
      </header>

      <ClientProjectNavigation projectId={projectId} current="context" />

      <section
        className="client-milestone-context-grid"
        aria-label="Milestone context"
      >
        <article className="client-project-surface-card client-milestone-purpose-card">
          <span className="client-panel-icon" data-tone="accent">
            <FolderOpenIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Purpose</p>
            <h2>{milestone.purpose ?? "Delivery phase"}</h2>
            <p>
              {milestone.clientDescription ??
                "Your agency has not added a separate client-facing description."}
            </p>
          </div>
        </article>

        <article className="client-project-surface-card client-milestone-fact-card">
          <span className="client-panel-icon">
            <ClockCountdownIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Planned dates</p>
            <strong>{formatDate(milestone.plannedStartDate)}</strong>
            <span>to {formatDate(milestone.plannedEndDate)}</span>
          </div>
        </article>

        <article className="client-project-surface-card client-milestone-fact-card">
          <span className="client-panel-icon">
            <CheckCircleIcon aria-hidden="true" weight="regular" />
          </span>
          <div>
            <p className="client-section-label">Completion state</p>
            <strong>{stateLabel(milestone.state)}</strong>
            <span>
              {milestone.state === "COMPLETED"
                ? "This delivery phase is complete."
                : milestone.state === "CANCELLED"
                  ? "This delivery phase is closed."
                  : milestone.state === "ACTIVE"
                    ? "This is the current delivery phase."
                    : "This phase is planned for later in the sequence."}
            </span>
          </div>
        </article>
      </section>

      <section className="client-project-overview-columns client-milestone-published-columns">
        <article className="client-project-surface-card">
          <div className="client-panel-heading">
            <span className="client-panel-icon" data-tone="accent">
              <FolderOpenIcon aria-hidden="true" weight="regular" />
            </span>
            <div>
              <p className="client-section-label">Responsibilities</p>
              <h2>Published requests</h2>
            </div>
          </div>
          <div className="client-inline-empty">
            <strong>No published responsibilities</strong>
            <span>
              There are no client requests attached to this Milestone.
            </span>
          </div>
        </article>

        <article className="client-project-surface-card">
          <div className="client-panel-heading">
            <span className="client-panel-icon">
              <FolderOpenIcon aria-hidden="true" weight="regular" />
            </span>
            <div>
              <p className="client-section-label">Deliverables</p>
              <h2>Published work</h2>
            </div>
          </div>
          <div className="client-inline-empty">
            <strong>No published Deliverables</strong>
            <span>
              Reviewable work will appear here only after it is shared.
            </span>
          </div>
        </article>
      </section>
    </main>
  );
}
