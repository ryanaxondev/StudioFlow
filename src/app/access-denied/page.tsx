import { headers } from "next/headers";
import Link from "next/link";

import { UtilityStateFrame } from "../../components/brand/utility-state-frame";
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
    <UtilityStateFrame
      code="403"
      eyebrow="Permission boundary"
      title="Access Denied"
      description="This account cannot open the requested destination. The protected object stays outside the current product context."
    >
      <Link className="utility-primary-link" href={landing?.href ?? "/access"}>
        {landing ? "Return to your valid home" : "Return to sign in"}
      </Link>
      {actor ? (
        <div className="utility-signout">
          <SignOutButton destination="/access" label="Switch account" />
        </div>
      ) : null}
    </UtilityStateFrame>
  );
}
