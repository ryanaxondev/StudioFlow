import { describe, expect, it } from "vitest";

import {
  parseApplicationDatabaseEnvironment,
  parseMigrationDatabaseEnvironment,
  parseWorkerDatabaseEnvironment,
} from "../../src/db/config";

describe("database environment", () => {
  it("uses safe local defaults outside production", () => {
    const application = parseApplicationDatabaseEnvironment({
      NODE_ENV: "test",
    });
    const worker = parseWorkerDatabaseEnvironment({ NODE_ENV: "test" });
    const migration = parseMigrationDatabaseEnvironment({ NODE_ENV: "test" });

    expect(application.DATABASE_URL).toContain("studioflow_app");
    expect(worker.WORKER_DATABASE_URL).toContain("studioflow_worker");
    expect(migration.MIGRATION_DATABASE_URL).toContain("studioflow_migrator");
  });

  it("requires only the application credential for the production Web runtime", () => {
    const environment = parseApplicationDatabaseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://web:secret@database.internal/studioflow",
    });

    expect(environment.DATABASE_URL).toContain("web:secret");
  });

  it("requires only the Worker credential for the production Worker runtime", () => {
    const environment = parseWorkerDatabaseEnvironment({
      NODE_ENV: "production",
      WORKER_DATABASE_URL:
        "postgresql://worker:secret@database.internal/studioflow",
    });

    expect(environment.WORKER_DATABASE_URL).toContain("worker:secret");
  });

  it("requires all release credentials for production migrations", () => {
    expect(() =>
      parseMigrationDatabaseEnvironment({
        NODE_ENV: "production",
        MIGRATION_DATABASE_URL:
          "postgresql://migrator:secret@database.internal/studioflow",
      }),
    ).toThrow();
  });
});
