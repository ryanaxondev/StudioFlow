import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { testActor } from "../helpers/authorization";
import {
  clientMembers,
  invitations,
  outboxEvents,
  users,
  workspaceMembers,
} from "../../src/db/schema";
import {
  changeWorkspaceMembershipRole,
  createClientOrganization,
  revokeClientMembership,
  revokeWorkspaceMembership,
} from "../../src/modules/memberships/service";
import { createWorkspaceForControlledSetup } from "../../src/modules/memberships/setup";
import { resolveActiveMembershipContexts } from "../../src/modules/memberships/queries";
import {
  acceptInvitation,
  hashInvitationToken,
  inviteClientMember,
  inviteWorkspaceMember,
  resendInvitation,
  revokeInvitation,
} from "../../src/modules/invitations/service";
import {
  CLIENT_INVITATION_DELIVERY_EVENT,
  revealInvitationDelivery,
  WORKSPACE_INVITATION_DELIVERY_EVENT,
} from "../../src/modules/invitations/email-outbox";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const baseInstant = "2026-08-11T10:00:00.000Z";
const baseClock = createFixedClock(baseInstant);
const delivery = {
  baseUrl: "http://127.0.0.1:3000",
  encryptionSecret: "studioflow-m06-invitation-test-secret-1234567890",
};

function laterClock(milliseconds: number) {
  return createFixedClock(
    new Date(new Date(baseInstant).getTime() + milliseconds),
  );
}

describe("M06 membership and invitation foundation", () => {
  let testDatabase: MigratedTestDatabase;

  beforeAll(async () => {
    testDatabase = await createMigratedTestDatabase();
  });

  beforeEach(async () => {
    const client = await testDatabase.database.pool.connect();
    try {
      await resetPublicSchemaData(client);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    await testDatabase?.drop();
  });

  async function createUser(
    email: string,
    options: Readonly<{ verified?: boolean; name?: string }> = {},
  ) {
    const verified = options.verified ?? true;
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({
        name: options.name ?? email.split("@")[0] ?? "Member",
        email: email.trim().toLowerCase(),
        emailVerified: verified,
        emailVerifiedAt: verified ? baseClock.now() : null,
      })
      .returning({ id: users.id, email: users.email });

    return user!;
  }

  async function createWorkspace(ownerEmail = "owner@example.com") {
    const owner = await createUser(ownerEmail);
    const created = await createWorkspaceForControlledSetup({
      database: testDatabase.database,
      ownerUserId: owner.id,
      name: "Northstar Studio",
      description: "Controlled M06 test workspace",
      timezone: "UTC",
      displayCurrency: "usd",
      clock: baseClock,
    });

    return { owner, workspaceId: created.workspaceId };
  }

  it("creates a controlled Workspace with one authoritative Agency Owner", async () => {
    const { owner, workspaceId } = await createWorkspace();

    const contexts = await resolveActiveMembershipContexts(
      testDatabase.database,
      owner.id,
    );
    expect(contexts).toEqual({
      workspaceMemberships: [{ workspaceId, role: "AGENCY_OWNER" }],
      clientMemberships: [],
    });
  });

  it("enforces invitation target shape in PostgreSQL", async () => {
    const { owner, workspaceId } = await createWorkspace();

    await expect(
      testDatabase.database.pool.query(
        `INSERT INTO invitations (
           workspace_id,
           email_normalized,
           membership_type,
           intended_role,
           token_hash,
           created_by_user_id,
           created_at,
           expires_at
         ) VALUES ($1, 'invalid@example.com', 'WORKSPACE_MEMBER', NULL, repeat('a', 64), $2, $3, $4)`,
        [workspaceId, owner.id, baseClock.now(), laterClock(60_000).now()],
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("creates an Agency invitation and protects its delivery payload", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const invitedEmail = "agency.member@example.com";
    const result = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: `  ${invitedEmail.toUpperCase()} `,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });

    const [storedInvitation] = await testDatabase.database.db
      .select()
      .from(invitations)
      .where(eq(invitations.id, result.invitationId));
    expect(storedInvitation).toMatchObject({
      workspaceId,
      emailNormalized: invitedEmail,
      membershipType: "WORKSPACE_MEMBER",
      intendedRole: "AGENCY_MEMBER",
      acceptedAt: null,
      revokedAt: null,
    });
    expect(storedInvitation!.tokenHash).toBe(hashInvitationToken(result.token));
    expect(storedInvitation!.tokenHash).not.toContain(result.token);
    expect(result.expiresAt.toISOString()).toBe("2026-08-18T10:00:00.000Z");

    const [event] = await testDatabase.database.db
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.aggregateId, result.invitationId));
    expect(event).toMatchObject({
      workspaceId,
      aggregateType: "invitation",
      eventType: WORKSPACE_INVITATION_DELIVERY_EVENT,
    });

    const serialized = JSON.stringify(event!.payload);
    expect(serialized).not.toContain(invitedEmail);
    expect(serialized).not.toContain(result.token);
    expect(serialized).not.toContain("/invite/");

    const revealed = revealInvitationDelivery(
      event!.payload,
      delivery.encryptionSecret,
      WORKSPACE_INVITATION_DELIVERY_EVENT,
    );
    expect(revealed.to).toBe(invitedEmail);
    expect(revealed.url).toBe(`http://127.0.0.1:3000/invite/${result.token}`);
  });

  it("enforces owner-only Agency invitation management and one live pending target", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const agencyMember = await createUser("agency@example.com");
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId,
      userId: agencyMember.id,
      role: "AGENCY_MEMBER",
      status: "ACTIVE",
      joinedAt: baseClock.now(),
    });

    await expect(
      inviteWorkspaceMember({
        database: testDatabase.database,
        actor: testActor(agencyMember.id),
        workspaceId,
        email: "other@example.com",
        role: "AGENCY_MEMBER",
        delivery,
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });

    await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: "pending@example.com",
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    await expect(
      inviteWorkspaceMember({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        email: "pending@example.com",
        role: "DELIVERY_MANAGER",
        delivery,
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ code: "PENDING_EXISTS" });
  });

  it("creates Client Organizations and Client invitations without granting agency membership", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const client = await createClientOrganization({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      name: "Kestrelon",
      clock: baseClock,
    });
    const invited = await createUser("client@example.com");
    const invitation = await inviteClientMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      clientOrganizationId: client.clientOrganizationId,
      email: invited.email,
      delivery,
      clock: baseClock,
    });

    const [event] = await testDatabase.database.db
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.aggregateId, invitation.invitationId));
    expect(event!.eventType).toBe(CLIENT_INVITATION_DELIVERY_EVENT);

    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(invited.id),
      token: invitation.token,
      clock: baseClock,
    });

    const contexts = await resolveActiveMembershipContexts(
      testDatabase.database,
      invited.id,
    );
    expect(contexts.workspaceMemberships).toEqual([]);
    expect(contexts.clientMemberships).toEqual([
      {
        workspaceId,
        clientOrganizationId: client.clientOrganizationId,
      },
    ]);
  });

  it("fails closed for cross-Workspace Client targets and database mismatches", async () => {
    const first = await createWorkspace("owner.one@example.com");
    const second = await createWorkspace("owner.two@example.com");
    const secondClient = await createClientOrganization({
      database: testDatabase.database,
      actor: testActor(second.owner.id),
      workspaceId: second.workspaceId,
      name: "Second Client",
      clock: baseClock,
    });

    await expect(
      inviteClientMember({
        database: testDatabase.database,
        actor: testActor(first.owner.id),
        workspaceId: first.workspaceId,
        clientOrganizationId: secondClient.clientOrganizationId,
        email: "cross@example.com",
        delivery,
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ code: "TARGET_UNAVAILABLE" });

    const user = await createUser("db-constraint@example.com");
    await expect(
      testDatabase.database.db.insert(clientMembers).values({
        workspaceId: first.workspaceId,
        clientOrganizationId: secondClient.clientOrganizationId,
        userId: user.id,
        status: "ACTIVE",
      }),
    ).rejects.toThrow();
  });

  it("rejects expired and revoked invitations", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const expiredUser = await createUser("expired@example.com");
    const expired = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: expiredUser.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(expiredUser.id),
        token: expired.token,
        clock: laterClock(7 * 24 * 60 * 60 * 1000),
      }),
    ).rejects.toMatchObject({ code: "EXPIRED" });

    const revokedUser = await createUser("revoked@example.com");
    const revoked = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: revokedUser.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    expect(
      await revokeInvitation({
        database: testDatabase.database,
        actor: testActor(owner.id),
        invitationId: revoked.invitationId,
        clock: laterClock(1_000),
      }),
    ).toBe(true);
    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(revokedUser.id),
        token: revoked.token,
        clock: laterClock(2_000),
      }),
    ).rejects.toMatchObject({ code: "REVOKED" });
  });

  it("resend creates a fresh invitation and invalidates the old token immediately", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const user = await createUser("resend@example.com");
    const original = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: user.email,
      role: "DELIVERY_MANAGER",
      delivery,
      clock: baseClock,
    });
    const resent = await resendInvitation({
      database: testDatabase.database,
      actor: testActor(owner.id),
      invitationId: original.invitationId,
      delivery,
      clock: laterClock(60_000),
    });

    expect(resent.invitationId).not.toBe(original.invitationId);
    expect(resent.token).not.toBe(original.token);
    const [originalRow] = await testDatabase.database.db
      .select({ revokedAt: invitations.revokedAt })
      .from(invitations)
      .where(eq(invitations.id, original.invitationId));
    expect(originalRow!.revokedAt).not.toBeNull();

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(user.id),
        token: original.token,
        clock: laterClock(61_000),
      }),
    ).rejects.toMatchObject({ code: "REVOKED" });

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(user.id),
        token: resent.token,
        clock: laterClock(61_000),
      }),
    ).resolves.toMatchObject({ status: "accepted" });
  });

  it("preserves expired invitation history when resending", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const user = await createUser("expired-resend@example.com");
    const original = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: user.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    const afterExpiry = laterClock(7 * 24 * 60 * 60 * 1000 + 1_000);

    expect(
      await revokeInvitation({
        database: testDatabase.database,
        actor: testActor(owner.id),
        invitationId: original.invitationId,
        clock: afterExpiry,
      }),
    ).toBe(false);

    const resent = await resendInvitation({
      database: testDatabase.database,
      actor: testActor(owner.id),
      invitationId: original.invitationId,
      delivery,
      clock: afterExpiry,
    });

    const [originalRow] = await testDatabase.database.db
      .select({ revokedAt: invitations.revokedAt })
      .from(invitations)
      .where(eq(invitations.id, original.invitationId));
    expect(originalRow!.revokedAt).toBeNull();

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(user.id),
        token: original.token,
        clock: afterExpiry,
      }),
    ).rejects.toMatchObject({ code: "EXPIRED" });
    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(user.id),
        token: resent.token,
        clock: afterExpiry,
      }),
    ).resolves.toMatchObject({ status: "accepted" });
  });

  it("does not resend a stale invitation after the target membership became active", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const user = await createUser("stale-resend@example.com");
    const stale = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: user.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    const afterExpiry = laterClock(7 * 24 * 60 * 60 * 1000 + 1_000);
    const current = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: user.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: afterExpiry,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(user.id),
      token: current.token,
      clock: afterExpiry,
    });

    await expect(
      resendInvitation({
        database: testDatabase.database,
        actor: testActor(owner.id),
        invitationId: stale.invitationId,
        delivery,
        clock: laterClock(7 * 24 * 60 * 60 * 1000 + 2_000),
      }),
    ).rejects.toMatchObject({ code: "ALREADY_MEMBER" });
  });

  it("requires the authenticated verified email to match the invitation", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const intended = await createUser("intended@example.com");
    const wrong = await createUser("wrong@example.com");
    const unverified = await createUser("unverified@example.com", {
      verified: false,
    });
    const invitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: intended.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(wrong.id),
        token: invitation.token,
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ code: "WRONG_ACCOUNT" });

    const unverifiedInvitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: unverified.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(unverified.id),
        token: unverifiedInvitation.token,
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ code: "WRONG_ACCOUNT" });
  });

  it("supports existing-user, new-user-after-invitation, duplicate, and concurrent acceptance", async () => {
    const { owner, workspaceId } = await createWorkspace();

    const existing = await createUser("existing@example.com");
    const existingInvitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: existing.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    expect(
      await acceptInvitation({
        database: testDatabase.database,
        actor: testActor(existing.id),
        token: existingInvitation.token,
        clock: baseClock,
      }),
    ).toMatchObject({ status: "accepted" });
    expect(
      await acceptInvitation({
        database: testDatabase.database,
        actor: testActor(existing.id),
        token: existingInvitation.token,
        clock: baseClock,
      }),
    ).toMatchObject({ status: "already-accepted" });

    const futureEmail = "future@example.com";
    const futureInvitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: futureEmail,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    const futureUser = await createUser(futureEmail);
    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(futureUser.id),
        token: futureInvitation.token,
        clock: baseClock,
      }),
    ).resolves.toMatchObject({ status: "accepted" });

    const concurrent = await createUser("concurrent@example.com");
    const concurrentInvitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: concurrent.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    const results = await Promise.all([
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(concurrent.id),
        token: concurrentInvitation.token,
        clock: baseClock,
      }),
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(concurrent.id),
        token: concurrentInvitation.token,
        clock: baseClock,
      }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([
      "accepted",
      "already-accepted",
    ]);

    const memberships = await testDatabase.database.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, concurrent.id),
        ),
      );
    expect(memberships).toHaveLength(1);
  });

  it("keeps accepted invitations terminal after their original expiry", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const user = await createUser("accepted-terminal@example.com");
    const invitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: user.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(user.id),
      token: invitation.token,
      clock: baseClock,
    });

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(user.id),
        token: invitation.token,
        clock: laterClock(7 * 24 * 60 * 60 * 1000 + 1_000),
      }),
    ).resolves.toMatchObject({ status: "already-accepted" });
  });

  it("revokes Workspace and Client membership immediately from active resolution", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const agency = await createUser("agency-revoke@example.com");
    const agencyInvitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: agency.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(agency.id),
      token: agencyInvitation.token,
      clock: baseClock,
    });

    const organization = await createClientOrganization({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      name: "Client",
      clock: baseClock,
    });
    const client = await createUser("client-revoke@example.com");
    const clientInvitation = await inviteClientMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      clientOrganizationId: organization.clientOrganizationId,
      email: client.email,
      delivery,
      clock: baseClock,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(client.id),
      token: clientInvitation.token,
      clock: baseClock,
    });

    expect(
      await revokeWorkspaceMembership({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        targetUserId: agency.id,
        clock: laterClock(10_000),
      }),
    ).toBe(true);
    expect(
      await revokeClientMembership({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        clientOrganizationId: organization.clientOrganizationId,
        targetUserId: client.id,
        clock: laterClock(10_000),
      }),
    ).toBe(true);

    expect(
      await resolveActiveMembershipContexts(testDatabase.database, agency.id),
    ).toEqual({ workspaceMemberships: [], clientMemberships: [] });
    expect(
      await resolveActiveMembershipContexts(testDatabase.database, client.id),
    ).toEqual({ workspaceMemberships: [], clientMemberships: [] });
  });

  it("allows an Agency Owner to change another active member's Workspace role", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const member = await createUser("role-change@example.com");
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId,
      userId: member.id,
      role: "AGENCY_MEMBER",
      status: "ACTIVE",
      joinedAt: baseClock.now(),
    });

    await expect(
      changeWorkspaceMembershipRole({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        targetUserId: member.id,
        role: "DELIVERY_MANAGER",
      }),
    ).resolves.toBe(true);

    const [updated] = await testDatabase.database.db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, member.id),
        ),
      )
      .limit(1);
    expect(updated?.role).toBe("DELIVERY_MANAGER");

    await expect(
      changeWorkspaceMembershipRole({
        database: testDatabase.database,
        actor: testActor(member.id),
        workspaceId,
        targetUserId: owner.id,
        role: "AGENCY_MEMBER",
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });

    await expect(
      changeWorkspaceMembershipRole({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        targetUserId: owner.id,
        role: "AGENCY_MEMBER",
      }),
    ).rejects.toThrow("cannot change their own Workspace role");

    await expect(
      revokeWorkspaceMembership({
        database: testDatabase.database,
        actor: testActor(owner.id),
        workspaceId,
        targetUserId: owner.id,
        clock: laterClock(1_000),
      }),
    ).rejects.toThrow("cannot revoke their own Workspace membership");
  });

  it("removes revoked managers from M06 management authority", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const manager = await createUser("manager@example.com");
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId,
      userId: manager.id,
      role: "DELIVERY_MANAGER",
      status: "ACTIVE",
      joinedAt: baseClock.now(),
    });

    await expect(
      createClientOrganization({
        database: testDatabase.database,
        actor: testActor(manager.id),
        workspaceId,
        name: "Manager Created Client",
        clock: baseClock,
      }),
    ).resolves.toBeDefined();

    await revokeWorkspaceMembership({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      targetUserId: manager.id,
      clock: laterClock(1_000),
    });

    await expect(
      createClientOrganization({
        database: testDatabase.database,
        actor: testActor(manager.id),
        workspaceId,
        name: "Should Fail",
        clock: laterClock(2_000),
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });

    const organization = await createClientOrganization({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      name: "Client Context",
      clock: baseClock,
    });
    const clientUser = await createUser("client-only@example.com");
    const clientInvitation = await inviteClientMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      clientOrganizationId: organization.clientOrganizationId,
      email: clientUser.email,
      delivery,
      clock: baseClock,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(clientUser.id),
      token: clientInvitation.token,
      clock: baseClock,
    });

    await expect(
      createClientOrganization({
        database: testDatabase.database,
        actor: testActor(clientUser.id),
        workspaceId,
        name: "Client Cannot Manage Agency",
        clock: baseClock,
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });
  });

  it("does not allow an accepted token to reactivate a later revoked membership", async () => {
    const { owner, workspaceId } = await createWorkspace();
    const member = await createUser("historical@example.com");
    const invitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      email: member.email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });
    await acceptInvitation({
      database: testDatabase.database,
      actor: testActor(member.id),
      token: invitation.token,
      clock: baseClock,
    });
    await revokeWorkspaceMembership({
      database: testDatabase.database,
      actor: testActor(owner.id),
      workspaceId,
      targetUserId: member.id,
      clock: laterClock(1_000),
    });

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        actor: testActor(member.id),
        token: invitation.token,
        clock: laterClock(2_000),
      }),
    ).rejects.toMatchObject({ code: "ALREADY_ACCEPTED" });

    const [storedMembership] = await testDatabase.database.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, member.id),
        ),
      );
    expect(storedMembership!.status).toBe("REVOKED");
  });
});
