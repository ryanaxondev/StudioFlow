import type { NodeEnvironment } from "./environment";
import {
  parseMailpitEnvironment,
  type MailpitEnvironment,
} from "./environment";

export type MagicLinkEmail = Readonly<{
  to: string;
  url: string;
}>;

export type AuthenticationEmailSendOptions = Readonly<{
  signal?: AbortSignal;
}>;

export interface AuthenticationEmailSender {
  sendMagicLink(
    message: MagicLinkEmail,
    options?: AuthenticationEmailSendOptions,
  ): Promise<void>;
}

export function createMailpitAuthenticationEmailSender(
  environment: MailpitEnvironment,
  fetchImplementation: typeof fetch = fetch,
): AuthenticationEmailSender {
  return {
    async sendMagicLink({ to, url }, options) {
      const response = await fetchImplementation(
        new URL("/api/v1/send", environment.MAILPIT_API_URL),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            From: {
              Email: environment.AUTH_EMAIL_FROM,
              Name: "StudioFlow",
            },
            To: [{ Email: to }],
            Subject: "StudioFlow",
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

export function createRuntimeAuthenticationEmailTransport(
  nodeEnvironment: NodeEnvironment,
): AuthenticationEmailSender {
  if (nodeEnvironment !== "production") {
    return createMailpitAuthenticationEmailSender(
      parseMailpitEnvironment(process.env),
    );
  }

  return {
    async sendMagicLink() {
      throw new Error(
        "Production authentication email delivery is not enabled in M05.",
      );
    },
  };
}
