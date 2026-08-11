import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { canViewAgencyWorkspace } from "../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
} from "../../modules/authorization/server/authorization";
import { getApplicationDatabase } from "../../server/database";

export default async function ProtectedAgencyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const readonlyHeaders = await headers();
  const requestHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => requestHeaders.append(key, value));
  const actor = await getCurrentActorContext(
    requestHeaders,
    getApplicationDatabase(),
  );

  if (!actor) {
    redirect(`/access?returnTo=${encodeURIComponent("/agency")}`);
  }

  const workspaceId = actor.workspaceMemberships[0]?.workspaceId;
  const result = canViewAgencyWorkspace(
    actor,
    workspaceId ?? "00000000-0000-0000-0000-000000000000",
  );
  if (!result.allowed) {
    logAuthorizationDenied(result, "agency.layout");
    redirect("/access-denied");
  }

  return children;
}
