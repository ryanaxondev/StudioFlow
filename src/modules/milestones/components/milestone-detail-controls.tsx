"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { projectActionStatusMessage } from "../../projects/action-status";
import type {
  AgencyMilestoneListItem,
  AgencyMilestonePermissions,
} from "../queries";
import {
  activateMilestoneAction,
  cancelMilestoneAction,
  completeMilestoneAction,
  completeMilestoneWithOverrideAction,
  publishMilestoneAction,
  updateMilestoneDraftAction,
} from "../actions";

export function MilestoneDetailControls({
  projectId,
  projectRowVersion,
  projectLifecycle,
  milestone,
  permissions,
}: Readonly<{
  projectId: string;
  projectRowVersion: number;
  projectLifecycle: string;
  milestone: AgencyMilestoneListItem;
  permissions: AgencyMilestonePermissions;
}>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [localProjectRowVersion, setLocalProjectRowVersion] =
    useState(projectRowVersion);
  const [localMilestoneRowVersion, setLocalMilestoneRowVersion] = useState(
    milestone.rowVersion,
  );
  const effectiveProjectRowVersion = Math.max(
    localProjectRowVersion,
    projectRowVersion,
  );
  const effectiveMilestoneRowVersion = Math.max(
    localMilestoneRowVersion,
    milestone.rowVersion,
  );

  function acknowledgeVersions(result: {
    projectRowVersion?: number;
    milestoneRowVersion?: number;
  }) {
    if (result.projectRowVersion) {
      setLocalProjectRowVersion(result.projectRowVersion);
    }
    if (result.milestoneRowVersion) {
      setLocalMilestoneRowVersion(result.milestoneRowVersion);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");
    const result = await updateMilestoneDraftAction({
      projectId,
      milestoneId: milestone.milestoneId,
      title: String(form.get("title") ?? ""),
      purpose: String(form.get("purpose") ?? ""),
      clientDescription: String(form.get("clientDescription") ?? ""),
      plannedStartDate: String(form.get("plannedStartDate") ?? "") || null,
      plannedEndDate: String(form.get("plannedEndDate") ?? "") || null,
      expectedProjectRowVersion: effectiveProjectRowVersion,
      expectedMilestoneRowVersion: effectiveMilestoneRowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      acknowledgeVersions(result);
      setStatus("Milestone Draft saved");
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Save failed"));
    }
    setPending(false);
  }

  async function run(action: typeof publishMilestoneAction, success: string) {
    setPending(true);
    setStatus("");
    const result = await action({
      projectId,
      milestoneId: milestone.milestoneId,
      expectedProjectRowVersion: effectiveProjectRowVersion,
      expectedMilestoneRowVersion: effectiveMilestoneRowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      acknowledgeVersions(result);
      setStatus(success);
      setConfirmingCancel(false);
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Action failed"));
    }
    setPending(false);
  }

  async function override(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");
    const result = await completeMilestoneWithOverrideAction({
      projectId,
      milestoneId: milestone.milestoneId,
      reason: String(form.get("reason") ?? ""),
      expectedProjectRowVersion: effectiveProjectRowVersion,
      expectedMilestoneRowVersion: effectiveMilestoneRowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      acknowledgeVersions(result);
      setOverrideOpen(false);
      setStatus("Milestone completed with override");
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Override failed"));
    }
    setPending(false);
  }

  const editableDraft =
    permissions.canEditDraft &&
    milestone.state === "PLANNED" &&
    !milestone.publishedAt;

  return (
    <div className="ops-milestone-detail-controls">
      {editableDraft ? (
        <form className="ops-project-form" onSubmit={save}>
          <div className="ops-project-form-grid">
            <label className="ops-project-field ops-project-field-wide">
              <span>Milestone title</span>
              <input
                name="title"
                defaultValue={milestone.title}
                maxLength={240}
                required
                disabled={pending}
              />
            </label>
            <label className="ops-project-field ops-project-field-wide">
              <span>Purpose</span>
              <textarea
                name="purpose"
                defaultValue={milestone.purpose ?? ""}
                rows={4}
                maxLength={5000}
                disabled={pending}
              />
            </label>
            <label className="ops-project-field ops-project-field-wide">
              <span>Client-facing description</span>
              <textarea
                name="clientDescription"
                defaultValue={milestone.clientDescription ?? ""}
                rows={4}
                maxLength={5000}
                disabled={pending}
              />
            </label>
            <label className="ops-project-field">
              <span>Planned start</span>
              <input
                type="date"
                name="plannedStartDate"
                defaultValue={milestone.plannedStartDate ?? ""}
                disabled={pending}
              />
            </label>
            <label className="ops-project-field">
              <span>Planned end</span>
              <input
                type="date"
                name="plannedEndDate"
                defaultValue={milestone.plannedEndDate ?? ""}
                disabled={pending}
              />
            </label>
          </div>
          <div className="ops-project-form-actions">
            <button
              className="ops-primary-action"
              type="submit"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save Milestone Draft"}
            </button>
            {projectLifecycle !== "DRAFT" && permissions.canPublishMilestone ? (
              <button
                className="ops-secondary-action"
                type="button"
                disabled={pending}
                onClick={() =>
                  void run(publishMilestoneAction, "Milestone published")
                }
              >
                Publish Milestone
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {permissions.canManageLifecycle && milestone.publishedAt ? (
        <section
          className="ops-milestone-lifecycle-actions"
          aria-label="Milestone lifecycle actions"
        >
          {milestone.state === "PLANNED" ? (
            <button
              className="ops-primary-action"
              type="button"
              disabled={pending}
              onClick={() =>
                void run(activateMilestoneAction, "Milestone activated")
              }
            >
              Activate Milestone
            </button>
          ) : null}

          {milestone.state === "ACTIVE" ? (
            <>
              <button
                className="ops-primary-action"
                type="button"
                disabled={pending}
                onClick={() =>
                  void run(completeMilestoneAction, "Milestone completed")
                }
              >
                Complete Milestone
              </button>
              <button
                className="ops-secondary-action"
                type="button"
                disabled={pending}
                onClick={() => setOverrideOpen((value) => !value)}
              >
                Complete with override
              </button>
            </>
          ) : null}

          {(milestone.state === "PLANNED" || milestone.state === "ACTIVE") &&
          !confirmingCancel ? (
            <button
              className="ops-danger-quiet-action"
              type="button"
              disabled={pending}
              onClick={() => setConfirmingCancel(true)}
            >
              Cancel Milestone
            </button>
          ) : null}

          {confirmingCancel ? (
            <div className="ops-milestone-cancel-confirmation">
              <strong>Cancel this Milestone?</strong>
              <span>
                The cancellation becomes part of the client-visible delivery
                history.
              </span>
              <div>
                <button
                  className="ops-danger-quiet-action"
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    void run(cancelMilestoneAction, "Milestone cancelled")
                  }
                >
                  Confirm cancellation
                </button>
                <button
                  className="ops-project-cancel-action"
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmingCancel(false)}
                >
                  Keep Milestone
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {overrideOpen && milestone.state === "ACTIVE" ? (
        <form className="ops-milestone-override-form" onSubmit={override}>
          <label className="ops-project-field">
            <span>Override reason</span>
            <textarea
              name="reason"
              rows={3}
              required
              maxLength={5000}
              disabled={pending}
            />
            <small>
              This reason is agency-only and is recorded in Activity.
            </small>
          </label>
          <div className="ops-project-form-actions">
            <button
              className="ops-secondary-action"
              type="submit"
              disabled={pending}
            >
              Confirm override completion
            </button>
            <button
              className="ops-project-cancel-action"
              type="button"
              disabled={pending}
              onClick={() => setOverrideOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!editableDraft && !permissions.canManageLifecycle ? (
        <div className="ops-project-callout">
          <strong>View-only Milestone</strong>
          <span>
            Your Project assignment allows delivery context without lifecycle
            controls.
          </span>
        </div>
      ) : null}

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
