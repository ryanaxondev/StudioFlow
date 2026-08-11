import { describe, expect, it } from "vitest";

import {
  protectAuthenticationMagicLink,
  revealAuthenticationMagicLink,
} from "../../src/modules/auth/email-outbox";

const encryptionSecret =
  "studioflow-authentication-message-test-secret-1234567890";

describe("protected authentication email payload", () => {
  it("keeps the recipient and Magic Link out of plaintext Outbox payloads", () => {
    const message = {
      to: "member@example.com",
      url: "http://127.0.0.1:3000/api/auth/magic-link/verify?token=secret-token",
    };

    const payload = protectAuthenticationMagicLink(message, encryptionSecret);
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain(message.to);
    expect(serialized).not.toContain("secret-token");
    expect(revealAuthenticationMagicLink(payload, encryptionSecret)).toEqual(
      message,
    );
  });

  it("rejects tampered payloads", () => {
    const payload = protectAuthenticationMagicLink(
      {
        to: "member@example.com",
        url: "http://127.0.0.1:3000/api/auth/magic-link/verify?token=secret-token",
      },
      encryptionSecret,
    );

    expect(() =>
      revealAuthenticationMagicLink(
        { ...payload, ciphertext: "tampered" },
        encryptionSecret,
      ),
    ).toThrow("Protected authentication message could not be opened.");
  });
});
