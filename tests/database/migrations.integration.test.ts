import { Client } from "pg";
import { describe, expect, it } from "vitest";

import {
  applyMigrations,
  readMigrationFiles,
} from "../../src/db/migrations/runner";
import { createDisposableTestDatabase } from "../helpers/database";

const approvedImplementedMigrations = [
  "0001_extensions_and_system.sql",
  "0002_identity_foundation.sql",
  "0003_outbox_and_idempotency.sql",
  "0004_workspaces_and_members.sql",
  "0005_clients_and_invitations.sql",
  "0006_projects_memberships_and_activity.sql",
  "0007_milestones.sql",
] as const;

describe.sequential("migration integrity through M10", () => {
  it("applies all implemented migrations to an empty database", async () => {
    const database = await createDisposableTestDatabase();

    try {
      const result = await applyMigrations({
        connectionString: database.connectionString,
      });
      expect(result.applied).toEqual(approvedImplementedMigrations);

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
          "activity_events",
          "client_members",
          "client_organizations",
          "idempotency_records",
          "invitations",
          "milestones",
          "outbox_events",
          "project_members",
          "projects",
          "sessions",
          "studioflow_migrations",
          "users",
          "verifications",
          "workspace_branding",
          "workspace_members",
          "workspaces",
        ]);

        const outboxWorkspaceForeignKey = await client.query<{
          exists: boolean;
        }>(
          `SELECT EXISTS (
             SELECT 1
               FROM pg_constraint
              WHERE conname = 'outbox_events_workspace_id_workspaces_id_fk'
                AND conrelid = 'outbox_events'::regclass
                AND confrelid = 'workspaces'::regclass
           ) AS exists`,
        );
        expect(outboxWorkspaceForeignKey.rows[0]?.exists).toBe(true);
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
      expect(replay.skipped).toHaveLength(7);
    } finally {
      await database.drop();
    }
  });

  it("applies later migrations incrementally after the async foundation", async () => {
    const database = await createDisposableTestDatabase();

    try {
      const foundation = await applyMigrations({
        connectionString: database.connectionString,
        targetVersion: 3,
      });
      expect(foundation.applied).toEqual(
        approvedImplementedMigrations.slice(0, 3),
      );

      const remaining = await applyMigrations({
        connectionString: database.connectionString,
      });
      expect(remaining.applied).toEqual(approvedImplementedMigrations.slice(3));

      const files = await readMigrationFiles();
      expect(files.map((migration) => migration.version)).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
      expect(files.slice(0, 3).map((migration) => migration.name)).toEqual(
        approvedImplementedMigrations.slice(0, 3),
      );
    } finally {
      await database.drop();
    }
  });
});
