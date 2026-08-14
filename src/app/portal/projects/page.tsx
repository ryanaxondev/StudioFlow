import { FolderOpenIcon } from "@phosphor-icons/react/ssr";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentActorContext } from "../../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../../modules/auth/components/session-refresh";
import {
  listClientProjects,
  type ClientProjectLifecycle,
  type ClientProjectListItem,
} from "../../../modules/projects/queries";
import { getApplicationDatabase } from "../../../server/database";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function lifecycleLabel(value: ClientProjectLifecycle): string {
  if (value === "PAST") return "Past";
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

function isPast(project: ClientProjectListItem): boolean {
  return (
    project.lifecycle === "COMPLETED" ||
    project.lifecycle === "CANCELLED" ||
    project.lifecycle === "PAST"
  );
}

function ProjectRows({
  projects,
}: Readonly<{ projects: readonly ClientProjectListItem[] }>) {
  if (projects.length === 0) {
    return (
      <div className="client-project-empty client-project-empty-large">
        <span className="client-empty-icon" aria-hidden="true">
          <FolderOpenIcon weight="regular" />
        </span>
        <div>
          <strong>No projects in this view</strong>
          <span>
            Published work assigned to your account will appear here with only
            client-safe delivery context.
          </span>
        </div>
      </div>
    );
  }

  return projects.map((project) => {
    const progress = project.publishedMilestoneCount
      ? `${project.completedMilestoneCount} of ${project.publishedMilestoneCount} complete`
      : "Milestone plan not available";

    return (
      <Link
        className="client-project-row client-project-row-link"
        href={`/portal/projects/${project.projectId}`}
        key={project.projectId}
      >
        <span className="client-project-cell client-project-identity-cell">
          <strong>{project.title}</strong>
          <small>
            {project.agencyName} · {project.clientOrganizationName}
          </small>
        </span>
        <span className="client-project-cell">
          <strong>{lifecycleLabel(project.lifecycle)}</strong>
          <small>{progress}</small>
        </span>
        <span className="client-project-cell">
          <strong>
            {project.currentMilestoneTitle ?? "No active milestone"}
          </strong>
          <small>
            {project.currentMilestoneState === "ACTIVE"
              ? "Current delivery phase"
              : "No action needed"}
          </small>
        </span>
        <span className="client-project-cell">
          <strong>{formatDate(project.targetCompletionDate)}</strong>
          <small>Target completion</small>
        </span>
      </Link>
    );
  });
}

export default async function ClientProjectsPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) {
    redirect(`/access?returnTo=${encodeURIComponent("/portal/projects")}`);
  }

  const projects = await listClientProjects(database, actor);
  const openProjects = projects.filter((project) => !isPast(project));
  const pastProjects = projects.filter(isPast);
  const requestedView = firstValue(parameters.view);
  const selectedView =
    requestedView === "past" ||
    (openProjects.length === 0 && pastProjects.length)
      ? "past"
      : "open";
  const selectedProjects =
    selectedView === "past" ? pastProjects : openProjects;

  return (
    <main className="client-page client-projects-page">
      <SessionRefresh returnTo="/portal/projects" />

      <header className="client-page-header">
        <p className="client-page-kicker">Shared work</p>
        <h1>Projects</h1>
        <p>
          Follow published delivery work, the current Milestone, and the target
          that matters without internal agency administration.
        </p>
      </header>

      <nav className="client-collection-switcher" aria-label="Project groups">
        <Link
          aria-current={selectedView === "open" ? "page" : undefined}
          href="/portal/projects?view=open"
        >
          Open <span>{openProjects.length}</span>
        </Link>
        <Link
          aria-current={selectedView === "past" ? "page" : undefined}
          href="/portal/projects?view=past"
        >
          Past <span>{pastProjects.length}</span>
        </Link>
      </nav>

      <section
        className="client-project-collection"
        aria-labelledby="client-projects-heading"
      >
        <div className="client-section-heading">
          <div>
            <p className="client-section-label">Collection</p>
            <h2 id="client-projects-heading">
              {selectedView === "open" ? "Open projects" : "Past projects"}
            </h2>
          </div>
          <span>{selectedProjects.length} visible</span>
        </div>

        <div className="client-project-table">
          <div
            className="client-project-row client-project-row-header"
            aria-hidden="true"
          >
            <span>Project</span>
            <span>Stage</span>
            <span>Current Milestone</span>
            <span>Target</span>
          </div>
          <ProjectRows projects={selectedProjects} />
        </div>
      </section>
    </main>
  );
}
