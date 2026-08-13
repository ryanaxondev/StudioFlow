"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { projectActionStatusMessage } from "../action-status";
import {
  reassignClientApproverAction,
  reassignDeliveryManagerAction,
  updateDraftProjectIdentityAction,
} from "../actions";
import type {
  AgencyProjectDetail,
  ProjectSettingsCandidates,
} from "../queries";

export function ProjectGeneralSettings({
  detail,
  candidates,
}: Readonly<{
  detail: AgencyProjectDetail;
  candidates: ProjectSettingsCandidates;
}>) {
  const router = useRouter();
  const [rowVersion, setRowVersion] = useState(detail.rowVersion);
  const [deliveryManagerSelection, setDeliveryManagerSelection] = useState(
    detail.deliveryManagerUserId,
  );
  const [clientApproverSelection, setClientApproverSelection] = useState(
    detail.clientApproverUserId ?? "",
  );
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function saveIdentity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");

    const result = await updateDraftProjectIdentityAction({
      projectId: detail.projectId,
      title: String(form.get("title") ?? ""),
      clientSummary: String(form.get("clientSummary") ?? ""),
      plannedStartDate: String(form.get("plannedStartDate") ?? "") || null,
      targetCompletionDate:
        String(form.get("targetCompletionDate") ?? "") || null,
      expectedRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });

    if (result.ok && result.rowVersion) {
      setRowVersion(result.rowVersion);
      setStatus("Project details saved");
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Save failed"));
    }
    setPending(false);
  }

  async function confirmDeliveryManager() {
    if (deliveryManagerSelection === detail.deliveryManagerUserId) return;
    setPending(true);
    setStatus("");
    const result = await reassignDeliveryManagerAction({
      projectId: detail.projectId,
      deliveryManagerUserId: deliveryManagerSelection,
      expectedRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok && result.rowVersion) {
      setRowVersion(result.rowVersion);
      setStatus("Delivery manager updated");
      router.refresh();
    } else {
      setDeliveryManagerSelection(detail.deliveryManagerUserId);
      setStatus(
        projectActionStatusMessage(result.status, "Manager update failed"),
      );
    }
    setPending(false);
  }

  async function confirmClientApprover() {
    if (
      !clientApproverSelection ||
      clientApproverSelection === (detail.clientApproverUserId ?? "")
    ) {
      return;
    }
    setPending(true);
    setStatus("");
    const result = await reassignClientApproverAction({
      projectId: detail.projectId,
      clientApproverUserId: clientApproverSelection,
      expectedRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok && result.rowVersion) {
      setRowVersion(result.rowVersion);
      setStatus("Client approver updated");
      router.refresh();
    } else {
      setClientApproverSelection(detail.clientApproverUserId ?? "");
      setStatus(
        projectActionStatusMessage(result.status, "Approver update failed"),
      );
    }
    setPending(false);
  }

  const deliveryManagers = candidates.agency.filter(
    (candidate) =>
      candidate.workspaceRole === "AGENCY_OWNER" ||
      candidate.workspaceRole === "DELIVERY_MANAGER",
  );
  const editable = detail.lifecycle === "DRAFT";
  const deliveryManagerChanged =
    deliveryManagerSelection !== detail.deliveryManagerUserId;
  const clientApproverChanged =
    Boolean(clientApproverSelection) &&
    clientApproverSelection !== (detail.clientApproverUserId ?? "");

  return (
    <div className="ops-project-settings-stack">
      <form className="ops-project-form" onSubmit={saveIdentity}>
        <div className="ops-project-form-grid">
          <label className="ops-project-field ops-project-field-wide">
            <span>Project title</span>
            <input
              name="title"
              defaultValue={detail.title}
              maxLength={240}
              required
              disabled={pending || !editable}
            />
          </label>

          <label className="ops-project-field ops-project-field-wide">
            <span>Client-facing summary</span>
            <textarea
              name="clientSummary"
              defaultValue={detail.clientSummary ?? ""}
              rows={5}
              maxLength={5000}
              disabled={pending || !editable}
            />
          </label>

          <label className="ops-project-field">
            <span>Planned start</span>
            <input
              type="date"
              name="plannedStartDate"
              defaultValue={detail.plannedStartDate ?? ""}
              disabled={pending || !editable}
            />
          </label>

          <label className="ops-project-field">
            <span>Target completion</span>
            <input
              type="date"
              name="targetCompletionDate"
              defaultValue={detail.targetCompletionDate ?? ""}
              disabled={pending || !editable}
            />
          </label>
        </div>

        <div className="ops-project-form-actions">
          <button
            className="ops-primary-action"
            type="submit"
            disabled={pending || !editable}
          >
            {pending ? "Saving…" : "Save project details"}
          </button>
        </div>
      </form>

      <section
        className="ops-project-authority-grid"
        aria-label="Project authority"
      >
        <div className="ops-project-field">
          <label htmlFor={`delivery-manager-${detail.projectId}`}>
            Delivery manager
          </label>
          <select
            id={`delivery-manager-${detail.projectId}`}
            value={deliveryManagerSelection}
            disabled={pending || !editable}
            onChange={(event) =>
              setDeliveryManagerSelection(event.target.value)
            }
          >
            {deliveryManagers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
          <small>Required agency authority</small>
          {deliveryManagerChanged ? (
            <div className="ops-project-field-confirmation">
              <button
                className="ops-quiet-action"
                type="button"
                disabled={pending}
                onClick={() => void confirmDeliveryManager()}
              >
                Confirm manager
              </button>
              <button
                className="ops-project-cancel-action"
                type="button"
                disabled={pending}
                onClick={() =>
                  setDeliveryManagerSelection(detail.deliveryManagerUserId)
                }
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        <div className="ops-project-field">
          <label htmlFor={`client-approver-${detail.projectId}`}>
            Client approver
          </label>
          <select
            id={`client-approver-${detail.projectId}`}
            value={clientApproverSelection}
            disabled={pending || !editable}
            onChange={(event) => setClientApproverSelection(event.target.value)}
          >
            <option value="" disabled>
              Select client approver
            </option>
            {candidates.client.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
          <small>Required before client publication</small>
          {clientApproverChanged ? (
            <div className="ops-project-field-confirmation">
              <button
                className="ops-quiet-action"
                type="button"
                disabled={pending}
                onClick={() => void confirmClientApprover()}
              >
                Confirm approver
              </button>
              <button
                className="ops-project-cancel-action"
                type="button"
                disabled={pending}
                onClick={() =>
                  setClientApproverSelection(detail.clientApproverUserId ?? "")
                }
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {!editable ? (
        <div className="ops-project-callout">
          <strong>Read-only lifecycle</strong>
          <span>Draft identity changes are no longer available here.</span>
        </div>
      ) : null}

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
