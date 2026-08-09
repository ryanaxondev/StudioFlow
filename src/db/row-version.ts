import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const INITIAL_ROW_VERSION = 1 as const;

export function incrementRowVersion(column: AnyPgColumn): SQL {
  return sql`${column} + 1`;
}
