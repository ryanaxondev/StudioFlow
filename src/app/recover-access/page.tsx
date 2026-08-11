import Link from "next/link";

import { normalizeReturnTo } from "../../modules/auth/redirects";

type RecoveryPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function recoveryState(
  parameters: Record<string, string | string[] | undefined>,
) {
  const state = firstValue(parameters.state);
  const error = firstValue(parameters.error);

  if (state === "expired") return "Expired invitation";
  if (state === "revoked") return "Revoked invitation";
  if (state === "request-sent") return "Request sent";
  if (state === "rate-limited") return "Rate limited";
  if (state === "unknown-link" || error) return "Unknown link";

  return "Unknown link";
}

function recoveryGuidance(
  parameters: Record<string, string | string[] | undefined>,
): string {
  const state = firstValue(parameters.state);
  if (state === "expired") {
    return "Ask the inviting agency to resend the invitation. A new invitation will replace the expired link.";
  }
  if (state === "revoked") {
    return "This invitation is no longer active. Contact the inviting agency if access should be restored.";
  }
  if (state === "rate-limited") {
    return "Too many access attempts were made. Wait before requesting another sign-in link.";
  }
  return "Request a fresh sign-in link or return to the invitation email and verify that the complete link was opened.";
}

export default async function RecoverAccessPage({
  searchParams,
}: RecoveryPageProps) {
  const parameters = await searchParams;
  const returnTo = normalizeReturnTo(firstValue(parameters.returnTo));
  const requestLink = `/access?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="recovery-heading">
        <p className="auth-brand">StudioFlow</p>
        <h1 id="recovery-heading">Invitation and Link Recovery</h1>
        <p className="auth-recovery-state">{recoveryState(parameters)}</p>
        <p className="auth-method">{recoveryGuidance(parameters)}</p>

        <div className="auth-actions">
          <Link className="auth-primary-link" href={requestLink}>
            Request a new access link.
          </Link>
          <Link className="auth-text-link" href="/access">
            Return to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
