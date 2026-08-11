import { and, asc, desc, eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  clientMembers,
  clientOrganizations,
  invitations,
  users,
  workspaceMembers,
  workspaces,
  type WorkspaceRole,
} from "../../db/schema";

export type WorkspaceContextDetail = Readonly<{
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
}>;

export type ClientContextDetail = Readonly<{
  workspaceId: string;
  workspaceName: string;
  clientOrganizationId: string;
  clientOrganizationName: string;
}>;

export type MembershipContextDetails = Readonly<{
  workspaceMemberships: readonly WorkspaceContextDetail[];
  clientMemberships: readonly ClientContextDetail[];
}>;

export async function listActiveMembershipContextDetails(
  database: DatabaseClient,
  userId: string,
): Promise<MembershipContextDetails> {
  const [workspaceRows, clientRows] = await Promise.all([
    database.db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        workspaceName: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      )
      .orderBy(asc(workspaces.name), asc(workspaceMembers.workspaceId)),
    database.db
      .select({
        workspaceId: clientMembers.workspaceId,
        workspaceName: workspaces.name,
        clientOrganizationId: clientMembers.clientOrganizationId,
        clientOrganizationName: clientOrganizations.name,
      })
      .from(clientMembers)
      .innerJoin(
        clientOrganizations,
        and(
          eq(clientOrganizations.id, clientMembers.clientOrganizationId),
          eq(clientOrganizations.workspaceId, clientMembers.workspaceId),
        ),
      )
      .innerJoin(workspaces, eq(workspaces.id, clientMembers.workspaceId))
      .where(
        and(
          eq(clientMembers.userId, userId),
          eq(clientMembers.status, "ACTIVE"),
          eq(clientOrganizations.status, "ACTIVE"),
        ),
      )
      .orderBy(
        asc(workspaces.name),
        asc(clientOrganizations.name),
        asc(clientMembers.clientOrganizationId),
      ),
  ]);

  return {
    workspaceMemberships: workspaceRows,
    clientMemberships: clientRows,
  };
}

export type AgencyWorkspaceSelection = Readonly<{
  selected: WorkspaceContextDetail;
  options: readonly WorkspaceContextDetail[];
}>;

export async function resolveAgencyWorkspaceSelection(
  database: DatabaseClient,
  input: Readonly<{
    userId: string;
    requestedWorkspaceId?: string;
    allowedRoles: ReadonlySet<WorkspaceRole>;
  }>,
): Promise<AgencyWorkspaceSelection | null> {
  const contexts = await listActiveMembershipContextDetails(
    database,
    input.userId,
  );
  const eligible = contexts.workspaceMemberships.filter((membership) =>
    input.allowedRoles.has(membership.role),
  );

  if (eligible.length === 0) {
    return null;
  }

  const selected = input.requestedWorkspaceId
    ? eligible.find(
        (membership) => membership.workspaceId === input.requestedWorkspaceId,
      )
    : eligible[0];

  if (!selected) {
    return null;
  }

  return { selected, options: eligible };
}

export type WorkspaceMemberListItem = Readonly<{
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: Date;
}>;

export type ManageableInvitationListItem = Readonly<{
  invitationId: string;
  email: string;
  intendedRole: WorkspaceRole | null;
  expiresAt: Date;
  status: "PENDING" | "EXPIRED";
}>;

type InvitationManagementRow = Readonly<{
  invitationId: string;
  email: string;
  intendedRole: WorkspaceRole | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}>;

function latestActionableInvitations(
  rows: readonly InvitationManagementRow[],
  now: Date,
): readonly ManageableInvitationListItem[] {
  const latestByEmail = new Map<string, InvitationManagementRow>();

  for (const row of rows) {
    if (!latestByEmail.has(row.email)) {
      latestByEmail.set(row.email, row);
    }
  }

  return [...latestByEmail.values()]
    .filter((row) => !row.acceptedAt && !row.revokedAt)
    .map<ManageableInvitationListItem>((row) => ({
      invitationId: row.invitationId,
      email: row.email,
      intendedRole: row.intendedRole,
      expiresAt: row.expiresAt,
      status: row.expiresAt.getTime() > now.getTime() ? "PENDING" : "EXPIRED",
    }))
    .sort((left, right) => left.email.localeCompare(right.email));
}

export async function listWorkspaceMemberManagementState(
  database: DatabaseClient,
  workspaceId: string,
  now: Date,
): Promise<
  Readonly<{
    members: readonly WorkspaceMemberListItem[];
    invitations: readonly ManageableInvitationListItem[];
  }>
> {
  const [members, invitationRows] = await Promise.all([
    database.db
      .select({
        userId: workspaceMembers.userId,
        name: users.name,
        email: users.email,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      )
      .orderBy(asc(users.name), asc(users.email)),
    database.db
      .select({
        invitationId: invitations.id,
        email: invitations.emailNormalized,
        intendedRole: invitations.intendedRole,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        revokedAt: invitations.revokedAt,
      })
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, workspaceId),
          eq(invitations.membershipType, "WORKSPACE_MEMBER"),
        ),
      )
      .orderBy(desc(invitations.createdAt)),
  ]);

  return {
    members,
    invitations: latestActionableInvitations(invitationRows, now),
  };
}

export type ClientOrganizationListItem = Readonly<{
  clientOrganizationId: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
  activeMemberCount: number;
}>;

export async function listClientOrganizationsForWorkspace(
  database: DatabaseClient,
  workspaceId: string,
): Promise<readonly ClientOrganizationListItem[]> {
  const [organizations, members] = await Promise.all([
    database.db
      .select({
        clientOrganizationId: clientOrganizations.id,
        name: clientOrganizations.name,
        status: clientOrganizations.status,
      })
      .from(clientOrganizations)
      .where(eq(clientOrganizations.workspaceId, workspaceId))
      .orderBy(asc(clientOrganizations.name)),
    database.db
      .select({
        clientOrganizationId: clientMembers.clientOrganizationId,
      })
      .from(clientMembers)
      .where(
        and(
          eq(clientMembers.workspaceId, workspaceId),
          eq(clientMembers.status, "ACTIVE"),
        ),
      ),
  ]);

  const counts = new Map<string, number>();
  for (const member of members) {
    counts.set(
      member.clientOrganizationId,
      (counts.get(member.clientOrganizationId) ?? 0) + 1,
    );
  }

  return organizations.map((organization) => ({
    ...organization,
    activeMemberCount: counts.get(organization.clientOrganizationId) ?? 0,
  }));
}

export type ClientOrganizationDetail = Readonly<{
  clientOrganizationId: string;
  workspaceId: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
  members: readonly Readonly<{
    userId: string;
    name: string;
    email: string;
    joinedAt: Date;
  }>[];
  invitations: readonly ManageableInvitationListItem[];
}>;

export async function getClientOrganizationDetail(
  database: DatabaseClient,
  input: Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
    now: Date;
  }>,
): Promise<ClientOrganizationDetail | null> {
  const [organization] = await database.db
    .select({
      clientOrganizationId: clientOrganizations.id,
      workspaceId: clientOrganizations.workspaceId,
      name: clientOrganizations.name,
      status: clientOrganizations.status,
    })
    .from(clientOrganizations)
    .where(
      and(
        eq(clientOrganizations.id, input.clientOrganizationId),
        eq(clientOrganizations.workspaceId, input.workspaceId),
      ),
    )
    .limit(1);

  if (!organization) {
    return null;
  }

  const [members, invitationRows] = await Promise.all([
    database.db
      .select({
        userId: clientMembers.userId,
        name: users.name,
        email: users.email,
        joinedAt: clientMembers.joinedAt,
      })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId))
      .where(
        and(
          eq(clientMembers.workspaceId, input.workspaceId),
          eq(clientMembers.clientOrganizationId, input.clientOrganizationId),
          eq(clientMembers.status, "ACTIVE"),
        ),
      )
      .orderBy(asc(users.name), asc(users.email)),
    database.db
      .select({
        invitationId: invitations.id,
        email: invitations.emailNormalized,
        intendedRole: invitations.intendedRole,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        revokedAt: invitations.revokedAt,
      })
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, input.workspaceId),
          eq(invitations.clientOrganizationId, input.clientOrganizationId),
          eq(invitations.membershipType, "CLIENT_MEMBER"),
        ),
      )
      .orderBy(desc(invitations.createdAt)),
  ]);

  return {
    ...organization,
    members,
    invitations: latestActionableInvitations(invitationRows, input.now),
  };
}
