import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  canCreateProject,
  canViewAgencyWorkspace,
} from "../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../modules/auth/components/session-refresh";
import { listAgencyProjects } from "../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../server/database";

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

export default async function AgencyProjectsPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor)
    redirect(`/access?returnTo=${encodeURIComponent("/agency/projects")}`);

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    {
      requestedWorkspaceId,
      policy: canViewAgencyWorkspace,
    },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.projects");
    redirect("/access-denied");
  }

  const { selected } = result.selection;
  const projects = await listAgencyProjects(database, actor, selected.scope);
  const canCreate = canCreateProject(actor, selected.workspaceId).allowed;

  return (
    <main className="ops-workspace ops-collection-page">
      <SessionRefresh
        returnTo={`/agency/projects?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <header className="ops-page-header ops-collection-header">
        <div>
          <p className="ops-page-kicker">Portfolio</p>
          <h1>Projects</h1>
          <p>Every Project visible through your current delivery assignment.</p>
        </div>
        {canCreate ? (
          <Link
            className="ops-primary-action"
            href={`/agency/projects/new?workspaceId=${selected.workspaceId}`}
          >
            New project
          </Link>
        ) : null}
      </header>

      <section
        className="ops-collection-section"
        aria-labelledby="projects-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div>
            <p className="ops-section-label">Collection</p>
            <h2 id="projects-heading">All projects</h2>
          </div>
          <span className="ops-section-meta">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <div
          className="ops-data-table ops-projects-table"
          aria-label="Projects"
        >
          <div className="ops-data-table-row ops-data-table-header">
            <span>Project</span>
            <span>Client</span>
            <span>Stage</span>
            <span>Owner</span>
            <span>Target</span>
          </div>

          {projects.length === 0 ? (
            <div className="ops-data-table-empty">
              <div className="ops-empty-symbol" aria-hidden="true">
                +
              </div>
              <div>
                <strong>No assigned projects yet</strong>
                <span>
                  New delivery work will appear here when a Project is created
                  or assigned to you.
                </span>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const row = (
                <>
                  <span className="ops-table-primary">
                    <strong>{project.title}</strong>
                    <small>Project</small>
                  </span>
                  <span>{project.clientOrganizationName}</span>
                  <span>
                    <span
                      className="ops-status-chip"
                      data-tone={
                        project.lifecycle === "DRAFT" ? "neutral" : "success"
                      }
                    >
                      {lifecycleLabel(project.lifecycle)}
                    </span>
                  </span>
                  <span>{project.deliveryManagerName}</span>
                  <span className="ops-table-muted">
                    {project.targetCompletionDate ?? "Not set"}
                  </span>
                </>
              );

              return project.canManageProject &&
                project.lifecycle === "DRAFT" ? (
                <Link
                  className="ops-data-table-row ops-data-table-link"
                  key={project.projectId}
                  href={`/agency/projects/${project.projectId}/setup?workspaceId=${selected.workspaceId}`}
                >
                  {row}
                </Link>
              ) : (
                <div
                  className="ops-data-table-row ops-data-table-static"
                  key={project.projectId}
                >
                  {row}
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
