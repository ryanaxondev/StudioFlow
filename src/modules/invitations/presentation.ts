import { and, eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientOrganizations,
  invitations,
  users,
  workspaces,
  type InvitationMembershipType,
  type WorkspaceRole,
} from "../../db/schema";
import type { Clock } from "../../lib/clock";
import { systemClock } from "../../lib/clock";
import { hashInvitationToken } from "./service";

export type InvitationPresentationState =
  | "valid"
  | "accepted"
  | "expired"
  | "revoked"
  | "invalid"
  | "target-unavailable";

export type InvitationPresentation = Readonly<{
  state: InvitationPresentationState;
  membershipType?: InvitationMembershipType;
  intendedRole?: WorkspaceRole | null;
  workspaceName?: string;
  clientOrganizationName?: string | null;
  expiresAt?: Date;
  identityExists?: boolean;
  invitedEmail?: string;
}>;

export async function getInvitationPresentation(
  database: DatabaseClient,
  token: string,
  clock: Clock = systemClock,
): Promise<InvitationPresentation> {
  if (!token || token.length > 512) {
    return { state: "invalid" };
  }

  const [row] = await database.db
    .select({
      membershipType: invitations.membershipType,
      intendedRole: invitations.intendedRole,
      email: invitations.emailNormalized,
      expiresAt: invitations.expiresAt,
      acceptedAt: invitations.acceptedAt,
      revokedAt: invitations.revokedAt,
      workspaceName: workspaces.name,
      clientOrganizationId: invitations.clientOrganizationId,
      clientOrganizationName: clientOrganizations.name,
      clientOrganizationStatus: clientOrganizations.status,
      identityId: users.id,
      identityDisabledAt: users.disabledAt,
    })
    .from(invitations)
    .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
    .leftJoin(
      clientOrganizations,
      and(
        eq(clientOrganizations.id, invitations.clientOrganizationId),
        eq(clientOrganizations.workspaceId, invitations.workspaceId),
      ),
    )
    .leftJoin(users, eq(users.email, invitations.emailNormalized))
    .where(eq(invitations.tokenHash, hashInvitationToken(token)))
    .limit(1);

  if (!row) {
    return { state: "invalid" };
  }

  const base = {
    membershipType: row.membershipType,
    intendedRole: row.intendedRole,
    workspaceName: row.workspaceName,
    clientOrganizationName: row.clientOrganizationName,
    expiresAt: row.expiresAt,
    identityExists: Boolean(row.identityId && !row.identityDisabledAt),
    invitedEmail: row.email,
  } as const;

  if (row.acceptedAt) {
    return { state: "accepted", ...base };
  }

  if (row.revokedAt) {
    return { state: "revoked", ...base };
  }

  if (clock.now().getTime() >= row.expiresAt.getTime()) {
    return { state: "expired", ...base };
  }

  if (
    row.membershipType === "CLIENT_MEMBER" &&
    (!row.clientOrganizationId || row.clientOrganizationStatus !== "ACTIVE")
  ) {
    return { state: "target-unavailable", ...base };
  }

  return { state: "valid", ...base };
}

export function invitationRoleLabel(
  membershipType: InvitationMembershipType | undefined,
  intendedRole: WorkspaceRole | null | undefined,
): string {
  if (membershipType === "CLIENT_MEMBER") {
    return "Client Member";
  }

  switch (intendedRole) {
    case "AGENCY_OWNER":
      return "Agency Owner";
    case "DELIVERY_MANAGER":
      return "Delivery Manager";
    case "AGENCY_MEMBER":
      return "Agency Member";
    default:
      return "Workspace Member";
  }
}
