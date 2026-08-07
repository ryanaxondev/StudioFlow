import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "../../src/lib/env-schema";

describe("server environment schema", () => {
  it("applies safe defaults", () => {
    const environment = parseServerEnvironment({});

    expect(environment.NODE_ENV).toBe("development");
    expect(environment.LOG_LEVEL).toBe("info");
  });

  it("accepts valid values", () => {
    const environment = parseServerEnvironment({
      NODE_ENV: "production",
      LOG_LEVEL: "warn",
    });

    expect(environment.NODE_ENV).toBe("production");
    expect(environment.LOG_LEVEL).toBe("warn");
  });

  it("rejects invalid values", () => {
    expect(() =>
      parseServerEnvironment({
        NODE_ENV: "production",
        LOG_LEVEL: "verbose",
      }),
    ).toThrow();
  });
});
