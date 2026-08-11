import { describe, expect, it } from "vitest";

import { hasTrustedAuthenticationOrigin } from "../../src/modules/auth/origin";

describe("authentication request origin", () => {
  const baseUrl = "https://studioflow.example";

  it("accepts the configured application origin", () => {
    expect(
      hasTrustedAuthenticationOrigin(
        new Headers({ origin: "https://studioflow.example" }),
        baseUrl,
      ),
    ).toBe(true);
  });

  it("rejects missing, malformed, and cross-origin requests", () => {
    expect(hasTrustedAuthenticationOrigin(new Headers(), baseUrl)).toBe(false);
    expect(
      hasTrustedAuthenticationOrigin(new Headers({ origin: "null" }), baseUrl),
    ).toBe(false);
    expect(
      hasTrustedAuthenticationOrigin(
        new Headers({ origin: "https://attacker.example" }),
        baseUrl,
      ),
    ).toBe(false);
  });
});
