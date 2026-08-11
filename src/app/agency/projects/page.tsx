import { headers } from "next/headers";
import Link from "next/link";
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

export default async function AgencyProjectsAuthorizationPlaceholder({
  searchParams,
}: PageProps) {
  const parameters = await searchParams;
  const requestedWorkspaceId = firstValue(parameters.workspaceId);
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    redirect(`/access?returnTo=${encodeURIComponent("/agency/projects")}`);
  }

  const result = await resolveAuthorizedAgencyWorkspaceSelection(
    database,
    actor,
    { requestedWorkspaceId, policy: canViewAgencyWorkspace },
  );
  if (result.status === "not-found") notFound();
  if (result.status === "denied") {
    logAuthorizationDenied(result.result, "agency.projects");
    redirect("/access-denied");
  }

  const { selected } = result.selection;
  return (
    <main className="management-shell">
      <SessionRefresh
        returnTo={`/agency/projects?workspaceId=${encodeURIComponent(selected.workspaceId)}`}
      />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Assigned Projects</h1>
          <p>{selected.workspaceName}</p>
        </div>
        <nav aria-label="Workspace utilities">
          <Link href="/account">Account</Link>
        </nav>
      </header>
      <section className="management-panel" aria-labelledby="projects-state">
        <h2 id="projects-state">Project access foundation ready</h2>
        <p className="management-muted">
          Project records and assignments begin in M09. This route exists only
          to preserve the approved Agency Member landing boundary.
        </p>
      </section>
    </main>
  );
}
