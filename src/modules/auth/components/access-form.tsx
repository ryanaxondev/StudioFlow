"use client";

import { useState } from "react";

export type AccessFormProps = Readonly<{
  returnTo: string;
}>;

type SubmissionState =
  "idle" | "submitting" | "request-sent" | "rate-limited" | "service-error";

export function AccessForm({ returnTo }: AccessFormProps) {
  const [state, setState] = useState<SubmissionState>("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "");

    setState("submitting");

    try {
      const response = await fetch("/api/access/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, returnTo }),
      });

      if (response.status === 429) {
        setState("rate-limited");
        return;
      }

      if (!response.ok) {
        setState("service-error");
        return;
      }

      formElement.reset();
      setState("request-sent");
    } catch {
      setState("service-error");
    }
  }

  const pending = state === "submitting";

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </label>

      <button className="auth-primary-action" type="submit" disabled={pending}>
        Continue to the authenticated destination.
      </button>

      <div className="auth-status" aria-live="polite">
        {state === "request-sent" ? <p>Request sent</p> : null}
        {state === "rate-limited" ? <p>Rate limited</p> : null}
        {state === "service-error" ? <p>Service error</p> : null}
      </div>
    </form>
  );
}
