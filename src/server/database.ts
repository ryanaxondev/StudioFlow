import "server-only";

import { createDatabaseClient, type DatabaseClient } from "../db/client";
import { parseApplicationDatabaseEnvironment } from "../db/config";
import { logger } from "./observability/logger";

const globalDatabase = globalThis as typeof globalThis & {
  studioflowDatabase?: DatabaseClient;
};

export function getApplicationDatabase(): DatabaseClient {
  if (!globalDatabase.studioflowDatabase) {
    const environment = parseApplicationDatabaseEnvironment(process.env);
    const database = createDatabaseClient({
      connectionString: environment.DATABASE_URL,
      applicationName: "studioflow-web",
    });

    database.pool.on("error", (error) => {
      logger.error("database.pool.error", {
        service: "web",
        message: error.message,
      });
    });

    globalDatabase.studioflowDatabase = database;
  }

  return globalDatabase.studioflowDatabase;
}
