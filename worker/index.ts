import { logger } from "../src/server/observability/logger";

export function startWorker(): void {
  logger.info("worker.started", {
    service: "worker",
  });
}

startWorker();
