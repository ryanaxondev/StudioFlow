import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../../modules/auth/components/session-refresh";
import { MilestonePlanEditor } from "../../../../../modules/milestones/components/milestone-plan-editor";
import { getAgencyMilestonePlan } from "../../../../../modules/milestones/queries";
import { AgencyProjectNavigation } from "../../../../../modules/projects/components/agency-project-navigation";
import { getAgencyProjectDetail } from "../../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgencyDeliveryPlanPage({
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
      `/access?returnTo=${encodeURIComponent(`/agency/projects/${projectId}/delivery`)}`,
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

  const { detail } = projectResult;
  const { plan } = planResult;
  if (requestedWorkspaceId && requestedWorkspaceId !== detail.workspaceId) {
    notFound();
  }

  const activeMilestone = plan.milestones.find(
    (milestone) => milestone.state === "ACTIVE",
  );

  return (
    <main className="ops-workspace ops-delivery-plan-page">
      <SessionRefresh
        returnTo={`/agency/projects/${projectId}/delivery?workspaceId=${encodeURIComponent(detail.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link
          href={
            detail.lifecycle === "DRAFT"
              ? `/agency/projects/${projectId}/setup?workspaceId=${detail.workspaceId}`
              : `/agency/projects/${projectId}?workspaceId=${detail.workspaceId}`
          }
        >
          ←{" "}
          {detail.lifecycle === "DRAFT" ? "Project setup" : "Project overview"}
        </Link>
      </div>

      <header className="ops-page-header ops-delivery-plan-header">
        <div>
          <p className="ops-page-kicker">{detail.clientOrganizationName}</p>
          <h1>Delivery Plan</h1>
          <p>
            Ordered Milestones define the client-facing sequence for{" "}
            {detail.title}.
          </p>
        </div>
        {activeMilestone ? (
          <Link
            className="ops-primary-action"
            href={`/agency/projects/${projectId}/delivery/milestones/${activeMilestone.milestoneId}?workspaceId=${detail.workspaceId}`}
          >
            Open Active Milestone
          </Link>
        ) : null}
      </header>

      <AgencyProjectNavigation
        projectId={projectId}
        workspaceId={detail.workspaceId}
        lifecycle={detail.lifecycle}
        current="delivery"
        canManageSettings={plan.permissions.canEditProjectSettings}
      />

      <section
        className="ops-delivery-plan-tabs"
        aria-label="Delivery Plan views"
      >
        <span aria-current="page">Milestones</span>
        <span aria-disabled="true" title="Client Actions arrive in M11">
          Client Actions
        </span>
      </section>

      <section className="ops-project-settings-card ops-milestone-plan-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Sequence</p>
            <h2>Milestones</h2>
          </div>
          <span className="ops-section-meta">
            {plan.milestones.length}{" "}
            {plan.milestones.length === 1 ? "Milestone" : "Milestones"}
          </span>
        </div>
        <p className="ops-section-intro">
          Unpublished Planned Milestones stay agency-only. Published Milestones
          form the client-visible delivery timeline.
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
    </main>
  );
}
