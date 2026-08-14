"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { moveProjectToActiveAction } from "../../milestones/actions";
import { projectActionStatusMessage } from "../action-status";

export function ProjectStageAction({
  projectId,
  rowVersion,
}: Readonly<{ projectId: string; rowVersion: number }>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function activate() {
    setPending(true);
    setStatus("");
    const result = await moveProjectToActiveAction({
      projectId,
      expectedProjectRowVersion: rowVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    if (result.ok) {
      setStatus("Project moved to Active delivery");
      router.refresh();
    } else {
      setStatus(projectActionStatusMessage(result.status, "Transition failed"));
    }
    setPending(false);
  }

  return (
    <div className="ops-project-stage-action">
      <button
        className="ops-primary-action"
        type="button"
        disabled={pending}
        onClick={() => void activate()}
      >
        {pending ? "Moving…" : "Move to Active"}
      </button>
      <p className="ops-management-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
