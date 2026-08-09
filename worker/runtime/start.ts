import { randomUUID } from "node:crypto";

import { createDatabaseClient } from "../../src/db/client";
import { parseWorkerDatabaseEnvironment } from "../../src/db/config";
import { systemClock } from "../../src/lib/clock";
import { logger } from "../../src/server/observability/logger";
import { runOutboxWorker } from "./outbox-worker";
import { ProcessorRegistry } from "./registry";

export async function startWorker(): Promise<void> {
  const environment = parseWorkerDatabaseEnvironment(process.env);
  const database = createDatabaseClient({
    connectionString: environment.WORKER_DATABASE_URL,
    applicationName: "studioflow-worker",
  });
  const registry = new ProcessorRegistry();
  const shutdownController = new AbortController();
  const workerId = `worker-${randomUUID()}`;

  const requestShutdown = (signal: string) => {
    logger.info("worker.shutdown.requested", { signal, workerId });
    shutdownController.abort();
  };

  process.once("SIGINT", () => requestShutdown("SIGINT"));
  process.once("SIGTERM", () => requestShutdown("SIGTERM"));

  database.pool.on("error", (error) => {
    logger.error("database.pool.error", {
      service: "worker",
      workerId,
      message: error.message,
    });
  });

  logger.info("worker.started", {
    service: "worker",
    workerId,
    processors: registry.names(),
  });

  try {
    await runOutboxWorker(
      {
        database,
        registry,
        logger,
        clock: systemClock,
        workerId,
      },
      shutdownController.signal,
    );
  } finally {
    await database.close();
    logger.info("worker.stopped", { service: "worker", workerId });
  }
}
