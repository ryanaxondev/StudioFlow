"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { projectActionStatusMessage } from "../action-status";
import { deleteDraftProjectAction } from "../actions";
import type { AgencyProjectDetail } from "../queries";

export function ProjectLifecyclePanel({
  detail,
  workspaceId,
}: Readonly<{
  detail: AgencyProjectDetail;
  workspaceId: string;
}>) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function removeDraft() {
    setPending(true);
    setStatus("");
    const result = await deleteDraftProjectAction({
      projectId: detail.projectId,
      expectedRowVersion: detail.rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });

    if (result.ok) {
      router.push(
        `/agency/projects?workspaceId=${encodeURIComponent(workspaceId)}`,
      );
      return;
    }

    setStatus(
      projectActionStatusMessage(result.status, "Draft deletion failed"),
    );
    setConfirming(false);
    setPending(false);
  }

  return (
    <div className="ops-project-settings-stack">
      <section className="ops-project-lifecycle-card">
        <div>
          <p className="ops-section-label">Current lifecycle</p>
          <h3>{detail.lifecycle === "DRAFT" ? "Draft" : detail.lifecycle}</h3>
          <p>
            Draft Projects remain agency-only. Complete Project setup before
            client-facing lifecycle transitions can begin.
          </p>
        </div>
        <span className="ops-status-chip" data-tone="neutral">
          {detail.lifecycle === "DRAFT" ? "Agency only" : "Read only"}
        </span>
      </section>

      <section className="ops-project-danger-zone">
        <div>
          <p className="ops-section-label">Destructive action</p>
          <h3>Delete Draft</h3>
          <p>
            Deletion is refused after client-visible or client-authored activity
            exists. This removes the eligible Draft and its scoped Project
            history.
          </p>
        </div>
        {confirming ? (
          <div className="ops-project-danger-confirmation">
            <span>Delete “{detail.title}” permanently?</span>
            <div>
              <button
                className="ops-danger-quiet-action"
                type="button"
                disabled={pending}
                onClick={() => void removeDraft()}
              >
                {pending ? "Deleting…" : "Confirm delete"}
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
            className="ops-danger-quiet-action"
            type="button"
            disabled={pending || detail.lifecycle !== "DRAFT"}
            onClick={() => setConfirming(true)}
          >
            Delete Draft
          </button>
        )}
      </section>

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
