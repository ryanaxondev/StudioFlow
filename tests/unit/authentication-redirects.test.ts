import { describe, expect, it } from "vitest";

import { normalizeReturnTo } from "../../src/modules/auth/redirects";

describe("authentication destination preservation", () => {
  it("keeps a safe local path including query and hash", () => {
    expect(normalizeReturnTo("/account?section=identity#email")).toBe(
      "/account?section=identity#email",
    );
  });

  it.each([
    "https://example.com/account",
    "//example.com/account",
    "/\\example.com/account",
    "/api/auth/get-session",
    "",
  ])("falls back for unsafe destination %s", (destination) => {
    expect(normalizeReturnTo(destination)).toBe("/account");
  });
});
