import { parseMigrationDatabaseEnvironment } from "../../src/db/config";
import { applyMigrations } from "../../src/db/migrations/runner";
import { applyRuntimePrivileges } from "../../src/db/runtime-privileges";

async function main(): Promise<void> {
  const environment = parseMigrationDatabaseEnvironment(process.env);
  const result = await applyMigrations({
    connectionString: environment.MIGRATION_DATABASE_URL,
  });

  const privileges = await applyRuntimePrivileges({
    migrationConnectionString: environment.MIGRATION_DATABASE_URL,
    appConnectionString: environment.DATABASE_URL,
    workerConnectionString: environment.WORKER_DATABASE_URL,
    strict: process.env.NODE_ENV === "production",
  });

  console.log(
    result.applied.length > 0
      ? `Applied migrations: ${result.applied.join(", ")}`
      : "Database migrations are already up to date.",
  );
  console.log(
    `Runtime grants: app=${privileges.appRoleApplied ? "applied" : "role-not-found"}, worker=${privileges.workerRoleApplied ? "applied" : "role-not-found"}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
