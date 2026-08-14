import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Logger } from "../../src/server/observability/logger";
import { runOutboxWorker } from "../../worker/runtime/outbox-worker";
import { ProcessorRegistry } from "../../worker/runtime/registry";
import { resetPublicSchemaData } from "../helpers/database-reset";
import { createFixedClock } from "../helpers/clock";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const silentLogger: Logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

describe("outbox Worker runtime", () => {
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

  it("processes a claimed event and records completion", async () => {
    const now = new Date("2026-08-09T18:00:00.000Z");
    const eventId = randomUUID();
    const shutdown = new AbortController();
    const registry = new ProcessorRegistry();
    let processedPayload: unknown;

    registry.register({
      name: "probe.process",
      async process(payload) {
        processedPayload = payload;
        shutdown.abort();
      },
    });

    await testDatabase.database.pool.query(
      `INSERT INTO outbox_events
        (id, aggregate_type, aggregate_id, event_type, payload, available_at)
       VALUES ($1, 'probe', $1, 'probe.process', $2::jsonb, $3)`,
      [eventId, JSON.stringify({ value: 42 }), new Date(now.getTime() - 1_000)],
    );

    await runOutboxWorker(
      {
        database: testDatabase.database,
        registry,
        logger: silentLogger,
        clock: createFixedClock(now),
        workerId: "worker-runtime-test",
        pollIntervalMs: 5,
        leaseMs: 1_000,
        shutdownTimeoutMs: 1_000,
      },
      shutdown.signal,
    );

    expect(processedPayload).toEqual({ value: 42 });
    const result = await testDatabase.database.pool.query<{
      processed_at: Date | null;
      attempt_count: number;
      locked_by: string | null;
    }>(
      `SELECT processed_at, attempt_count, locked_by
         FROM outbox_events
        WHERE id = $1`,
      [eventId],
    );

    expect(result.rows[0]?.processed_at).not.toBeNull();
    expect(result.rows[0]?.attempt_count).toBe(1);
    expect(result.rows[0]?.locked_by).toBeNull();
  });

  it("persists retry metadata after a processor failure", async () => {
    const now = new Date("2026-08-09T18:00:00.000Z");
    const eventId = randomUUID();
    const shutdown = new AbortController();
    const registry = new ProcessorRegistry();

    registry.register({
      name: "probe.retry",
      async process() {
        shutdown.abort();
        throw new Error("transient probe failure");
      },
    });

    await testDatabase.database.pool.query(
      `INSERT INTO outbox_events
        (id, aggregate_type, aggregate_id, event_type, payload, available_at)
       VALUES ($1, 'probe', $1, 'probe.retry', '{}'::jsonb, $2)`,
      [eventId, new Date(now.getTime() - 1_000)],
    );

    await runOutboxWorker(
      {
        database: testDatabase.database,
        registry,
        logger: silentLogger,
        clock: createFixedClock(now),
        workerId: "worker-retry-test",
        pollIntervalMs: 5,
        leaseMs: 1_000,
        shutdownTimeoutMs: 1_000,
      },
      shutdown.signal,
    );

    const result = await testDatabase.database.pool.query<{
      available_at: Date;
      attempt_count: number;
      locked_by: string | null;
      last_error: string | null;
    }>(
      `SELECT available_at, attempt_count, locked_by, last_error
         FROM outbox_events
        WHERE id = $1`,
      [eventId],
    );

    expect(result.rows[0]?.available_at.getTime()).toBe(now.getTime() + 60_000);
    expect(result.rows[0]?.attempt_count).toBe(1);
    expect(result.rows[0]?.locked_by).toBeNull();
    expect(result.rows[0]?.last_error).toBe("transient probe failure");
  });
  it("leaves domain Outbox intents pending until their processor is registered", async () => {
    const now = new Date("2026-08-14T08:00:00.000Z");
    const deferredEventId = randomUUID();
    const registeredEventId = randomUUID();
    const shutdown = new AbortController();
    const registry = new ProcessorRegistry();

    registry.register({
      name: "probe.registered",
      async process() {
        shutdown.abort();
      },
    });

    await testDatabase.database.pool.query(
      `INSERT INTO outbox_events
        (id, aggregate_type, aggregate_id, event_type, payload, available_at)
       VALUES
        ($1, 'project', $1, 'project.published', '{}'::jsonb, $3),
        ($2, 'probe', $2, 'probe.registered', '{}'::jsonb, $3)`,
      [deferredEventId, registeredEventId, new Date(now.getTime() - 1_000)],
    );

    await runOutboxWorker(
      {
        database: testDatabase.database,
        registry,
        logger: silentLogger,
        clock: createFixedClock(now),
        workerId: "worker-deferred-domain-test",
        pollIntervalMs: 5,
        leaseMs: 1_000,
        shutdownTimeoutMs: 1_000,
      },
      shutdown.signal,
    );

    const result = await testDatabase.database.pool.query<{
      id: string;
      attempt_count: number;
      locked_by: string | null;
      processed_at: Date | null;
      failed_at: Date | null;
    }>(
      `SELECT id, attempt_count, locked_by, processed_at, failed_at
         FROM outbox_events
        WHERE id = ANY($1::uuid[])
        ORDER BY id`,
      [[deferredEventId, registeredEventId]],
    );

    const deferred = result.rows.find((row) => row.id === deferredEventId);
    const registered = result.rows.find((row) => row.id === registeredEventId);
    expect(deferred).toMatchObject({
      attempt_count: 0,
      locked_by: null,
      processed_at: null,
      failed_at: null,
    });
    expect(registered?.attempt_count).toBe(1);
    expect(registered?.processed_at).not.toBeNull();
    expect(registered?.failed_at).toBeNull();

    const laterShutdown = new AbortController();
    const laterRegistry = new ProcessorRegistry();
    laterRegistry.register({
      name: "project.published",
      async process() {
        laterShutdown.abort();
      },
    });

    await runOutboxWorker(
      {
        database: testDatabase.database,
        registry: laterRegistry,
        logger: silentLogger,
        clock: createFixedClock(now),
        workerId: "worker-later-domain-registration",
        pollIntervalMs: 5,
        leaseMs: 1_000,
        shutdownTimeoutMs: 1_000,
      },
      laterShutdown.signal,
    );

    const laterResult = await testDatabase.database.pool.query<{
      attempt_count: number;
      processed_at: Date | null;
      failed_at: Date | null;
    }>(
      `SELECT attempt_count, processed_at, failed_at
         FROM outbox_events
        WHERE id = $1`,
      [deferredEventId],
    );
    expect(laterResult.rows[0]?.attempt_count).toBe(1);
    expect(laterResult.rows[0]?.processed_at).not.toBeNull();
    expect(laterResult.rows[0]?.failed_at).toBeNull();
  });
});
