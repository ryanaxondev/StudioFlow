"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { projectActionStatusMessage } from "../../projects/action-status";
import type {
  AgencyMilestoneListItem,
  AgencyMilestonePermissions,
} from "../queries";
import {
  createMilestoneDraftAction,
  publishMilestoneAction,
  reorderMilestonesAction,
} from "../actions";

function milestoneStateLabel(milestone: AgencyMilestoneListItem): string {
  if (!milestone.publishedAt) return "Draft";
  return milestone.state
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function milestoneTone(milestone: AgencyMilestoneListItem): string {
  if (!milestone.publishedAt) return "neutral";
  if (milestone.state === "ACTIVE") return "active";
  if (milestone.state === "COMPLETED") return "success";
  if (milestone.state === "CANCELLED") return "danger";
  return "waiting";
}

export function MilestonePlanEditor({
  projectId,
  workspaceId,
  projectRowVersion,
  projectLifecycle,
  milestones,
  permissions,
}: Readonly<{
  projectId: string;
  workspaceId: string;
  projectRowVersion: number;
  projectLifecycle: string;
  milestones: readonly AgencyMilestoneListItem[];
  permissions: AgencyMilestonePermissions;
}>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [localProjectRowVersion, setLocalProjectRowVersion] =
    useState(projectRowVersion);
  const effectiveProjectRowVersion = Math.max(
    localProjectRowVersion,
    projectRowVersion,
  );
  const plannedMilestones = useMemo(
    () => milestones.filter((milestone) => milestone.state === "PLANNED"),
    [milestones],
  );
  const plannedIds = useMemo(
    () => plannedMilestones.map((milestone) => milestone.milestoneId),
    [plannedMilestones],
  );

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");
    const result = await createMilestoneDraftAction({
      projectId,
      title: String(form.get("title") ?? ""),
      purpose: String(form.get("purpose") ?? ""),
      clientDescription: String(form.get("clientDescription") ?? ""),
      plannedStartDate: String(form.get("plannedStartDate") ?? "") || null,
      plannedEndDate: String(form.get("plannedEndDate") ?? "") || null,
      expectedProjectRowVersion: effectiveProjectRowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      if (result.projectRowVersion) {
        setLocalProjectRowVersion(result.projectRowVersion);
      }
      setCreating(false);
      setStatus("Milestone Draft created");
      router.refresh();
    } else {
      setStatus(
        projectActionStatusMessage(result.status, "Milestone creation failed"),
      );
    }
    setPending(false);
  }

  async function move(milestoneId: string, direction: -1 | 1) {
    const index = plannedIds.indexOf(milestoneId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= plannedIds.length) return;
    const currentMilestone = plannedMilestones[index];
    const targetMilestone = plannedMilestones[target];
    const managerCanAffectPublishedPlan = permissions.canEditProjectSettings;
    const contributorSafeSwap =
      currentMilestone?.publishedAt == null &&
      targetMilestone?.publishedAt == null;
    if (!managerCanAffectPublishedPlan && !contributorSafeSwap) return;

    const orderedMilestoneIds = [...plannedIds];
    [orderedMilestoneIds[index], orderedMilestoneIds[target]] = [
      orderedMilestoneIds[target]!,
      orderedMilestoneIds[index]!,
    ];
    setPending(true);
    setStatus("");
    const result = await reorderMilestonesAction({
      projectId,
      orderedMilestoneIds,
      expectedProjectRowVersion: effectiveProjectRowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      if (result.projectRowVersion) {
        setLocalProjectRowVersion(result.projectRowVersion);
      }
      setStatus("Milestone order updated");
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Reorder failed"));
    }
    setPending(false);
  }

  async function publish(milestone: AgencyMilestoneListItem) {
    setPending(true);
    setStatus("");
    const result = await publishMilestoneAction({
      projectId,
      milestoneId: milestone.milestoneId,
      expectedProjectRowVersion: effectiveProjectRowVersion,
      expectedMilestoneRowVersion: milestone.rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      if (result.projectRowVersion) {
        setLocalProjectRowVersion(result.projectRowVersion);
      }
      setStatus("Milestone published to the client plan");
      router.refresh();
    } else {
      setStatus(
        projectActionStatusMessage(result.status, "Publication failed"),
      );
    }
    setPending(false);
  }

  return (
    <div className="ops-milestone-plan-stack">
      <div
        className="ops-milestone-sequence"
        role="list"
        aria-label="Milestones"
      >
        {milestones.length === 0 ? (
          <div className="ops-milestone-empty">
            <strong>No Milestones yet</strong>
            <span>
              Create the first Milestone to establish the delivery sequence.
            </span>
          </div>
        ) : (
          milestones.map((milestone, index) => {
            const plannedIndex = plannedIds.indexOf(milestone.milestoneId);
            const previousPlanned =
              plannedIndex > 0 ? plannedMilestones[plannedIndex - 1] : null;
            const nextPlanned =
              plannedIndex >= 0 && plannedIndex < plannedMilestones.length - 1
                ? plannedMilestones[plannedIndex + 1]
                : null;
            const canMoveWith = (other: AgencyMilestoneListItem | null) =>
              Boolean(
                permissions.canEditDraft &&
                milestone.state === "PLANNED" &&
                other &&
                (permissions.canEditProjectSettings ||
                  (!milestone.publishedAt && !other.publishedAt)),
              );

            return (
              <article
                className="ops-milestone-row"
                data-active={milestone.state === "ACTIVE"}
                key={milestone.milestoneId}
                role="listitem"
              >
                <div
                  className="ops-milestone-position"
                  aria-label={`Position ${index + 1}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="ops-milestone-row-main">
                  <div className="ops-milestone-row-heading">
                    <Link
                      href={`/agency/projects/${projectId}/delivery/milestones/${milestone.milestoneId}?workspaceId=${encodeURIComponent(workspaceId)}`}
                    >
                      {milestone.title}
                    </Link>
                    <span
                      className="ops-status-chip"
                      data-tone={milestoneTone(milestone)}
                    >
                      {milestoneStateLabel(milestone)}
                    </span>
                  </div>
                  <p>
                    {milestone.purpose ??
                      milestone.clientDescription ??
                      "Purpose not set"}
                  </p>
                  <div className="ops-milestone-meta">
                    <span>{milestone.plannedStartDate ?? "Start TBD"}</span>
                    <span>→</span>
                    <span>{milestone.plannedEndDate ?? "End TBD"}</span>
                    <span>
                      {milestone.publishedAt ? "Client-visible" : "Agency-only"}
                    </span>
                  </div>
                </div>
                <div className="ops-milestone-row-actions">
                  {permissions.canEditDraft && milestone.state === "PLANNED" ? (
                    <div
                      className="ops-milestone-order-actions"
                      aria-label={`Reorder ${milestone.title}`}
                    >
                      <button
                        type="button"
                        disabled={pending || !canMoveWith(previousPlanned)}
                        onClick={() => void move(milestone.milestoneId, -1)}
                        aria-label={`Move ${milestone.title} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={pending || !canMoveWith(nextPlanned)}
                        onClick={() => void move(milestone.milestoneId, 1)}
                        aria-label={`Move ${milestone.title} down`}
                      >
                        ↓
                      </button>
                    </div>
                  ) : null}
                  {projectLifecycle !== "DRAFT" &&
                  !milestone.publishedAt &&
                  permissions.canPublishMilestone ? (
                    <button
                      className="ops-quiet-action"
                      type="button"
                      disabled={pending}
                      onClick={() => void publish(milestone)}
                    >
                      Publish
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>

      {permissions.canEditDraft ? (
        creating ? (
          <form className="ops-milestone-create-form" onSubmit={create}>
            <div className="ops-project-form-grid">
              <label className="ops-project-field ops-project-field-wide">
                <span>Milestone title</span>
                <input
                  name="title"
                  required
                  maxLength={240}
                  disabled={pending}
                />
              </label>
              <label className="ops-project-field ops-project-field-wide">
                <span>Purpose</span>
                <textarea
                  name="purpose"
                  rows={3}
                  maxLength={5000}
                  disabled={pending}
                />
              </label>
              <label className="ops-project-field ops-project-field-wide">
                <span>Client-facing description</span>
                <textarea
                  name="clientDescription"
                  rows={3}
                  maxLength={5000}
                  disabled={pending}
                />
              </label>
              <label className="ops-project-field">
                <span>Planned start</span>
                <input type="date" name="plannedStartDate" disabled={pending} />
              </label>
              <label className="ops-project-field">
                <span>Planned end</span>
                <input type="date" name="plannedEndDate" disabled={pending} />
              </label>
            </div>
            <div className="ops-project-form-actions">
              <button
                className="ops-primary-action"
                type="submit"
                disabled={pending}
              >
                {pending ? "Creating…" : "Create Milestone Draft"}
              </button>
              <button
                className="ops-project-cancel-action"
                type="button"
                disabled={pending}
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="ops-secondary-action ops-milestone-create-trigger"
            type="button"
            disabled={pending}
            onClick={() => setCreating(true)}
          >
            Create Milestone Draft
          </button>
        )
      ) : null}

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
