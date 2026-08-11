import { describe, expect, it } from "vitest";

import { revealAuthenticationMagicLink } from "../../src/modules/auth/email-outbox";
import {
  CLIENT_INVITATION_DELIVERY_EVENT,
  protectInvitationDelivery,
  revealInvitationDelivery,
  WORKSPACE_INVITATION_DELIVERY_EVENT,
} from "../../src/modules/invitations/email-outbox";

const secret = "studioflow-invitation-message-test-secret-1234567890";

describe("invitation protected delivery payload", () => {
  it("round-trips only in the correct invitation domain", () => {
    const message = {
      to: "Member@Example.com",
      url: "http://127.0.0.1:3000/invite/test-token",
    };
    const payload = protectInvitationDelivery(
      message,
      secret,
      WORKSPACE_INVITATION_DELIVERY_EVENT,
    );

    expect(JSON.stringify(payload)).not.toContain("member@example.com");
    expect(JSON.stringify(payload)).not.toContain("test-token");
    expect(
      revealInvitationDelivery(
        payload,
        secret,
        WORKSPACE_INVITATION_DELIVERY_EVENT,
      ),
    ).toEqual({
      to: "member@example.com",
      url: message.url,
    });

    expect(() =>
      revealInvitationDelivery(
        payload,
        secret,
        CLIENT_INVITATION_DELIVERY_EVENT,
      ),
    ).toThrow("Protected invitation message could not be opened.");
    expect(() => revealAuthenticationMagicLink(payload, secret)).toThrow(
      "Protected authentication message could not be opened.",
    );
  });

  it("fails closed for the wrong key or tampered ciphertext", () => {
    const payload = protectInvitationDelivery(
      {
        to: "member@example.com",
        url: "http://127.0.0.1:3000/invite/test-token",
      },
      secret,
      CLIENT_INVITATION_DELIVERY_EVENT,
    );

    expect(() =>
      revealInvitationDelivery(
        payload,
        "different-invitation-message-secret-1234567890",
        CLIENT_INVITATION_DELIVERY_EVENT,
      ),
    ).toThrow("Protected invitation message could not be opened.");

    const ciphertext = String(payload.ciphertext);
    const tampered = {
      ...payload,
      ciphertext: `${ciphertext.slice(0, -1)}${ciphertext.endsWith("A") ? "B" : "A"}`,
    };
    expect(() =>
      revealInvitationDelivery(
        tampered,
        secret,
        CLIENT_INVITATION_DELIVERY_EVENT,
      ),
    ).toThrow("Protected invitation message could not be opened.");
  });
});
