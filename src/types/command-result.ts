export type CommandErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "STATE_CONFLICT"
  | "STALE_VERSION"
  | "DUPLICATE_COMMAND"
  | "RATE_LIMITED"
  | "DEPENDENCY_UNAVAILABLE";

export type CommandResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      code: CommandErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
      currentState?: unknown;
    };
