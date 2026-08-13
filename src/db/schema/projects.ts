import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { clientOrganizations } from "./clients";
import { users } from "./identity";
import { workspaces } from "./workspaces";

export const projectLifecycles = [
  "DRAFT",
  "ONBOARDING",
  "ACTIVE",
  "HANDOFF",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;
export type ProjectLifecycle = (typeof projectLifecycles)[number];

export const projectMemberSides = ["AGENCY", "CLIENT"] as const;
export type ProjectMemberSide = (typeof projectMemberSides)[number];

export const projectRoles = [
  "DELIVERY_MANAGER",
  "AGENCY_MEMBER",
  "CLIENT_APPROVER",
  "CLIENT_CONTRIBUTOR",
] as const;
export type ProjectRole = (typeof projectRoles)[number];

export const projectMemberStatuses = ["ACTIVE", "REVOKED"] as const;
export type ProjectMemberStatus = (typeof projectMemberStatuses)[number];

export const activityVisibilities = ["CLIENT_VISIBLE", "AGENCY_ONLY"] as const;
export type ActivityVisibility = (typeof activityVisibilities)[number];

export type ActivityMetadata = Readonly<Record<string, unknown>>;

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    clientOrganizationId: uuid("client_organization_id").notNull(),
    title: text("title").notNull(),
    clientSummary: text("client_summary"),
    lifecycle: text("lifecycle")
      .$type<ProjectLifecycle>()
      .notNull()
      .default("DRAFT"),
    plannedStartDate: date("planned_start_date", { mode: "string" }),
    targetCompletionDate: date("target_completion_date", { mode: "string" }),
    deliveryManagerUserId: uuid("delivery_manager_user_id")
      .notNull()
      .references(() => users.id),
    clientApproverUserId: uuid("client_approver_user_id").references(
      () => users.id,
    ),
    cancelledReasonClient: text("cancelled_reason_client"),
    cancelledReasonInternal: text("cancelled_reason_internal"),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    rowVersion: integer("row_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("projects_workspace_id_id_unique").on(table.workspaceId, table.id),
    foreignKey({
      name: "projects_client_workspace_fk",
      columns: [table.workspaceId, table.clientOrganizationId],
      foreignColumns: [clientOrganizations.workspaceId, clientOrganizations.id],
    }),
    index("projects_workspace_lifecycle_updated_idx").on(
      table.workspaceId,
      table.lifecycle,
      table.updatedAt.desc(),
    ),
    index("projects_client_organization_idx").on(
      table.workspaceId,
      table.clientOrganizationId,
      table.updatedAt.desc(),
    ),
    index("projects_delivery_manager_idx").on(
      table.workspaceId,
      table.deliveryManagerUserId,
      table.updatedAt.desc(),
    ),
    check(
      "projects_title_nonempty_check",
      sql`length(trim(${table.title})) > 0`,
    ),
    check(
      "projects_lifecycle_check",
      sql`${table.lifecycle} IN ('DRAFT', 'ONBOARDING', 'ACTIVE', 'HANDOFF', 'COMPLETED', 'CANCELLED', 'ARCHIVED')`,
    ),
    check(
      "projects_date_order_check",
      sql`${table.plannedStartDate} IS NULL OR ${table.targetCompletionDate} IS NULL OR ${table.targetCompletionDate} >= ${table.plannedStartDate}`,
    ),
    check("projects_row_version_positive_check", sql`${table.rowVersion} > 0`),
  ],
);

export const projectMembers = pgTable(
  "project_members",
  {
    workspaceId: uuid("workspace_id").notNull(),
    projectId: uuid("project_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    side: text("side").$type<ProjectMemberSide>().notNull(),
    projectRole: text("project_role").$type<ProjectRole>().notNull(),
    status: text("status")
      .$type<ProjectMemberStatus>()
      .notNull()
      .default("ACTIVE"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    primaryKey({
      name: "project_members_pkey",
      columns: [table.workspaceId, table.projectId, table.userId],
    }),
    foreignKey({
      name: "project_members_project_workspace_fk",
      columns: [table.workspaceId, table.projectId],
      foreignColumns: [projects.workspaceId, projects.id],
    }).onDelete("cascade"),
    index("project_members_active_user_idx")
      .on(table.userId, table.workspaceId, table.projectId)
      .where(sql`${table.status} = 'ACTIVE'`),
    index("project_members_active_project_idx")
      .on(table.workspaceId, table.projectId, table.side, table.projectRole)
      .where(sql`${table.status} = 'ACTIVE'`),
    uniqueIndex("project_members_one_delivery_manager_idx")
      .on(table.workspaceId, table.projectId)
      .where(
        sql`${table.status} = 'ACTIVE' AND ${table.projectRole} = 'DELIVERY_MANAGER'`,
      ),
    uniqueIndex("project_members_one_client_approver_idx")
      .on(table.workspaceId, table.projectId)
      .where(
        sql`${table.status} = 'ACTIVE' AND ${table.projectRole} = 'CLIENT_APPROVER'`,
      ),
    check(
      "project_members_side_check",
      sql`${table.side} IN ('AGENCY', 'CLIENT')`,
    ),
    check(
      "project_members_role_check",
      sql`${table.projectRole} IN ('DELIVERY_MANAGER', 'AGENCY_MEMBER', 'CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR')`,
    ),
    check(
      "project_members_side_role_check",
      sql`(${table.side} = 'AGENCY' AND ${table.projectRole} IN ('DELIVERY_MANAGER', 'AGENCY_MEMBER')) OR (${table.side} = 'CLIENT' AND ${table.projectRole} IN ('CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR'))`,
    ),
    check(
      "project_members_status_check",
      sql`${table.status} IN ('ACTIVE', 'REVOKED')`,
    ),
    check(
      "project_members_revocation_state_check",
      sql`(${table.status} = 'ACTIVE' AND ${table.revokedAt} IS NULL) OR (${table.status} = 'REVOKED' AND ${table.revokedAt} IS NOT NULL)`,
    ),
  ],
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    projectId: uuid("project_id").notNull(),
    eventType: text("event_type").notNull(),
    visibility: text("visibility").$type<ActivityVisibility>().notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorNameSnapshot: text("actor_name_snapshot").notNull(),
    actorRoleSnapshot: text("actor_role_snapshot"),
    subjectType: text("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    summaryKey: text("summary_key").notNull(),
    metadata: jsonb("metadata").$type<ActivityMetadata>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: "activity_events_project_workspace_fk",
      columns: [table.workspaceId, table.projectId],
      foreignColumns: [projects.workspaceId, projects.id],
    }).onDelete("cascade"),
    index("activity_events_project_timeline_idx").on(
      table.workspaceId,
      table.projectId,
      table.occurredAt.desc(),
      table.id.desc(),
    ),
    index("activity_events_client_visible_timeline_idx")
      .on(
        table.workspaceId,
        table.projectId,
        table.occurredAt.desc(),
        table.id.desc(),
      )
      .where(sql`${table.visibility} = 'CLIENT_VISIBLE'`),
    check(
      "activity_events_event_type_nonempty_check",
      sql`length(trim(${table.eventType})) > 0`,
    ),
    check(
      "activity_events_visibility_check",
      sql`${table.visibility} IN ('CLIENT_VISIBLE', 'AGENCY_ONLY')`,
    ),
    check(
      "activity_events_actor_name_nonempty_check",
      sql`length(trim(${table.actorNameSnapshot})) > 0`,
    ),
    check(
      "activity_events_subject_type_nonempty_check",
      sql`length(trim(${table.subjectType})) > 0`,
    ),
    check(
      "activity_events_summary_key_nonempty_check",
      sql`length(trim(${table.summaryKey})) > 0`,
    ),
    check(
      "activity_events_metadata_object_check",
      sql`jsonb_typeof(${table.metadata}) = 'object'`,
    ),
  ],
);
