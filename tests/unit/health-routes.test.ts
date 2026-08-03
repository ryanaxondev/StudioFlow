import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GET as getLiveness } from "../../src/app/api/health/live/route";
import { GET as getReadiness } from "../../src/app/api/health/ready/route";

describe("health routes", () => {
  it("returns a successful liveness response", async () => {
    const response = getLiveness();

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "ok",
      service: "web",
    });
  });

  it("returns a successful readiness response", async () => {
    const response = getReadiness();
    const payload = (await response.json()) as {
      status: string;
      service: string;
      environment: string;
    };

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ready");
    assert.equal(payload.service, "web");
    assert.ok(
      ["development", "test", "production"].includes(payload.environment),
    );
  });
});
