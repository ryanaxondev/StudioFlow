import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./identity";

export const workspaceRoles = [
  "AGENCY_OWNER",
  "DELIVERY_MANAGER",
  "AGENCY_MEMBER",
] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

export const membershipStatuses = ["ACTIVE", "REVOKED"] as const;
export type MembershipStatus = (typeof membershipStatuses)[number];

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    timezone: text("timezone").notNull(),
    displayCurrency: text("display_currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    rowVersion: integer("row_version").notNull().default(1),
  },
  (table) => [
    check(
      "workspaces_name_nonempty_check",
      sql`length(trim(${table.name})) > 0`,
    ),
    check(
      "workspaces_timezone_nonempty_check",
      sql`length(trim(${table.timezone})) > 0`,
    ),
    check(
      "workspaces_display_currency_format_check",
      sql`${table.displayCurrency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "workspaces_row_version_positive_check",
      sql`${table.rowVersion} > 0`,
    ),
  ],
);

export const workspaceBranding = pgTable(
  "workspace_branding",
  {
    workspaceId: uuid("workspace_id")
      .primaryKey()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    logoAssetId: uuid("logo_asset_id"),
    requestedAccentHex: text("requested_accent_hex"),
    appliedAccentHex: text("applied_accent_hex"),
    accentContrastResult: text("accent_contrast_result"),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "workspace_branding_requested_accent_hex_check",
      sql`${table.requestedAccentHex} IS NULL OR ${table.requestedAccentHex} ~ '^#[0-9A-Fa-f]{6}$'`,
    ),
    check(
      "workspace_branding_applied_accent_hex_check",
      sql`${table.appliedAccentHex} IS NULL OR ${table.appliedAccentHex} ~ '^#[0-9A-Fa-f]{6}$'`,
    ),
  ],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").$type<WorkspaceRole>().notNull(),
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
    primaryKey({
      name: "workspace_members_pkey",
      columns: [table.workspaceId, table.userId],
    }),
    index("workspace_members_user_id_idx").on(table.userId),
    index("workspace_members_active_workspace_idx")
      .on(table.workspaceId, table.role)
      .where(sql`${table.status} = 'ACTIVE'`),
    check(
      "workspace_members_role_check",
      sql`${table.role} IN ('AGENCY_OWNER', 'DELIVERY_MANAGER', 'AGENCY_MEMBER')`,
    ),
    check(
      "workspace_members_status_check",
      sql`${table.status} IN ('ACTIVE', 'REVOKED')`,
    ),
    check(
      "workspace_members_revocation_state_check",
      sql`(${table.status} = 'ACTIVE' AND ${table.revokedAt} IS NULL) OR (${table.status} = 'REVOKED' AND ${table.revokedAt} IS NOT NULL)`,
    ),
  ],
);
