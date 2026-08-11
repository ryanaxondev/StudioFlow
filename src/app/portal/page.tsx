import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { toClientContextProjection } from "../../modules/authorization/projections";
import { getCurrentActorContext } from "../../modules/authorization/server/authorization";
import { SessionRefresh } from "../../modules/auth/components/session-refresh";
import { listActiveMembershipContextDetails } from "../../modules/memberships/queries";
import { getApplicationDatabase } from "../../server/database";

export default async function ClientPortalAuthorizationPlaceholder() {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);
  if (!actor) redirect(`/access?returnTo=${encodeURIComponent("/portal")}`);

  const details = await listActiveMembershipContextDetails(
    database,
    actor.userId,
  );
  const contexts = details.clientMemberships.map(toClientContextProjection);

  return (
    <main className="management-shell">
      <SessionRefresh returnTo="/portal" />
      <header className="management-header">
        <div>
          <p className="auth-brand">StudioFlow</p>
          <h1>Client Portal</h1>
          <p>Authorized client context</p>
        </div>
        <nav aria-label="Client utilities">
          <Link href="/account">Account</Link>
        </nav>
      </header>
      <section className="management-panel" aria-labelledby="client-contexts">
        <h2 id="client-contexts">Client Organizations</h2>
        <div className="account-context-list">
          {contexts.map((context) => (
            <article key={context.clientOrganizationId}>
              <strong>{context.clientOrganizationName}</strong>
              <span>{context.workspaceName}</span>
            </article>
          ))}
        </div>
        <p className="management-muted">
          Project-scoped Client roles and Project data begin in M09.
        </p>
      </section>
    </main>
  );
}
