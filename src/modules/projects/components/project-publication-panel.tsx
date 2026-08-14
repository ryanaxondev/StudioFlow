"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { publishProjectAction } from "../../milestones/actions";
import { projectActionStatusMessage } from "../action-status";

export type ProjectPublicationCheck = Readonly<{
  label: string;
  complete: boolean;
}>;

export function ProjectPublicationPanel({
  projectId,
  workspaceId,
  rowVersion,
  checks,
}: Readonly<{
  projectId: string;
  workspaceId: string;
  rowVersion: number;
  checks: readonly ProjectPublicationCheck[];
}>) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const ready = checks.every((check) => check.complete);

  async function publish() {
    setPending(true);
    setStatus("");
    const result = await publishProjectAction({
      projectId,
      expectedProjectRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      router.push(
        `/agency/projects/${projectId}?workspaceId=${encodeURIComponent(workspaceId)}`,
      );
      router.refresh();
      return;
    }
    setStatus(projectActionStatusMessage(result.status, "Publication failed"));
    setPending(false);
    setConfirming(false);
  }

  return (
    <section className="ops-project-settings-card ops-publication-card">
      <div className="ops-section-heading">
        <div>
          <p className="ops-section-label">Publication</p>
          <h2>Client handoff into Onboarding</h2>
        </div>
        <span className="ops-section-meta">
          {checks.filter((check) => check.complete).length} of {checks.length}{" "}
          ready
        </span>
      </div>

      <div className="ops-project-checklist ops-publication-checklist">
        {checks.map((check) => (
          <div data-complete={check.complete} key={check.label}>
            <span aria-hidden="true">{check.complete ? "✓" : "·"}</span>
            <strong>{check.label}</strong>
          </div>
        ))}
      </div>

      <div className="ops-publication-summary">
        <p>
          Publication makes the Project client-visible, publishes the current
          Milestone plan, and activates the first Milestone in one transaction.
        </p>
        {!ready ? (
          <span>Complete every requirement above before publication.</span>
        ) : null}
      </div>

      {confirming ? (
        <div className="ops-publication-confirmation">
          <strong>Publish this Project into Onboarding?</strong>
          <span>
            Client access begins immediately and the first Milestone becomes
            Active.
          </span>
          <div>
            <button
              className="ops-primary-action"
              type="button"
              disabled={pending}
              onClick={() => void publish()}
            >
              {pending ? "Publishing…" : "Confirm publication"}
            </button>
            <button
              className="ops-project-cancel-action"
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="ops-primary-action ops-publication-action"
          type="button"
          disabled={!ready || pending}
          onClick={() => setConfirming(true)}
        >
          Publish Project
        </button>
      )}

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
