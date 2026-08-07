import { describe, expect, it, vi } from "vitest";

import type { WorkerProcessor } from "../../worker/runtime/processor";
import { runWorkerProcessor } from "../helpers/worker";

describe("worker processor harness", () => {
  it("runs a processor with deterministic context", async () => {
    const process = vi.fn(async () => undefined);
    const processor: WorkerProcessor<{ eventId: string }> = {
      name: "sample",
      process,
    };

    await runWorkerProcessor(processor, { eventId: "evt_test_001" }, 2);

    expect(process).toHaveBeenCalledTimes(1);
    expect(process).toHaveBeenCalledWith(
      { eventId: "evt_test_001" },
      expect.objectContaining({
        attempt: 2,
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
