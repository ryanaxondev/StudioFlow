import type { WorkerProcessor } from "../../worker/runtime/processor";

export async function runWorkerProcessor<TPayload>(
  processor: WorkerProcessor<TPayload>,
  payload: TPayload,
  attempt = 1,
): Promise<void> {
  const controller = new AbortController();

  await processor.process(payload, {
    attempt,
    signal: controller.signal,
  });
}
