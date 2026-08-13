"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { projectActionStatusMessage } from "../action-status";
import {
  assignProjectMemberAction,
  removeProjectMemberAction,
} from "../actions";
import type {
  AgencyProjectDetail,
  ProjectSettingsCandidates,
} from "../queries";

export function ProjectPeopleManagement({
  detail,
  candidates,
}: Readonly<{
  detail: AgencyProjectDetail;
  candidates: ProjectSettingsCandidates;
}>) {
  const router = useRouter();
  const [rowVersion, setRowVersion] = useState(detail.rowVersion);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  const activeIds = useMemo(
    () => new Set(detail.members.map((member) => member.userId)),
    [detail.members],
  );
  const availableAgency = candidates.agency.filter(
    (member) =>
      member.workspaceRole !== "AGENCY_OWNER" &&
      member.userId !== detail.deliveryManagerUserId &&
      !activeIds.has(member.userId),
  );
  const availableClient = candidates.client.filter(
    (member) =>
      member.userId !== detail.clientApproverUserId &&
      !activeIds.has(member.userId),
  );

  async function assign(
    event: React.FormEvent<HTMLFormElement>,
    projectRole: "AGENCY_MEMBER" | "CLIENT_CONTRIBUTOR",
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const userId = String(form.get("userId") ?? "");
    if (!userId) return;

    setPending(true);
    setStatus("");
    const result = await assignProjectMemberAction({
      projectId: detail.projectId,
      userId,
      projectRole,
      expectedRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok && result.rowVersion) {
      setRowVersion(result.rowVersion);
      setStatus("Project access updated");
      router.refresh();
    } else {
      setStatus(
        projectActionStatusMessage(
          result.status,
          "Project access update failed",
        ),
      );
    }
    setPending(false);
  }

  async function remove(userId: string) {
    setPending(true);
    setStatus("");
    const result = await removeProjectMemberAction({
      projectId: detail.projectId,
      userId,
      expectedRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok && result.rowVersion) {
      setRowVersion(result.rowVersion);
      setStatus("Project access removed");
      router.refresh();
    } else {
      setStatus(
        projectActionStatusMessage(
          result.status,
          "Project access removal failed",
        ),
      );
    }
    setPending(false);
  }

  const agencyMembers = detail.members.filter(
    (member) => member.side === "AGENCY",
  );
  const clientMembers = detail.members.filter(
    (member) => member.side === "CLIENT",
  );

  return (
    <div className="ops-project-settings-stack">
      <section className="ops-project-people-section">
        <div className="ops-section-heading ops-collection-heading">
          <div>
            <p className="ops-section-label">Agency team</p>
            <h3>Project access</h3>
          </div>
          <span className="ops-section-meta">
            {agencyMembers.length} active
          </span>
        </div>

        <div className="ops-project-member-list">
          {agencyMembers.map((member) => {
            const required = member.userId === detail.deliveryManagerUserId;
            return (
              <article key={member.userId}>
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.projectRole === "DELIVERY_MANAGER"
                      ? "Delivery Manager"
                      : "Agency Member"}
                  </span>
                </div>
                {required ? (
                  <span className="ops-status-chip" data-tone="success">
                    Required
                  </span>
                ) : (
                  <button
                    className="ops-danger-quiet-action"
                    type="button"
                    disabled={pending || detail.lifecycle !== "DRAFT"}
                    onClick={() => void remove(member.userId)}
                  >
                    Remove
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <form
          className="ops-project-inline-form"
          onSubmit={(event) => void assign(event, "AGENCY_MEMBER")}
        >
          <select
            name="userId"
            defaultValue=""
            disabled={
              pending ||
              detail.lifecycle !== "DRAFT" ||
              availableAgency.length === 0
            }
          >
            <option value="" disabled>
              Add agency member
            </option>
            {availableAgency.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            className="ops-quiet-action"
            type="submit"
            disabled={
              pending ||
              detail.lifecycle !== "DRAFT" ||
              availableAgency.length === 0
            }
          >
            Add to project
          </button>
        </form>
      </section>

      <section className="ops-project-people-section">
        <div className="ops-section-heading ops-collection-heading">
          <div>
            <p className="ops-section-label">Client participants</p>
            <h3>Project access</h3>
          </div>
          <span className="ops-section-meta">
            {clientMembers.length} active
          </span>
        </div>

        <div className="ops-project-member-list">
          {clientMembers.map((member) => {
            const required = member.userId === detail.clientApproverUserId;
            return (
              <article key={member.userId}>
                <div>
                  <strong>{member.name}</strong>
                  <span>
                    {member.projectRole === "CLIENT_APPROVER"
                      ? "Client Approver"
                      : "Client Contributor"}
                  </span>
                </div>
                {required ? (
                  <span className="ops-status-chip" data-tone="waiting">
                    Approver
                  </span>
                ) : (
                  <button
                    className="ops-danger-quiet-action"
                    type="button"
                    disabled={pending || detail.lifecycle !== "DRAFT"}
                    onClick={() => void remove(member.userId)}
                  >
                    Remove
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <form
          className="ops-project-inline-form"
          onSubmit={(event) => void assign(event, "CLIENT_CONTRIBUTOR")}
        >
          <select
            name="userId"
            defaultValue=""
            disabled={
              pending ||
              detail.lifecycle !== "DRAFT" ||
              availableClient.length === 0
            }
          >
            <option value="" disabled>
              Add client contributor
            </option>
            {availableClient.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            className="ops-quiet-action"
            type="submit"
            disabled={
              pending ||
              detail.lifecycle !== "DRAFT" ||
              availableClient.length === 0
            }
          >
            Add to project
          </button>
        </form>
      </section>

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
