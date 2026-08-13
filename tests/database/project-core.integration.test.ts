import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { normalizeDatabaseError } from "../../src/db/errors";
import {
  activityEvents,
  clientOrganizations,
  idempotencyRecords,
  outboxEvents,
  projectMembers,
  projects,
  users,
  workspaceMembers,
  workspaces,
} from "../../src/db/schema";
import {
  canViewAgencyDelivery,
  canViewProject,
} from "../../src/modules/authorization/policies";
import { buildActorContext } from "../../src/modules/authorization/server/authorization";
import type { ActorContext } from "../../src/modules/authorization/types";
import { resolveProjectAuthorization } from "../../src/modules/projects/authorization";
import { runProjectCommand } from "../../src/modules/projects/command-transaction";
import {
  assertDevelopmentSeedVersion,
  DEVELOPMENT_SEED_VERSION,
  developmentSeedIds,
  seedDevelopmentV1,
} from "../../src/modules/projects/development-seed";
import {
  listAgencyDeliveryProjects,
  listAgencyProjectActivity,
  listAgencyProjects,
  listClientProjectActivity,
  listClientProjects,
} from "../../src/modules/projects/queries";
import {
  assignProjectMember,
  createDraftProject,
  deleteEligibleDraftProject,
  reassignClientApprover,
  reassignDeliveryManager,
  removeProjectMember,
  updateDraftProjectIdentity,
} from "../../src/modules/projects/service";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const commandClock = createFixedClock("2026-08-13T10:00:00.000Z");

function workspaceScope<
  Capability extends "VIEW_AGENCY_WORKSPACE" | "VIEW_AGENCY_DELIVERY",
>(
  capability: Capability,
): Readonly<{
  workspaceId: string;
  capability: Capability;
}> {
  return { workspaceId: developmentSeedIds.workspace, capability };
}

describe("M09 Project, assignment, Activity, and development seed core", () => {
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
      sessionId: `m09-test:${userId}`,
    });
  }

  it("creates a Draft idempotently with its required manager and immutable Project-created Activity", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const created = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Kestrelon Campaign Microsite",
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      idempotencyKey: "m09-create-draft",
      clock: commandClock,
    });

    const replay = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Kestrelon Campaign Microsite",
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      idempotencyKey: "m09-create-draft",
      clock: commandClock,
    });
    expect(replay).toEqual(created);

    const [projectRows, memberRows, activityRows] = await Promise.all([
      testDatabase.database.db
        .select()
        .from(projects)
        .where(eq(projects.id, created.projectId)),
      testDatabase.database.db
        .select()
        .from(projectMembers)
        .where(eq(projectMembers.projectId, created.projectId)),
      testDatabase.database.db
        .select()
        .from(activityEvents)
        .where(eq(activityEvents.projectId, created.projectId)),
    ]);

    expect(projectRows).toHaveLength(1);
    expect(projectRows[0]).toMatchObject({
      title: "Kestrelon Campaign Microsite",
      lifecycle: "DRAFT",
      rowVersion: 1,
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      clientApproverUserId: null,
    });
    expect(memberRows).toHaveLength(1);
    expect(memberRows[0]).toMatchObject({
      userId: developmentSeedIds.users.daniel,
      side: "AGENCY",
      projectRole: "DELIVERY_MANAGER",
      status: "ACTIVE",
    });
    expect(activityRows).toHaveLength(1);
    expect(activityRows[0]).toMatchObject({
      eventType: "project.created",
      visibility: "AGENCY_ONLY",
      actorUserId: developmentSeedIds.users.maya,
      actorNameSnapshot: "Maya Chen",
      actorRoleSnapshot: "AGENCY_OWNER",
      summaryKey: "activity.project.created",
    });

    let mutationError: unknown;
    try {
      await testDatabase.database.db
        .update(activityEvents)
        .set({ summaryKey: "must.not.change" })
        .where(eq(activityEvents.id, activityRows[0]!.id));
    } catch (error) {
      mutationError = error;
    }

    expect(normalizeDatabaseError(mutationError)).toMatchObject({
      code: "55000",
      kind: "unknown",
      retryable: false,
    });
  });

  it("authorizes Owner and assigned Agency roles, keeps Agency Member out of Delivery, and blocks Client access to Draft", async () => {
    const [owner, manager, member, client] = await Promise.all([
      actor(developmentSeedIds.users.maya),
      actor(developmentSeedIds.users.daniel),
      actor(developmentSeedIds.users.priya),
      actor(developmentSeedIds.users.elena),
    ]);

    for (const agencyActor of [owner, manager, member]) {
      const result = await resolveProjectAuthorization(
        testDatabase.database,
        agencyActor,
        developmentSeedIds.project,
        canViewProject,
      );
      expect(result.status).toBe("allowed");
    }

    expect(
      canViewAgencyDelivery(member, developmentSeedIds.workspace).allowed,
    ).toBe(false);

    const clientResult = await resolveProjectAuthorization(
      testDatabase.database,
      client,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(clientResult).toMatchObject({
      status: "denied",
      result: { allowed: false, reason: "PROJECT_DRAFT_AGENCY_ONLY" },
    });

    const ownerProjects = await listAgencyProjects(
      testDatabase.database,
      owner,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );
    const managerProjects = await listAgencyProjects(
      testDatabase.database,
      manager,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );
    const managerDelivery = await listAgencyDeliveryProjects(
      testDatabase.database,
      manager,
      workspaceScope("VIEW_AGENCY_DELIVERY"),
    );
    const memberProjects = await listAgencyProjects(
      testDatabase.database,
      member,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );
    expect(ownerProjects.map((project) => project.projectId)).toContain(
      developmentSeedIds.project,
    );
    expect(managerProjects.map((project) => project.projectId)).toEqual([
      developmentSeedIds.project,
    ]);
    expect(managerDelivery.map((project) => project.projectId)).toEqual([
      developmentSeedIds.project,
    ]);
    expect(memberProjects.map((project) => project.projectId)).toEqual([
      developmentSeedIds.project,
    ]);
  });

  it("keeps collection projections assignment-aware for Delivery Manager and Agency Member", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const manager = await actor(developmentSeedIds.users.daniel);
    const member = await actor(developmentSeedIds.users.priya);

    const unassigned = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Owner-only Draft",
      deliveryManagerUserId: developmentSeedIds.users.maya,
      idempotencyKey: "owner-only-draft",
      clock: commandClock,
    });

    const ownerDelivery = await listAgencyProjects(
      testDatabase.database,
      owner,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );
    const managerDelivery = await listAgencyProjects(
      testDatabase.database,
      manager,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );
    const memberProjects = await listAgencyProjects(
      testDatabase.database,
      member,
      workspaceScope("VIEW_AGENCY_WORKSPACE"),
    );

    expect(ownerDelivery.map((project) => project.projectId)).toContain(
      unassigned.projectId,
    );
    expect(managerDelivery.map((project) => project.projectId)).not.toContain(
      unassigned.projectId,
    );
    expect(memberProjects.map((project) => project.projectId)).not.toContain(
      unassigned.projectId,
    );
  });

  it("updates Draft identity with optimistic row versioning", async () => {
    const manager = await actor(developmentSeedIds.users.daniel);
    const updated = await updateDraftProjectIdentity({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      title: "Kestrelon Website Platform Rebuild",
      clientSummary: "A tighter client-safe summary.",
      plannedStartDate: "2026-03-03",
      targetCompletionDate: "2026-05-29",
      expectedRowVersion: 1,
      idempotencyKey: "update-identity",
      clock: commandClock,
    });
    expect(updated.rowVersion).toBe(2);

    await expect(
      updateDraftProjectIdentity({
        database: testDatabase.database,
        actor: manager,
        projectId: developmentSeedIds.project,
        title: "Stale write",
        expectedRowVersion: 1,
        idempotencyKey: "stale-update",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ code: "ROW_VERSION_CONFLICT" });
  });

  it("keeps a semantic Draft identity no-op free of row-version and Activity churn", async () => {
    const manager = await actor(developmentSeedIds.users.daniel);
    const beforeActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));

    const result = await updateDraftProjectIdentity({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      title: "Kestrelon Website Rebuild",
      clientSummary:
        "Sableframe is repositioning, redesigning, and rebuilding Kestrelon’s marketing website around a clearer customer-onboarding narrative. The engagement includes strategy, information architecture, visual design, frontend development, CMS implementation, launch support, and final handoff.",
      plannedStartDate: "2026-03-02",
      targetCompletionDate: "2026-05-22",
      expectedRowVersion: 1,
      idempotencyKey: "identity-no-op",
      clock: commandClock,
    });

    expect(result.rowVersion).toBe(1);

    const [project] = await testDatabase.database.db
      .select({ rowVersion: projects.rowVersion })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project));
    const afterActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));

    expect(project?.rowVersion).toBe(1);
    expect(afterActivity).toHaveLength(beforeActivity.length);
  });

  it("reassigns required authorities atomically and the database rejects orphaned required roles", async () => {
    const owner = await actor(developmentSeedIds.users.maya);

    const managerReassignment = await reassignDeliveryManager({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      deliveryManagerUserId: developmentSeedIds.users.maya,
      expectedRowVersion: 1,
      idempotencyKey: "reassign-dm",
      clock: commandClock,
    });
    expect(managerReassignment.rowVersion).toBe(2);

    const approverReassignment = await reassignClientApprover({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      clientApproverUserId: developmentSeedIds.users.marcus,
      expectedRowVersion: 2,
      idempotencyKey: "reassign-approver",
      clock: commandClock,
    });
    expect(approverReassignment.rowVersion).toBe(3);

    const [project] = await testDatabase.database.db
      .select({
        deliveryManagerUserId: projects.deliveryManagerUserId,
        clientApproverUserId: projects.clientApproverUserId,
      })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project));
    expect(project).toEqual({
      deliveryManagerUserId: developmentSeedIds.users.maya,
      clientApproverUserId: developmentSeedIds.users.marcus,
    });

    await expect(
      removeProjectMember({
        database: testDatabase.database,
        actor: owner,
        projectId: developmentSeedIds.project,
        userId: developmentSeedIds.users.maya,
        expectedRowVersion: 3,
        idempotencyKey: "remove-required-dm",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ code: "REQUIRED_ROLE" });

    await expect(
      testDatabase.database.pool.query(
        `UPDATE project_members
            SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP
          WHERE workspace_id = $1
            AND project_id = $2
            AND user_id = $3`,
        [
          developmentSeedIds.workspace,
          developmentSeedIds.project,
          developmentSeedIds.users.maya,
        ],
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("rejects cross-tenant Project membership and removes access immediately after member revocation", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const staleMember = await actor(developmentSeedIds.users.priya);

    const [foreignUser] = await testDatabase.database.db
      .insert(users)
      .values({
        name: "Foreign Member",
        email: "foreign.member@m09.example.com",
        emailVerified: true,
        emailVerifiedAt: commandClock.now(),
      })
      .returning({ id: users.id });
    const [foreignWorkspace] = await testDatabase.database.db
      .insert(workspaces)
      .values({
        name: "Foreign Workspace",
        timezone: "UTC",
        displayCurrency: "USD",
      })
      .returning({ id: workspaces.id });
    await testDatabase.database.db.insert(workspaceMembers).values({
      workspaceId: foreignWorkspace!.id,
      userId: foreignUser!.id,
      role: "AGENCY_MEMBER",
      status: "ACTIVE",
      joinedAt: commandClock.now(),
    });

    await expect(
      assignProjectMember({
        database: testDatabase.database,
        actor: owner,
        projectId: developmentSeedIds.project,
        userId: foreignUser!.id,
        projectRole: "AGENCY_MEMBER",
        expectedRowVersion: 1,
        idempotencyKey: "cross-tenant-member",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ code: "INVALID_MEMBER" });

    const removed = await removeProjectMember({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      userId: developmentSeedIds.users.priya,
      expectedRowVersion: 1,
      idempotencyKey: "remove-priya",
      clock: commandClock,
    });
    expect(removed.rowVersion).toBe(2);

    const authorization = await resolveProjectAuthorization(
      testDatabase.database,
      staleMember,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(authorization.status).toBe("denied");
  });

  it("hard-deletes only eligible Drafts, removes their Activity atomically, and replays deletion idempotently", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const created = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Disposable Draft",
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      idempotencyKey: "create-disposable",
      clock: commandClock,
    });

    const deleted = await deleteEligibleDraftProject({
      database: testDatabase.database,
      actor: owner,
      projectId: created.projectId,
      expectedRowVersion: created.rowVersion,
      idempotencyKey: "delete-disposable",
      clock: commandClock,
    });
    expect(deleted).toEqual({ projectId: created.projectId, deleted: true });

    const replay = await deleteEligibleDraftProject({
      database: testDatabase.database,
      actor: owner,
      projectId: created.projectId,
      expectedRowVersion: created.rowVersion,
      idempotencyKey: "delete-disposable",
      clock: commandClock,
    });
    expect(replay).toEqual(deleted);

    const [projectRows, activityRows, memberRows] = await Promise.all([
      testDatabase.database.db
        .select()
        .from(projects)
        .where(eq(projects.id, created.projectId)),
      testDatabase.database.db
        .select()
        .from(activityEvents)
        .where(eq(activityEvents.projectId, created.projectId)),
      testDatabase.database.db
        .select()
        .from(projectMembers)
        .where(eq(projectMembers.projectId, created.projectId)),
    ]);
    expect(projectRows).toEqual([]);
    expect(activityRows).toEqual([]);
    expect(memberRows).toEqual([]);
  });

  it("blocks Draft hard deletion after client-authored Activity exists", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const created = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Client-touched Draft",
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      idempotencyKey: "create-client-touched",
      clock: commandClock,
    });

    await testDatabase.database.db.insert(activityEvents).values({
      workspaceId: developmentSeedIds.workspace,
      projectId: created.projectId,
      eventType: "project.client_probe",
      visibility: "CLIENT_VISIBLE",
      actorUserId: developmentSeedIds.users.marcus,
      actorNameSnapshot: "Marcus Reed",
      actorRoleSnapshot: "CLIENT_CONTRIBUTOR",
      subjectType: "PROJECT",
      subjectId: created.projectId,
      summaryKey: "activity.project.client_probe",
      metadata: {},
      occurredAt: commandClock.now(),
    });

    await expect(
      deleteEligibleDraftProject({
        database: testDatabase.database,
        actor: owner,
        projectId: created.projectId,
        expectedRowVersion: created.rowVersion,
        idempotencyKey: "delete-client-touched",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ code: "DELETE_NOT_ELIGIBLE" });
  });

  it("keeps Client Project DTOs explicit and hides Agency-only membership Activity", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const client = await actor(developmentSeedIds.users.elena);

    expect(await listClientProjects(testDatabase.database, client)).toEqual([]);

    const removed = await removeProjectMember({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      userId: developmentSeedIds.users.nia,
      expectedRowVersion: 1,
      idempotencyKey: "remove-nia-for-visibility",
      clock: commandClock,
    });
    const assignment = await assignProjectMember({
      database: testDatabase.database,
      actor: owner,
      projectId: developmentSeedIds.project,
      userId: developmentSeedIds.users.nia,
      projectRole: "CLIENT_CONTRIBUTOR",
      expectedRowVersion: removed.rowVersion,
      idempotencyKey: "reassign-nia-for-visibility",
      clock: commandClock,
    });
    expect(assignment.rowVersion).toBe(3);

    await testDatabase.database.db
      .update(projects)
      .set({ lifecycle: "ONBOARDING" })
      .where(eq(projects.id, developmentSeedIds.project));

    await testDatabase.database.db.insert(activityEvents).values({
      workspaceId: developmentSeedIds.workspace,
      projectId: developmentSeedIds.project,
      eventType: "project.client_visible_probe",
      visibility: "CLIENT_VISIBLE",
      actorUserId: developmentSeedIds.users.daniel,
      actorNameSnapshot: "Daniel Ortiz",
      actorRoleSnapshot: "DELIVERY_MANAGER",
      subjectType: "PROJECT",
      subjectId: developmentSeedIds.project,
      summaryKey: "activity.project.client_visible_probe",
      metadata: { safe: true },
      occurredAt: commandClock.now(),
    });

    const clientProjects = await listClientProjects(
      testDatabase.database,
      client,
    );
    expect(clientProjects).toHaveLength(1);
    const serialized = JSON.stringify(clientProjects[0]);
    for (const forbidden of [
      "workspaceId",
      "deliveryManagerUserId",
      "clientApproverUserId",
      "cancelledReasonInternal",
      "rowVersion",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }

    const clientAuthorization = await resolveProjectAuthorization(
      testDatabase.database,
      client,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(clientAuthorization.status).toBe("allowed");
    if (clientAuthorization.status !== "allowed") {
      throw new Error("Expected seeded client Project authorization.");
    }

    const clientActivity = await listClientProjectActivity(
      testDatabase.database,
      clientAuthorization.scope,
    );
    expect(clientActivity.map((event) => event.eventType)).toEqual([
      "project.client_visible_probe",
    ]);

    const ownerAuthorization = await resolveProjectAuthorization(
      testDatabase.database,
      owner,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(ownerAuthorization.status).toBe("allowed");
    if (ownerAuthorization.status !== "allowed") {
      throw new Error("Expected owner Project authorization.");
    }
    const agencyActivity = await listAgencyProjectActivity(
      testDatabase.database,
      ownerAuthorization.scope,
    );
    const agencyEventTypes = agencyActivity.map((event) => event.eventType);
    expect(agencyEventTypes).toContain("project.created");
    expect(agencyEventTypes).toContain("project.member_removed");
    expect(agencyEventTypes).toContain("project.member_assigned");
    expect(agencyEventTypes).toContain("project.client_visible_probe");
  });

  it("revokes Client Project authority when the Client Organization is archived and rejects new Client authority assignment", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const client = await actor(developmentSeedIds.users.elena);

    await testDatabase.database.db
      .update(clientOrganizations)
      .set({ status: "ARCHIVED" })
      .where(eq(clientOrganizations.id, developmentSeedIds.clientOrganization));

    await expect(
      reassignClientApprover({
        database: testDatabase.database,
        actor: owner,
        projectId: developmentSeedIds.project,
        clientApproverUserId: developmentSeedIds.users.marcus,
        expectedRowVersion: 1,
        idempotencyKey: "archived-client-approver",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ code: "INVALID_MEMBER" });

    await testDatabase.database.db
      .update(projects)
      .set({ lifecycle: "ONBOARDING" })
      .where(eq(projects.id, developmentSeedIds.project));

    const authorization = await resolveProjectAuthorization(
      testDatabase.database,
      client,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(authorization.status).toBe("not-found");
    expect(await listClientProjects(testDatabase.database, client)).toEqual([]);
  });

  it("keeps the Activity hard-delete exception scoped to the exact Project aggregate", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const otherProject = await createDraftProject({
      database: testDatabase.database,
      actor: owner,
      workspaceId: developmentSeedIds.workspace,
      clientOrganizationId: developmentSeedIds.clientOrganization,
      title: "Hard-delete scope probe",
      deliveryManagerUserId: developmentSeedIds.users.daniel,
      idempotencyKey: "hard-delete-scope-probe",
      clock: commandClock,
    });

    const client = await testDatabase.database.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT set_config('studioflow.activity_hard_delete_project_id', $1, true)",
        [developmentSeedIds.project],
      );

      await expect(
        client.query("DELETE FROM activity_events WHERE project_id = $1", [
          otherProject.projectId,
        ]),
      ).rejects.toMatchObject({ code: "55000" });
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  });

  it("rolls state, Activity, Outbox, and idempotency reservation back in the same failed Project transaction", async () => {
    const owner = await actor(developmentSeedIds.users.maya);
    const original = await testDatabase.database.db
      .select({ title: projects.title })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project));
    const beforeActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));

    await expect(
      runProjectCommand({
        database: testDatabase.database,
        actor: owner,
        commandType: "project.transaction-rollback-probe",
        idempotencyKey: "rollback-probe",
        request: { projectId: developmentSeedIds.project },
        clock: commandClock,
        execute: async ({ transaction, recordActivity, enqueueOutbox }) => {
          await transaction.db
            .update(projects)
            .set({ title: "Must Roll Back" })
            .where(eq(projects.id, developmentSeedIds.project));
          await recordActivity({
            workspaceId: developmentSeedIds.workspace,
            projectId: developmentSeedIds.project,
            eventType: "project.rollback_probe",
            visibility: "AGENCY_ONLY",
            subjectType: "PROJECT",
            subjectId: developmentSeedIds.project,
            summaryKey: "activity.project.rollback_probe",
            actorRoleSnapshot: "AGENCY_OWNER",
            metadata: {},
          });
          await enqueueOutbox({
            workspaceId: developmentSeedIds.workspace,
            aggregateType: "PROJECT",
            aggregateId: developmentSeedIds.project,
            eventType: "project.rollback_probe",
            payload: { projectId: developmentSeedIds.project },
          });
          throw new Error("force Project transaction rollback");
        },
      }),
    ).rejects.toThrow("force Project transaction rollback");

    const [afterProject, afterActivity, outbox, idempotency] =
      await Promise.all([
        testDatabase.database.db
          .select({ title: projects.title })
          .from(projects)
          .where(eq(projects.id, developmentSeedIds.project)),
        testDatabase.database.db
          .select({ id: activityEvents.id })
          .from(activityEvents)
          .where(eq(activityEvents.projectId, developmentSeedIds.project)),
        testDatabase.database.db
          .select({ id: outboxEvents.id })
          .from(outboxEvents)
          .where(eq(outboxEvents.eventType, "project.rollback_probe")),
        testDatabase.database.db
          .select({ id: idempotencyRecords.id })
          .from(idempotencyRecords)
          .where(eq(idempotencyRecords.idempotencyKey, "rollback-probe")),
      ]);

    expect(afterProject).toEqual(original);
    expect(afterActivity).toEqual(beforeActivity);
    expect(outbox).toEqual([]);
    expect(idempotency).toEqual([]);
  });

  it("replays development seed v1 deterministically and rejects unsupported seed versions", async () => {
    const first = await seedDevelopmentV1(testDatabase.database);
    const second = await seedDevelopmentV1(
      testDatabase.database,
      DEVELOPMENT_SEED_VERSION,
    );
    expect(second).toEqual(first);

    const counts = await testDatabase.database.pool.query<{
      users: string;
      workspaces: string;
      clients: string;
      projects: string;
      project_members: string;
      activity: string;
    }>(
      `SELECT
         (SELECT count(*) FROM users)::text AS users,
         (SELECT count(*) FROM workspaces)::text AS workspaces,
         (SELECT count(*) FROM client_organizations)::text AS clients,
         (SELECT count(*) FROM projects)::text AS projects,
         (SELECT count(*) FROM project_members)::text AS project_members,
         (SELECT count(*) FROM activity_events)::text AS activity`,
    );
    expect(counts.rows[0]).toEqual({
      users: "7",
      workspaces: "1",
      clients: "1",
      projects: "1",
      project_members: "6",
      activity: "1",
    });

    const seedActivity = await testDatabase.database.db
      .select({
        eventType: activityEvents.eventType,
        actorUserId: activityEvents.actorUserId,
        actorNameSnapshot: activityEvents.actorNameSnapshot,
        actorRoleSnapshot: activityEvents.actorRoleSnapshot,
        occurredAt: activityEvents.occurredAt,
      })
      .from(activityEvents)
      .where(eq(activityEvents.id, developmentSeedIds.activityProjectCreated));
    expect(seedActivity).toEqual([
      {
        eventType: "project.created",
        actorUserId: developmentSeedIds.users.daniel,
        actorNameSnapshot: "Daniel Ortiz",
        actorRoleSnapshot: "DELIVERY_MANAGER",
        occurredAt: new Date("2026-03-02T08:10:00.000Z"),
      },
    ]);

    expect(() => assertDevelopmentSeedVersion(1)).not.toThrow();
    expect(() => assertDevelopmentSeedVersion(2)).toThrow(
      "Unsupported development seed version 2",
    );
  });
});
