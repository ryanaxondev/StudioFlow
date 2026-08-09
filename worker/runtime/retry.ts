const retryDelaysMs = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  6 * 60 * 60_000,
  24 * 60 * 60_000,
] as const;

export function retryDelayMs(attemptCount: number): number {
  const index = Math.max(
    0,
    Math.min(attemptCount - 1, retryDelaysMs.length - 1),
  );
  return retryDelaysMs[index];
}

export function retryAvailableAt(attemptCount: number, now = new Date()): Date {
  return new Date(now.getTime() + retryDelayMs(attemptCount));
}
