import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./identity";
import { workspaces } from "./workspaces";

export type JsonObject = Readonly<Record<string, unknown>>;

export const idempotencyRecords = pgTable(
  "idempotency_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commandType: text("command_type").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
    resultReference: jsonb("result_reference").$type<JsonObject>(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("idempotency_actor_command_key_unique").on(
      table.actorId,
      table.commandType,
      table.idempotencyKey,
    ),
    index("idempotency_expires_at_idx").on(table.expiresAt),
    check(
      "idempotency_expires_after_created_check",
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
  ],
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id),
    aggregateType: text("aggregate_type").notNull(),
    aggregateId: uuid("aggregate_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<JsonObject>().notNull(),
    availableAt: timestamp("available_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(7),
    lockedAt: timestamp("locked_at", {
      withTimezone: true,
      mode: "date",
    }),
    lockedBy: text("locked_by"),
    lockExpiresAt: timestamp("lock_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "date",
    }),
    failedAt: timestamp("failed_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("outbox_claim_ready_idx")
      .on(table.availableAt, table.createdAt)
      .where(sql`${table.processedAt} IS NULL AND ${table.failedAt} IS NULL`),
    index("outbox_lock_expiry_idx")
      .on(table.lockExpiresAt)
      .where(sql`${table.lockExpiresAt} IS NOT NULL`),
    check(
      "outbox_attempt_count_nonnegative_check",
      sql`${table.attemptCount} >= 0`,
    ),
    check("outbox_max_attempts_positive_check", sql`${table.maxAttempts} > 0`),
  ],
);
