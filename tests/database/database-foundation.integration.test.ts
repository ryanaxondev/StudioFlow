import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";

import { normalizeDatabaseError } from "../../src/db/errors";
import { sessions, users } from "../../src/db/schema";
import { withTransaction } from "../../src/db/transactions";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

describe("database foundation", () => {
  let testDatabase: MigratedTestDatabase;

  beforeAll(async () => {
    testDatabase = await createMigratedTestDatabase();
  });

  beforeEach(async () => {
    const client = await testDatabase.database.pool.connect();
    try {
      await resetPublicSchemaData(client);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    await testDatabase?.drop();
  });

  it("rolls back a failed transaction", async () => {
    await expect(
      withTransaction(testDatabase.database, async ({ db }) => {
        await db.insert(users).values({
          name: "Rollback Probe",
          email: "rollback@example.com",
        });
        throw new Error("force rollback");
      }),
    ).rejects.toThrow("force rollback");

    const rows = await testDatabase.database.db.select().from(users);
    expect(rows).toHaveLength(0);
  });

  it("creates UUID primary keys and preserves UTC instants", async () => {
    const expiresAt = new Date("2026-08-09T18:30:00.000Z");
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({ name: "UTC Probe", email: "utc@example.com" })
      .returning({ id: users.id });

    expect(user?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    await testDatabase.database.db.insert(sessions).values({
      userId: user!.id,
      token: "utc-session-token",
      expiresAt,
    });

    const result = await testDatabase.database.pool.query<{ epoch: string }>(
      `SELECT extract(epoch FROM expires_at)::text AS epoch
         FROM sessions
        WHERE token = $1`,
      ["utc-session-token"],
    );

    expect(Number(result.rows[0]?.epoch) * 1000).toBe(expiresAt.getTime());
  });

  it("normalizes PostgreSQL constraint errors", async () => {
    await testDatabase.database.db.insert(users).values({
      name: "First",
      email: "duplicate@example.com",
    });

    let caught: unknown;
    try {
      await testDatabase.database.db.insert(users).values({
        name: "Second",
        email: "duplicate@example.com",
      });
    } catch (error) {
      caught = error;
    }

    expect(normalizeDatabaseError(caught)).toMatchObject({
      kind: "unique_violation",
      code: "23505",
      constraint: "users_email_normalized_unique",
      retryable: false,
    });
  });
  it("enforces foundational schema constraints", async () => {
    await expect(
      testDatabase.database.pool.query(
        `INSERT INTO users (display_name, email_normalized)
         VALUES ($1, $2)`,
        ["Constraint Probe", "Not-Normalized@Example.COM"],
      ),
    ).rejects.toMatchObject({ code: "23514" });

    const userResult = await testDatabase.database.pool.query<{ id: string }>(
      `INSERT INTO users (display_name, email_normalized)
       VALUES ($1, $2)
       RETURNING id`,
      ["Constraint Actor", "constraint@example.com"],
    );
    const actorId = userResult.rows[0]!.id;

    await expect(
      testDatabase.database.pool.query(
        `INSERT INTO idempotency_records
          (actor_id, command_type, idempotency_key, request_fingerprint, expires_at)
         VALUES ($1, 'probe', 'invalid-expiry', repeat('a', 64), CURRENT_TIMESTAMP - interval '1 minute')`,
        [actorId],
      ),
    ).rejects.toMatchObject({ code: "23514" });

    await expect(
      testDatabase.database.pool.query(
        `INSERT INTO outbox_events
          (aggregate_type, aggregate_id, event_type, payload, max_attempts)
         VALUES ('probe', gen_random_uuid(), 'probe.invalid', '{}'::jsonb, 0)`,
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });
});
