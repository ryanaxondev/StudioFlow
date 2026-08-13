import { StudioFlowMark } from "../../components/brand/studioflow-mark";
import { WorkflowMotif } from "../../components/brand/workflow-motif";
import { AccessForm } from "../../modules/auth/components/access-form";
import { normalizeReturnTo } from "../../modules/auth/redirects";

type AccessPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const parameters = await searchParams;
  const returnTo = normalizeReturnTo(parameters.returnTo);

  return (
    <main className="auth-shell access-experience">
      <section
        className="access-product-panel"
        aria-labelledby="studioflow-access-promise"
      >
        <div className="access-product-brand">
          <StudioFlowMark />
          <span>StudioFlow</span>
        </div>
        <div className="access-product-copy">
          <p className="access-product-kicker">Agency delivery operations</p>
          <h2 id="studioflow-access-promise">Delivery without ambiguity.</h2>
          <p>
            Keep ownership, client approvals, and handoffs visible from first
            review to final delivery.
          </p>
        </div>
        <WorkflowMotif />
        <p className="access-product-note">
          One operational view for the work your clients depend on.
        </p>
      </section>

      <section className="access-auth-panel" aria-labelledby="access-heading">
        <div className="access-auth-inner">
          <div className="access-auth-mobile-brand" aria-hidden="true">
            <StudioFlowMark />
            <span>StudioFlow</span>
          </div>
          <p className="access-auth-kicker">Secure workspace access</p>
          <h1 id="access-heading">Sign in to StudioFlow</h1>
          <p className="access-auth-copy">
            Use your work email. We’ll send a one-time secure sign-in link.
          </p>
          <AccessForm returnTo={returnTo} />
          <div className="access-auth-footnote">
            <span className="access-auth-footnote-dot" aria-hidden="true" />
            <span>Passwordless access · session protected</span>
          </div>
        </div>
      </section>
    </main>
  );
}
