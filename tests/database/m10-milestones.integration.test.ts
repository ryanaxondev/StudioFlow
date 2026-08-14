import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { normalizeDatabaseError } from "../../src/db/errors";
import {
  activityEvents,
  idempotencyRecords,
  milestones,
  outboxEvents,
  projects,
  workspaceMembers,
} from "../../src/db/schema";
import { buildActorContext } from "../../src/modules/authorization/server/authorization";
import type { ActorContext } from "../../src/modules/authorization/types";
import {
  DEVELOPMENT_SEED_V2_VERSION,
  m10DevelopmentSeedIds,
  seedDevelopmentV2,
} from "../../src/modules/milestones/development-seed";
import {
  getAgencyMilestonePlan,
  getClientMilestoneDetail,
  getClientMilestonePlan,
} from "../../src/modules/milestones/queries";
import {
  activateMilestone,
  cancelMilestone,
  completeMilestone,
  completeMilestoneWithOverride,
  createMilestoneDraft,
  moveProjectToActive,
  publishMilestone,
  publishProject,
  reorderMilestones,
  updateMilestoneDraft,
} from "../../src/modules/milestones/service";
import { resolveProjectAuthorization } from "../../src/modules/projects/authorization";
import {
  getClientProjectDetail,
  listClientProjectActivity,
  listClientProjects,
} from "../../src/modules/projects/queries";
import {
  developmentSeedIds,
  seedDevelopmentV1,
} from "../../src/modules/projects/development-seed";
import { canViewProject } from "../../src/modules/authorization/policies";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const commandClock = createFixedClock("2026-08-14T09:00:00.000Z");

async function actor(
  database: MigratedTestDatabase,
  userId: string,
): Promise<ActorContext> {
  return buildActorContext(database.database, {
    userId,
    sessionId: `m10-test:${userId}`,
  });
}

type DraftPlan = Readonly<{
  projectRowVersion: number;
  first: Readonly<{ id: string; rowVersion: number }>;
  second: Readonly<{ id: string; rowVersion: number }>;
}>;

async function createTwoMilestonePlan(
  testDatabase: MigratedTestDatabase,
  actingUser: ActorContext,
  prefix: string,
): Promise<DraftPlan> {
  const first = await createMilestoneDraft({
    database: testDatabase.database,
    actor: actingUser,
    projectId: developmentSeedIds.project,
    title: "Kickoff",
    purpose: "Align the delivery team and client.",
    clientDescription: "Kickoff and discovery.",
    plannedStartDate: "2026-03-02",
    plannedEndDate: "2026-03-13",
    expectedProjectRowVersion: 1,
    idempotencyKey: `${prefix}-first`,
    clock: commandClock,
  });
  const second = await createMilestoneDraft({
    database: testDatabase.database,
    actor: actingUser,
    projectId: developmentSeedIds.project,
    title: "Design",
    purpose: "Approve the visual direction.",
    clientDescription: "Visual design.",
    plannedStartDate: "2026-03-16",
    plannedEndDate: "2026-03-27",
    expectedProjectRowVersion: first.projectRowVersion,
    idempotencyKey: `${prefix}-second`,
    clock: commandClock,
  });

  return {
    projectRowVersion: second.projectRowVersion,
    first: { id: first.milestoneId, rowVersion: first.milestoneRowVersion },
    second: {
      id: second.milestoneId,
      rowVersion: second.milestoneRowVersion,
    },
  };
}

describe("M10 Milestone and Project publication foundation", () => {
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

  it("installs the M10 Milestone and registered-event Outbox indexes", async () => {
    const result = await testDatabase.database.pool.query<{
      active_milestone_index: string | null;
      outbox_event_type_index: string | null;
    }>(
      `SELECT to_regclass('public.milestones_one_active_per_project_idx')::text
                AS active_milestone_index,
              to_regclass('public.outbox_claim_event_type_ready_idx')::text
                AS outbox_event_type_index`,
    );

    expect(result.rows[0]).toEqual({
      active_milestone_index: "milestones_one_active_per_project_idx",
      outbox_event_type_index: "outbox_claim_event_type_ready_idx",
    });
  });

  it("enforces Milestone date ordering at the database boundary", async () => {
    let databaseError: unknown;
    try {
      await testDatabase.database.db.insert(milestones).values({
        workspaceId: developmentSeedIds.workspace,
        projectId: developmentSeedIds.project,
        title: "Invalid date range",
        position: 1,
        plannedStartDate: "2026-03-10",
        plannedEndDate: "2026-03-09",
      });
    } catch (error) {
      databaseError = error;
    }

    expect(normalizeDatabaseError(databaseError)).toMatchObject({
      code: "23514",
      retryable: false,
    });
  });

  it("lets an assigned Agency Member draft, edit, and reorder Milestones without publication authority", async () => {
    const member = await actor(testDatabase, developmentSeedIds.users.priya);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      member,
      "member-plan",
    );

    const updated = await updateMilestoneDraft({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      milestoneId: plan.first.id,
      title: "Kickoff & Discovery",
      purpose: "Align the delivery team and client.",
      clientDescription: "Kickoff and discovery.",
      plannedStartDate: "2026-03-02",
      plannedEndDate: "2026-03-13",
      expectedProjectRowVersion: plan.projectRowVersion,
      expectedMilestoneRowVersion: plan.first.rowVersion,
      idempotencyKey: "member-plan-update",
      clock: commandClock,
    });

    const reordered = await reorderMilestones({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      orderedMilestoneIds: [plan.second.id, plan.first.id],
      expectedProjectRowVersion: updated.projectRowVersion,
      idempotencyKey: "member-plan-reorder",
      clock: commandClock,
    });

    const ordered = await testDatabase.database.db
      .select({ id: milestones.id, position: milestones.position })
      .from(milestones)
      .where(eq(milestones.projectId, developmentSeedIds.project))
      .orderBy(milestones.position);
    expect(ordered.map((row) => row.id)).toEqual([
      plan.second.id,
      plan.first.id,
    ]);

    await expect(
      publishProject({
        database: testDatabase.database,
        actor: member,
        projectId: developmentSeedIds.project,
        expectedProjectRowVersion: reordered.projectRowVersion,
        idempotencyKey: "member-cannot-publish",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });
  });

  it("treats an unchanged Milestone Draft update as a semantic no-op", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const created = await createMilestoneDraft({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      title: "Kickoff",
      purpose: "Align the delivery team and client.",
      clientDescription: "Kickoff and discovery.",
      plannedStartDate: "2026-03-02",
      plannedEndDate: "2026-03-13",
      expectedProjectRowVersion: 1,
      idempotencyKey: "no-op-create",
      clock: commandClock,
    });
    const beforeActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));

    const unchanged = await updateMilestoneDraft({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: created.milestoneId,
      title: "Kickoff",
      purpose: "Align the delivery team and client.",
      clientDescription: "Kickoff and discovery.",
      plannedStartDate: "2026-03-02",
      plannedEndDate: "2026-03-13",
      expectedProjectRowVersion: created.projectRowVersion,
      expectedMilestoneRowVersion: created.milestoneRowVersion,
      idempotencyKey: "no-op-update",
      clock: commandClock,
    });

    expect(unchanged).toEqual(created);
    const afterActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));
    expect(afterActivity).toEqual(beforeActivity);
  });

  it("rejects a stale Milestone row version after an accepted Draft edit", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const created = await createMilestoneDraft({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      title: "Kickoff",
      expectedProjectRowVersion: 1,
      idempotencyKey: "stale-create",
      clock: commandClock,
    });
    const updated = await updateMilestoneDraft({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: created.milestoneId,
      title: "Kickoff & Discovery",
      expectedProjectRowVersion: created.projectRowVersion,
      expectedMilestoneRowVersion: created.milestoneRowVersion,
      idempotencyKey: "stale-first-update",
      clock: commandClock,
    });

    await expect(
      updateMilestoneDraft({
        database: testDatabase.database,
        actor: manager,
        projectId: developmentSeedIds.project,
        milestoneId: created.milestoneId,
        title: "Stale edit",
        expectedProjectRowVersion: updated.projectRowVersion,
        expectedMilestoneRowVersion: created.milestoneRowVersion,
        idempotencyKey: "stale-second-update",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({
      name: "ProjectDomainError",
      code: "ROW_VERSION_CONFLICT",
    });
  });

  it("publishes a valid Draft atomically, publishes the plan, activates the first Milestone, and unlocks Client Project access", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const client = await actor(testDatabase, developmentSeedIds.users.elena);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "publish-plan",
    );

    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "publish-project",
      clock: commandClock,
    });

    const [projectRows, milestoneRows, activityRows, outboxRows] =
      await Promise.all([
        testDatabase.database.db
          .select({
            lifecycle: projects.lifecycle,
            rowVersion: projects.rowVersion,
          })
          .from(projects)
          .where(eq(projects.id, developmentSeedIds.project)),
        testDatabase.database.db
          .select({
            id: milestones.id,
            position: milestones.position,
            state: milestones.state,
            publishedAt: milestones.publishedAt,
            rowVersion: milestones.rowVersion,
          })
          .from(milestones)
          .where(eq(milestones.projectId, developmentSeedIds.project))
          .orderBy(milestones.position),
        testDatabase.database.db
          .select({
            eventType: activityEvents.eventType,
            visibility: activityEvents.visibility,
          })
          .from(activityEvents)
          .where(eq(activityEvents.projectId, developmentSeedIds.project)),
        testDatabase.database.db
          .select({
            eventType: outboxEvents.eventType,
            payload: outboxEvents.payload,
            processedAt: outboxEvents.processedAt,
            failedAt: outboxEvents.failedAt,
          })
          .from(outboxEvents)
          .where(eq(outboxEvents.eventType, "project.published")),
      ]);

    expect(projectRows[0]).toMatchObject({
      lifecycle: "ONBOARDING",
      rowVersion: published.projectRowVersion,
    });
    expect(milestoneRows).toHaveLength(2);
    expect(milestoneRows[0]).toMatchObject({
      id: plan.first.id,
      state: "ACTIVE",
      rowVersion: 2,
    });
    expect(milestoneRows[1]).toMatchObject({
      id: plan.second.id,
      state: "PLANNED",
      rowVersion: 2,
    });
    expect(milestoneRows.every((row) => row.publishedAt instanceof Date)).toBe(
      true,
    );
    expect(activityRows).toEqual(
      expect.arrayContaining([
        { eventType: "project.published", visibility: "CLIENT_VISIBLE" },
        { eventType: "milestone.activated", visibility: "CLIENT_VISIBLE" },
      ]),
    );
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0]).toMatchObject({
      eventType: "project.published",
      processedAt: null,
      failedAt: null,
    });
    expect(outboxRows[0]?.payload).toMatchObject({
      schemaVersion: 1,
      projectId: developmentSeedIds.project,
      clientApproverUserId: developmentSeedIds.users.elena,
    });
    expect(outboxRows[0]?.payload).not.toHaveProperty("email");
    expect(JSON.stringify(outboxRows[0]?.payload)).not.toContain("@");

    const clientAccess = await resolveProjectAuthorization(
      testDatabase.database,
      client,
      developmentSeedIds.project,
      canViewProject,
    );
    expect(clientAccess.status).toBe("allowed");
  });

  it("keeps later Milestone drafts agency-only until a manager publishes them", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const member = await actor(testDatabase, developmentSeedIds.users.priya);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "later-draft-plan",
    );
    const publishedProject = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "later-draft-publish-project",
      clock: commandClock,
    });

    const laterDraft = await createMilestoneDraft({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      title: "Post-launch follow-up",
      clientDescription:
        "A later milestone that is not visible to the client yet.",
      expectedProjectRowVersion: publishedProject.projectRowVersion,
      idempotencyKey: "later-draft-create",
      clock: commandClock,
    });

    await expect(
      publishMilestone({
        database: testDatabase.database,
        actor: member,
        projectId: developmentSeedIds.project,
        milestoneId: laterDraft.milestoneId,
        expectedProjectRowVersion: laterDraft.projectRowVersion,
        expectedMilestoneRowVersion: laterDraft.milestoneRowVersion,
        idempotencyKey: "member-cannot-publish-later-draft",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({ name: "AuthorizationError" });

    const publishedMilestone = await publishMilestone({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: laterDraft.milestoneId,
      expectedProjectRowVersion: laterDraft.projectRowVersion,
      expectedMilestoneRowVersion: laterDraft.milestoneRowVersion,
      idempotencyKey: "manager-publishes-later-draft",
      clock: commandClock,
    });

    const [row] = await testDatabase.database.db
      .select({
        state: milestones.state,
        publishedAt: milestones.publishedAt,
        rowVersion: milestones.rowVersion,
      })
      .from(milestones)
      .where(eq(milestones.id, laterDraft.milestoneId))
      .limit(1);
    expect(row).toMatchObject({
      state: "PLANNED",
      rowVersion: publishedMilestone.milestoneRowVersion,
    });
    expect(row?.publishedAt).toBeInstanceOf(Date);

    const activity = await testDatabase.database.db
      .select({
        eventType: activityEvents.eventType,
        visibility: activityEvents.visibility,
        metadata: activityEvents.metadata,
      })
      .from(activityEvents)
      .where(eq(activityEvents.subjectId, laterDraft.milestoneId));
    expect(activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "milestone.draft_created",
          visibility: "AGENCY_ONLY",
        }),
        expect.objectContaining({
          eventType: "milestone.published",
          visibility: "CLIENT_VISIBLE",
          metadata: { ordinal: 3 },
        }),
      ]),
    );
    const publishedActivity = activity.find(
      (event) => event.eventType === "milestone.published",
    );
    expect(publishedActivity?.metadata).not.toHaveProperty("position");
  });

  it("lets an Agency Member reorder only unpublished later drafts without leaking the mixed sequence to Client Activity", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const member = await actor(testDatabase, developmentSeedIds.users.priya);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "private-reorder-plan",
    );
    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "private-reorder-publish",
      clock: commandClock,
    });
    const firstDraft = await createMilestoneDraft({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      title: "Private follow-up A",
      expectedProjectRowVersion: published.projectRowVersion,
      idempotencyKey: "private-reorder-a",
      clock: commandClock,
    });
    const secondDraft = await createMilestoneDraft({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      title: "Private follow-up B",
      expectedProjectRowVersion: firstDraft.projectRowVersion,
      idempotencyKey: "private-reorder-b",
      clock: commandClock,
    });

    const reordered = await reorderMilestones({
      database: testDatabase.database,
      actor: member,
      projectId: developmentSeedIds.project,
      orderedMilestoneIds: [
        plan.second.id,
        secondDraft.milestoneId,
        firstDraft.milestoneId,
      ],
      expectedProjectRowVersion: secondDraft.projectRowVersion,
      idempotencyKey: "private-reorder-drafts",
      clock: commandClock,
    });

    const rows = await testDatabase.database.db
      .select({
        id: milestones.id,
        position: milestones.position,
        rowVersion: milestones.rowVersion,
      })
      .from(milestones)
      .where(eq(milestones.projectId, developmentSeedIds.project))
      .orderBy(milestones.position);
    expect(rows).toEqual(
      expect.arrayContaining([
        { id: plan.second.id, position: 2, rowVersion: 2 },
        { id: secondDraft.milestoneId, position: 3, rowVersion: 2 },
        { id: firstDraft.milestoneId, position: 4, rowVersion: 2 },
      ]),
    );
    expect(reordered.projectRowVersion).toBe(secondDraft.projectRowVersion + 1);

    const sequenceActivity = await testDatabase.database.db
      .select({
        eventType: activityEvents.eventType,
        visibility: activityEvents.visibility,
        metadata: activityEvents.metadata,
      })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));
    expect(
      sequenceActivity.some(
        (event) =>
          event.eventType === "milestone.sequence_reordered" &&
          event.visibility === "CLIENT_VISIBLE",
      ),
    ).toBe(false);
    const internal = sequenceActivity.find(
      (event) => event.eventType === "milestone.sequence_reordered_internal",
    );
    expect(internal?.visibility).toBe("AGENCY_ONLY");
    expect(internal?.metadata).toMatchObject({
      orderedMilestoneIds: [
        plan.second.id,
        secondDraft.milestoneId,
        firstDraft.milestoneId,
      ],
    });
  });

  it("revalidates required Delivery Manager eligibility at publication time", async () => {
    const owner = await actor(testDatabase, developmentSeedIds.users.maya);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      owner,
      "authority-revalidation",
    );

    await testDatabase.database.db
      .update(workspaceMembers)
      .set({ role: "AGENCY_MEMBER" })
      .where(
        and(
          eq(workspaceMembers.workspaceId, developmentSeedIds.workspace),
          eq(workspaceMembers.userId, developmentSeedIds.users.daniel),
        ),
      );

    await expect(
      publishProject({
        database: testDatabase.database,
        actor: owner,
        projectId: developmentSeedIds.project,
        expectedProjectRowVersion: plan.projectRowVersion,
        idempotencyKey: "publish-with-ineligible-manager",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({
      name: "ProjectDomainError",
      code: "PUBLICATION_REQUIREMENTS_MISSING",
    });

    const project = await testDatabase.database.db
      .select({ lifecycle: projects.lifecycle })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project));
    expect(project[0]?.lifecycle).toBe("DRAFT");
  });

  it("fails publication without a Milestone and leaves Project, Activity, and Outbox unchanged", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const beforeActivity = await testDatabase.database.db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));

    await expect(
      publishProject({
        database: testDatabase.database,
        actor: manager,
        projectId: developmentSeedIds.project,
        expectedProjectRowVersion: 1,
        idempotencyKey: "publish-without-plan",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({
      name: "ProjectDomainError",
      code: "PUBLICATION_REQUIREMENTS_MISSING",
    });

    const [projectRows, afterActivity, outboxRows] = await Promise.all([
      testDatabase.database.db
        .select({
          lifecycle: projects.lifecycle,
          rowVersion: projects.rowVersion,
        })
        .from(projects)
        .where(eq(projects.id, developmentSeedIds.project)),
      testDatabase.database.db
        .select({ id: activityEvents.id })
        .from(activityEvents)
        .where(eq(activityEvents.projectId, developmentSeedIds.project)),
      testDatabase.database.db
        .select({ id: outboxEvents.id })
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "project.published")),
    ]);
    expect(projectRows[0]).toEqual({ lifecycle: "DRAFT", rowVersion: 1 });
    expect(afterActivity).toEqual(beforeActivity);
    expect(outboxRows).toEqual([]);
  });

  it("rolls Project publication back when its Outbox insert fails", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "outbox-rollback",
    );

    await testDatabase.database.pool.query(`
      CREATE OR REPLACE FUNCTION studioflow_test_reject_project_publication_outbox()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        IF NEW.event_type = 'project.published' THEN
          RAISE EXCEPTION 'test rejects project publication outbox';
        END IF;
        RETURN NEW;
      END;
      $$;

      CREATE TRIGGER studioflow_test_reject_project_publication_outbox_trigger
      BEFORE INSERT ON outbox_events
      FOR EACH ROW
      EXECUTE FUNCTION studioflow_test_reject_project_publication_outbox();
    `);

    try {
      let publicationError: unknown;
      try {
        await publishProject({
          database: testDatabase.database,
          actor: manager,
          projectId: developmentSeedIds.project,
          expectedProjectRowVersion: plan.projectRowVersion,
          idempotencyKey: "publication-outbox-rollback",
          clock: commandClock,
        });
      } catch (error) {
        publicationError = error;
      }

      expect(publicationError).toBeInstanceOf(Error);
      const databaseCause = (publicationError as Error & { cause?: unknown })
        .cause;
      expect(databaseCause).toBeInstanceOf(Error);
      expect((databaseCause as Error).message).toContain(
        "test rejects project publication outbox",
      );
    } finally {
      await testDatabase.database.pool.query(`
        DROP TRIGGER IF EXISTS studioflow_test_reject_project_publication_outbox_trigger
          ON outbox_events;
        DROP FUNCTION IF EXISTS studioflow_test_reject_project_publication_outbox();
      `);
    }

    const [
      projectRows,
      milestoneRows,
      activityRows,
      outboxRows,
      idempotencyRows,
    ] = await Promise.all([
      testDatabase.database.db
        .select({
          lifecycle: projects.lifecycle,
          rowVersion: projects.rowVersion,
        })
        .from(projects)
        .where(eq(projects.id, developmentSeedIds.project)),
      testDatabase.database.db
        .select({
          state: milestones.state,
          publishedAt: milestones.publishedAt,
        })
        .from(milestones)
        .where(eq(milestones.projectId, developmentSeedIds.project)),
      testDatabase.database.db
        .select({ eventType: activityEvents.eventType })
        .from(activityEvents)
        .where(eq(activityEvents.projectId, developmentSeedIds.project)),
      testDatabase.database.db
        .select({ id: outboxEvents.id })
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "project.published")),
      testDatabase.database.db
        .select({ id: idempotencyRecords.id })
        .from(idempotencyRecords)
        .where(
          eq(idempotencyRecords.idempotencyKey, "publication-outbox-rollback"),
        ),
    ]);
    expect(projectRows[0]).toEqual({
      lifecycle: "DRAFT",
      rowVersion: plan.projectRowVersion,
    });
    expect(milestoneRows.every((row) => row.state === "PLANNED")).toBe(true);
    expect(milestoneRows.every((row) => row.publishedAt === null)).toBe(true);
    expect(
      activityRows.some((row) => row.eventType === "project.published"),
    ).toBe(false);
    expect(outboxRows).toEqual([]);
    expect(idempotencyRows).toEqual([]);
  });

  it("blocks a second Active Milestone, then permits completion and sequential activation", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "lifecycle-plan",
    );
    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "lifecycle-publish",
      clock: commandClock,
    });

    await expect(
      activateMilestone({
        database: testDatabase.database,
        actor: manager,
        projectId: developmentSeedIds.project,
        milestoneId: plan.second.id,
        expectedProjectRowVersion: published.projectRowVersion,
        expectedMilestoneRowVersion: 2,
        idempotencyKey: "second-active-blocked",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({
      name: "ProjectDomainError",
      code: "ACTIVE_MILESTONE_EXISTS",
    });

    const completed = await completeMilestone({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: plan.first.id,
      expectedProjectRowVersion: published.projectRowVersion,
      expectedMilestoneRowVersion: 2,
      idempotencyKey: "complete-first",
      clock: commandClock,
    });
    const activated = await activateMilestone({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: plan.second.id,
      expectedProjectRowVersion: completed.projectRowVersion,
      expectedMilestoneRowVersion: 2,
      idempotencyKey: "activate-second",
      clock: commandClock,
    });

    const states = await testDatabase.database.db
      .select({ id: milestones.id, state: milestones.state })
      .from(milestones)
      .where(eq(milestones.projectId, developmentSeedIds.project))
      .orderBy(milestones.position);
    expect(states).toEqual([
      { id: plan.first.id, state: "COMPLETED" },
      { id: plan.second.id, state: "ACTIVE" },
    ]);
    expect(activated.projectRowVersion).toBeGreaterThan(
      published.projectRowVersion,
    );
  });

  it("requires an override reason and keeps the reason agency-only", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "override-plan",
    );
    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "override-publish",
      clock: commandClock,
    });

    await expect(
      completeMilestoneWithOverride({
        database: testDatabase.database,
        actor: manager,
        projectId: developmentSeedIds.project,
        milestoneId: plan.first.id,
        reason: "   ",
        expectedProjectRowVersion: published.projectRowVersion,
        expectedMilestoneRowVersion: 2,
        idempotencyKey: "override-empty",
        clock: commandClock,
      }),
    ).rejects.toMatchObject({
      name: "ProjectDomainError",
      code: "INVALID_REQUEST",
    });

    await completeMilestoneWithOverride({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: plan.first.id,
      reason: "Client dependency was handled outside StudioFlow.",
      expectedProjectRowVersion: published.projectRowVersion,
      expectedMilestoneRowVersion: 2,
      idempotencyKey: "override-valid",
      clock: commandClock,
    });

    const activity = await testDatabase.database.db
      .select({
        eventType: activityEvents.eventType,
        visibility: activityEvents.visibility,
        metadata: activityEvents.metadata,
      })
      .from(activityEvents)
      .where(eq(activityEvents.projectId, developmentSeedIds.project));
    const clientCompletion = activity.find(
      (row) => row.eventType === "milestone.completed",
    );
    const internalOverride = activity.find(
      (row) => row.eventType === "milestone.completion_overridden",
    );
    expect(clientCompletion).toMatchObject({ visibility: "CLIENT_VISIBLE" });
    expect(JSON.stringify(clientCompletion?.metadata)).not.toContain(
      "Client dependency was handled outside StudioFlow.",
    );
    expect(internalOverride).toMatchObject({ visibility: "AGENCY_ONLY" });
    expect(internalOverride?.metadata).toMatchObject({
      reason: "Client dependency was handled outside StudioFlow.",
    });
  });

  it("supports Milestone cancellation and the Onboarding-to-Active Project transition", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "project-active-plan",
    );
    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "project-active-publish",
      clock: commandClock,
    });

    const activeProject = await moveProjectToActive({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: published.projectRowVersion,
      idempotencyKey: "move-project-active",
      clock: commandClock,
    });
    const cancelled = await cancelMilestone({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: plan.second.id,
      expectedProjectRowVersion: activeProject.projectRowVersion,
      expectedMilestoneRowVersion: 2,
      idempotencyKey: "cancel-planned-milestone",
      clock: commandClock,
    });

    const [projectRow, milestoneRow] = await Promise.all([
      testDatabase.database.db
        .select({ lifecycle: projects.lifecycle })
        .from(projects)
        .where(eq(projects.id, developmentSeedIds.project)),
      testDatabase.database.db
        .select({
          state: milestones.state,
          cancelledAt: milestones.cancelledAt,
        })
        .from(milestones)
        .where(eq(milestones.id, plan.second.id)),
    ]);
    expect(projectRow[0]?.lifecycle).toBe("ACTIVE");
    expect(milestoneRow[0]?.state).toBe("CANCELLED");
    expect(milestoneRow[0]?.cancelledAt).toBeInstanceOf(Date);
    expect(cancelled.projectRowVersion).toBeGreaterThan(
      activeProject.projectRowVersion,
    );
  });

  it("keeps the Agency Milestone projection unavailable to Client actors and preserves reduced contributor controls", async () => {
    await seedDevelopmentV2(testDatabase.database);
    const member = await actor(testDatabase, developmentSeedIds.users.priya);
    const client = await actor(testDatabase, developmentSeedIds.users.elena);

    const memberResult = await getAgencyMilestonePlan(
      testDatabase.database,
      member,
      developmentSeedIds.project,
    );
    expect(memberResult.status).toBe("allowed");
    if (memberResult.status !== "allowed") {
      throw new Error(
        "Expected assigned Agency Member to read the Agency Milestone plan",
      );
    }
    expect(memberResult.plan.permissions).toEqual({
      canEditDraft: true,
      canEditProjectSettings: false,
      canPublishProject: false,
      canPublishMilestone: false,
      canManageLifecycle: false,
    });
    expect(memberResult.plan.milestones).toHaveLength(5);

    const clientResult = await getAgencyMilestonePlan(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(clientResult).toEqual({ status: "denied" });
  });

  it("keeps Client Project and Milestone projections published-only and ignores agency-only Draft churn for recency", async () => {
    await seedDevelopmentV2(testDatabase.database);
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const client = await actor(testDatabase, developmentSeedIds.users.elena);

    const beforeProjects = await listClientProjects(
      testDatabase.database,
      client,
    );
    expect(beforeProjects).toHaveLength(1);
    const beforeRecency = beforeProjects[0]!.clientVisibleUpdatedAt;

    const projectResult = await getClientProjectDetail(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(projectResult.status).toBe("allowed");
    if (projectResult.status !== "allowed") {
      throw new Error(
        "Expected Client Project detail to be available after publication",
      );
    }
    expect(JSON.stringify(projectResult.detail)).not.toContain("workspaceId");
    expect(JSON.stringify(projectResult.detail)).not.toContain("rowVersion");

    const initialPlan = await getClientMilestonePlan(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(initialPlan.status).toBe("allowed");
    if (initialPlan.status !== "allowed") {
      throw new Error("Expected published Client Milestone plan");
    }
    expect(initialPlan.plan.milestones).toHaveLength(5);
    expect(
      initialPlan.plan.milestones.map((milestone) => milestone.ordinal),
    ).toEqual([1, 2, 3, 4, 5]);

    const draft = await createMilestoneDraft({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      title: "Private agency checkpoint",
      purpose: "Internal preparation before client publication.",
      clientDescription: "Client-ready checkpoint.",
      plannedStartDate: "2026-05-23",
      plannedEndDate: "2026-05-24",
      expectedProjectRowVersion: 2,
      idempotencyKey: "client-projection-private-draft",
      clock: createFixedClock("2026-08-14T10:00:00.000Z"),
    });

    const afterDraftPlan = await getClientMilestonePlan(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(afterDraftPlan.status).toBe("allowed");
    if (afterDraftPlan.status !== "allowed") {
      throw new Error("Expected Client Milestone plan after agency-only Draft");
    }
    expect(afterDraftPlan.plan.milestones).toHaveLength(5);
    expect(
      afterDraftPlan.plan.milestones.some(
        (milestone) => milestone.milestoneId === draft.milestoneId,
      ),
    ).toBe(false);
    expect(
      await getClientMilestoneDetail(
        testDatabase.database,
        client,
        developmentSeedIds.project,
        draft.milestoneId,
      ),
    ).toEqual({ status: "not-found" });

    const afterDraftProjects = await listClientProjects(
      testDatabase.database,
      client,
    );
    expect(afterDraftProjects[0]!.clientVisibleUpdatedAt.getTime()).toBe(
      beforeRecency.getTime(),
    );

    const clientActivityBeforePublication = await listClientProjectActivity(
      testDatabase.database,
      projectResult.scope,
      50,
    );
    expect(
      clientActivityBeforePublication.some(
        (event) => event.subjectId === draft.milestoneId,
      ),
    ).toBe(false);

    await publishMilestone({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: draft.milestoneId,
      expectedProjectRowVersion: draft.projectRowVersion,
      expectedMilestoneRowVersion: draft.milestoneRowVersion,
      idempotencyKey: "client-projection-publish-later",
      clock: createFixedClock("2026-08-14T10:05:00.000Z"),
    });

    const publishedPlan = await getClientMilestonePlan(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(publishedPlan.status).toBe("allowed");
    if (publishedPlan.status !== "allowed") {
      throw new Error("Expected Client Milestone plan after publication");
    }
    expect(publishedPlan.plan.milestones).toHaveLength(6);
    expect(publishedPlan.plan.milestones.at(-1)).toMatchObject({
      milestoneId: draft.milestoneId,
      ordinal: 6,
      title: "Private agency checkpoint",
    });

    const afterPublicationProjects = await listClientProjects(
      testDatabase.database,
      client,
    );
    expect(
      afterPublicationProjects[0]!.clientVisibleUpdatedAt.getTime(),
    ).toBeGreaterThan(beforeRecency.getTime());
  });

  it("keeps completion override detail out of Client Milestone and Activity projections", async () => {
    const manager = await actor(testDatabase, developmentSeedIds.users.daniel);
    const client = await actor(testDatabase, developmentSeedIds.users.elena);
    const plan = await createTwoMilestonePlan(
      testDatabase,
      manager,
      "client-override-plan",
    );
    const published = await publishProject({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      expectedProjectRowVersion: plan.projectRowVersion,
      idempotencyKey: "client-override-publish",
      clock: commandClock,
    });
    const reason =
      "Agency accepted a delivery exception after internal review.";
    await completeMilestoneWithOverride({
      database: testDatabase.database,
      actor: manager,
      projectId: developmentSeedIds.project,
      milestoneId: plan.first.id,
      reason,
      expectedProjectRowVersion: published.projectRowVersion,
      expectedMilestoneRowVersion: 2,
      idempotencyKey: "client-override-complete",
      clock: commandClock,
    });

    const milestoneResult = await getClientMilestoneDetail(
      testDatabase.database,
      client,
      developmentSeedIds.project,
      plan.first.id,
    );
    expect(milestoneResult.status).toBe("allowed");
    if (milestoneResult.status !== "allowed") {
      throw new Error("Expected completed Client Milestone detail");
    }
    const serializedMilestone = JSON.stringify(milestoneResult.milestone);
    expect(serializedMilestone).not.toContain(reason);
    expect(serializedMilestone).not.toContain("completionOverrideReason");
    expect(serializedMilestone).not.toContain("rowVersion");

    const projectResult = await getClientProjectDetail(
      testDatabase.database,
      client,
      developmentSeedIds.project,
    );
    expect(projectResult.status).toBe("allowed");
    if (projectResult.status !== "allowed") {
      throw new Error("Expected Client Project detail");
    }
    const activity = await listClientProjectActivity(
      testDatabase.database,
      projectResult.scope,
      50,
    );
    expect(activity.map((event) => event.eventType)).toContain(
      "milestone.completed",
    );
    expect(activity.map((event) => event.eventType)).not.toContain(
      "milestone.completion_overridden",
    );
    expect(JSON.stringify(activity)).not.toContain(reason);
  });

  it("enforces one Active Milestone at the database boundary", async () => {
    await seedDevelopmentV2(testDatabase.database);

    let databaseError: unknown;
    try {
      await testDatabase.database.db
        .update(milestones)
        .set({
          state: "ACTIVE",
          activatedAt: commandClock.now(),
        })
        .where(
          eq(milestones.id, m10DevelopmentSeedIds.milestones.visualDesign),
        );
    } catch (error) {
      databaseError = error;
    }

    expect(normalizeDatabaseError(databaseError)).toMatchObject({
      code: "23505",
      retryable: false,
    });
  });

  it("replays development seed v2 deterministically with the approved Kestrelon sequence", async () => {
    const first = await seedDevelopmentV2(testDatabase.database);
    const second = await seedDevelopmentV2(
      testDatabase.database,
      DEVELOPMENT_SEED_V2_VERSION,
    );
    expect(second).toEqual(first);

    const milestoneRows = await testDatabase.database.db
      .select({
        title: milestones.title,
        position: milestones.position,
        plannedStartDate: milestones.plannedStartDate,
        plannedEndDate: milestones.plannedEndDate,
        state: milestones.state,
        publishedAt: milestones.publishedAt,
      })
      .from(milestones)
      .where(eq(milestones.projectId, developmentSeedIds.project))
      .orderBy(milestones.position);

    expect(milestoneRows.map((row) => row.title)).toEqual([
      "Kickoff & Discovery",
      "Content & Information Architecture",
      "Visual Design",
      "Development & QA",
      "Launch & Handoff",
    ]);
    expect(
      milestoneRows.map((row) => [row.plannedStartDate, row.plannedEndDate]),
    ).toEqual([
      ["2026-03-02", "2026-03-13"],
      ["2026-03-16", "2026-03-27"],
      ["2026-03-30", "2026-04-17"],
      ["2026-04-15", "2026-05-20"],
      ["2026-05-21", "2026-05-22"],
    ]);
    expect(milestoneRows[0]?.state).toBe("ACTIVE");
    expect(milestoneRows.slice(1).every((row) => row.state === "PLANNED")).toBe(
      true,
    );
    expect(milestoneRows.every((row) => row.publishedAt instanceof Date)).toBe(
      true,
    );

    const project = await testDatabase.database.db
      .select({
        lifecycle: projects.lifecycle,
        rowVersion: projects.rowVersion,
      })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project));
    expect(project[0]).toEqual({ lifecycle: "ONBOARDING", rowVersion: 2 });
  });
});
