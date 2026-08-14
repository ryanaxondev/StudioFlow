import type { QueryResultRow } from "pg";

import type { DatabaseClient } from "../client";
import { outboxEvents, type JsonObject } from "../schema";
import type { TransactionDatabase } from "../transactions";
import { withTransaction } from "../transactions";

export type ClaimedOutboxEvent = Readonly<{
  id: string;
  workspaceId: string | null;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: JsonObject;
  availableAt: Date;
  attemptCount: number;
  maxAttempts: number;
  lockedAt: Date;
  lockedBy: string;
  lockExpiresAt: Date;
}>;

type ClaimedOutboxRow = QueryResultRow & {
  id: string;
  workspace_id: string | null;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: JsonObject;
  available_at: Date;
  attempt_count: number;
  max_attempts: number;
  locked_at: Date;
  locked_by: string;
  lock_expires_at: Date;
};

function mapClaimedRow(row: ClaimedOutboxRow): ClaimedOutboxEvent {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    eventType: row.event_type,
    payload: row.payload,
    availableAt: row.available_at,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lockedAt: row.locked_at,
    lockedBy: row.locked_by,
    lockExpiresAt: row.lock_expires_at,
  };
}

export async function insertOutboxEvent(
  db: TransactionDatabase,
  input: Readonly<{
    workspaceId?: string | null;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: JsonObject;
    availableAt?: Date;
    maxAttempts?: number;
  }>,
): Promise<string> {
  const rows = await db
    .insert(outboxEvents)
    .values({
      workspaceId: input.workspaceId ?? null,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      eventType: input.eventType,
      payload: input.payload,
      ...(input.availableAt ? { availableAt: input.availableAt } : {}),
      ...(input.maxAttempts ? { maxAttempts: input.maxAttempts } : {}),
    })
    .returning({ id: outboxEvents.id });

  const row = rows[0];
  if (!row) {
    throw new Error("Outbox insert did not return an id.");
  }

  return row.id;
}

export async function claimOutboxEvents(
  database: DatabaseClient,
  options: Readonly<{
    workerId: string;
    limit: number;
    leaseMs: number;
    now?: Date;
    eventTypes?: readonly string[];
  }>,
): Promise<readonly ClaimedOutboxEvent[]> {
  if (options.limit < 1 || options.eventTypes?.length === 0) {
    return [];
  }

  return withTransaction(database, async ({ client }) => {
    const now = options.now ?? new Date();
    const lockExpiresAt = new Date(now.getTime() + options.leaseMs);
    const result = await client.query<ClaimedOutboxRow>(
      `WITH candidates AS (
         SELECT id
           FROM outbox_events
          WHERE processed_at IS NULL
            AND failed_at IS NULL
            AND available_at <= $1
            AND (lock_expires_at IS NULL OR lock_expires_at <= $1)
            AND ($5::text[] IS NULL OR event_type = ANY($5::text[]))
          ORDER BY available_at, created_at
          FOR UPDATE SKIP LOCKED
          LIMIT $2
       )
       UPDATE outbox_events AS event
          SET locked_at = $1,
              locked_by = $3,
              lock_expires_at = $4,
              attempt_count = event.attempt_count + 1
         FROM candidates
        WHERE event.id = candidates.id
      RETURNING event.id,
                event.workspace_id,
                event.aggregate_type,
                event.aggregate_id,
                event.event_type,
                event.payload,
                event.available_at,
                event.attempt_count,
                event.max_attempts,
                event.locked_at,
                event.locked_by,
                event.lock_expires_at`,
      [
        now,
        options.limit,
        options.workerId,
        lockExpiresAt,
        options.eventTypes ? [...options.eventTypes] : null,
      ],
    );

    return result.rows.map(mapClaimedRow);
  });
}

export async function markOutboxProcessed(
  database: DatabaseClient,
  eventId: string,
  workerId: string,
  processedAt = new Date(),
): Promise<boolean> {
  const result = await database.pool.query(
    `UPDATE outbox_events
        SET processed_at = $3,
            locked_at = NULL,
            locked_by = NULL,
            lock_expires_at = NULL,
            last_error = NULL
      WHERE id = $1
        AND locked_by = $2
        AND processed_at IS NULL
        AND failed_at IS NULL`,
    [eventId, workerId, processedAt],
  );

  return result.rowCount === 1;
}

export async function rescheduleOutboxEvent(
  database: DatabaseClient,
  input: Readonly<{
    eventId: string;
    workerId: string;
    availableAt: Date;
    lastError: string;
  }>,
): Promise<boolean> {
  const result = await database.pool.query(
    `UPDATE outbox_events
        SET available_at = $3,
            locked_at = NULL,
            locked_by = NULL,
            lock_expires_at = NULL,
            last_error = $4
      WHERE id = $1
        AND locked_by = $2
        AND processed_at IS NULL
        AND failed_at IS NULL`,
    [input.eventId, input.workerId, input.availableAt, input.lastError],
  );

  return result.rowCount === 1;
}

export async function markOutboxFailed(
  database: DatabaseClient,
  input: Readonly<{
    eventId: string;
    workerId: string;
    failedAt?: Date;
    lastError: string;
  }>,
): Promise<boolean> {
  const result = await database.pool.query(
    `UPDATE outbox_events
        SET failed_at = $3,
            locked_at = NULL,
            locked_by = NULL,
            lock_expires_at = NULL,
            last_error = $4
      WHERE id = $1
        AND locked_by = $2
        AND processed_at IS NULL
        AND failed_at IS NULL`,
    [
      input.eventId,
      input.workerId,
      input.failedAt ?? new Date(),
      input.lastError,
    ],
  );

  return result.rowCount === 1;
}
