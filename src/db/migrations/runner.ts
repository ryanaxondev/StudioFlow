import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Client } from "pg";

const migrationPattern = /^(\d{4})_[a-z0-9_]+\.sql$/;
const migrationLockKey = "studioflow:migrations";

export type MigrationFile = Readonly<{
  version: number;
  name: string;
  checksum: string;
  sql: string;
}>;

export type MigrationRunResult = Readonly<{
  applied: readonly string[];
  skipped: readonly string[];
}>;

export type ApplyMigrationsOptions = Readonly<{
  connectionString: string;
  migrationsDirectory?: string;
  targetVersion?: number;
}>;

function checksumSql(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export async function readMigrationFiles(
  migrationsDirectory = resolve(process.cwd(), "src/db/migrations"),
): Promise<readonly MigrationFile[]> {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  const migrations: MigrationFile[] = [];

  for (const [index, name] of names.entries()) {
    const match = migrationPattern.exec(name);
    if (!match) {
      throw new Error(`Invalid migration filename: ${name}`);
    }

    const version = Number(match[1]);
    if (version !== index + 1) {
      throw new Error(
        `Migration sequence must be contiguous from 0001. Expected ${String(index + 1).padStart(4, "0")}, found ${match[1]}.`,
      );
    }

    const sql = await readFile(resolve(migrationsDirectory, name), "utf8");
    migrations.push({ version, name, checksum: checksumSql(sql), sql });
  }

  return migrations;
}

async function migrationHistoryExists(client: Client): Promise<boolean> {
  const result = await client.query<{ relation_name: string | null }>(
    "SELECT to_regclass('public.studioflow_migrations')::text AS relation_name",
  );

  return result.rows[0]?.relation_name === "studioflow_migrations";
}

async function loadAppliedMigrations(
  client: Client,
): Promise<ReadonlyMap<number, Readonly<{ name: string; checksum: string }>>> {
  if (!(await migrationHistoryExists(client))) {
    return new Map();
  }

  const result = await client.query<{
    version: number;
    name: string;
    checksum: string;
  }>(
    "SELECT version, name, checksum FROM studioflow_migrations ORDER BY version",
  );

  return new Map(
    result.rows.map((row) => [
      row.version,
      { name: row.name, checksum: row.checksum },
    ]),
  );
}

export async function applyMigrations(
  options: ApplyMigrationsOptions,
): Promise<MigrationRunResult> {
  const migrations = await readMigrationFiles(options.migrationsDirectory);
  const selectedMigrations = options.targetVersion
    ? migrations.filter(
        (migration) => migration.version <= options.targetVersion!,
      )
    : migrations;
  const client = new Client({
    connectionString: options.connectionString,
    application_name: "studioflow-migrator",
  });

  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock(hashtext($1))", [
      migrationLockKey,
    ]);

    const appliedMigrations = await loadAppliedMigrations(client);
    const knownVersions = new Set(
      migrations.map((migration) => migration.version),
    );

    for (const version of appliedMigrations.keys()) {
      if (!knownVersions.has(version)) {
        throw new Error(
          `Database contains migration ${version} that is not present in the repository.`,
        );
      }
    }

    const applied: string[] = [];
    const skipped: string[] = [];

    for (const migration of selectedMigrations) {
      const existing = appliedMigrations.get(migration.version);

      if (existing) {
        if (
          existing.name !== migration.name ||
          existing.checksum !== migration.checksum
        ) {
          throw new Error(
            `Applied migration ${migration.name} no longer matches its recorded name/checksum. Migration files are immutable after application.`,
          );
        }

        skipped.push(migration.name);
        continue;
      }

      await client.query("BEGIN");

      try {
        await client.query(migration.sql);
        await client.query(
          `INSERT INTO studioflow_migrations (version, name, checksum)
           VALUES ($1, $2, $3)`,
          [migration.version, migration.name, migration.checksum],
        );
        await client.query("COMMIT");
        applied.push(migration.name);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    return { applied, skipped };
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(hashtext($1))", [
        migrationLockKey,
      ]);
    } finally {
      await client.end();
    }
  }
}
