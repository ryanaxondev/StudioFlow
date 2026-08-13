"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SignOutButton } from "../../auth/components/sign-out-button";

type PresentationStatus =
  | "loading"
  | "valid"
  | "accepted"
  | "expired"
  | "revoked"
  | "invalid"
  | "target-unavailable"
  | "wrong-account"
  | "service-error";

type Presentation = Readonly<{
  status: PresentationStatus;
  authenticated?: boolean;
  accountMatches?: boolean;
  membershipType?: "WORKSPACE_MEMBER" | "CLIENT_MEMBER";
  intendedRole?: "AGENCY_OWNER" | "DELIVERY_MANAGER" | "AGENCY_MEMBER" | null;
  workspaceName?: string;
  clientOrganizationName?: string | null;
  expiresAt?: string;
  identityExists?: boolean;
}>;

type ActionState =
  | "idle"
  | "submitting"
  | "request-sent"
  | "rate-limited"
  | "name-required"
  | "service-error";

function roleLabel(presentation: Presentation): string {
  if (presentation.membershipType === "CLIENT_MEMBER") {
    return "Client Member";
  }

  switch (presentation.intendedRole) {
    case "AGENCY_OWNER":
      return "Agency Owner";
    case "DELIVERY_MANAGER":
      return "Delivery Manager";
    case "AGENCY_MEMBER":
      return "Agency Member";
    default:
      return "Workspace Member";
  }
}

function RecoveryLink({
  state,
}: Readonly<{ state: "expired" | "revoked" | "unknown-link" }>) {
  return (
    <Link className="auth-primary-link" href={`/recover-access?state=${state}`}>
      Recover access
    </Link>
  );
}

export function InvitationAcceptance({ token }: Readonly<{ token: string }>) {
  const [presentation, setPresentation] = useState<Presentation>({
    status: "loading",
  });
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/invitations/presentation", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const payload = (await response.json()) as Presentation;
        if (active) {
          setPresentation(response.ok ? payload : { status: "service-error" });
        }
      } catch {
        if (active) {
          setPresentation({ status: "service-error" });
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  async function requestAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionState("submitting");

    try {
      const response = await fetch("/api/invitations/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          displayName: presentation.identityExists ? undefined : displayName,
        }),
      });
      const payload = (await response.json()) as { status?: string };

      if (response.status === 429 || payload.status === "rate-limited") {
        setActionState("rate-limited");
        return;
      }

      if (payload.status === "request-sent") {
        setActionState("request-sent");
        return;
      }

      if (payload.status === "name-required") {
        setActionState("name-required");
        return;
      }

      if (
        [
          "expired",
          "revoked",
          "already-accepted",
          "invalid",
          "target-unavailable",
        ].includes(payload.status ?? "")
      ) {
        window.location.reload();
        return;
      }

      setActionState("service-error");
    } catch {
      setActionState("service-error");
    }
  }

  async function accept() {
    setActionState("submitting");

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json()) as {
        status?: string;
        destination?: string;
      };

      if (
        response.ok &&
        ["accepted", "already-accepted"].includes(payload.status ?? "")
      ) {
        window.location.assign(payload.destination ?? "/account");
        return;
      }

      if (payload.status === "authentication-required") {
        window.location.reload();
        return;
      }

      if (payload.status === "wrong-account") {
        setPresentation({ status: "wrong-account", authenticated: true });
        setActionState("idle");
        return;
      }

      if (
        [
          "expired",
          "revoked",
          "already-accepted",
          "invalid",
          "target-unavailable",
        ].includes(payload.status ?? "")
      ) {
        window.location.reload();
        return;
      }

      setActionState("service-error");
    } catch {
      setActionState("service-error");
    }
  }

  if (presentation.status === "loading") {
    return (
      <div
        className="invitation-loading-state"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="invitation-loading-indicator" aria-hidden="true" />
        <span>
          <strong>Checking invitation</strong>
          <span>Verifying the access scope and invited identity.</span>
        </span>
      </div>
    );
  }

  if (presentation.status === "invalid") {
    return (
      <>
        <p className="auth-recovery-state">Unknown invitation</p>
        <p className="auth-method">This invitation link is not valid.</p>
        <div className="auth-actions">
          <RecoveryLink state="unknown-link" />
          <Link className="auth-text-link" href="/access">
            Return to sign in
          </Link>
        </div>
      </>
    );
  }

  if (presentation.status === "expired" || presentation.status === "revoked") {
    const state = presentation.status;
    return (
      <>
        <p className="auth-recovery-state">
          {state === "expired" ? "Invitation expired" : "Invitation revoked"}
        </p>
        {presentation.workspaceName ? (
          <p className="auth-method">Issued by {presentation.workspaceName}</p>
        ) : null}
        <div className="auth-actions">
          <RecoveryLink state={state} />
          <Link className="auth-text-link" href="/access">
            Return to sign in
          </Link>
        </div>
      </>
    );
  }

  if (presentation.status === "target-unavailable") {
    return (
      <>
        <p className="auth-recovery-state">Invitation unavailable</p>
        <p className="auth-method">
          The invitation target is no longer available.
        </p>
        <div className="auth-actions">
          <RecoveryLink state="unknown-link" />
        </div>
      </>
    );
  }

  if (presentation.status === "wrong-account") {
    return (
      <>
        <p className="auth-recovery-state">Wrong account</p>
        <p className="auth-method">
          This invitation belongs to a different account. Switch accounts to
          continue.
        </p>
        <div className="auth-actions">
          <SignOutButton
            destination={`/invite/${encodeURIComponent(token)}`}
            label="Use another account"
          />
          <Link className="auth-text-link" href="/account">
            Open current account
          </Link>
        </div>
      </>
    );
  }

  if (presentation.status === "accepted") {
    return (
      <>
        <p className="auth-recovery-state">Already accepted</p>
        <p className="auth-method">This invitation has already been used.</p>
        <div className="auth-actions">
          <Link
            className="auth-primary-link"
            href={
              presentation.authenticated
                ? "/account"
                : "/access?returnTo=/account"
            }
          >
            {presentation.authenticated ? "Open account" : "Sign in"}
          </Link>
        </div>
      </>
    );
  }

  if (presentation.status === "service-error") {
    return (
      <>
        <p className="auth-recovery-state">Service error</p>
        <p className="auth-method">
          The invitation could not be checked right now.
        </p>
        <div className="auth-actions">
          <button
            className="auth-secondary-action"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  const pending = actionState === "submitting";
  const formattedExpiry = presentation.expiresAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(presentation.expiresAt),
      )
    : null;

  return (
    <>
      <div className="auth-invitation-summary">
        <p className="auth-method">
          Invitation to {presentation.workspaceName ?? "StudioFlow"}
        </p>
        <dl className="auth-identity-list">
          <div>
            <dt>Role</dt>
            <dd>{roleLabel(presentation)}</dd>
          </div>
          {presentation.clientOrganizationName ? (
            <div>
              <dt>Client organization</dt>
              <dd>{presentation.clientOrganizationName}</dd>
            </div>
          ) : null}
          {formattedExpiry ? (
            <div>
              <dt>Valid until</dt>
              <dd>{formattedExpiry}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {presentation.authenticated && presentation.accountMatches ? (
        <div className="auth-actions">
          <button
            className="auth-primary-action"
            type="button"
            onClick={accept}
            disabled={pending}
          >
            Accept invitation and continue
          </button>
          <Link className="auth-text-link" href="/">
            Decline or leave
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={requestAccess}>
          {!presentation.identityExists ? (
            <label className="auth-field">
              <span>Your name</span>
              <input
                type="text"
                name="displayName"
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                maxLength={120}
                disabled={pending}
              />
            </label>
          ) : null}
          <button
            className="auth-primary-action"
            type="submit"
            disabled={pending}
          >
            {presentation.identityExists
              ? "Email me a sign-in link"
              : "Confirm identity by email"}
          </button>
          <div className="auth-status" aria-live="polite">
            {actionState === "request-sent" ? (
              <p>Check your email. The sign-in link will return you here.</p>
            ) : null}
            {actionState === "rate-limited" ? <p>Rate limited</p> : null}
            {actionState === "name-required" ? (
              <p>Enter your name to continue.</p>
            ) : null}
            {actionState === "service-error" ? <p>Service error</p> : null}
          </div>
          <Link className="auth-text-link" href="/">
            Decline or leave
          </Link>
        </form>
      )}
    </>
  );
}
