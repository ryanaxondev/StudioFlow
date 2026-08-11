import type { JsonObject } from "../../src/db/schema";
import {
  AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
  revealAuthenticationMagicLink,
} from "../../src/modules/auth/email-outbox";
import type { AuthenticationEmailSender } from "../../src/modules/auth/email";
import type { WorkerProcessor } from "../runtime/processor";

export function createAuthenticationEmailProcessor(
  options: Readonly<{
    encryptionSecret: string;
    emailTransport: AuthenticationEmailSender;
  }>,
): WorkerProcessor<JsonObject> {
  return {
    name: AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
    async process(payload, context) {
      if (context.signal.aborted) {
        throw new Error("Authentication email delivery was aborted.");
      }

      const message = revealAuthenticationMagicLink(
        payload,
        options.encryptionSecret,
      );
      await options.emailTransport.sendMagicLink(message, {
        signal: context.signal,
      });
    },
  };
}
