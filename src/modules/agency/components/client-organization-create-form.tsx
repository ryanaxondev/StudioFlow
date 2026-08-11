"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClientOrganizationCreateForm({
  workspaceId,
}: Readonly<{ workspaceId: string }>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");

    try {
      const response = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: String(form.get("name") ?? ""),
        }),
      });
      const payload = (await response.json()) as {
        status?: string;
        clientOrganizationId?: string;
      };
      if (!response.ok || !payload.clientOrganizationId) {
        setStatus(payload.status ?? "Creation failed");
        return;
      }
      router.push(
        `/agency/clients/${payload.clientOrganizationId}?workspaceId=${encodeURIComponent(workspaceId)}`,
      );
      router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="management-form management-inline-form" onSubmit={submit}>
      <label>
        <span>Organization name</span>
        <input
          type="text"
          name="name"
          required
          maxLength={160}
          disabled={pending}
        />
      </label>
      <button className="management-primary" type="submit" disabled={pending}>
        Create Client Organization
      </button>
      <p className="management-status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
