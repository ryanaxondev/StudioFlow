import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { SessionRefresh } from "../../../../../modules/auth/components/session-refresh";
import { ProjectGeneralSettings } from "../../../../../modules/projects/components/project-general-settings";
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

  const projectResult = await getAgencyProjectDetail(
    database,
    actor,
    projectId,
  );
  if (projectResult.status === "not-found") notFound();
  if (projectResult.status === "denied") redirect("/access-denied");
  const { detail } = projectResult;

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
      `/agency/projects/${projectId}/settings?workspaceId=${encodeURIComponent(detail.workspaceId)}`,
    );
  }

  const checks = [
    { label: "Minimal Draft created", complete: true },
    { label: "Client-facing summary", complete: Boolean(detail.clientSummary) },
    {
      label: "Target completion",
      complete: Boolean(detail.targetCompletionDate),
    },
    {
      label: "Client Approver",
      complete: Boolean(detail.clientApproverUserId),
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

      <nav className="ops-project-settings-nav" aria-label="Project settings">
        <Link
          aria-current="page"
          href={`/agency/projects/${projectId}/setup?workspaceId=${detail.workspaceId}`}
        >
          Setup
        </Link>
        <Link
          href={`/agency/projects/${projectId}/settings?workspaceId=${detail.workspaceId}`}
        >
          General
        </Link>
        <Link
          href={`/agency/projects/${projectId}/settings/people?workspaceId=${detail.workspaceId}`}
        >
          People & Access
        </Link>
        <Link
          href={`/agency/projects/${projectId}/settings/lifecycle?workspaceId=${detail.workspaceId}`}
        >
          Lifecycle
        </Link>
      </nav>

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
    </main>
  );
}
