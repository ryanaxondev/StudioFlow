import { createHash } from "node:crypto";

import { and, eq } from "drizzle-orm";

import type { TransactionDatabase } from "../transactions";
import { idempotencyRecords, type JsonObject } from "../schema";

function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new TypeError("Idempotency payload must contain JSON values only.");
    }
    return serialized;
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(",")}]`;
  }

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(object[key])}`)
    .join(",")}}`;
}

function toJsonValue(payload: unknown): unknown {
  const serialized = JSON.stringify(payload);

  if (serialized === undefined) {
    throw new TypeError("Idempotency payload must be JSON-serializable.");
  }

  return JSON.parse(serialized) as unknown;
}

export function createRequestFingerprint(payload: unknown): string {
  return createHash("sha256")
    .update(canonicalizeJson(toJsonValue(payload)))
    .digest("hex");
}

export type IdempotencyReservation =
  | Readonly<{ kind: "new"; recordId: string }>
  | Readonly<{ kind: "replay"; recordId: string; resultReference: JsonObject }>
  | Readonly<{ kind: "conflict"; recordId: string }>;

export async function reserveIdempotencyRecord(
  db: TransactionDatabase,
  input: Readonly<{
    actorId: string;
    commandType: string;
    idempotencyKey: string;
    requestFingerprint: string;
    expiresAt: Date;
  }>,
): Promise<IdempotencyReservation> {
  const inserted = await db
    .insert(idempotencyRecords)
    .values({
      actorId: input.actorId,
      commandType: input.commandType,
      idempotencyKey: input.idempotencyKey,
      requestFingerprint: input.requestFingerprint,
      expiresAt: input.expiresAt,
    })
    .onConflictDoNothing({
      target: [
        idempotencyRecords.actorId,
        idempotencyRecords.commandType,
        idempotencyRecords.idempotencyKey,
      ],
    })
    .returning({ id: idempotencyRecords.id });

  const created = inserted[0];
  if (created) {
    return { kind: "new", recordId: created.id };
  }

  const existing = await db
    .select({
      id: idempotencyRecords.id,
      requestFingerprint: idempotencyRecords.requestFingerprint,
      resultReference: idempotencyRecords.resultReference,
    })
    .from(idempotencyRecords)
    .where(
      and(
        eq(idempotencyRecords.actorId, input.actorId),
        eq(idempotencyRecords.commandType, input.commandType),
        eq(idempotencyRecords.idempotencyKey, input.idempotencyKey),
      ),
    )
    .limit(1);

  const record = existing[0];
  if (!record) {
    throw new Error(
      "Idempotency record disappeared after uniqueness conflict.",
    );
  }

  if (record.requestFingerprint !== input.requestFingerprint) {
    return { kind: "conflict", recordId: record.id };
  }

  if (!record.resultReference) {
    throw new Error(
      "Matching idempotency record has no completed result reference.",
    );
  }

  return {
    kind: "replay",
    recordId: record.id,
    resultReference: record.resultReference,
  };
}

export async function completeIdempotencyRecord(
  db: TransactionDatabase,
  recordId: string,
  resultReference: JsonObject,
): Promise<void> {
  const updated = await db
    .update(idempotencyRecords)
    .set({ resultReference })
    .where(eq(idempotencyRecords.id, recordId))
    .returning({ id: idempotencyRecords.id });

  if (updated.length !== 1) {
    throw new Error(`Idempotency record not found: ${recordId}`);
  }
}
