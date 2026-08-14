import { eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import { activityEvents, milestones, projects } from "../../db/schema";
import { withTransaction } from "../../db/transactions";
import {
  developmentSeedIds,
  seedDevelopmentV1,
} from "../projects/development-seed";

export const DEVELOPMENT_SEED_V2_VERSION = 2 as const;
export const LATEST_DEVELOPMENT_SEED_VERSION = DEVELOPMENT_SEED_V2_VERSION;

const seedPublishInstant = new Date("2026-03-02T08:30:00.000Z");

export const m10DevelopmentSeedIds = Object.freeze({
  milestones: Object.freeze({
    kickoff: "0a000000-0000-4000-8000-000000000401",
    informationArchitecture: "0a000000-0000-4000-8000-000000000402",
    visualDesign: "0a000000-0000-4000-8000-000000000403",
    developmentQa: "0a000000-0000-4000-8000-000000000404",
    launchHandoff: "0a000000-0000-4000-8000-000000000405",
  }),
  activity: Object.freeze({
    projectPublished: "0a000000-0000-4000-8000-000000000501",
    firstMilestoneActivated: "0a000000-0000-4000-8000-000000000502",
  }),
});

const milestoneSeed = [
  {
    id: m10DevelopmentSeedIds.milestones.kickoff,
    title: "Kickoff & Discovery",
    purpose:
      "Align the team on Kestrelon’s audience, positioning, launch objectives, and decision process.",
    position: 1,
    plannedStartDate: "2026-03-02",
    plannedEndDate: "2026-03-13",
    state: "ACTIVE" as const,
  },
  {
    id: m10DevelopmentSeedIds.milestones.informationArchitecture,
    title: "Content & Information Architecture",
    purpose:
      "Turn the approved strategy into a clear page structure, content hierarchy, and conversion path.",
    position: 2,
    plannedStartDate: "2026-03-16",
    plannedEndDate: "2026-03-27",
    state: "PLANNED" as const,
  },
  {
    id: m10DevelopmentSeedIds.milestones.visualDesign,
    title: "Visual Design",
    purpose:
      "Establish the visual system and approve the responsive homepage direction before development.",
    position: 3,
    plannedStartDate: "2026-03-30",
    plannedEndDate: "2026-04-17",
    state: "PLANNED" as const,
  },
  {
    id: m10DevelopmentSeedIds.milestones.developmentQa,
    title: "Development & QA",
    purpose:
      "Build the approved website, connect the CMS, validate content, and prepare the release candidate.",
    position: 4,
    plannedStartDate: "2026-04-15",
    plannedEndDate: "2026-05-20",
    state: "PLANNED" as const,
  },
  {
    id: m10DevelopmentSeedIds.milestones.launchHandoff,
    title: "Launch & Handoff",
    purpose:
      "Launch the website, transfer final assets and documentation, and establish the post-launch support window.",
    position: 5,
    plannedStartDate: "2026-05-21",
    plannedEndDate: "2026-05-22",
    state: "PLANNED" as const,
  },
] as const;

export type DevelopmentSeedV2Result = Readonly<{
  version: typeof DEVELOPMENT_SEED_V2_VERSION;
  workspaceId: string;
  clientOrganizationId: string;
  projectId: string;
  activeMilestoneId: string;
}>;

export function assertDevelopmentSeedV2Version(
  version: number,
): asserts version is typeof DEVELOPMENT_SEED_V2_VERSION {
  if (version !== DEVELOPMENT_SEED_V2_VERSION) {
    throw new Error(
      `Unsupported development seed version ${version}. Expected ${DEVELOPMENT_SEED_V2_VERSION}.`,
    );
  }
}

export async function seedDevelopmentV2(
  database: DatabaseClient,
  requestedVersion: number = DEVELOPMENT_SEED_V2_VERSION,
): Promise<DevelopmentSeedV2Result> {
  assertDevelopmentSeedV2Version(requestedVersion);

  const existingFoundation = await database.db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, developmentSeedIds.project))
    .limit(1);
  if (!existingFoundation[0]) {
    await seedDevelopmentV1(database, 1);
  }

  await withTransaction(database, async ({ db, client }) => {
    await client.query(
      "SET CONSTRAINTS milestones_project_position_unique DEFERRED",
    );

    for (const milestone of milestoneSeed) {
      await db
        .insert(milestones)
        .values({
          id: milestone.id,
          workspaceId: developmentSeedIds.workspace,
          projectId: developmentSeedIds.project,
          title: milestone.title,
          purpose: milestone.purpose,
          clientDescription: milestone.purpose,
          position: milestone.position,
          plannedStartDate: milestone.plannedStartDate,
          plannedEndDate: milestone.plannedEndDate,
          state: milestone.state,
          publishedAt: seedPublishInstant,
          activatedAt: milestone.state === "ACTIVE" ? seedPublishInstant : null,
          completedAt: null,
          cancelledAt: null,
          completionOverrideReason: null,
          rowVersion: 1,
          createdAt: seedPublishInstant,
          updatedAt: seedPublishInstant,
        })
        .onConflictDoUpdate({
          target: milestones.id,
          set: {
            workspaceId: developmentSeedIds.workspace,
            projectId: developmentSeedIds.project,
            title: milestone.title,
            purpose: milestone.purpose,
            clientDescription: milestone.purpose,
            position: milestone.position,
            plannedStartDate: milestone.plannedStartDate,
            plannedEndDate: milestone.plannedEndDate,
            state: milestone.state,
            publishedAt: seedPublishInstant,
            activatedAt:
              milestone.state === "ACTIVE" ? seedPublishInstant : null,
            completedAt: null,
            cancelledAt: null,
            completionOverrideReason: null,
            rowVersion: 1,
            updatedAt: seedPublishInstant,
          },
        });
    }

    await db
      .update(projects)
      .set({
        lifecycle: "ONBOARDING",
        rowVersion: 2,
        updatedAt: seedPublishInstant,
      })
      .where(eq(projects.id, developmentSeedIds.project));

    await db
      .insert(activityEvents)
      .values({
        id: m10DevelopmentSeedIds.activity.projectPublished,
        workspaceId: developmentSeedIds.workspace,
        projectId: developmentSeedIds.project,
        eventType: "project.published",
        visibility: "CLIENT_VISIBLE",
        actorUserId: developmentSeedIds.users.daniel,
        actorNameSnapshot: "Daniel Ortiz",
        actorRoleSnapshot: "DELIVERY_MANAGER",
        subjectType: "PROJECT",
        subjectId: developmentSeedIds.project,
        summaryKey: "activity.project.published",
        metadata: {
          lifecycle: "ONBOARDING",
          publishedMilestoneCount: milestoneSeed.length,
          seedVersion: 2,
        },
        occurredAt: seedPublishInstant,
      })
      .onConflictDoNothing({ target: activityEvents.id });

    await db
      .insert(activityEvents)
      .values({
        id: m10DevelopmentSeedIds.activity.firstMilestoneActivated,
        workspaceId: developmentSeedIds.workspace,
        projectId: developmentSeedIds.project,
        eventType: "milestone.activated",
        visibility: "CLIENT_VISIBLE",
        actorUserId: developmentSeedIds.users.daniel,
        actorNameSnapshot: "Daniel Ortiz",
        actorRoleSnapshot: "DELIVERY_MANAGER",
        subjectType: "MILESTONE",
        subjectId: m10DevelopmentSeedIds.milestones.kickoff,
        summaryKey: "activity.milestone.activated",
        metadata: { ordinal: 1, seedVersion: 2 },
        occurredAt: seedPublishInstant,
      })
      .onConflictDoNothing({ target: activityEvents.id });

    const [seedProject] = await db
      .select({
        lifecycle: projects.lifecycle,
        rowVersion: projects.rowVersion,
      })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project))
      .limit(1);
    const seededMilestones = await db
      .select({
        id: milestones.id,
        position: milestones.position,
        state: milestones.state,
        publishedAt: milestones.publishedAt,
      })
      .from(milestones)
      .where(eq(milestones.projectId, developmentSeedIds.project))
      .orderBy(milestones.position);

    if (
      seedProject?.lifecycle !== "ONBOARDING" ||
      seedProject.rowVersion !== 2 ||
      seededMilestones.length !== milestoneSeed.length ||
      seededMilestones[0]?.id !== m10DevelopmentSeedIds.milestones.kickoff ||
      seededMilestones[0]?.state !== "ACTIVE" ||
      seededMilestones.some((milestone) => milestone.publishedAt === null)
    ) {
      throw new Error("Development seed validation failed for Milestones v2.");
    }
  });

  return {
    version: DEVELOPMENT_SEED_V2_VERSION,
    workspaceId: developmentSeedIds.workspace,
    clientOrganizationId: developmentSeedIds.clientOrganization,
    projectId: developmentSeedIds.project,
    activeMilestoneId: m10DevelopmentSeedIds.milestones.kickoff,
  };
}
