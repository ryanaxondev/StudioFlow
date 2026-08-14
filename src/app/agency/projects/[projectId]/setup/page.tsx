import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { SessionRefresh } from "../../../../../modules/auth/components/session-refresh";
import { MilestonePlanEditor } from "../../../../../modules/milestones/components/milestone-plan-editor";
import { getAgencyMilestonePlan } from "../../../../../modules/milestones/queries";
import { AgencyProjectNavigation } from "../../../../../modules/projects/components/agency-project-navigation";
import { ProjectGeneralSettings } from "../../../../../modules/projects/components/project-general-settings";
import { ProjectPublicationPanel } from "../../../../../modules/projects/components/project-publication-panel";
import {
  getAgencyProjectDetail,
  getProjectSettingsCandidates,
} from "../../../../../modules/projects/queries";
import { getCurrentActorContext } from "../../../../../modules/authorization/server/authorization";
import { getApplicationDatabase } from "../../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectSetupPage({
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
    const returnTo = requestedWorkspaceId
      ? `/agency/projects/${projectId}/setup?workspaceId=${encodeURIComponent(requestedWorkspaceId)}`
      : `/agency/projects/${projectId}/setup`;
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const [projectResult, planResult] = await Promise.all([
    getAgencyProjectDetail(database, actor, projectId),
    getAgencyMilestonePlan(database, actor, projectId),
  ]);
  if (projectResult.status === "not-found" || planResult.status === "not-found")
    notFound();
  if (projectResult.status === "denied" || planResult.status === "denied")
    redirect("/access-denied");
  const { detail } = projectResult;
  const { plan } = planResult;

  if (requestedWorkspaceId && requestedWorkspaceId !== detail.workspaceId) {
    notFound();
  }

  const candidatesResult = await getProjectSettingsCandidates(
    database,
    actor,
    projectId,
  );
  if (candidatesResult.status === "not-found") notFound();
  if (candidatesResult.status === "denied") redirect("/access-denied");
  if (detail.lifecycle !== "DRAFT") {
    redirect(
      `/agency/projects/${projectId}?workspaceId=${encodeURIComponent(detail.workspaceId)}`,
    );
  }

  const deliveryManagerEligible = candidatesResult.candidates.agency.some(
    (candidate) => candidate.userId === detail.deliveryManagerUserId,
  );
  const clientApproverEligible = candidatesResult.candidates.client.some(
    (candidate) => candidate.userId === detail.clientApproverUserId,
  );
  const checks = [
    { label: "Minimal Draft created", complete: true },
    {
      label: "Client-facing summary",
      complete: Boolean(detail.clientSummary?.trim()),
    },
    {
      label: "Target completion",
      complete: Boolean(detail.targetCompletionDate),
    },
    { label: "Delivery Manager", complete: deliveryManagerEligible },
    { label: "Client Approver", complete: clientApproverEligible },
    {
      label: "Milestone plan",
      complete: plan.milestones.length > 0,
    },
  ] as const;
  const completeCount = checks.filter((item) => item.complete).length;

  return (
    <main className="ops-workspace ops-project-settings-page">
      <SessionRefresh
        returnTo={`/agency/projects/${projectId}/setup?workspaceId=${encodeURIComponent(detail.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link href={`/agency/projects?workspaceId=${detail.workspaceId}`}>
          ← Projects
        </Link>
      </div>

      <header className="ops-page-header ops-project-settings-header">
        <div>
          <p className="ops-page-kicker">Project setup</p>
          <h1>{detail.title}</h1>
          <p>
            Complete the core Project context now, then return whenever the
            remaining setup requirements are ready.
          </p>
        </div>
        <span
          className="ops-status-chip ops-status-chip-large"
          data-tone="neutral"
        >
          Draft
        </span>
      </header>

      <AgencyProjectNavigation
        projectId={projectId}
        workspaceId={detail.workspaceId}
        lifecycle={detail.lifecycle}
        current="setup"
        canManageSettings={true}
      />

      <section className="ops-project-readiness">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Resumable setup</p>
            <h2>Draft readiness</h2>
          </div>
          <span className="ops-section-meta">
            {completeCount} of {checks.length} ready
          </span>
        </div>
        <div className="ops-project-checklist">
          {checks.map((item) => (
            <div key={item.label} data-complete={item.complete}>
              <span aria-hidden="true">{item.complete ? "✓" : "·"}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-project-settings-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Identity</p>
            <h2>Project context</h2>
          </div>
          <span className="ops-section-meta">
            {detail.clientOrganizationName}
          </span>
        </div>
        <ProjectGeneralSettings
          detail={detail}
          candidates={candidatesResult.candidates}
        />
      </section>

      <section className="ops-project-settings-card ops-setup-milestones-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Delivery plan</p>
            <h2>Milestone sequence</h2>
          </div>
          <Link
            className="ops-quiet-action"
            href={`/agency/projects/${projectId}/delivery?workspaceId=${detail.workspaceId}`}
          >
            Open full Delivery Plan
          </Link>
        </div>
        <p className="ops-section-intro">
          At least one Milestone is required. The first position becomes Active
          when this Project is published.
        </p>
        <MilestonePlanEditor
          projectId={projectId}
          workspaceId={detail.workspaceId}
          projectRowVersion={detail.rowVersion}
          projectLifecycle={detail.lifecycle}
          milestones={plan.milestones}
          permissions={plan.permissions}
        />
      </section>

      <section className="ops-project-settings-card ops-client-preview-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Client Portal preview</p>
            <h2>Publication context</h2>
          </div>
          <span className="ops-section-meta">Preview boundary</span>
        </div>
        <div className="ops-client-preview-surface">
          <p className="ops-section-label">{detail.clientOrganizationName}</p>
          <h3>{detail.title}</h3>
          <p>{detail.clientSummary ?? "Client-facing summary not set."}</p>
          <div>
            <span>Target {detail.targetCompletionDate ?? "not set"}</span>
            <span>•</span>
            <span>{plan.milestones.length} planned Milestones</span>
          </div>
          {plan.milestones[0] ? (
            <strong>First Milestone: {plan.milestones[0].title}</strong>
          ) : null}
        </div>
      </section>

      <ProjectPublicationPanel
        projectId={projectId}
        workspaceId={detail.workspaceId}
        rowVersion={detail.rowVersion}
        checks={checks.filter(
          (check) => check.label !== "Minimal Draft created",
        )}
      />
    </main>
  );
}
