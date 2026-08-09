import { z } from "zod";

const postgresUrl = z
  .string()
  .min(1)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "postgres:" || protocol === "postgresql:";
    } catch {
      return false;
    }
  }, "Expected a PostgreSQL connection URL");

const rawDatabaseEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: postgresUrl.optional(),
  MIGRATION_DATABASE_URL: postgresUrl.optional(),
  WORKER_DATABASE_URL: postgresUrl.optional(),
});

const localDefaults = {
  DATABASE_URL:
    "postgresql://studioflow_app:studioflow_app_dev@127.0.0.1:5432/studioflow",
  MIGRATION_DATABASE_URL:
    "postgresql://studioflow_migrator:studioflow_migrator_dev@127.0.0.1:5432/studioflow",
  WORKER_DATABASE_URL:
    "postgresql://studioflow_worker:studioflow_worker_dev@127.0.0.1:5432/studioflow",
} as const;

type DatabaseUrlKey = keyof typeof localDefaults;
type EnvironmentInput = Readonly<Record<string, string | undefined>>;
type RawDatabaseEnvironment = z.infer<typeof rawDatabaseEnvironmentSchema>;

export type ApplicationDatabaseEnvironment = Readonly<{
  DATABASE_URL: string;
}>;

export type WorkerDatabaseEnvironment = Readonly<{
  WORKER_DATABASE_URL: string;
}>;

export type MigrationDatabaseEnvironment = Readonly<{
  DATABASE_URL: string;
  MIGRATION_DATABASE_URL: string;
  WORKER_DATABASE_URL: string;
}>;

function parseRawEnvironment(
  environment: EnvironmentInput,
): RawDatabaseEnvironment {
  return rawDatabaseEnvironmentSchema.parse(environment);
}

function resolveDatabaseUrl(
  environment: RawDatabaseEnvironment,
  key: DatabaseUrlKey,
): string {
  const value = environment[key];

  if (environment.NODE_ENV === "production") {
    return postgresUrl.parse(value);
  }

  return value ?? localDefaults[key];
}

export function parseApplicationDatabaseEnvironment(
  environment: EnvironmentInput,
): ApplicationDatabaseEnvironment {
  const raw = parseRawEnvironment(environment);

  return {
    DATABASE_URL: resolveDatabaseUrl(raw, "DATABASE_URL"),
  };
}

export function parseWorkerDatabaseEnvironment(
  environment: EnvironmentInput,
): WorkerDatabaseEnvironment {
  const raw = parseRawEnvironment(environment);

  return {
    WORKER_DATABASE_URL: resolveDatabaseUrl(raw, "WORKER_DATABASE_URL"),
  };
}

export function parseMigrationDatabaseEnvironment(
  environment: EnvironmentInput,
): MigrationDatabaseEnvironment {
  const raw = parseRawEnvironment(environment);

  return {
    DATABASE_URL: resolveDatabaseUrl(raw, "DATABASE_URL"),
    MIGRATION_DATABASE_URL: resolveDatabaseUrl(raw, "MIGRATION_DATABASE_URL"),
    WORKER_DATABASE_URL: resolveDatabaseUrl(raw, "WORKER_DATABASE_URL"),
  };
}
