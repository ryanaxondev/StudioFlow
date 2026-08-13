import { eq } from "drizzle-orm";

import type { DatabaseClient } from "../../db/client";
import {
  activityEvents,
  clientMembers,
  clientOrganizations,
  projectMembers,
  projects,
  users,
  workspaceMembers,
  workspaces,
} from "../../db/schema";
import { withTransaction } from "../../db/transactions";

export const DEVELOPMENT_SEED_VERSION = 1 as const;

const seedInstant = new Date("2026-03-02T08:10:00.000Z");

export const developmentSeedIds = Object.freeze({
  workspace: "09000000-0000-4000-8000-000000000001",
  clientOrganization: "09000000-0000-4000-8000-000000000101",
  project: "09000000-0000-4000-8000-000000000201",
  activityProjectCreated: "09000000-0000-4000-8000-000000000301",
  users: Object.freeze({
    maya: "09000000-0000-4000-8000-000000001001",
    daniel: "09000000-0000-4000-8000-000000001002",
    priya: "09000000-0000-4000-8000-000000001003",
    theo: "09000000-0000-4000-8000-000000001004",
    elena: "09000000-0000-4000-8000-000000001005",
    marcus: "09000000-0000-4000-8000-000000001006",
    nia: "09000000-0000-4000-8000-000000001007",
  }),
  clientMemberships: Object.freeze({
    elena: "09000000-0000-4000-8000-000000002001",
    marcus: "09000000-0000-4000-8000-000000002002",
    nia: "09000000-0000-4000-8000-000000002003",
  }),
});

export type DevelopmentSeedResult = Readonly<{
  version: typeof DEVELOPMENT_SEED_VERSION;
  workspaceId: string;
  clientOrganizationId: string;
  projectId: string;
}>;

export function assertDevelopmentSeedVersion(
  version: number,
): asserts version is typeof DEVELOPMENT_SEED_VERSION {
  if (version !== DEVELOPMENT_SEED_VERSION) {
    throw new Error(
      `Unsupported development seed version ${version}. Expected ${DEVELOPMENT_SEED_VERSION}.`,
    );
  }
}

const seededUsers = [
  {
    id: developmentSeedIds.users.maya,
    name: "Maya Chen",
    email: "maya.chen@sableframe.studioflow.local",
  },
  {
    id: developmentSeedIds.users.daniel,
    name: "Daniel Ortiz",
    email: "daniel.ortiz@sableframe.studioflow.local",
  },
  {
    id: developmentSeedIds.users.priya,
    name: "Priya Shah",
    email: "priya.shah@sableframe.studioflow.local",
  },
  {
    id: developmentSeedIds.users.theo,
    name: "Theo Martin",
    email: "theo.martin@sableframe.studioflow.local",
  },
  {
    id: developmentSeedIds.users.elena,
    name: "Elena Rossi",
    email: "elena.rossi@kestrelon.studioflow.local",
  },
  {
    id: developmentSeedIds.users.marcus,
    name: "Marcus Reed",
    email: "marcus.reed@kestrelon.studioflow.local",
  },
  {
    id: developmentSeedIds.users.nia,
    name: "Nia Patel",
    email: "nia.patel@kestrelon.studioflow.local",
  },
] as const;

export async function seedDevelopmentV1(
  database: DatabaseClient,
  requestedVersion: number = DEVELOPMENT_SEED_VERSION,
): Promise<DevelopmentSeedResult> {
  assertDevelopmentSeedVersion(requestedVersion);

  await withTransaction(database, async ({ db }) => {
    for (const user of seededUsers) {
      await db
        .insert(users)
        .values({
          ...user,
          emailVerified: true,
          emailVerifiedAt: seedInstant,
          disabledAt: null,
          createdAt: seedInstant,
          updatedAt: seedInstant,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.name,
            email: user.email,
            emailVerified: true,
            emailVerifiedAt: seedInstant,
            disabledAt: null,
            updatedAt: seedInstant,
          },
        });
    }

    await db
      .insert(workspaces)
      .values({
        id: developmentSeedIds.workspace,
        name: "Sableframe Studio",
        description:
          "Strategy, design, and development for B2B teams building their next stage of growth.",
        timezone: "Europe/Amsterdam",
        displayCurrency: "EUR",
        createdAt: seedInstant,
        rowVersion: 1,
      })
      .onConflictDoUpdate({
        target: workspaces.id,
        set: {
          name: "Sableframe Studio",
          description:
            "Strategy, design, and development for B2B teams building their next stage of growth.",
          timezone: "Europe/Amsterdam",
          displayCurrency: "EUR",
          rowVersion: 1,
        },
      });

    const agencyMemberships = [
      {
        userId: developmentSeedIds.users.maya,
        role: "AGENCY_OWNER" as const,
      },
      {
        userId: developmentSeedIds.users.daniel,
        role: "DELIVERY_MANAGER" as const,
      },
      {
        userId: developmentSeedIds.users.priya,
        role: "AGENCY_MEMBER" as const,
      },
      {
        userId: developmentSeedIds.users.theo,
        role: "AGENCY_MEMBER" as const,
      },
    ];
    for (const membership of agencyMemberships) {
      await db
        .insert(workspaceMembers)
        .values({
          workspaceId: developmentSeedIds.workspace,
          userId: membership.userId,
          role: membership.role,
          status: "ACTIVE",
          joinedAt: seedInstant,
          revokedAt: null,
        })
        .onConflictDoUpdate({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
          set: {
            role: membership.role,
            status: "ACTIVE",
            joinedAt: seedInstant,
            revokedAt: null,
          },
        });
    }

    await db
      .insert(clientOrganizations)
      .values({
        id: developmentSeedIds.clientOrganization,
        workspaceId: developmentSeedIds.workspace,
        name: "Kestrelon",
        status: "ACTIVE",
        createdAt: seedInstant,
        rowVersion: 1,
      })
      .onConflictDoUpdate({
        target: clientOrganizations.id,
        set: {
          workspaceId: developmentSeedIds.workspace,
          name: "Kestrelon",
          status: "ACTIVE",
          rowVersion: 1,
        },
      });

    const clientMembershipSeed = [
      {
        id: developmentSeedIds.clientMemberships.elena,
        userId: developmentSeedIds.users.elena,
      },
      {
        id: developmentSeedIds.clientMemberships.marcus,
        userId: developmentSeedIds.users.marcus,
      },
      {
        id: developmentSeedIds.clientMemberships.nia,
        userId: developmentSeedIds.users.nia,
      },
    ];
    for (const membership of clientMembershipSeed) {
      await db
        .insert(clientMembers)
        .values({
          id: membership.id,
          workspaceId: developmentSeedIds.workspace,
          clientOrganizationId: developmentSeedIds.clientOrganization,
          userId: membership.userId,
          status: "ACTIVE",
          joinedAt: seedInstant,
          revokedAt: null,
        })
        .onConflictDoUpdate({
          target: clientMembers.id,
          set: {
            workspaceId: developmentSeedIds.workspace,
            clientOrganizationId: developmentSeedIds.clientOrganization,
            userId: membership.userId,
            status: "ACTIVE",
            joinedAt: seedInstant,
            revokedAt: null,
          },
        });
    }

    await db
      .insert(projects)
      .values({
        id: developmentSeedIds.project,
        workspaceId: developmentSeedIds.workspace,
        clientOrganizationId: developmentSeedIds.clientOrganization,
        title: "Kestrelon Website Rebuild",
        clientSummary:
          "Sableframe is repositioning, redesigning, and rebuilding Kestrelon’s marketing website around a clearer customer-onboarding narrative. The engagement includes strategy, information architecture, visual design, frontend development, CMS implementation, launch support, and final handoff.",
        lifecycle: "DRAFT",
        plannedStartDate: "2026-03-02",
        targetCompletionDate: "2026-05-22",
        deliveryManagerUserId: developmentSeedIds.users.daniel,
        clientApproverUserId: developmentSeedIds.users.elena,
        cancelledReasonClient: null,
        cancelledReasonInternal: null,
        completedAt: null,
        archivedAt: null,
        rowVersion: 1,
        createdAt: seedInstant,
        updatedAt: seedInstant,
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          workspaceId: developmentSeedIds.workspace,
          clientOrganizationId: developmentSeedIds.clientOrganization,
          title: "Kestrelon Website Rebuild",
          clientSummary:
            "Sableframe is repositioning, redesigning, and rebuilding Kestrelon’s marketing website around a clearer customer-onboarding narrative. The engagement includes strategy, information architecture, visual design, frontend development, CMS implementation, launch support, and final handoff.",
          lifecycle: "DRAFT",
          plannedStartDate: "2026-03-02",
          targetCompletionDate: "2026-05-22",
          deliveryManagerUserId: developmentSeedIds.users.daniel,
          clientApproverUserId: developmentSeedIds.users.elena,
          cancelledReasonClient: null,
          cancelledReasonInternal: null,
          completedAt: null,
          archivedAt: null,
          rowVersion: 1,
          updatedAt: seedInstant,
        },
      });

    const projectMembershipSeed = [
      {
        userId: developmentSeedIds.users.daniel,
        side: "AGENCY" as const,
        projectRole: "DELIVERY_MANAGER" as const,
      },
      {
        userId: developmentSeedIds.users.priya,
        side: "AGENCY" as const,
        projectRole: "AGENCY_MEMBER" as const,
      },
      {
        userId: developmentSeedIds.users.theo,
        side: "AGENCY" as const,
        projectRole: "AGENCY_MEMBER" as const,
      },
      {
        userId: developmentSeedIds.users.elena,
        side: "CLIENT" as const,
        projectRole: "CLIENT_APPROVER" as const,
      },
      {
        userId: developmentSeedIds.users.marcus,
        side: "CLIENT" as const,
        projectRole: "CLIENT_CONTRIBUTOR" as const,
      },
      {
        userId: developmentSeedIds.users.nia,
        side: "CLIENT" as const,
        projectRole: "CLIENT_CONTRIBUTOR" as const,
      },
    ];
    for (const membership of projectMembershipSeed) {
      await db
        .insert(projectMembers)
        .values({
          workspaceId: developmentSeedIds.workspace,
          projectId: developmentSeedIds.project,
          userId: membership.userId,
          side: membership.side,
          projectRole: membership.projectRole,
          status: "ACTIVE",
          joinedAt: seedInstant,
          revokedAt: null,
        })
        .onConflictDoUpdate({
          target: [
            projectMembers.workspaceId,
            projectMembers.projectId,
            projectMembers.userId,
          ],
          set: {
            side: membership.side,
            projectRole: membership.projectRole,
            status: "ACTIVE",
            joinedAt: seedInstant,
            revokedAt: null,
          },
        });
    }

    await db
      .insert(activityEvents)
      .values({
        id: developmentSeedIds.activityProjectCreated,
        workspaceId: developmentSeedIds.workspace,
        projectId: developmentSeedIds.project,
        eventType: "project.created",
        visibility: "AGENCY_ONLY",
        actorUserId: developmentSeedIds.users.daniel,
        actorNameSnapshot: "Daniel Ortiz",
        actorRoleSnapshot: "DELIVERY_MANAGER",
        subjectType: "PROJECT",
        subjectId: developmentSeedIds.project,
        summaryKey: "activity.project.created",
        metadata: { lifecycle: "DRAFT", seedVersion: 1 },
        occurredAt: seedInstant,
      })
      .onConflictDoNothing({ target: activityEvents.id });

    const [seedProject] = await db
      .select({
        workspaceId: projects.workspaceId,
        clientOrganizationId: projects.clientOrganizationId,
        lifecycle: projects.lifecycle,
        deliveryManagerUserId: projects.deliveryManagerUserId,
        clientApproverUserId: projects.clientApproverUserId,
      })
      .from(projects)
      .where(eq(projects.id, developmentSeedIds.project))
      .limit(1);

    if (
      !seedProject ||
      seedProject.workspaceId !== developmentSeedIds.workspace ||
      seedProject.clientOrganizationId !==
        developmentSeedIds.clientOrganization ||
      seedProject.lifecycle !== "DRAFT" ||
      seedProject.deliveryManagerUserId !== developmentSeedIds.users.daniel ||
      seedProject.clientApproverUserId !== developmentSeedIds.users.elena
    ) {
      throw new Error("Development seed validation failed for Project v1.");
    }
  });

  return {
    version: DEVELOPMENT_SEED_VERSION,
    workspaceId: developmentSeedIds.workspace,
    clientOrganizationId: developmentSeedIds.clientOrganization,
    projectId: developmentSeedIds.project,
  };
}
