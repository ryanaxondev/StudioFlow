import { describe, expect, it } from "vitest";

import { isPastAbsoluteSessionExpiry } from "../../src/modules/auth/session-policy";

describe("authentication absolute session lifetime", () => {
  it("keeps a session before 30 days", () => {
    expect(
      isPastAbsoluteSessionExpiry(
        new Date("2026-07-10T00:00:00.000Z"),
        new Date("2026-08-08T23:59:59.999Z"),
      ),
    ).toBe(false);
  });

  it("expires a session at 30 days", () => {
    expect(
      isPastAbsoluteSessionExpiry(
        new Date("2026-07-10T00:00:00.000Z"),
        new Date("2026-08-09T00:00:00.000Z"),
      ),
    ).toBe(true);
  });
});
