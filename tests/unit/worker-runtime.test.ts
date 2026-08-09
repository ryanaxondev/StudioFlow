import { describe, expect, it } from "vitest";

import { ProcessorRegistry } from "../../worker/runtime/registry";
import { retryDelayMs } from "../../worker/runtime/retry";

describe("worker runtime foundation", () => {
  it("uses the approved retry schedule", () => {
    expect([1, 2, 3, 4, 5, 6].map(retryDelayMs)).toEqual([
      60_000, 300_000, 900_000, 3_600_000, 21_600_000, 86_400_000,
    ]);
  });

  it("rejects duplicate processor registrations", () => {
    const registry = new ProcessorRegistry();
    const processor = {
      name: "sample",
      process: async () => undefined,
    };

    registry.register(processor);
    expect(() => registry.register(processor)).toThrow(
      "Worker processor already registered",
    );
  });
});
