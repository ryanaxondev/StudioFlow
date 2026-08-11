import { describe, expect, it, vi } from "vitest";

import { createMailpitAuthenticationEmailSender } from "../../src/modules/auth/email";

describe("authentication Mailpit sender", () => {
  it("sends the generated access URL through Mailpit", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    const sender = createMailpitAuthenticationEmailSender(
      {
        MAILPIT_API_URL: "http://127.0.0.1:8025",
        AUTH_EMAIL_FROM: "access@studioflow.local",
      },
      fetchImplementation,
    );

    await sender.sendMagicLink({
      to: "member@example.com",
      url: "http://127.0.0.1:3000/api/auth/magic-link/verify?token=secret",
    });

    expect(fetchImplementation).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImplementation.mock.calls[0]!;
    expect(String(url)).toBe("http://127.0.0.1:8025/api/v1/send");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      From: {
        Email: "access@studioflow.local",
        Name: "StudioFlow",
      },
      To: [{ Email: "member@example.com" }],
      Subject: "StudioFlow",
      Text: "http://127.0.0.1:3000/api/auth/magic-link/verify?token=secret",
    });
  });
});
