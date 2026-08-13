import type { ReactNode } from "react";

import { StudioFlowMark } from "./studioflow-mark";

export function UtilityStateFrame({
  code,
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <main className="utility-state-experience">
      <header className="utility-state-topbar">
        <span className="utility-state-brand">
          <StudioFlowMark />
          <strong>StudioFlow</strong>
        </span>
        <span>Protected product boundary</span>
      </header>

      <section
        className="utility-state-stage"
        aria-labelledby="utility-state-heading"
      >
        <div className="utility-state-code" aria-hidden="true">
          {code}
        </div>
        <div className="utility-state-copy">
          <p className="utility-state-eyebrow">{eyebrow}</p>
          <h1 id="utility-state-heading">{title}</h1>
          <p>{description}</p>
          <div className="utility-state-actions">{children}</div>
        </div>
      </section>

      <footer className="utility-state-footer">
        StudioFlow does not disclose protected object details across invalid
        product boundaries.
      </footer>
    </main>
  );
}
