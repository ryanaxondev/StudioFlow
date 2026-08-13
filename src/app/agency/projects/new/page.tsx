import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canCreateProject } from "../../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../../modules/auth/components/session-refresh";
import { ProjectCreateForm } from "../../../../modules/projects/components/project-create-form";
import { getProjectCreationCandidates } from "../../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewProjectPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const requestedClientOrganizationId = firstValue(
    parameters.clientOrganizationId,
  );
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    const returnParameters = new URLSearchParams();
    if (requestedWorkspaceId) {
      returnParameters.set("workspaceId", requestedWorkspaceId);
    }
    if (requestedClientOrganizationId) {
      returnParameters.set(
        "clientOrganizationId",
        requestedClientOrganizationId,
      );
    }
    const returnQuery = returnParameters.toString();
    const returnTo = returnQuery
      ? `/agency/projects/new?${returnQuery}`
      : "/agency/projects/new";
    redirect(`/access?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    { requestedWorkspaceId, policy: canCreateProject },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.project.create");
    redirect("/access-denied");
  }

  const { selected } = result.selection;
  const candidates = await getProjectCreationCandidates(
    database,
    selected.scope,
  );

  return (
    <main className="ops-workspace ops-project-settings-page">
      <SessionRefresh
        returnTo={`/agency/projects/new?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <div className="ops-detail-back">
        <Link href={`/agency/projects?workspaceId=${selected.workspaceId}`}>
          ← Projects
        </Link>
      </div>

      <header className="ops-page-header ops-project-settings-header">
        <div>
          <p className="ops-page-kicker">Project setup</p>
          <h1>New Project</h1>
          <p>
            Create the minimal persistent Draft first. People, client-safe
            context, and lifecycle controls remain resumable after creation.
          </p>
        </div>
      </header>

      <section className="ops-project-settings-card">
        <div className="ops-section-heading">
          <div>
            <p className="ops-section-label">Minimal Draft</p>
            <h2>Start the engagement</h2>
          </div>
          <span className="ops-section-meta">{selected.workspaceName}</span>
        </div>
        <ProjectCreateForm
          workspaceId={selected.workspaceId}
          candidates={candidates}
          initialClientOrganizationId={requestedClientOrganizationId}
        />
      </section>
    </main>
  );
}
