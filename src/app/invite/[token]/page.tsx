import { InvitationAcceptance } from "../../../modules/invitations/components/invitation-acceptance";

type InvitationPageProps = Readonly<{
  params: Promise<{ token: string }>;
}>;

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="invitation-heading">
        <p className="auth-brand">StudioFlow</p>
        <h1 id="invitation-heading">Invitation Acceptance</h1>
        <InvitationAcceptance token={token} />
      </section>
    </main>
  );
}
