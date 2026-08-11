import { describe, expect, it } from "vitest";

import {
  protectInvitationDelivery,
  WORKSPACE_INVITATION_DELIVERY_EVENT,
} from "../../src/modules/invitations/email-outbox";
import type { InvitationEmailSender } from "../../src/modules/invitations/email";
import { createInvitationEmailProcessor } from "../../worker/processors/invitation-email";
import { runWorkerProcessor } from "../helpers/worker";

class RecordingInvitationEmailSender implements InvitationEmailSender {
  readonly messages: { to: string; url: string }[] = [];

  async sendInvitation(message: { to: string; url: string }): Promise<void> {
    this.messages.push(message);
  }
}

describe("invitation email worker processor", () => {
  it("opens and delivers a protected invitation message", async () => {
    const secret = "studioflow-invitation-worker-test-secret-1234567890";
    const sender = new RecordingInvitationEmailSender();
    const processor = createInvitationEmailProcessor(
      WORKSPACE_INVITATION_DELIVERY_EVENT,
      {
        encryptionSecret: secret,
        emailTransport: sender,
      },
    );
    const payload = protectInvitationDelivery(
      {
        to: "member@example.com",
        url: "http://127.0.0.1:3000/invite/test-token",
      },
      secret,
      WORKSPACE_INVITATION_DELIVERY_EVENT,
    );

    await runWorkerProcessor(processor, payload);

    expect(sender.messages).toEqual([
      {
        to: "member@example.com",
        url: "http://127.0.0.1:3000/invite/test-token",
      },
    ]);
  });
});
