"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClientOrganizationAction } from "../actions";

export function ClientOrganizationCreateForm({
  workspaceId,
  openCreatedOrganization,
}: Readonly<{ workspaceId: string; openCreatedOrganization: boolean }>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");

    try {
      const result = await createClientOrganizationAction({
        workspaceId,
        name: String(form.get("name") ?? ""),
      });
      if (!result.ok || !result.id) {
        setStatus(result.status ?? "Creation failed");
        return;
      }
      if (openCreatedOrganization) {
        router.push(
          `/agency/clients/${result.id}?workspaceId=${encodeURIComponent(workspaceId)}`,
        );
      } else {
        setStatus("Client Organization created");
      }
      router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="ops-client-create-form" onSubmit={submit}>
      <label>
        <span>Organization name</span>
        <input
          type="text"
          name="name"
          placeholder="Acme Studio"
          required
          maxLength={160}
          disabled={pending}
        />
      </label>
      <button className="ops-primary-action" type="submit" disabled={pending}>
        Create client
      </button>
      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
