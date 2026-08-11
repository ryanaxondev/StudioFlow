import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { SignOutButton } from "../../modules/auth/components/sign-out-button";
import { getCurrentStudioFlowSession } from "../../modules/auth/server/session";

export default async function AccountPage() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const session = await getCurrentStudioFlowSession(requestHeaders);

  if (!session) {
    redirect("/access?returnTo=/account");
  }

  return (
    <main className="auth-shell">
      <SessionRefresh />
      <section className="auth-card" aria-labelledby="account-heading">
        <p className="auth-brand">StudioFlow</p>
        <h1 id="account-heading">Account and Product Context</h1>

        <dl className="auth-identity-list">
          <div>
            <dt>Name</dt>
            <dd>{session.user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.user.email}</dd>
          </div>
        </dl>

        <div className="auth-actions">
          <Link className="auth-text-link" href="/">
            Return to product
          </Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
