import { Client } from "pg";
import { describe, expect, it } from "vitest";

import {
  applyMigrations,
  readMigrationFiles,
} from "../../src/db/migrations/runner";
import { createDisposableTestDatabase } from "../helpers/database";

describe.sequential("M04 migration integrity", () => {
  it("applies all approved migrations to an empty database", async () => {
    const database = await createDisposableTestDatabase();

    try {
      const result = await applyMigrations({
        connectionString: database.connectionString,
      });
      expect(result.applied).toEqual([
        "0001_extensions_and_system.sql",
        "0002_identity_foundation.sql",
        "0003_outbox_and_idempotency.sql",
      ]);

      const client = new Client({
        connectionString: database.connectionString,
      });
      await client.connect();
      try {
        const extension = await client.query<{ installed: boolean }>(
          "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS installed",
        );
        expect(extension.rows[0]?.installed).toBe(true);

        const tables = await client.query<{ tablename: string }>(
          `SELECT tablename
             FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename`,
        );
        expect(tables.rows.map((row) => row.tablename)).toEqual([
          "accounts",
          "idempotency_records",
          "outbox_events",
          "sessions",
          "studioflow_migrations",
          "users",
          "verifications",
        ]);
      } finally {
        await client.end();
      }
    } finally {
      await database.drop();
    }
  });

  it("replays without reapplying immutable migrations", async () => {
    const database = await createDisposableTestDatabase();

    try {
      await applyMigrations({ connectionString: database.connectionString });
      const replay = await applyMigrations({
        connectionString: database.connectionString,
      });

      expect(replay.applied).toEqual([]);
      expect(replay.skipped).toHaveLength(3);
    } finally {
      await database.drop();
    }
  });

  it("applies later migrations to the previous schema deterministically", async () => {
    const database = await createDisposableTestDatabase();

    try {
      const first = await applyMigrations({
        connectionString: database.connectionString,
        targetVersion: 1,
      });
      expect(first.applied).toEqual(["0001_extensions_and_system.sql"]);

      const remaining = await applyMigrations({
        connectionString: database.connectionString,
      });
      expect(remaining.applied).toEqual([
        "0002_identity_foundation.sql",
        "0003_outbox_and_idempotency.sql",
      ]);

      const files = await readMigrationFiles();
      expect(files.map((migration) => migration.version)).toEqual([1, 2, 3]);
    } finally {
      await database.drop();
    }
  });
});
