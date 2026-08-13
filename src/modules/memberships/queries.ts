import { and, asc, desc, eq, isNull } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import type { AuthorizedWorkspaceScope } from "../authorization/types";
import {
  clientMembers,
  clientOrganizations,
  invitations,
  projects,
  users,
  workspaceBranding,
  workspaceMembers,
  workspaces,
  type WorkspaceRole,
} from "../../db/schema";

export type ActiveMembershipContexts = Readonly<{
  workspaceMemberships: readonly Readonly<{
    workspaceId: string;
    role: WorkspaceRole;
  }>[];
  clientMemberships: readonly Readonly<{
    workspaceId: string;
    clientOrganizationId: string;
  }>[];
}>;

export async function resolveActiveMembershipContexts(
  database: DatabaseClient,
  userId: string,
): Promise<ActiveMembershipContexts> {
  const [workspaceRows, clientRows] = await Promise.all([
    database.db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      ),
    database.db
      .select({
        workspaceId: clientMembers.workspaceId,
        clientOrganizationId: clientMembers.clientOrganizationId,
      })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId))
      .innerJoin(
        clientOrganizations,
        and(
          eq(clientOrganizations.id, clientMembers.clientOrganizationId),
          eq(clientOrganizations.workspaceId, clientMembers.workspaceId),
        ),
      )
      .where(
        and(
          eq(clientMembers.userId, userId),
          eq(clientMembers.status, "ACTIVE"),
          eq(clientOrganizations.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      ),
  ]);

  return {
    workspaceMemberships: workspaceRows,
    clientMemberships: clientRows,
  };
}

export type WorkspaceContextDetail = Readonly<{
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
}>;

export type ClientContextDetail = Readonly<{
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
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "ACTIVE"),
          isNull(users.disabledAt),
        ),
      )
      .orderBy(asc(workspaces.name), asc(workspaceMembers.workspaceId)),
    database.db
      .select({
        workspaceName: workspaces.name,
        clientOrganizationId: clientMembers.clientOrganizationId,
        clientOrganizationName: clientOrganizations.name,
      })
      .from(clientMembers)
      .innerJoin(users, eq(users.id, clientMembers.userId))
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
          isNull(users.disabledAt),
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
  scope: AuthorizedWorkspaceScope<"MANAGE_AGENCY_MEMBERS">,
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
          eq(workspaceMembers.workspaceId, scope.workspaceId),
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
          eq(invitations.workspaceId, scope.workspaceId),
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
  projectCount: number;
}>;

export async function listClientOrganizationsForWorkspace(
  database: DatabaseClient,
  scope: AuthorizedWorkspaceScope<"VIEW_CLIENT_ORGANIZATIONS">,
): Promise<readonly ClientOrganizationListItem[]> {
  const [organizations, members, projectRows] = await Promise.all([
    database.db
      .select({
        clientOrganizationId: clientOrganizations.id,
        name: clientOrganizations.name,
        status: clientOrganizations.status,
      })
      .from(clientOrganizations)
      .where(eq(clientOrganizations.workspaceId, scope.workspaceId))
      .orderBy(asc(clientOrganizations.name)),
    database.db
      .select({
        clientOrganizationId: clientMembers.clientOrganizationId,
      })
      .from(clientMembers)
      .where(
        and(
          eq(clientMembers.workspaceId, scope.workspaceId),
          eq(clientMembers.status, "ACTIVE"),
        ),
      ),
    database.db
      .select({
        clientOrganizationId: projects.clientOrganizationId,
      })
      .from(projects)
      .where(eq(projects.workspaceId, scope.workspaceId)),
  ]);

  const memberCounts = new Map<string, number>();
  for (const member of members) {
    memberCounts.set(
      member.clientOrganizationId,
      (memberCounts.get(member.clientOrganizationId) ?? 0) + 1,
    );
  }

  const projectCounts = new Map<string, number>();
  for (const project of projectRows) {
    projectCounts.set(
      project.clientOrganizationId,
      (projectCounts.get(project.clientOrganizationId) ?? 0) + 1,
    );
  }

  return organizations.map((organization) => ({
    ...organization,
    activeMemberCount: memberCounts.get(organization.clientOrganizationId) ?? 0,
    projectCount: projectCounts.get(organization.clientOrganizationId) ?? 0,
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
    scope: AuthorizedWorkspaceScope<"VIEW_CLIENT_ORGANIZATION">;
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
        eq(clientOrganizations.workspaceId, input.scope.workspaceId),
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
          eq(clientMembers.workspaceId, input.scope.workspaceId),
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
          eq(invitations.workspaceId, input.scope.workspaceId),
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

export type ClientPortalShellContext = Readonly<{
  workspaceName: string;
  clientOrganizationName: string;
  appliedAccentHex: string | null;
}>;

export async function listClientPortalShellContexts(
  database: DatabaseClient,
  userId: string,
): Promise<readonly ClientPortalShellContext[]> {
  return database.db
    .select({
      workspaceName: workspaces.name,
      clientOrganizationName: clientOrganizations.name,
      appliedAccentHex: workspaceBranding.appliedAccentHex,
    })
    .from(clientMembers)
    .innerJoin(users, eq(users.id, clientMembers.userId))
    .innerJoin(
      clientOrganizations,
      and(
        eq(clientOrganizations.id, clientMembers.clientOrganizationId),
        eq(clientOrganizations.workspaceId, clientMembers.workspaceId),
      ),
    )
    .innerJoin(workspaces, eq(workspaces.id, clientMembers.workspaceId))
    .leftJoin(
      workspaceBranding,
      eq(workspaceBranding.workspaceId, workspaces.id),
    )
    .where(
      and(
        eq(clientMembers.userId, userId),
        eq(clientMembers.status, "ACTIVE"),
        eq(clientOrganizations.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .orderBy(asc(workspaces.name), asc(clientOrganizations.name));
}
