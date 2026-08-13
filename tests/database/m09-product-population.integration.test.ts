import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { buildActorContext } from "../../src/modules/authorization/server/authorization";
import { AuthorizationError } from "../../src/modules/authorization/types";
import type { ActorContext } from "../../src/modules/authorization/types";
import { inviteClientMember } from "../../src/modules/invitations/service";
import {
  changeWorkspaceMembershipRole,
  createClientOrganization,
  RequiredProjectAuthorityError,
  revokeClientMembership,
  revokeWorkspaceMembership,
} from "../../src/modules/memberships/service";
import { resolveClientOrganizationAuthorization } from "../../src/modules/projects/client-organization-authorization";
import {
  developmentSeedIds,
  seedDevelopmentV1,
} from "../../src/modules/projects/development-seed";
import {
  assignProjectMember,
  createDraftProject,
  reassignClientApprover,
  reassignDeliveryManager,
} from "../../src/modules/projects/service";
import {
  getProjectSettingsCandidates,
  listAgencyProjects,
} from "../../src/modules/projects/queries";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const clock = createFixedClock("2026-08-13T18:00:00.000Z");
const delivery = {
  baseUrl: "http://127.0.0.1:3000",
  encryptionSecret: "studioflow-m09-product-population-secret-1234567890",
};

describe("M09 product population authorization handoffs", () => {
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
    await seedDevelopmentV1(testDatabase.database);
  });

  afterAll(async () => {
    await testDatabase?.drop();
  });

  function actor(userId: string): Promise<ActorContext> {
    return buildActorContext(testDatabase.database, {
      userId,
      sessionId: `m09-b2:${userId}`,
    });
  }

  it("grants Client Organization detail and member management only through assigned Delivery Manager authority", async () => {
    const [owner, manager] = await Promise.all([
      actor(developmentSeedIds.users.maya),
      actor(developmentSeedIds.users.daniel),
    ]);

    const assigned = await resolveClientOrganizationAuthorization(
      testDatabase.database,
      manager,
      {
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        capability: "MANAGE_CLIENT_MEMBERS",
      },
    );
    expect(assigned.status).toBe("allowed");

    await expect(
      inviteClientMember({
        database: testDatabase.database,
        actor: manager,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        email: "assigned-invitee@example.com",
        delivery,
        clock,
      }),
    ).resolves.toMatchObject({ invitationId: expect.any(String) });

    const otherClient = await createClientOrganization({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      name: "Unassigned Client",
      clock,
    });
    const unassigned = await resolveClientOrganizationAuthorization(
      testDatabase.database,
      manager,
      {
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: otherClient.clientOrganizationId,
        capability: "VIEW_CLIENT_ORGANIZATION",
      },
    );
    expect(unassigned).toMatchObject({
      status: "denied",
      result: {
        allowed: false,
        reason: "PROJECT_ASSIGNMENT_REQUIRED",
      },
    });
    await expect(
      inviteClientMember({
        database: testDatabase.database,
        actor: manager,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: otherClient.clientOrganizationId,
        email: "unassigned-invitee@example.com",
        delivery,
        clock,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    await expect(
      revokeClientMembership({
        database: testDatabase.database,
        actor: manager,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        targetUserId: developmentSeedIds.users.nia,
        clock,
      }),
    ).resolves.toBe(true);
  });

  it("keeps view-only Delivery Manager assignments non-actionable in Project collections", async () => {
    const [owner, manager] = await Promise.all([
      actor(developmentSeedIds.users.maya),
      actor(developmentSeedIds.users.daniel),
    ]);

    const created = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Read-only manager assignment",
      deliveryManagerUserId: developmentSeedIds.users.maya,
      idempotencyKey: "m09-b2-view-only-manager-draft",
      clock,
    });

    await assignProjectMember({
      database: testDatabase.database,
      actor: owner,
      projectId: created.projectId,
      userId: developmentSeedIds.users.daniel,
      projectRole: "AGENCY_MEMBER",
      expectedRowVersion: created.rowVersion,
      idempotencyKey: "m09-b2-view-only-manager-assignment",
      clock,
    });

    const visibleProjects = await listAgencyProjects(
      testDatabase.database,
      manager,
      {
        workspaceId: developmentSeedIds.workspace,
        capability: "VIEW_AGENCY_WORKSPACE",
      },
    );
    expect(
      visibleProjects.find(
        (project) => project.projectId === created.projectId,
      ),
    ).toMatchObject({ canManageProject: false });

    await expect(
      getProjectSettingsCandidates(
        testDatabase.database,
        manager,
        created.projectId,
      ),
    ).resolves.toMatchObject({ status: "denied" });
  });

  it("blocks upstream membership removal until required Project authority is reassigned", async () => {
    const owner = await actor(developmentSeedIds.users.maya);

    await expect(
      changeWorkspaceMembershipRole({
        database: testDatabase.database,
        actor: owner,
        workspaceId: developmentSeedIds.workspace,
        targetUserId: developmentSeedIds.users.daniel,
        role: "AGENCY_MEMBER",
      }),
    ).rejects.toBeInstanceOf(RequiredProjectAuthorityError);

    await expect(
      revokeWorkspaceMembership({
        database: testDatabase.database,
        actor: owner,
        workspaceId: developmentSeedIds.workspace,
        targetUserId: developmentSeedIds.users.daniel,
        clock,
      }),
    ).rejects.toBeInstanceOf(RequiredProjectAuthorityError);

    await expect(
      revokeClientMembership({
        database: testDatabase.database,
        actor: owner,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        targetUserId: developmentSeedIds.users.elena,
        clock,
      }),
    ).rejects.toBeInstanceOf(RequiredProjectAuthorityError);

    const managerUpdate = await reassignDeliveryManager({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      deliveryManagerUserId: developmentSeedIds.users.maya,
      expectedRowVersion: 1,
      idempotencyKey: "m09-b2-reassign-manager",
      clock,
    });
    const approverUpdate = await reassignClientApprover({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      clientApproverUserId: developmentSeedIds.users.marcus,
      expectedRowVersion: managerUpdate.rowVersion,
      idempotencyKey: "m09-b2-reassign-approver",
      clock,
    });
    expect(approverUpdate.rowVersion).toBeGreaterThan(managerUpdate.rowVersion);

    await expect(
      changeWorkspaceMembershipRole({
        database: testDatabase.database,
        actor: owner,
        workspaceId: developmentSeedIds.workspace,
        targetUserId: developmentSeedIds.users.daniel,
        role: "AGENCY_MEMBER",
      }),
    ).resolves.toBe(true);

    await expect(
      revokeClientMembership({
        database: testDatabase.database,
        actor: owner,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        targetUserId: developmentSeedIds.users.elena,
        clock,
      }),
    ).resolves.toBe(true);
  });
});
