import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentActorContext } from "../../../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../../../modules/auth/components/session-refresh";
import { ProjectPeopleManagement } from "../../../../../../modules/projects/components/project-people-management";
import {
  getAgencyProjectDetail,
  getProjectSettingsCandidates,
} from "../../../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../../../server/database";

type PageProps = Readonly<{
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectPeopleSettingsPage({
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
  if (!actor)
    redirect(
      `/access?returnTo=${encodeURIComponent(`/agency/projects/${projectId}/settings/people`)}`,
    );

  const [projectResult, candidatesResult] = await Promise.all([
    getAgencyProjectDetail(database, actor, projectId),
    getProjectSettingsCandidates(database, actor, projectId),
  ]);
  if (
    projectResult.status === "not-found" ||
    candidatesResult.status === "not-found"
  )
    notFound();
  if (projectResult.status === "denied" || candidatesResult.status === "denied")
    redirect("/access-denied");

  const { detail } = projectResult;
  if (requestedWorkspaceId && requestedWorkspaceId !== detail.workspaceId)
    notFound();

  return (
    <main className="ops-workspace ops-project-settings-page">
      <SessionRefresh
        returnTo={`/agency/projects/${projectId}/settings/people?workspaceId=${encodeURIComponent(detail.workspaceId)}`}
      />
      <div className="ops-detail-back">
        {detail.lifecycle === "DRAFT" ? (
          <Link
            href={`/agency/projects/${projectId}/setup?workspaceId=${detail.workspaceId}`}
          >
            ← Project setup
          </Link>
        ) : (
          <Link href={`/agency/projects?workspaceId=${detail.workspaceId}`}>
            ← Projects
          </Link>
        )}
      </div>
      <header className="ops-page-header ops-project-settings-header">
        <div>
          <p className="ops-page-kicker">Project settings</p>
          <h1>People & Access</h1>
          <p>
            Project assignments are explicit and remain separate from Workspace
            or Client Organization authentication.
          </p>
        </div>
      </header>

      <nav className="ops-project-settings-nav" aria-label="Project settings">
        {detail.lifecycle === "DRAFT" ? (
          <Link
            href={`/agency/projects/${projectId}/setup?workspaceId=${detail.workspaceId}`}
          >
            Setup
          </Link>
        ) : null}
        <Link
          href={`/agency/projects/${projectId}/settings?workspaceId=${detail.workspaceId}`}
        >
          General
        </Link>
        <Link
          aria-current="page"
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

      <section className="ops-project-settings-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Authority & participation</p>
            <h2>{detail.title}</h2>
          </div>
          <span className="ops-section-meta">
            {detail.members.length} active
          </span>
        </div>
        <ProjectPeopleManagement
          detail={detail}
          candidates={candidatesResult.candidates}
        />
      </section>
    </main>
  );
}
