const workflowSteps = [
  { label: "Internal review", meta: "Approved", tone: "success" },
  { label: "Client approval", meta: "In review", tone: "active" },
  { label: "Ready for delivery", meta: "Next", tone: "muted" },
] as const;

export function WorkflowMotif() {
  return (
    <div
      className="workflow-motif"
      aria-label="StudioFlow delivery workflow preview"
    >
      <div className="workflow-motif-head">
        <div>
          <span>PROJECT FLOW</span>
          <strong>Website relaunch</strong>
        </div>
        <span className="workflow-motif-count">3 stages</span>
      </div>
      <ol className="workflow-motif-list">
        {workflowSteps.map((step) => (
          <li key={step.label} data-tone={step.tone}>
            <span className="workflow-node" aria-hidden="true" />
            <div>
              <strong>{step.label}</strong>
              <span>{step.meta}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="workflow-motif-foot">
        <span>Clear owner</span>
        <span>Visible handoff</span>
        <span>Client-safe</span>
      </div>
    </div>
  );
}
