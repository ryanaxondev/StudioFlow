import { FolderOpenIcon } from "@phosphor-icons/react/ssr";

export default function ClientProjectsPage() {
  return (
    <main className="client-page client-projects-page">
      <header className="client-page-header">
        <p className="client-page-kicker">Shared work</p>
        <h1>Projects</h1>
        <p>
          A client-safe view of delivery work, current stage, and the next
          visible handoff.
        </p>
      </header>

      <section
        className="client-project-collection"
        aria-labelledby="client-projects-heading"
      >
        <div className="client-section-heading">
          <div>
            <p className="client-section-label">Collection</p>
            <h2 id="client-projects-heading">All projects</h2>
          </div>
        </div>

        <div className="client-project-table">
          <div
            className="client-project-row client-project-row-header"
            aria-hidden="true"
          >
            <span>Project</span>
            <span>Stage</span>
            <span>Next step</span>
            <span>Updated</span>
          </div>
          <div className="client-project-empty client-project-empty-large">
            <span className="client-empty-icon" aria-hidden="true">
              <FolderOpenIcon weight="regular" />
            </span>
            <div>
              <strong>No projects are shared yet</strong>
              <span>
                When project work becomes available to this client organization,
                it will appear here with only client-safe delivery context.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
