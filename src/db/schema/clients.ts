import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./identity";
import { type MembershipStatus, workspaces } from "./workspaces";

export const clientOrganizationStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type ClientOrganizationStatus =
  (typeof clientOrganizationStatuses)[number];

export const clientOrganizations = pgTable(
  "client_organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    status: text("status")
      .$type<ClientOrganizationStatus>()
      .notNull()
      .default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    rowVersion: integer("row_version").notNull().default(1),
  },
  (table) => [
    unique("client_organizations_workspace_id_id_unique").on(
      table.workspaceId,
      table.id,
    ),
    index("client_organizations_workspace_id_idx").on(table.workspaceId),
    check(
      "client_organizations_name_nonempty_check",
      sql`length(trim(${table.name})) > 0`,
    ),
    check(
      "client_organizations_status_check",
      sql`${table.status} IN ('ACTIVE', 'ARCHIVED')`,
    ),
    check(
      "client_organizations_row_version_positive_check",
      sql`${table.rowVersion} > 0`,
    ),
  ],
);

export const clientMembers = pgTable(
  "client_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    clientOrganizationId: uuid("client_organization_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status")
      .$type<MembershipStatus>()
      .notNull()
      .default("ACTIVE"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    foreignKey({
      name: "client_members_client_workspace_fk",
      columns: [table.workspaceId, table.clientOrganizationId],
      foreignColumns: [clientOrganizations.workspaceId, clientOrganizations.id],
    }),
    unique("client_members_client_user_unique").on(
      table.clientOrganizationId,
      table.userId,
    ),
    index("client_members_user_id_idx").on(table.userId),
    index("client_members_active_workspace_idx")
      .on(table.workspaceId, table.clientOrganizationId)
      .where(sql`${table.status} = 'ACTIVE'`),
    check(
      "client_members_status_check",
      sql`${table.status} IN ('ACTIVE', 'REVOKED')`,
    ),
    check(
      "client_members_revocation_state_check",
      sql`(${table.status} = 'ACTIVE' AND ${table.revokedAt} IS NULL) OR (${table.status} = 'REVOKED' AND ${table.revokedAt} IS NOT NULL)`,
    ),
  ],
);
