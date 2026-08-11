import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { clientMembers, users, workspaceMembers } from "../../src/db/schema";
import { canViewClientOrganization } from "../../src/modules/authorization/policies";
import {
  buildActorContext,
  resolveAuthorizedAgencyWorkspaceSelection,
} from "../../src/modules/authorization/server/authorization";
import { AuthorizationError } from "../../src/modules/authorization/types";
import {
  createClientOrganization,
  revokeClientMembership,
  revokeWorkspaceMembership,
} from "../../src/modules/memberships/service";
import { createWorkspaceForControlledSetup } from "../../src/modules/memberships/setup";
import { listActiveMembershipContextDetails } from "../../src/modules/memberships/queries";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const clock = createFixedClock("2026-08-11T20:00:00.000Z");

describe("M07 tenant isolation and authoritative authorization", () => {
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

  async function createUser(email: string) {
    const [user] = await testDatabase.database.db
      .insert(users)
      .values({
        name: email.split("@")[0] ?? "User",
        email,
        emailVerified: true,
        emailVerifiedAt: clock.now(),
      })
      .returning({ id: users.id });
    if (!user) throw new Error("test user creation failed");
    return user;
  }

  async function createWorkspace(ownerUserId: string, name: string) {
    return createWorkspaceForControlledSetup({
      database: testDatabase.database,
      ownerUserId,
      name,
      timezone: "UTC",
      displayCurrency: "USD",
      clock,
    });
  }

  it("builds ActorContext only from active authoritative memberships", async () => {
    const owner = await createUser("owner.context@example.com");
    const client = await createUser("client.context@example.com");
    const workspace = await createWorkspace(owner.id, "Context Workspace");
    const ownerActor = await buildActorContext(testDatabase.database, {
      userId: owner.id,
      sessionId: "session-owner",
    });
    const organization = await createClientOrganization({
      database: testDatabase.database,
      actor: ownerActor,
      workspaceId: workspace.workspaceId,
      name: "Client Context",
      clock,
    });
    await testDatabase.database.db.insert(clientMembers).values({
      workspaceId: workspace.workspaceId,
      clientOrganizationId: organization.clientOrganizationId,
      userId: client.id,
      status: "ACTIVE",
      joinedAt: clock.now(),
    });

    const clientActor = await buildActorContext(testDatabase.database, {
      userId: client.id,
      sessionId: "session-client",
    });

    expect(ownerActor.workspaceMemberships).toEqual([
      { workspaceId: workspace.workspaceId, role: "AGENCY_OWNER" },
    ]);
    expect(clientActor.workspaceMemberships).toEqual([]);
    expect(clientActor.clientMemberships).toEqual([
      { clientOrganizationId: organization.clientOrganizationId },
    ]);

    const clientDetails = await listActiveMembershipContextDetails(
      testDatabase.database,
      client.id,
    );
    expect(clientDetails.clientMemberships).toEqual([
      {
        workspaceName: "Context Workspace",
        clientOrganizationId: organization.clientOrganizationId,
        clientOrganizationName: "Client Context",
      },
    ]);
    expect(clientDetails.clientMemberships[0]).not.toHaveProperty(
      "workspaceId",
    );
  });

  it("returns not-found semantics for a cross-Workspace requested context", async () => {
    const ownerA = await createUser("owner.a@example.com");
    const ownerB = await createUser("owner.b@example.com");
    const workspaceA = await createWorkspace(ownerA.id, "Workspace A");
    const workspaceB = await createWorkspace(ownerB.id, "Workspace B");
    const actorA = await buildActorContext(testDatabase.database, {
      userId: ownerA.id,
      sessionId: "session-a",
    });

    const selection = await resolveAuthorizedAgencyWorkspaceSelection(
      testDatabase.database,
      actorA,
      {
        requestedWorkspaceId: workspaceB.workspaceId,
        policy: canViewClientOrganization,
      },
    );
    expect(selection).toEqual({ status: "not-found" });

    await expect(
      createClientOrganization({
        database: testDatabase.database,
        actor: actorA,
        workspaceId: workspaceB.workspaceId,
        name: "Cross Tenant",
        clock,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    const ownSelection = await resolveAuthorizedAgencyWorkspaceSelection(
      testDatabase.database,
      actorA,
      {
        requestedWorkspaceId: workspaceA.workspaceId,
        policy: canViewClientOrganization,
      },
    );
    expect(ownSelection.status).toBe("allowed");
  });

  it("uses Access Denied semantics when the Workspace is known but the role is insufficient", async () => {
    const owner = await createUser("owner.role@example.com");
    const member = await createUser("member.role@example.com");
    const workspace = await createWorkspace(owner.id, "Role Workspace");
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId: workspace.workspaceId,
      userId: member.id,
      role: "AGENCY_MEMBER",
      status: "ACTIVE",
      joinedAt: clock.now(),
    });
    const actor = await buildActorContext(testDatabase.database, {
      userId: member.id,
      sessionId: "session-member",
    });

    const selection = await resolveAuthorizedAgencyWorkspaceSelection(
      testDatabase.database,
      actor,
      {
        requestedWorkspaceId: workspace.workspaceId,
        policy: canViewClientOrganization,
      },
    );
    expect(selection.status).toBe("denied");
  });

  it("keeps Delivery Manager Client-member writes fail-closed before assigned access exists", async () => {
    const owner = await createUser("owner.client-policy@example.com");
    const manager = await createUser("manager.client-policy@example.com");
    const workspace = await createWorkspace(
      owner.id,
      "Client Policy Workspace",
    );
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId: workspace.workspaceId,
      userId: manager.id,
      role: "DELIVERY_MANAGER",
      status: "ACTIVE",
      joinedAt: clock.now(),
    });

    const managerActor = await buildActorContext(testDatabase.database, {
      userId: manager.id,
      sessionId: "session-manager",
    });
    const organization = await createClientOrganization({
      database: testDatabase.database,
      actor: managerActor,
      workspaceId: workspace.workspaceId,
      name: "Manager Created Client",
      clock,
    });

    await expect(
      revokeClientMembership({
        database: testDatabase.database,
        actor: managerActor,
        workspaceId: workspace.workspaceId,
        clientOrganizationId: organization.clientOrganizationId,
        targetUserId: owner.id,
        clock,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("revocation defeats a stale ActorContext before a protected write", async () => {
    const owner = await createUser("owner.revoke@example.com");
    const secondOwner = await createUser("second.owner@example.com");
    const workspace = await createWorkspace(owner.id, "Revocation Workspace");
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId: workspace.workspaceId,
      userId: secondOwner.id,
      role: "AGENCY_OWNER",
      status: "ACTIVE",
      joinedAt: clock.now(),
    });

    const [ownerActor, staleSecondOwnerActor] = await Promise.all([
      buildActorContext(testDatabase.database, {
        userId: owner.id,
        sessionId: "session-owner",
      }),
      buildActorContext(testDatabase.database, {
        userId: secondOwner.id,
        sessionId: "session-second-owner",
      }),
    ]);

    await revokeWorkspaceMembership({
      database: testDatabase.database,
      actor: ownerActor,
      workspaceId: workspace.workspaceId,
      targetUserId: secondOwner.id,
      clock,
    });

    await expect(
      createClientOrganization({
        database: testDatabase.database,
        actor: staleSecondOwnerActor,
        workspaceId: workspace.workspaceId,
        name: "Must Not Exist",
        clock,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    const refreshed = await buildActorContext(testDatabase.database, {
      userId: secondOwner.id,
      sessionId: "session-second-owner",
    });
    expect(refreshed.workspaceMemberships).toEqual([]);
  });

  it("disabled identities do not retain membership in ActorContext", async () => {
    const owner = await createUser("disabled.owner@example.com");
    const workspace = await createWorkspace(owner.id, "Disabled Workspace");
    await testDatabase.database.db
      .update(users)
      .set({ disabledAt: clock.now() })
      .where(eq(users.id, owner.id));

    const actor = await buildActorContext(testDatabase.database, {
      userId: owner.id,
      sessionId: "disabled-session",
    });
    expect(actor.workspaceMemberships).toEqual([]);
    expect(actor.clientMemberships).toEqual([]);
    await expect(
      listActiveMembershipContextDetails(testDatabase.database, owner.id),
    ).resolves.toEqual({ workspaceMemberships: [], clientMemberships: [] });
    expect(workspace.workspaceId).toBeTruthy();
  });
});
