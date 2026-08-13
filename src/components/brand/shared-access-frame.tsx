import type { ReactNode } from "react";

import { StudioFlowMark } from "./studioflow-mark";

const accessSteps = [
  ["01", "Invitation", "A scoped workspace or client-access handoff."],
  ["02", "Verify", "Confirm the invited identity through secure email access."],
  ["03", "Continue", "Enter only the product context the invitation grants."],
] as const;

export function SharedAccessFrame({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <main className="shared-access-experience">
      <aside
        className="shared-access-context"
        aria-label="StudioFlow access context"
      >
        <div className="shared-access-brand">
          <StudioFlowMark />
          <span>StudioFlow</span>
        </div>
        <div className="shared-access-context-copy">
          <p>Secure product access</p>
          <h2>Access follows the work.</h2>
          <span>
            Invitations stay scoped to the workspace, organization, and role
            they were issued for.
          </span>
        </div>
        <ol className="shared-access-sequence">
          {accessSteps.map(([number, label, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <strong>{label}</strong>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="shared-access-context-note">
          Protected context stays hidden until access is valid.
        </p>
      </aside>

      <section
        className="shared-access-action"
        aria-labelledby="shared-access-heading"
      >
        <div className="shared-access-action-inner">
          <p className="shared-access-eyebrow">{eyebrow}</p>
          <h1 id="shared-access-heading">{title}</h1>
          <p className="shared-access-description">{description}</p>
          <div className="shared-access-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
