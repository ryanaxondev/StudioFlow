import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseServerEnvironment } from "../../src/lib/env-schema";

describe("server environment schema", () => {
  it("applies safe defaults", () => {
    const environment = parseServerEnvironment({});

    assert.equal(environment.NODE_ENV, "development");
    assert.equal(environment.LOG_LEVEL, "info");
  });

  it("accepts valid values", () => {
    const environment = parseServerEnvironment({
      NODE_ENV: "production",
      LOG_LEVEL: "warn",
    });

    assert.equal(environment.NODE_ENV, "production");
    assert.equal(environment.LOG_LEVEL, "warn");
  });

  it("rejects invalid values", () => {
    assert.throws(() =>
      parseServerEnvironment({
        NODE_ENV: "production",
        LOG_LEVEL: "verbose",
      }),
    );
  });
});
