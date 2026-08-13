import Link from "next/link";

import { UtilityStateFrame } from "../components/brand/utility-state-frame";

export default function NotFoundPage() {
  return (
    <UtilityStateFrame
      code="404"
      eyebrow="Product boundary"
      title="Not found"
      description="This destination is unavailable or outside the current product context. No protected object details are shown."
    >
      <Link className="utility-primary-link" href="/account">
        Return to account
      </Link>
    </UtilityStateFrame>
  );
}
