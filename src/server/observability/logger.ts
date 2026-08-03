export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Readonly<Record<string, unknown>>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

function writeLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
): void {
  const serializedEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  });

  switch (level) {
    case "debug":
      console.debug(serializedEntry);
      break;
    case "info":
      console.info(serializedEntry);
      break;
    case "warn":
      console.warn(serializedEntry);
      break;
    case "error":
      console.error(serializedEntry);
      break;
  }
}

export const logger: Logger = {
  debug: (message, context) => writeLog("debug", message, context),
  info: (message, context) => writeLog("info", message, context),
  warn: (message, context) => writeLog("warn", message, context),
  error: (message, context) => writeLog("error", message, context),
};
