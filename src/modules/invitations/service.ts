import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";

import type { DatabaseClient } from "../../db/client";
import { insertOutboxEvent } from "../../db/repositories/outbox";
import {
  clientMembers,
  clientOrganizations,
  invitations,
  users,
  workspaceMembers,
  type InvitationMembershipType,
  type WorkspaceRole,
} from "../../db/schema";
import type {
  TransactionContext,
  TransactionDatabase,
} from "../../db/transactions";
import { withTransaction } from "../../db/transactions";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";
import {
  requireActiveWorkspaceRole,
  workspaceClientManagerRoles,
  workspaceOwnerRoles,
} from "../memberships/service";
import {
  CLIENT_INVITATION_DELIVERY_EVENT,
  protectInvitationDelivery,
  WORKSPACE_INVITATION_DELIVERY_EVENT,
  type InvitationDeliveryEventType,
} from "./email-outbox";

export const INVITATION_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

const emailSchema = z.string().trim().toLowerCase().email();

export type InvitationErrorCode =
  | "INVALID"
  | "EXPIRED"
  | "REVOKED"
  | "ALREADY_ACCEPTED"
  | "WRONG_ACCOUNT"
  | "TARGET_UNAVAILABLE"
  | "PENDING_EXISTS"
  | "ALREADY_MEMBER"
  | "FORBIDDEN";

export class InvitationError extends Error {
  constructor(readonly code: InvitationErrorCode) {
    super("Invitation operation could not be completed.");
    this.name = "InvitationError";
  }
}

export type InvitationDeliveryConfiguration = Readonly<{
  baseUrl: string;
  encryptionSecret: string;
}>;

export type InvitationCommandResult = Readonly<{
  invitationId: string;
  token: string;
  expiresAt: Date;
}>;

export type InvitationAcceptanceResult = Readonly<{
  status: "accepted" | "already-accepted";
  membershipType: InvitationMembershipType;
  workspaceId: string;
  clientOrganizationId: string | null;
}>;

export function createInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function invitationUrl(baseUrl: string, token: string): string {
  return new URL(`/invite/${encodeURIComponent(token)}`, baseUrl).toString();
}

function eventTypeFor(
  membershipType: InvitationMembershipType,
): InvitationDeliveryEventType {
  return membershipType === "WORKSPACE_MEMBER"
    ? WORKSPACE_INVITATION_DELIVERY_EVENT
    : CLIENT_INVITATION_DELIVERY_EVENT;
}

function targetLockKey(
  input: Readonly<{
    workspaceId: string;
    membershipType: InvitationMembershipType;
    clientOrganizationId: string | null;
    email: string;
  }>,
): string {
  return [
    "studioflow:invitation",
    input.workspaceId,
    input.membershipType,
    input.clientOrganizationId ?? "workspace",
    input.email,
  ].join(":");
}

async function lockInvitationTarget(
  transaction: TransactionContext,
  input: Readonly<{
    workspaceId: string;
    membershipType: InvitationMembershipType;
    clientOrganizationId: string | null;
    email: string;
  }>,
): Promise<void> {
  await transaction.client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
    targetLockKey(input),
  ]);
}

async function assertNoPendingInvitation(
  db: TransactionDatabase,
  input: Readonly<{
    workspaceId: string;
    membershipType: InvitationMembershipType;
    clientOrganizationId: string | null;
    email: string;
    now: Date;
  }>,
): Promise<void> {
  const target = [
    eq(invitations.workspaceId, input.workspaceId),
    eq(invitations.membershipType, input.membershipType),
    eq(invitations.emailNormalized, input.email),
    isNull(invitations.acceptedAt),
    isNull(invitations.revokedAt),
    gt(invitations.expiresAt, input.now),
  ];

  if (input.clientOrganizationId) {
    target.push(
      eq(invitations.clientOrganizationId, input.clientOrganizationId),
    );
  } else {
    target.push(isNull(invitations.clientOrganizationId));
  }

  const [pending] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(...target))
    .limit(1);

  if (pending) {
    throw new InvitationError("PENDING_EXISTS");
  }
}

async function assertWorkspaceInviteeIsNotActiveMember(
  db: TransactionDatabase,
  workspaceId: string,
  email: string,
): Promise<void> {
  const [membership] = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.status, "ACTIVE"),
        eq(users.email, email),
      ),
    )
    .limit(1);

  if (membership) {
    throw new InvitationError("ALREADY_MEMBER");
  }
}

async function assertClientInviteeIsNotActiveMember(
  db: TransactionDatabase,
  clientOrganizationId: string,
  email: string,
): Promise<void> {
  const [membership] = await db
    .select({ userId: clientMembers.userId })
    .from(clientMembers)
    .innerJoin(users, eq(users.id, clientMembers.userId))
    .where(
      and(
        eq(clientMembers.clientOrganizationId, clientOrganizationId),
        eq(clientMembers.status, "ACTIVE"),
        eq(users.email, email),
      ),
    )
    .limit(1);

  if (membership) {
    throw new InvitationError("ALREADY_MEMBER");
  }
}

async function insertInvitationWithDelivery(
  transaction: TransactionContext,
  input: Readonly<{
    workspaceId: string;
    clientOrganizationId: string | null;
    email: string;
    membershipType: InvitationMembershipType;
    intendedRole: WorkspaceRole | null;
    createdByUserId: string;
    now: Date;
    delivery: InvitationDeliveryConfiguration;
  }>,
): Promise<InvitationCommandResult> {
  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(input.now.getTime() + INVITATION_VALIDITY_MS);
  const [invitation] = await transaction.db
    .insert(invitations)
    .values({
      workspaceId: input.workspaceId,
      clientOrganizationId: input.clientOrganizationId,
      emailNormalized: input.email,
      membershipType: input.membershipType,
      intendedRole: input.intendedRole,
      tokenHash,
      createdByUserId: input.createdByUserId,
      createdAt: input.now,
      expiresAt,
    })
    .returning({ id: invitations.id });

  if (!invitation) {
    throw new Error("Invitation insert did not return an id.");
  }

  const eventType = eventTypeFor(input.membershipType);
  const url = invitationUrl(input.delivery.baseUrl, token);
  await insertOutboxEvent(transaction.db, {
    workspaceId: input.workspaceId,
    aggregateType: "invitation",
    aggregateId: invitation.id,
    eventType,
    payload: protectInvitationDelivery(
      { to: input.email, url },
      input.delivery.encryptionSecret,
      eventType,
    ),
  });

  return { invitationId: invitation.id, token, expiresAt };
}

export async function inviteWorkspaceMember(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
    delivery: InvitationDeliveryConfiguration;
    clock?: Clock;
  }>,
): Promise<InvitationCommandResult> {
  const email = emailSchema.parse(options.email);
  const clock = options.clock ?? systemClock;
  const now = clock.now();

  return withTransaction(options.database, async (transaction) => {
    await requireActiveWorkspaceRole(transaction.db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: workspaceOwnerRoles,
    });
    await lockInvitationTarget(transaction, {
      workspaceId: options.workspaceId,
      membershipType: "WORKSPACE_MEMBER",
      clientOrganizationId: null,
      email,
    });
    await assertWorkspaceInviteeIsNotActiveMember(
      transaction.db,
      options.workspaceId,
      email,
    );
    await assertNoPendingInvitation(transaction.db, {
      workspaceId: options.workspaceId,
      membershipType: "WORKSPACE_MEMBER",
      clientOrganizationId: null,
      email,
      now,
    });

    return insertInvitationWithDelivery(transaction, {
      workspaceId: options.workspaceId,
      clientOrganizationId: null,
      email,
      membershipType: "WORKSPACE_MEMBER",
      intendedRole: options.role,
      createdByUserId: options.actorUserId,
      now,
      delivery: options.delivery,
    });
  });
}

export async function inviteClientMember(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    workspaceId: string;
    clientOrganizationId: string;
    email: string;
    delivery: InvitationDeliveryConfiguration;
    clock?: Clock;
  }>,
): Promise<InvitationCommandResult> {
  const email = emailSchema.parse(options.email);
  const clock = options.clock ?? systemClock;
  const now = clock.now();

  return withTransaction(options.database, async (transaction) => {
    await requireActiveWorkspaceRole(transaction.db, {
      workspaceId: options.workspaceId,
      userId: options.actorUserId,
      allowedRoles: workspaceClientManagerRoles,
    });

    const [organization] = await transaction.db
      .select({ id: clientOrganizations.id })
      .from(clientOrganizations)
      .where(
        and(
          eq(clientOrganizations.id, options.clientOrganizationId),
          eq(clientOrganizations.workspaceId, options.workspaceId),
          eq(clientOrganizations.status, "ACTIVE"),
        ),
      )
      .limit(1);

    if (!organization) {
      throw new InvitationError("TARGET_UNAVAILABLE");
    }

    await lockInvitationTarget(transaction, {
      workspaceId: options.workspaceId,
      membershipType: "CLIENT_MEMBER",
      clientOrganizationId: options.clientOrganizationId,
      email,
    });
    await assertClientInviteeIsNotActiveMember(
      transaction.db,
      options.clientOrganizationId,
      email,
    );
    await assertNoPendingInvitation(transaction.db, {
      workspaceId: options.workspaceId,
      membershipType: "CLIENT_MEMBER",
      clientOrganizationId: options.clientOrganizationId,
      email,
      now,
    });

    return insertInvitationWithDelivery(transaction, {
      workspaceId: options.workspaceId,
      clientOrganizationId: options.clientOrganizationId,
      email,
      membershipType: "CLIENT_MEMBER",
      intendedRole: null,
      createdByUserId: options.actorUserId,
      now,
      delivery: options.delivery,
    });
  });
}

type LockedInvitationRow = Readonly<{
  id: string;
  workspace_id: string;
  client_organization_id: string | null;
  email_normalized: string;
  membership_type: InvitationMembershipType;
  intended_role: WorkspaceRole | null;
  created_by_user_id: string;
  expires_at: Date;
  accepted_at: Date | null;
  revoked_at: Date | null;
}>;

async function lockInvitationById(
  transaction: TransactionContext,
  invitationId: string,
): Promise<LockedInvitationRow | null> {
  const result = await transaction.client.query<LockedInvitationRow>(
    `SELECT id,
            workspace_id,
            client_organization_id,
            email_normalized,
            membership_type,
            intended_role,
            created_by_user_id,
            expires_at,
            accepted_at,
            revoked_at
       FROM invitations
      WHERE id = $1
      FOR UPDATE`,
    [invitationId],
  );

  return result.rows[0] ?? null;
}

async function authorizeInvitationManagement(
  db: TransactionDatabase,
  invitation: LockedInvitationRow,
  actorUserId: string,
): Promise<void> {
  try {
    await requireActiveWorkspaceRole(db, {
      workspaceId: invitation.workspace_id,
      userId: actorUserId,
      allowedRoles:
        invitation.membership_type === "WORKSPACE_MEMBER"
          ? workspaceOwnerRoles
          : workspaceClientManagerRoles,
    });
  } catch {
    throw new InvitationError("FORBIDDEN");
  }
}

async function assertInvitationInviteeIsNotActiveMember(
  db: TransactionDatabase,
  invitation: LockedInvitationRow,
): Promise<void> {
  if (invitation.membership_type === "WORKSPACE_MEMBER") {
    await assertWorkspaceInviteeIsNotActiveMember(
      db,
      invitation.workspace_id,
      invitation.email_normalized,
    );
    return;
  }

  if (!invitation.client_organization_id) {
    throw new InvitationError("TARGET_UNAVAILABLE");
  }

  await assertClientInviteeIsNotActiveMember(
    db,
    invitation.client_organization_id,
    invitation.email_normalized,
  );
}

export async function resendInvitation(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    invitationId: string;
    delivery: InvitationDeliveryConfiguration;
    clock?: Clock;
  }>,
): Promise<InvitationCommandResult> {
  const clock = options.clock ?? systemClock;
  const now = clock.now();

  return withTransaction(options.database, async (transaction) => {
    const invitation = await lockInvitationById(
      transaction,
      options.invitationId,
    );
    if (!invitation) {
      throw new InvitationError("INVALID");
    }

    await authorizeInvitationManagement(
      transaction.db,
      invitation,
      options.actorUserId,
    );

    if (invitation.accepted_at) {
      throw new InvitationError("ALREADY_ACCEPTED");
    }
    if (invitation.revoked_at) {
      throw new InvitationError("REVOKED");
    }

    await ensureInvitationTargetAvailable(transaction, invitation);
    await lockInvitationTarget(transaction, {
      workspaceId: invitation.workspace_id,
      membershipType: invitation.membership_type,
      clientOrganizationId: invitation.client_organization_id,
      email: invitation.email_normalized,
    });
    await assertInvitationInviteeIsNotActiveMember(transaction.db, invitation);

    if (now.getTime() < invitation.expires_at.getTime()) {
      await transaction.db
        .update(invitations)
        .set({ revokedAt: now })
        .where(eq(invitations.id, invitation.id));
    }

    await assertNoPendingInvitation(transaction.db, {
      workspaceId: invitation.workspace_id,
      membershipType: invitation.membership_type,
      clientOrganizationId: invitation.client_organization_id,
      email: invitation.email_normalized,
      now,
    });

    return insertInvitationWithDelivery(transaction, {
      workspaceId: invitation.workspace_id,
      clientOrganizationId: invitation.client_organization_id,
      email: invitation.email_normalized,
      membershipType: invitation.membership_type,
      intendedRole: invitation.intended_role,
      createdByUserId: options.actorUserId,
      now,
      delivery: options.delivery,
    });
  });
}

export async function revokeInvitation(
  options: Readonly<{
    database: DatabaseClient;
    actorUserId: string;
    invitationId: string;
    clock?: Clock;
  }>,
): Promise<boolean> {
  const clock = options.clock ?? systemClock;
  const now = clock.now();

  return withTransaction(options.database, async (transaction) => {
    const invitation = await lockInvitationById(
      transaction,
      options.invitationId,
    );
    if (!invitation) {
      return false;
    }

    await authorizeInvitationManagement(
      transaction.db,
      invitation,
      options.actorUserId,
    );

    if (
      invitation.accepted_at ||
      invitation.revoked_at ||
      now.getTime() >= invitation.expires_at.getTime()
    ) {
      return false;
    }

    const updated = await transaction.db
      .update(invitations)
      .set({ revokedAt: now })
      .where(eq(invitations.id, invitation.id))
      .returning({ id: invitations.id });

    return updated.length === 1;
  });
}

async function activeAcceptedMembershipExists(
  transaction: TransactionContext,
  invitation: LockedInvitationRow,
  userId: string,
): Promise<boolean> {
  if (invitation.membership_type === "WORKSPACE_MEMBER") {
    const result = await transaction.client.query(
      `SELECT 1
         FROM workspace_members
        WHERE workspace_id = $1
          AND user_id = $2
          AND status = 'ACTIVE'
        LIMIT 1`,
      [invitation.workspace_id, userId],
    );
    return result.rowCount === 1;
  }

  const result = await transaction.client.query(
    `SELECT 1
       FROM client_members
      WHERE workspace_id = $1
        AND client_organization_id = $2
        AND user_id = $3
        AND status = 'ACTIVE'
      LIMIT 1`,
    [invitation.workspace_id, invitation.client_organization_id, userId],
  );
  return result.rowCount === 1;
}

async function ensureInvitationTargetAvailable(
  transaction: TransactionContext,
  invitation: LockedInvitationRow,
): Promise<void> {
  if (invitation.membership_type === "WORKSPACE_MEMBER") {
    const result = await transaction.client.query(
      "SELECT 1 FROM workspaces WHERE id = $1 LIMIT 1",
      [invitation.workspace_id],
    );
    if (result.rowCount !== 1) {
      throw new InvitationError("TARGET_UNAVAILABLE");
    }
    return;
  }

  const result = await transaction.client.query(
    `SELECT 1
       FROM client_organizations
      WHERE id = $1
        AND workspace_id = $2
        AND status = 'ACTIVE'
      LIMIT 1`,
    [invitation.client_organization_id, invitation.workspace_id],
  );
  if (result.rowCount !== 1) {
    throw new InvitationError("TARGET_UNAVAILABLE");
  }
}

async function activateMembership(
  transaction: TransactionContext,
  invitation: LockedInvitationRow,
  userId: string,
  now: Date,
): Promise<void> {
  if (invitation.membership_type === "WORKSPACE_MEMBER") {
    await transaction.client.query(
      `INSERT INTO workspace_members (
         workspace_id, user_id, role, status, joined_at, revoked_at
       ) VALUES ($1, $2, $3, 'ACTIVE', $4, NULL)
       ON CONFLICT (workspace_id, user_id)
       DO UPDATE SET
         role = CASE
           WHEN workspace_members.status = 'REVOKED' THEN EXCLUDED.role
           ELSE workspace_members.role
         END,
         status = 'ACTIVE',
         joined_at = CASE
           WHEN workspace_members.status = 'REVOKED' THEN EXCLUDED.joined_at
           ELSE workspace_members.joined_at
         END,
         revoked_at = NULL`,
      [invitation.workspace_id, userId, invitation.intended_role, now],
    );
    return;
  }

  await transaction.client.query(
    `INSERT INTO client_members (
       workspace_id, client_organization_id, user_id, status, joined_at, revoked_at
     ) VALUES ($1, $2, $3, 'ACTIVE', $4, NULL)
     ON CONFLICT (client_organization_id, user_id)
     DO UPDATE SET
       status = 'ACTIVE',
       joined_at = CASE
         WHEN client_members.status = 'REVOKED' THEN EXCLUDED.joined_at
         ELSE client_members.joined_at
       END,
       revoked_at = NULL`,
    [invitation.workspace_id, invitation.client_organization_id, userId, now],
  );
}

export async function acceptInvitation(
  options: Readonly<{
    database: DatabaseClient;
    authenticatedUserId: string;
    token: string;
    clock?: Clock;
  }>,
): Promise<InvitationAcceptanceResult> {
  const clock = options.clock ?? systemClock;
  const tokenHash = hashInvitationToken(options.token);

  return withTransaction(options.database, async (transaction) => {
    const result = await transaction.client.query<LockedInvitationRow>(
      `SELECT id,
              workspace_id,
              client_organization_id,
              email_normalized,
              membership_type,
              intended_role,
              created_by_user_id,
              expires_at,
              accepted_at,
              revoked_at
         FROM invitations
        WHERE token_hash = $1
        FOR UPDATE`,
      [tokenHash],
    );
    const invitation = result.rows[0];
    if (!invitation) {
      throw new InvitationError("INVALID");
    }

    const userResult = await transaction.client.query<{
      email_normalized: string;
      email_verified: boolean;
      disabled_at: Date | null;
    }>(
      `SELECT email_normalized, email_verified, disabled_at
         FROM users
        WHERE id = $1
        LIMIT 1`,
      [options.authenticatedUserId],
    );
    const user = userResult.rows[0];
    if (
      !user ||
      user.disabled_at ||
      !user.email_verified ||
      user.email_normalized !== invitation.email_normalized
    ) {
      throw new InvitationError("WRONG_ACCOUNT");
    }

    if (invitation.revoked_at) {
      throw new InvitationError("REVOKED");
    }

    if (invitation.accepted_at) {
      if (
        await activeAcceptedMembershipExists(
          transaction,
          invitation,
          options.authenticatedUserId,
        )
      ) {
        return {
          status: "already-accepted",
          membershipType: invitation.membership_type,
          workspaceId: invitation.workspace_id,
          clientOrganizationId: invitation.client_organization_id,
        };
      }
      throw new InvitationError("ALREADY_ACCEPTED");
    }

    const now = clock.now();
    if (now.getTime() >= invitation.expires_at.getTime()) {
      throw new InvitationError("EXPIRED");
    }

    await ensureInvitationTargetAvailable(transaction, invitation);
    await activateMembership(
      transaction,
      invitation,
      options.authenticatedUserId,
      now,
    );
    await transaction.client.query(
      `UPDATE invitations
          SET accepted_at = $2
        WHERE id = $1
          AND accepted_at IS NULL
          AND revoked_at IS NULL`,
      [invitation.id, now],
    );

    return {
      status: "accepted",
      membershipType: invitation.membership_type,
      workspaceId: invitation.workspace_id,
      clientOrganizationId: invitation.client_organization_id,
    };
  });
}
