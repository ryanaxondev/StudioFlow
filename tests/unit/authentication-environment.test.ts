import { describe, expect, it } from "vitest";

import {
  parseAuthenticationEnvironment,
  parseAuthenticationMessageEnvironment,
} from "../../src/modules/auth/environment";

describe("authentication environment", () => {
  it("provides local defaults outside production", () => {
    const environment = parseAuthenticationEnvironment({
      NODE_ENV: "development",
    });
    const messageEnvironment = parseAuthenticationMessageEnvironment({
      NODE_ENV: "development",
    });

    expect(environment.BETTER_AUTH_URL).toBe("http://127.0.0.1:3000");
    expect(environment.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(
      messageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET.length,
    ).toBeGreaterThanOrEqual(32);
  });

  it("requires explicit production authentication configuration", () => {
    expect(() =>
      parseAuthenticationEnvironment({ NODE_ENV: "production" }),
    ).toThrow();
    expect(() =>
      parseAuthenticationMessageEnvironment({ NODE_ENV: "production" }),
    ).toThrow();
  });
});
