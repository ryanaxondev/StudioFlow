import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const milestoneStates = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;
export type MilestoneState = (typeof milestoneStates)[number];

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    projectId: uuid("project_id").notNull(),
    title: text("title").notNull(),
    purpose: text("purpose"),
    clientDescription: text("client_description"),
    position: integer("position").notNull(),
    plannedStartDate: date("planned_start_date", { mode: "string" }),
    plannedEndDate: date("planned_end_date", { mode: "string" }),
    state: text("state").$type<MilestoneState>().notNull().default("PLANNED"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    activatedAt: timestamp("activated_at", {
      withTimezone: true,
      mode: "date",
    }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
      mode: "date",
    }),
    completionOverrideReason: text("completion_override_reason"),
    rowVersion: integer("row_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("milestones_workspace_project_id_unique").on(
      table.workspaceId,
      table.projectId,
      table.id,
    ),
    foreignKey({
      name: "milestones_project_workspace_fk",
      columns: [table.workspaceId, table.projectId],
      foreignColumns: [projects.workspaceId, projects.id],
    }).onDelete("cascade"),
    // Migration 0007 declares this constraint DEFERRABLE so ordered-plan
    // rewrites can move multiple positions atomically. Drizzle still models
    // the logical uniqueness here for typed schema consumers.
    unique("milestones_project_position_unique").on(
      table.workspaceId,
      table.projectId,
      table.position,
    ),
    index("milestones_project_sequence_idx").on(
      table.workspaceId,
      table.projectId,
      table.position,
    ),
    index("milestones_project_state_idx").on(
      table.workspaceId,
      table.projectId,
      table.state,
      table.position,
    ),
    index("milestones_client_visible_idx")
      .on(table.workspaceId, table.projectId, table.position)
      .where(sql`${table.publishedAt} IS NOT NULL`),
    uniqueIndex("milestones_one_active_per_project_idx")
      .on(table.workspaceId, table.projectId)
      .where(sql`${table.state} = 'ACTIVE'`),
    check(
      "milestones_title_nonempty_check",
      sql`length(trim(${table.title})) > 0`,
    ),
    check("milestones_position_positive_check", sql`${table.position} > 0`),
    check(
      "milestones_state_check",
      sql`${table.state} IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')`,
    ),
    check(
      "milestones_date_order_check",
      sql`${table.plannedStartDate} IS NULL OR ${table.plannedEndDate} IS NULL OR ${table.plannedEndDate} >= ${table.plannedStartDate}`,
    ),
    check(
      "milestones_row_version_positive_check",
      sql`${table.rowVersion} > 0`,
    ),
    check(
      "milestones_lifecycle_timestamps_check",
      sql`(${table.state} = 'PLANNED' AND ${table.activatedAt} IS NULL AND ${table.completedAt} IS NULL AND ${table.cancelledAt} IS NULL) OR (${table.state} = 'ACTIVE' AND ${table.activatedAt} IS NOT NULL AND ${table.completedAt} IS NULL AND ${table.cancelledAt} IS NULL) OR (${table.state} = 'COMPLETED' AND ${table.activatedAt} IS NOT NULL AND ${table.completedAt} IS NOT NULL AND ${table.cancelledAt} IS NULL) OR (${table.state} = 'CANCELLED' AND ${table.completedAt} IS NULL AND ${table.cancelledAt} IS NOT NULL)`,
    ),
    check(
      "milestones_nonplanned_requires_publication_check",
      sql`${table.state} = 'PLANNED' OR ${table.publishedAt} IS NOT NULL`,
    ),
    check(
      "milestones_override_reason_state_check",
      sql`${table.completionOverrideReason} IS NULL OR (${table.state} = 'COMPLETED' AND length(trim(${table.completionOverrideReason})) > 0)`,
    ),
  ],
);
