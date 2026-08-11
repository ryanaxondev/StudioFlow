"use client";

import { useState } from "react";

export function SignOutButton() {
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    setFailed(false);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        setFailed(true);
        setPending(false);
        return;
      }

      window.location.assign("/access");
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="auth-sign-out">
      <button
        className="auth-secondary-action"
        type="button"
        onClick={signOut}
        disabled={pending}
      >
        Sign out
      </button>
      <div className="auth-status" aria-live="polite">
        {failed ? <p>Service error</p> : null}
      </div>
    </div>
  );
}
