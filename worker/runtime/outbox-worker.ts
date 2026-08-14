import type { DatabaseClient } from "../../src/db/client";
import type { Clock } from "../../src/lib/clock";
import {
  claimOutboxEvents,
  markOutboxFailed,
  markOutboxProcessed,
  rescheduleOutboxEvent,
  type ClaimedOutboxEvent,
} from "../../src/db/repositories/outbox";
import type { Logger } from "../../src/server/observability/logger";
import type { ProcessorRegistry } from "./registry";
import { retryAvailableAt } from "./retry";

export type OutboxWorkerOptions = Readonly<{
  database: DatabaseClient;
  registry: ProcessorRegistry;
  logger: Logger;
  clock: Clock;
  workerId: string;
  pollIntervalMs?: number;
  batchSize?: number;
  leaseMs?: number;
  shutdownTimeoutMs?: number;
}>;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function processEvent(
  event: ClaimedOutboxEvent,
  options: OutboxWorkerOptions,
  processorSignal: AbortSignal,
): Promise<void> {
  const processor = options.registry.get(event.eventType);

  if (!processor) {
    const markedFailed = await markOutboxFailed(options.database, {
      eventId: event.id,
      workerId: options.workerId,
      failedAt: options.clock.now(),
      lastError: `No processor registered for event type: ${event.eventType}`,
    });
    options.logger.error("worker.outbox.processor_missing", {
      eventId: event.id,
      eventType: event.eventType,
      persistedFailure: markedFailed,
    });
    return;
  }

  try {
    await processor.process(event.payload, {
      attempt: event.attemptCount,
      signal: processorSignal,
    });

    const markedProcessed = await markOutboxProcessed(
      options.database,
      event.id,
      options.workerId,
      options.clock.now(),
    );

    if (!markedProcessed) {
      options.logger.warn("worker.outbox.lease_lost_after_processing", {
        eventId: event.id,
        eventType: event.eventType,
        attempt: event.attemptCount,
      });
      return;
    }

    options.logger.info("worker.outbox.processed", {
      eventId: event.id,
      eventType: event.eventType,
      attempt: event.attemptCount,
    });
  } catch (error) {
    const lastError = errorMessage(error);

    if (event.attemptCount >= event.maxAttempts) {
      const markedFailed = await markOutboxFailed(options.database, {
        eventId: event.id,
        workerId: options.workerId,
        lastError,
        failedAt: options.clock.now(),
      });
      options.logger.error("worker.outbox.failed", {
        eventId: event.id,
        eventType: event.eventType,
        attempt: event.attemptCount,
        error: lastError,
        persistedFailure: markedFailed,
      });
      return;
    }

    const availableAt = retryAvailableAt(
      event.attemptCount,
      options.clock.now(),
    );
    const rescheduled = await rescheduleOutboxEvent(options.database, {
      eventId: event.id,
      workerId: options.workerId,
      availableAt,
      lastError,
    });
    options.logger.warn("worker.outbox.retry_scheduled", {
      eventId: event.id,
      eventType: event.eventType,
      attempt: event.attemptCount,
      availableAt: availableAt.toISOString(),
      error: lastError,
      persistedRetry: rescheduled,
    });
  }
}

export async function runOutboxWorker(
  options: OutboxWorkerOptions,
  shutdownSignal: AbortSignal,
): Promise<void> {
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const batchSize = options.batchSize ?? 10;
  const leaseMs = options.leaseMs ?? 60_000;
  const shutdownTimeoutMs = options.shutdownTimeoutMs ?? 30_000;
  const processorController = new AbortController();

  while (!shutdownSignal.aborted) {
    const claimed = await claimOutboxEvents(options.database, {
      workerId: options.workerId,
      limit: batchSize,
      leaseMs,
      now: options.clock.now(),
      eventTypes: options.registry.names(),
    });

    if (claimed.length === 0) {
      await sleep(pollIntervalMs, shutdownSignal);
      continue;
    }

    const processing = Promise.allSettled(
      claimed.map((event) =>
        processEvent(event, options, processorController.signal),
      ),
    );

    let removeShutdownListener: () => void = () => {};
    const shutdownRequested = new Promise<false>((resolve) => {
      const listener = () => resolve(false);
      shutdownSignal.addEventListener("abort", listener, { once: true });
      removeShutdownListener = () =>
        shutdownSignal.removeEventListener("abort", listener);
    });

    const batchCompleted = await Promise.race([
      processing.then(() => true as const),
      shutdownRequested,
    ]);
    removeShutdownListener();

    if (batchCompleted) {
      continue;
    }

    const completedBeforeTimeout = await Promise.race([
      processing.then(() => true),
      sleep(shutdownTimeoutMs, new AbortController().signal).then(() => false),
    ]);

    if (!completedBeforeTimeout) {
      processorController.abort();
      options.logger.warn("worker.shutdown.processor_timeout", {
        workerId: options.workerId,
        shutdownTimeoutMs,
      });
      return;
    }
  }
}
