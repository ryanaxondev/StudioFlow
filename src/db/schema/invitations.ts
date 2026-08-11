import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { clientOrganizations } from "./clients";
import { users } from "./identity";
import { workspaces, type WorkspaceRole } from "./workspaces";

export const invitationMembershipTypes = [
  "WORKSPACE_MEMBER",
  "CLIENT_MEMBER",
] as const;
export type InvitationMembershipType =
  (typeof invitationMembershipTypes)[number];

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    clientOrganizationId: uuid("client_organization_id"),
    emailNormalized: text("email_normalized").notNull(),
    membershipType: text("membership_type")
      .$type<InvitationMembershipType>()
      .notNull(),
    intendedRole: text("intended_role").$type<WorkspaceRole | null>(),
    tokenHash: text("token_hash").notNull(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    foreignKey({
      name: "invitations_client_workspace_fk",
      columns: [table.workspaceId, table.clientOrganizationId],
      foreignColumns: [clientOrganizations.workspaceId, clientOrganizations.id],
    }),
    uniqueIndex("invitations_token_hash_unique").on(table.tokenHash),
    index("invitations_workspace_lookup_idx").on(
      table.workspaceId,
      table.membershipType,
      table.emailNormalized,
      table.createdAt.desc(),
    ),
    index("invitations_client_lookup_idx")
      .on(
        table.clientOrganizationId,
        table.emailNormalized,
        table.createdAt.desc(),
      )
      .where(sql`${table.clientOrganizationId} IS NOT NULL`),
    index("invitations_pending_lookup_idx")
      .on(table.workspaceId, table.emailNormalized, table.expiresAt)
      .where(sql`${table.acceptedAt} IS NULL AND ${table.revokedAt} IS NULL`),
    check(
      "invitations_email_normalized_check",
      sql`${table.emailNormalized} = lower(trim(${table.emailNormalized}))`,
    ),
    check(
      "invitations_membership_type_check",
      sql`${table.membershipType} IN ('WORKSPACE_MEMBER', 'CLIENT_MEMBER')`,
    ),
    check(
      "invitations_target_shape_check",
      sql`(${table.membershipType} = 'WORKSPACE_MEMBER' AND ${table.clientOrganizationId} IS NULL AND ${table.intendedRole} IS NOT NULL AND ${table.intendedRole} IN ('AGENCY_OWNER', 'DELIVERY_MANAGER', 'AGENCY_MEMBER')) OR (${table.membershipType} = 'CLIENT_MEMBER' AND ${table.clientOrganizationId} IS NOT NULL AND ${table.intendedRole} IS NULL)`,
    ),
    check(
      "invitations_token_hash_format_check",
      sql`${table.tokenHash} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      "invitations_expires_after_created_check",
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
    check(
      "invitations_terminal_state_check",
      sql`NOT (${table.acceptedAt} IS NOT NULL AND ${table.revokedAt} IS NOT NULL)`,
    ),
    check(
      "invitations_accepted_after_created_check",
      sql`${table.acceptedAt} IS NULL OR ${table.acceptedAt} >= ${table.createdAt}`,
    ),
    check(
      "invitations_revoked_after_created_check",
      sql`${table.revokedAt} IS NULL OR ${table.revokedAt} >= ${table.createdAt}`,
    ),
  ],
);
