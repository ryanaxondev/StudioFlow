"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { projectActionStatusMessage } from "../action-status";
import { createDraftProjectAction } from "../actions";
import type { ProjectCreationCandidates } from "../queries";

export function ProjectCreateForm({
  workspaceId,
  candidates,
  initialClientOrganizationId,
}: Readonly<{
  workspaceId: string;
  candidates: ProjectCreationCandidates;
  initialClientOrganizationId?: string;
}>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");

    const result = await createDraftProjectAction({
      workspaceId,
      clientOrganizationId: String(form.get("clientOrganizationId") ?? ""),
      title: String(form.get("title") ?? ""),
      deliveryManagerUserId: String(form.get("deliveryManagerUserId") ?? ""),
      idempotencyKey: crypto.randomUUID(),
    });

    if (!result.ok || !result.projectId) {
      setStatus(
        projectActionStatusMessage(result.status, "Draft creation failed"),
      );
      setPending(false);
      return;
    }

    router.push(
      `/agency/projects/${result.projectId}/setup?workspaceId=${encodeURIComponent(workspaceId)}`,
    );
  }

  const unavailable =
    candidates.clients.length === 0 || candidates.deliveryManagers.length === 0;
  const selectedClientOrganizationId = candidates.clients.some(
    (client) => client.clientOrganizationId === initialClientOrganizationId,
  )
    ? initialClientOrganizationId
    : "";

  return (
    <form className="ops-project-form" onSubmit={submit}>
      <div className="ops-project-form-grid">
        <label className="ops-project-field ops-project-field-wide">
          <span>Project title</span>
          <input
            name="title"
            maxLength={240}
            placeholder="Website redesign"
            required
            disabled={pending}
          />
        </label>

        <label className="ops-project-field">
          <span>Client organization</span>
          <select
            name="clientOrganizationId"
            required
            disabled={pending || candidates.clients.length === 0}
            defaultValue={selectedClientOrganizationId}
          >
            <option value="" disabled>
              Select client
            </option>
            {candidates.clients.map((client) => (
              <option
                key={client.clientOrganizationId}
                value={client.clientOrganizationId}
              >
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <label className="ops-project-field">
          <span>Delivery manager</span>
          <select
            name="deliveryManagerUserId"
            required
            disabled={pending || candidates.deliveryManagers.length === 0}
            defaultValue=""
          >
            <option value="" disabled>
              Select manager
            </option>
            {candidates.deliveryManagers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {unavailable ? (
        <div className="ops-project-callout" data-tone="warning">
          <strong>Draft creation is blocked</strong>
          <span>
            An active client organization and eligible delivery manager are
            required.
          </span>
        </div>
      ) : null}

      <div className="ops-project-form-actions">
        <button
          className="ops-primary-action"
          type="submit"
          disabled={pending || unavailable}
        >
          {pending ? "Creating…" : "Create draft"}
        </button>
      </div>

      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
