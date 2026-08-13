import { SharedAccessFrame } from "../../../components/brand/shared-access-frame";
import { InvitationAcceptance } from "../../../modules/invitations/components/invitation-acceptance";

type InvitationPageProps = Readonly<{
  params: Promise<{ token: string }>;
}>;

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;

  return (
    <SharedAccessFrame
      eyebrow="Workspace invitation"
      title="Invitation Acceptance"
      description="Review the access being offered, confirm the invited identity, and continue into the scoped product context."
    >
      <InvitationAcceptance token={token} />
    </SharedAccessFrame>
  );
}
