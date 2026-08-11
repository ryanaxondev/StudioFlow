import { randomUUID } from "node:crypto";

import { createDatabaseClient } from "../../src/db/client";
import { parseWorkerDatabaseEnvironment } from "../../src/db/config";
import { systemClock } from "../../src/lib/clock";
import { createRuntimeAuthenticationEmailTransport } from "../../src/modules/auth/email";
import { parseAuthenticationMessageEnvironment } from "../../src/modules/auth/environment";
import { createRuntimeInvitationEmailTransport } from "../../src/modules/invitations/email";
import {
  CLIENT_INVITATION_DELIVERY_EVENT,
  WORKSPACE_INVITATION_DELIVERY_EVENT,
} from "../../src/modules/invitations/email-outbox";
import { logger } from "../../src/server/observability/logger";
import { createAuthenticationEmailProcessor } from "../processors/authentication-email";
import { createInvitationEmailProcessor } from "../processors/invitation-email";
import { runOutboxWorker } from "./outbox-worker";
import { ProcessorRegistry } from "./registry";

export async function startWorker(): Promise<void> {
  const databaseEnvironment = parseWorkerDatabaseEnvironment(process.env);
  const authenticationMessageEnvironment =
    parseAuthenticationMessageEnvironment(process.env);
  const database = createDatabaseClient({
    connectionString: databaseEnvironment.WORKER_DATABASE_URL,
    applicationName: "studioflow-worker",
  });
  const registry = new ProcessorRegistry();
  const shutdownController = new AbortController();
  const workerId = `worker-${randomUUID()}`;

  registry.register(
    createAuthenticationEmailProcessor({
      encryptionSecret:
        authenticationMessageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
      emailTransport: createRuntimeAuthenticationEmailTransport(
        authenticationMessageEnvironment.NODE_ENV,
      ),
    }),
  );

  const invitationEmailTransport = createRuntimeInvitationEmailTransport(
    authenticationMessageEnvironment.NODE_ENV,
  );
  for (const eventType of [
    WORKSPACE_INVITATION_DELIVERY_EVENT,
    CLIENT_INVITATION_DELIVERY_EVENT,
  ] as const) {
    registry.register(
      createInvitationEmailProcessor(eventType, {
        encryptionSecret:
          authenticationMessageEnvironment.AUTH_MESSAGE_ENCRYPTION_SECRET,
        emailTransport: invitationEmailTransport,
      }),
    );
  }

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
