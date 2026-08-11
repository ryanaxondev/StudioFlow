import { describe, expect, it, vi } from "vitest";

import { protectAuthenticationMagicLink } from "../../src/modules/auth/email-outbox";
import type { AuthenticationEmailSender } from "../../src/modules/auth/email";
import { createAuthenticationEmailProcessor } from "../../worker/processors/authentication-email";
import { runWorkerProcessor } from "../helpers/worker";

const encryptionSecret =
  "studioflow-authentication-message-test-secret-1234567890";

describe("authentication email Worker processor", () => {
  it("opens a protected payload and delivers it through the transport", async () => {
    const sendMagicLink = vi.fn<AuthenticationEmailSender["sendMagicLink"]>();
    const processor = createAuthenticationEmailProcessor({
      encryptionSecret,
      emailTransport: { sendMagicLink },
    });
    const message = {
      to: "member@example.com",
      url: "http://127.0.0.1:3000/api/auth/magic-link/verify?token=secret-token",
    };

    await runWorkerProcessor(
      processor,
      protectAuthenticationMagicLink(message, encryptionSecret),
    );

    expect(sendMagicLink).toHaveBeenCalledTimes(1);
    expect(sendMagicLink).toHaveBeenCalledWith(
      message,
      expect.objectContaining({ signal: expect.anything() }),
    );
  });
});
