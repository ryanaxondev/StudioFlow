import { describe, expect, it } from "vitest";

import { GET as getLiveness } from "../../src/app/api/health/live/route";
import { GET as getReadiness } from "../../src/app/api/health/ready/route";

describe("health routes", () => {
  it("returns a successful liveness response", async () => {
    const response = getLiveness();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
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

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ready");
    expect(payload.service).toBe("web");
    expect(["development", "test", "production"]).toContain(
      payload.environment,
    );
  });
});
