import type { JsonObject } from "../../src/db/schema";
import {
  revealInvitationDelivery,
  type InvitationDeliveryEventType,
} from "../../src/modules/invitations/email-outbox";
import type { InvitationEmailSender } from "../../src/modules/invitations/email";
import type { WorkerProcessor } from "../runtime/processor";

export function createInvitationEmailProcessor(
  eventType: InvitationDeliveryEventType,
  options: Readonly<{
    encryptionSecret: string;
    emailTransport: InvitationEmailSender;
  }>,
): WorkerProcessor<JsonObject> {
  return {
    name: eventType,
    async process(payload, context) {
      if (context.signal.aborted) {
        throw new Error("Invitation email delivery was aborted.");
      }

      const message = revealInvitationDelivery(
        payload,
        options.encryptionSecret,
        eventType,
      );
      await options.emailTransport.sendInvitation(message, {
        signal: context.signal,
      });
    },
  };
}
