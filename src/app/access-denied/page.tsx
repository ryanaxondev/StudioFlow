import { headers } from "next/headers";
import Link from "next/link";

import { resolveRoleBasedLanding } from "../../modules/authorization/policies";
import { getCurrentActorContext } from "../../modules/authorization/server/authorization";
import { SignOutButton } from "../../modules/auth/components/sign-out-button";
import { getApplicationDatabase } from "../../server/database";

export default async function AccessDeniedPage() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const actor = await getCurrentActorContext(
    requestHeaders,
    getApplicationDatabase(),
  );
  const landing = actor ? resolveRoleBasedLanding(actor) : null;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="access-denied-heading">
        <p className="auth-brand">StudioFlow</p>
        <h1 id="access-denied-heading">Access Denied</h1>
        <p className="auth-method">
          This account cannot open the requested destination. Protected object
          details are intentionally not shown here.
        </p>
        <div className="auth-actions">
          <Link className="auth-primary-link" href={landing?.href ?? "/access"}>
            {landing ? "Return to your valid home" : "Return to sign in"}
          </Link>
          {actor ? (
            <SignOutButton destination="/access" label="Switch account" />
          ) : null}
        </div>
      </section>
    </main>
  );
}
