import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const migrationHistory = pgTable(
  "studioflow_migrations",
  {
    version: integer("version").primaryKey(),
    name: text("name").notNull().unique(),
    checksum: text("checksum").notNull(),
    appliedAt: timestamp("applied_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "studioflow_migrations_version_positive_check",
      sql`${table.version} > 0`,
    ),
    check(
      "studioflow_migrations_checksum_format_check",
      sql`${table.checksum} ~ '^[0-9a-f]{64}$'`,
    ),
  ],
);
