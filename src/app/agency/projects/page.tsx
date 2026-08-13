import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { canViewAgencyWorkspace } from "../../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../modules/auth/components/session-refresh";
import { getApplicationDatabase } from "../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

  return (
    <main className="ops-workspace ops-collection-page">
      <SessionRefresh
        returnTo={`/agency/projects?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />

      <header className="ops-page-header ops-collection-header">
        <div>
          <p className="ops-page-kicker">Portfolio</p>
          <h1>Projects</h1>
          <p>Every active client engagement, organized for delivery.</p>
        </div>
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
          <span className="ops-section-meta">0 projects</span>
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
            <span>Health</span>
          </div>
          <div className="ops-data-table-empty">
            <div className="ops-empty-symbol" aria-hidden="true">
              +
            </div>
            <div>
              <strong>No projects yet</strong>
              <span>
                New delivery work will appear here as soon as the first project
                is created.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
