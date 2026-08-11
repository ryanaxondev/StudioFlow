import type { NodeEnvironment } from "../auth/environment";
import {
  parseMailpitEnvironment,
  type MailpitEnvironment,
} from "../auth/environment";

export type InvitationEmail = Readonly<{
  to: string;
  url: string;
}>;

export type InvitationEmailSendOptions = Readonly<{
  signal?: AbortSignal;
}>;

export interface InvitationEmailSender {
  sendInvitation(
    message: InvitationEmail,
    options?: InvitationEmailSendOptions,
  ): Promise<void>;
}

export function createMailpitInvitationEmailSender(
  environment: MailpitEnvironment,
  fetchImplementation: typeof fetch = fetch,
): InvitationEmailSender {
  return {
    async sendInvitation({ to, url }, options) {
      const response = await fetchImplementation(
        new URL("/api/v1/send", environment.MAILPIT_API_URL),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            From: {
              Email: environment.AUTH_EMAIL_FROM,
              Name: "StudioFlow",
            },
            To: [{ Email: to }],
            Subject: "StudioFlow invitation",
            Text: url,
          }),
          signal: options?.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Mailpit returned HTTP ${response.status}.`);
      }
    },
  };
}

export function createRuntimeInvitationEmailTransport(
  nodeEnvironment: NodeEnvironment,
): InvitationEmailSender {
  if (nodeEnvironment !== "production") {
    return createMailpitInvitationEmailSender(
      parseMailpitEnvironment(process.env),
    );
  }

  return {
    async sendInvitation() {
      throw new Error(
        "Production invitation email delivery is not enabled in M06.",
      );
    },
  };
}
