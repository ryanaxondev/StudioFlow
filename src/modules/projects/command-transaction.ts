import type { DatabaseClient } from "../../db/client";
import {
  completeIdempotencyRecord,
  createRequestFingerprint,
  reserveIdempotencyRecord,
} from "../../db/repositories/idempotency";
import { insertOutboxEvent } from "../../db/repositories/outbox";
import {
  activityEvents,
  type ActivityMetadata,
  type ActivityVisibility,
  type JsonObject,
} from "../../db/schema";
import type { TransactionContext } from "../../db/transactions";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";
import type { ActorContext } from "../authorization/types";
import { ProjectDomainError } from "./errors";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export type ProjectCommandExecutionContext = Readonly<{
  transaction: TransactionContext;
  now: Date;
  recordActivity(
    input: Readonly<{
      workspaceId: string;
      projectId: string;
      eventType: string;
      visibility: ActivityVisibility;
      subjectType: string;
      subjectId: string;
      summaryKey: string;
      actorRoleSnapshot?: string | null;
      metadata?: ActivityMetadata;
    }>,
  ): Promise<string>;
  enqueueOutbox(
    input: Readonly<{
      workspaceId: string;
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: JsonObject;
    }>,
  ): Promise<string>;
}>;

async function loadActorName(
  transaction: TransactionContext,
  actorUserId: string,
): Promise<string> {
  const result = await transaction.client.query<{ display_name: string }>(
    `SELECT display_name
       FROM users
      WHERE id = $1
        AND disabled_at IS NULL
      LIMIT 1`,
    [actorUserId],
  );
  const name = result.rows[0]?.display_name;
  if (!name) {
    throw new ProjectDomainError("ACTOR_UNAVAILABLE");
  }
  return name;
}

export async function runProjectCommand<Result extends JsonObject>(
  options: Readonly<{
    database: DatabaseClient;
    actor: ActorContext;
    commandType: string;
    idempotencyKey: string;
    request: JsonObject;
    clock?: Clock;
    execute(context: ProjectCommandExecutionContext): Promise<Result>;
  }>,
): Promise<Result> {
  const idempotencyKey = options.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new ProjectDomainError("INVALID_REQUEST");
  }

  const clock = options.clock ?? systemClock;
  const requestFingerprint = createRequestFingerprint(options.request);

  return withTransaction(options.database, async (transaction) => {
    const now = clock.now();
    const reservation = await reserveIdempotencyRecord(transaction.db, {
      actorId: options.actor.userId,
      commandType: options.commandType,
      idempotencyKey,
      requestFingerprint,
      expiresAt: new Date(now.getTime() + IDEMPOTENCY_TTL_MS),
    });

    if (reservation.kind === "conflict") {
      throw new ProjectDomainError("IDEMPOTENCY_CONFLICT");
    }
    if (reservation.kind === "replay") {
      return reservation.resultReference as Result;
    }

    let actorName: string | null = null;
    const context: ProjectCommandExecutionContext = {
      transaction,
      now,
      async recordActivity(input) {
        actorName ??= await loadActorName(transaction, options.actor.userId);
        const rows = await transaction.db
          .insert(activityEvents)
          .values({
            workspaceId: input.workspaceId,
            projectId: input.projectId,
            eventType: input.eventType,
            visibility: input.visibility,
            actorUserId: options.actor.userId,
            actorNameSnapshot: actorName,
            actorRoleSnapshot: input.actorRoleSnapshot ?? null,
            subjectType: input.subjectType,
            subjectId: input.subjectId,
            summaryKey: input.summaryKey,
            metadata: input.metadata ?? {},
            occurredAt: now,
          })
          .returning({ id: activityEvents.id });
        const event = rows[0];
        if (!event) throw new Error("Activity Event insert returned no id.");
        return event.id;
      },
      enqueueOutbox(input) {
        return insertOutboxEvent(transaction.db, input);
      },
    };

    const result = await options.execute(context);
    await completeIdempotencyRecord(
      transaction.db,
      reservation.recordId,
      result,
    );
    return result;
  });
}
