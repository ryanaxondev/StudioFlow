import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ClientShell } from "../../components/shell/client-shell";
import { canEnterClientPortal } from "../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
} from "../../modules/authorization/server/authorization";
import { listClientPortalShellContexts } from "../../modules/memberships/queries";
import { getApplicationDatabase } from "../../server/database";

export default async function ProtectedClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const database = getApplicationDatabase();
  const actor = await getCurrentActorContext(requestHeaders, database);

  if (!actor) {
    redirect(`/access?returnTo=${encodeURIComponent("/portal")}`);
  }

  const result = canEnterClientPortal(actor);
  if (!result.allowed) {
    logAuthorizationDenied(result, "client.layout");
    redirect("/access-denied");
  }

  const contexts = await listClientPortalShellContexts(database, actor.userId);
  const selected = contexts[0];

  return (
    <ClientShell
      agencyName={selected?.workspaceName ?? "Client Portal"}
      clientOrganizationName={selected?.clientOrganizationName}
      accentHex={selected?.appliedAccentHex}
    >
      {children}
    </ClientShell>
  );
}
