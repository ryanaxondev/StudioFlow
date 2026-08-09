export type DatabaseErrorKind =
  | "unique_violation"
  | "foreign_key_violation"
  | "check_violation"
  | "not_null_violation"
  | "serialization_failure"
  | "deadlock_detected"
  | "connection_failure"
  | "unknown";

export type NormalizedDatabaseError = Readonly<{
  kind: DatabaseErrorKind;
  code?: string;
  constraint?: string;
  detail?: string;
  retryable: boolean;
}>;

type PostgreSqlErrorLike = Error & {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: unknown;
};

export function normalizeDatabaseError(
  error: unknown,
): NormalizedDatabaseError {
  if (!(error instanceof Error)) {
    return { kind: "unknown", retryable: false };
  }

  const outerError = error as PostgreSqlErrorLike;
  const postgresError =
    outerError.code || !(outerError.cause instanceof Error)
      ? outerError
      : (outerError.cause as PostgreSqlErrorLike);
  const base = {
    ...(postgresError.code ? { code: postgresError.code } : {}),
    ...(postgresError.constraint
      ? { constraint: postgresError.constraint }
      : {}),
    ...(postgresError.detail ? { detail: postgresError.detail } : {}),
  };

  switch (postgresError.code) {
    case "23505":
      return { ...base, kind: "unique_violation", retryable: false };
    case "23503":
      return { ...base, kind: "foreign_key_violation", retryable: false };
    case "23514":
      return { ...base, kind: "check_violation", retryable: false };
    case "23502":
      return { ...base, kind: "not_null_violation", retryable: false };
    case "40001":
      return { ...base, kind: "serialization_failure", retryable: true };
    case "40P01":
      return { ...base, kind: "deadlock_detected", retryable: true };
    default:
      if (postgresError.code?.startsWith("08")) {
        return { ...base, kind: "connection_failure", retryable: true };
      }

      return { ...base, kind: "unknown", retryable: false };
  }
}
