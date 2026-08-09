import { randomUUID } from "node:crypto";

import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  completeIdempotencyRecord,
  createRequestFingerprint,
  reserveIdempotencyRecord,
} from "../../src/db/repositories/idempotency";
import {
  claimOutboxEvents,
  insertOutboxEvent,
} from "../../src/db/repositories/outbox";
import { users } from "../../src/db/schema";
import { withTransaction } from "../../src/db/transactions";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

describe("transactional outbox and idempotency", () => {
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

  it("commits an Outbox Event with its domain transaction", async () => {
    const aggregateId = randomUUID();

    await withTransaction(testDatabase.database, async ({ db }) => {
      await insertOutboxEvent(db, {
        aggregateType: "test_aggregate",
        aggregateId,
        eventType: "test.created",
        payload: { aggregateId },
      });
    });

    const result = await testDatabase.database.pool.query<{ count: string }>(
      "SELECT count(*) FROM outbox_events",
    );
    expect(Number(result.rows[0]?.count)).toBe(1);
  });

  it("leaves no Outbox Event when the domain transaction fails", async () => {
    await expect(
      withTransaction(testDatabase.database, async ({ db }) => {
        await insertOutboxEvent(db, {
          aggregateType: "test_aggregate",
          aggregateId: randomUUID(),
          eventType: "test.failed",
          payload: { shouldPersist: false },
        });
        throw new Error("domain failure");
      }),
    ).rejects.toThrow("domain failure");

    const result = await testDatabase.database.pool.query<{ count: string }>(
      "SELECT count(*) FROM outbox_events",
    );
    expect(Number(result.rows[0]?.count)).toBe(0);
  });

  it("replays the prior result for the same idempotency fingerprint", async () => {
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({ name: "Idempotent Actor", email: "actor@example.com" })
      .returning({ id: users.id });
    const fingerprint = createRequestFingerprint({
      value: 42,
      nested: { b: 2, a: 1 },
    });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await withTransaction(testDatabase.database, async ({ db }) => {
      const reservation = await reserveIdempotencyRecord(db, {
        actorId: user!.id,
        commandType: "test.command",
        idempotencyKey: "idem-001",
        requestFingerprint: fingerprint,
        expiresAt,
      });
      expect(reservation.kind).toBe("new");

      if (reservation.kind === "new") {
        await completeIdempotencyRecord(db, reservation.recordId, {
          objectId: "result-001",
        });
      }
    });

    const replay = await withTransaction(testDatabase.database, ({ db }) =>
      reserveIdempotencyRecord(db, {
        actorId: user!.id,
        commandType: "test.command",
        idempotencyKey: "idem-001",
        requestFingerprint: createRequestFingerprint({
          nested: { a: 1, b: 2 },
          value: 42,
        }),
        expiresAt,
      }),
    );

    expect(replay).toMatchObject({
      kind: "replay",
      resultReference: { objectId: "result-001" },
    });
  });

  it("returns conflict when an idempotency key is reused with another payload", async () => {
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({ name: "Conflict Actor", email: "conflict@example.com" })
      .returning({ id: users.id });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await withTransaction(testDatabase.database, async ({ db }) => {
      const reservation = await reserveIdempotencyRecord(db, {
        actorId: user!.id,
        commandType: "test.command",
        idempotencyKey: "idem-conflict",
        requestFingerprint: createRequestFingerprint({ value: 1 }),
        expiresAt,
      });
      if (reservation.kind !== "new") {
        throw new Error("Expected a new idempotency reservation.");
      }
      await completeIdempotencyRecord(db, reservation.recordId, {
        objectId: "result-001",
      });
    });

    const conflict = await withTransaction(testDatabase.database, ({ db }) =>
      reserveIdempotencyRecord(db, {
        actorId: user!.id,
        commandType: "test.command",
        idempotencyKey: "idem-conflict",
        requestFingerprint: createRequestFingerprint({ value: 2 }),
        expiresAt,
      }),
    );

    expect(conflict.kind).toBe("conflict");
  });

  it("claims around a locked row with FOR UPDATE SKIP LOCKED", async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const now = new Date("2026-08-09T18:00:00.000Z");

    await testDatabase.database.pool.query(
      `INSERT INTO outbox_events
        (id, aggregate_type, aggregate_id, event_type, payload, available_at, created_at)
       VALUES
        ($1, 'probe', $1, 'probe.first', '{}'::jsonb, $3, $3),
        ($2, 'probe', $2, 'probe.second', '{}'::jsonb, $4, $4)`,
      [
        firstId,
        secondId,
        new Date(now.getTime() - 2_000),
        new Date(now.getTime() - 1_000),
      ],
    );

    const lockingClient = new Client({
      connectionString: testDatabase.connectionString,
    });
    await lockingClient.connect();
    await lockingClient.query("BEGIN");

    try {
      await lockingClient.query(
        "SELECT id FROM outbox_events WHERE id = $1 FOR UPDATE",
        [firstId],
      );

      const claimed = await claimOutboxEvents(testDatabase.database, {
        workerId: "worker-b",
        limit: 1,
        leaseMs: 60_000,
        now,
      });

      expect(claimed.map((event) => event.id)).toEqual([secondId]);
    } finally {
      await lockingClient.query("ROLLBACK");
      await lockingClient.end();
    }
  });

  it("recovers an Outbox Event after its Worker lease expires", async () => {
    const eventId = randomUUID();
    const firstClaimAt = new Date("2026-08-09T18:00:00.000Z");

    await testDatabase.database.pool.query(
      `INSERT INTO outbox_events
        (id, aggregate_type, aggregate_id, event_type, payload, available_at)
       VALUES ($1, 'probe', $1, 'probe.lease', '{}'::jsonb, $2)`,
      [eventId, new Date(firstClaimAt.getTime() - 1_000)],
    );

    const firstClaim = await claimOutboxEvents(testDatabase.database, {
      workerId: "worker-a",
      limit: 1,
      leaseMs: 1_000,
      now: firstClaimAt,
    });
    expect(firstClaim[0]?.lockedBy).toBe("worker-a");

    const recovered = await claimOutboxEvents(testDatabase.database, {
      workerId: "worker-b",
      limit: 1,
      leaseMs: 1_000,
      now: new Date(firstClaimAt.getTime() + 2_000),
    });

    expect(recovered).toHaveLength(1);
    expect(recovered[0]).toMatchObject({
      id: eventId,
      lockedBy: "worker-b",
      attemptCount: 2,
    });
  });
});
