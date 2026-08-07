import { describe, expect, it } from "vitest";

import { createFixedClock } from "../helpers/clock";

describe("fixed clock", () => {
  it("returns the configured instant without sharing mutable Date instances", () => {
    const clock = createFixedClock("2026-05-28T10:30:00+02:00");

    const first = clock.now();
    first.setUTCFullYear(2030);

    expect(clock.now().toISOString()).toBe("2026-05-28T08:30:00.000Z");
  });
});
