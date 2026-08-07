import type { Clock } from "../../src/lib/clock";

export function createFixedClock(instant: string | Date): Clock {
  const fixedInstant = new Date(instant);

  if (Number.isNaN(fixedInstant.getTime())) {
    throw new Error("Fixed Clock requires a valid instant.");
  }

  return {
    now: () => new Date(fixedInstant),
  };
}
