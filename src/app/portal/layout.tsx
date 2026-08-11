import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { canEnterClientPortal } from "../../modules/authorization/policies";
import {
  getCurrentActorContext,
  logAuthorizationDenied,
} from "../../modules/authorization/server/authorization";
import { getApplicationDatabase } from "../../server/database";

export default async function ProtectedClientLayout({
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
    redirect(`/access?returnTo=${encodeURIComponent("/portal")}`);
  }

  const result = canEnterClientPortal(actor);
  if (!result.allowed) {
    logAuthorizationDenied(result, "client.layout");
    redirect("/access-denied");
  }

  return children;
}
