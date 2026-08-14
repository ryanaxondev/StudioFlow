import { describe, expect, it } from "vitest";

import {
  canCreateClientOrganization,
  canCreateProject,
  canDeleteDraftProject,
  canEditMilestoneDraft,
  canEditProjectSettings,
  canEnterClientPortal,
  canManageAgencyMembers,
  canManageProjectMembers,
  canManageClientMembers,
  canManageMilestoneLifecycle,
  canMoveProjectToActive,
  canPublishMilestone,
  canPublishProject,
  canManageWorkspace,
  canViewAgencyDelivery,
  canViewAgencyWorkspace,
  canViewClientOrganization,
  canViewClientOrganizations,
  canViewProject,
  resolveRoleBasedLanding,
  toAuthorizedWorkspaceScope,
} from "../../src/modules/authorization/policies";
import {
  toAgencyContextProjection,
  toAgencyNavigationProjection,
  toClientContextProjection,
} from "../../src/modules/authorization/projections";
import { createAuthorizationLogContext } from "../../src/modules/authorization/logging";
import {
  authorizationActors,
  authorizationFixture,
} from "../fixtures/authorization";

const { workspaceA, clientA } = authorizationFixture;

describe("authorization policy matrix through M10", () => {
  it("enforces Workspace capabilities by authoritative role", () => {
    const matrix = [
      {
        actor: authorizationActors.owner,
        delivery: true,
        manage: true,
        members: true,
        manageClientMembers: true,
        createClient: true,
        viewClientCollection: true,
        viewClient: true,
        createProject: true,
      },
      {
        actor: authorizationActors.deliveryManager,
        delivery: true,
        manage: false,
        members: false,
        manageClientMembers: false,
        createClient: true,
        viewClientCollection: true,
        viewClient: false,
        createProject: true,
      },
      {
        actor: authorizationActors.agencyMember,
        delivery: false,
        manage: false,
        members: false,
        manageClientMembers: false,
        createClient: false,
        viewClientCollection: false,
        viewClient: false,
        createProject: false,
      },
      {
        actor: authorizationActors.clientUser,
        delivery: false,
        manage: false,
        members: false,
        manageClientMembers: false,
        createClient: false,
        viewClientCollection: false,
        viewClient: false,
        createProject: false,
      },
      {
        actor: authorizationActors.otherWorkspaceOwner,
        delivery: false,
        manage: false,
        members: false,
        manageClientMembers: false,
        createClient: false,
        viewClientCollection: false,
        viewClient: false,
        createProject: false,
      },
      {
        actor: authorizationActors.removedUser,
        delivery: false,
        manage: false,
        members: false,
        manageClientMembers: false,
        createClient: false,
        viewClientCollection: false,
        viewClient: false,
        createProject: false,
      },
    ];

    for (const row of matrix) {
      expect(canViewAgencyDelivery(row.actor, workspaceA).allowed).toBe(
        row.delivery,
      );
      expect(canManageWorkspace(row.actor, workspaceA).allowed).toBe(
        row.manage,
      );
      expect(canManageAgencyMembers(row.actor, workspaceA).allowed).toBe(
        row.members,
      );
      expect(canManageClientMembers(row.actor, workspaceA).allowed).toBe(
        row.manageClientMembers,
      );
      expect(canCreateClientOrganization(row.actor, workspaceA).allowed).toBe(
        row.createClient,
      );
      expect(canViewClientOrganizations(row.actor, workspaceA).allowed).toBe(
        row.viewClientCollection,
      );
      expect(canViewClientOrganization(row.actor, workspaceA).allowed).toBe(
        row.viewClient,
      );
      expect(canCreateProject(row.actor, workspaceA).allowed).toBe(
        row.createProject,
      );
    }
  });

  it("projects Agency navigation from the same capability policies used by routes", () => {
    const ownerNavigation = toAgencyNavigationProjection(
      authorizationActors.owner,
      {
        workspaceId: workspaceA,
        workspaceName: "StudioFlow Local",
        role: "AGENCY_OWNER",
      },
    );
    expect(ownerNavigation).toEqual({
      canViewDelivery: true,
      canViewProjects: true,
      canViewClients: true,
      canManageMembers: true,
      defaultPath: "/agency",
    });

    const managerNavigation = toAgencyNavigationProjection(
      authorizationActors.deliveryManager,
      {
        workspaceId: workspaceA,
        workspaceName: "StudioFlow Local",
        role: "DELIVERY_MANAGER",
      },
    );
    expect(managerNavigation).toEqual({
      canViewDelivery: true,
      canViewProjects: true,
      canViewClients: true,
      canManageMembers: false,
      defaultPath: "/agency",
    });

    const memberNavigation = toAgencyNavigationProjection(
      authorizationActors.agencyMember,
      {
        workspaceId: workspaceA,
        workspaceName: "StudioFlow Local",
        role: "AGENCY_MEMBER",
      },
    );
    expect(memberNavigation).toEqual({
      canViewDelivery: false,
      canViewProjects: true,
      canViewClients: false,
      canManageMembers: false,
      defaultPath: "/agency/projects",
    });

    expect(
      canViewAgencyDelivery(authorizationActors.agencyMember, workspaceA)
        .allowed,
    ).toBe(false);
    expect(
      canViewClientOrganizations(authorizationActors.agencyMember, workspaceA)
        .allowed,
    ).toBe(false);
  });

  it("allows the Agency shell to all active agency roles but not clients or removed users", () => {
    expect(
      canViewAgencyWorkspace(authorizationActors.owner, workspaceA).allowed,
    ).toBe(true);
    expect(
      canViewAgencyWorkspace(authorizationActors.deliveryManager, workspaceA)
        .allowed,
    ).toBe(true);
    expect(
      canViewAgencyWorkspace(authorizationActors.agencyMember, workspaceA)
        .allowed,
    ).toBe(true);
    expect(
      canViewAgencyWorkspace(authorizationActors.clientUser, workspaceA)
        .allowed,
    ).toBe(false);
    expect(
      canViewAgencyWorkspace(authorizationActors.removedUser, workspaceA)
        .allowed,
    ).toBe(false);
  });

  it("enforces Project assignment, Draft client exclusion, and Project-manager capabilities", () => {
    const draft = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: null,
    };

    expect(canViewProject(authorizationActors.owner, draft).allowed).toBe(true);
    expect(
      canEditProjectSettings(authorizationActors.owner, draft).allowed,
    ).toBe(true);
    expect(
      canManageProjectMembers(authorizationActors.owner, draft).allowed,
    ).toBe(true);
    expect(
      canDeleteDraftProject(authorizationActors.owner, draft).allowed,
    ).toBe(true);

    const assignedManager = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: {
        kind: "AGENCY" as const,
        role: "DELIVERY_MANAGER" as const,
      },
    };
    expect(
      canViewProject(authorizationActors.deliveryManager, assignedManager)
        .allowed,
    ).toBe(true);
    expect(
      canEditProjectSettings(
        authorizationActors.deliveryManager,
        assignedManager,
      ).allowed,
    ).toBe(true);
    expect(
      canManageProjectMembers(
        authorizationActors.deliveryManager,
        assignedManager,
      ).allowed,
    ).toBe(true);
    expect(
      canDeleteDraftProject(
        authorizationActors.deliveryManager,
        assignedManager,
      ).allowed,
    ).toBe(true);

    expect(
      canViewProject(authorizationActors.deliveryManager, {
        ...draft,
        actorAssignment: null,
      }).allowed,
    ).toBe(false);

    const assignedAgencyMember = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: {
        kind: "AGENCY" as const,
        role: "AGENCY_MEMBER" as const,
      },
    };
    expect(
      canViewProject(authorizationActors.agencyMember, assignedAgencyMember)
        .allowed,
    ).toBe(true);
    expect(
      canEditProjectSettings(
        authorizationActors.agencyMember,
        assignedAgencyMember,
      ).allowed,
    ).toBe(false);
    expect(
      canManageProjectMembers(
        authorizationActors.agencyMember,
        assignedAgencyMember,
      ).allowed,
    ).toBe(false);
    expect(
      canDeleteDraftProject(
        authorizationActors.agencyMember,
        assignedAgencyMember,
      ).allowed,
    ).toBe(false);

    for (const role of ["CLIENT_APPROVER", "CLIENT_CONTRIBUTOR"] as const) {
      const clientAssignment = {
        kind: "CLIENT" as const,
        clientOrganizationId: clientA,
        role,
      };
      expect(
        canViewProject(authorizationActors.clientUser, {
          workspaceId: workspaceA,
          lifecycle: "ONBOARDING",
          actorAssignment: clientAssignment,
        }).allowed,
      ).toBe(true);
      expect(
        canViewProject(authorizationActors.clientUser, {
          workspaceId: workspaceA,
          lifecycle: "DRAFT",
          actorAssignment: clientAssignment,
        }),
      ).toMatchObject({
        allowed: false,
        reason: "PROJECT_DRAFT_AGENCY_ONLY",
      });
    }

    expect(
      canViewProject(authorizationActors.otherWorkspaceOwner, draft).allowed,
    ).toBe(false);
    expect(canViewProject(authorizationActors.removedUser, draft).allowed).toBe(
      false,
    );
    expect(
      canDeleteDraftProject(authorizationActors.owner, {
        ...draft,
        lifecycle: "ACTIVE",
      }).allowed,
    ).toBe(false);
  });

  it("resolves role-based landing without inventing Project authority", () => {
    expect(resolveRoleBasedLanding(authorizationActors.owner).surface).toBe(
      "AGENCY_DELIVERY",
    );
    expect(
      resolveRoleBasedLanding(authorizationActors.deliveryManager).surface,
    ).toBe("AGENCY_DELIVERY");
    expect(
      resolveRoleBasedLanding(authorizationActors.agencyMember).surface,
    ).toBe("AGENCY_PROJECTS");
    expect(
      resolveRoleBasedLanding(authorizationActors.clientUser).surface,
    ).toBe("CLIENT_PORTAL");
    expect(
      resolveRoleBasedLanding(authorizationActors.removedUser).surface,
    ).toBe("ACCOUNT");
    expect(canEnterClientPortal(authorizationActors.clientUser).allowed).toBe(
      true,
    );
  });

  it("creates an authorized repository scope only from an allowed capability", () => {
    const allowed = canViewClientOrganization(
      authorizationActors.owner,
      workspaceA,
    );
    const denied = canViewClientOrganization(
      authorizationActors.agencyMember,
      workspaceA,
    );

    expect(toAuthorizedWorkspaceScope(allowed, workspaceA)).toEqual({
      workspaceId: workspaceA,
      capability: "VIEW_CLIENT_ORGANIZATION",
    });
    expect(toAuthorizedWorkspaceScope(denied, workspaceA)).toBeNull();
  });

  it("keeps Client projections free of Agency-only fields", () => {
    const clientProjection = toClientContextProjection({
      workspaceName: "StudioFlow Local",
      clientOrganizationId: clientA,
      clientOrganizationName: "Acme",
    });
    expect(clientProjection).toEqual({
      workspaceName: "StudioFlow Local",
      clientOrganizationId: clientA,
      clientOrganizationName: "Acme",
    });
    expect(clientProjection).not.toHaveProperty("workspaceId");
    expect(clientProjection).not.toHaveProperty("role");

    expect(
      toAgencyContextProjection({
        workspaceId: workspaceA,
        workspaceName: "StudioFlow Local",
        role: "AGENCY_OWNER",
      }),
    ).toHaveProperty("role", "AGENCY_OWNER");
  });

  it("builds denial log context without actor, email, token, or object identity", () => {
    const denied = canManageWorkspace(
      authorizationActors.agencyMember,
      workspaceA,
    );
    const context = createAuthorizationLogContext(denied, "agency.settings");

    expect(context).toEqual({
      surface: "agency.settings",
      capability: "MANAGE_WORKSPACE",
      outcome: "denied",
      reason: "ROLE_FORBIDDEN",
    });
    expect(JSON.stringify(context)).not.toContain(
      authorizationActors.agencyMember.userId,
    );
    expect(JSON.stringify(context)).not.toContain(workspaceA);
  });
  it("separates Milestone drafting from Project publication and lifecycle authority", () => {
    const ownerDraft = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: null,
    };
    const managerDraft = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: {
        kind: "AGENCY" as const,
        role: "DELIVERY_MANAGER" as const,
      },
    };
    const memberDraft = {
      workspaceId: workspaceA,
      lifecycle: "DRAFT" as const,
      actorAssignment: {
        kind: "AGENCY" as const,
        role: "AGENCY_MEMBER" as const,
      },
    };

    expect(
      canEditMilestoneDraft(authorizationActors.owner, ownerDraft).allowed,
    ).toBe(true);
    expect(
      canPublishProject(authorizationActors.owner, ownerDraft).allowed,
    ).toBe(true);
    expect(
      canEditMilestoneDraft(authorizationActors.deliveryManager, managerDraft)
        .allowed,
    ).toBe(true);
    expect(
      canPublishProject(authorizationActors.deliveryManager, managerDraft)
        .allowed,
    ).toBe(true);
    expect(
      canEditMilestoneDraft(authorizationActors.agencyMember, memberDraft)
        .allowed,
    ).toBe(true);
    expect(
      canPublishProject(authorizationActors.agencyMember, memberDraft).allowed,
    ).toBe(false);

    const viewOnlyDeliveryManagerDraft = {
      ...memberDraft,
      actorAssignment: {
        kind: "AGENCY" as const,
        role: "AGENCY_MEMBER" as const,
      },
    };
    expect(
      canEditMilestoneDraft(
        authorizationActors.deliveryManager,
        viewOnlyDeliveryManagerDraft,
      ).allowed,
    ).toBe(true);
    expect(
      canPublishProject(
        authorizationActors.deliveryManager,
        viewOnlyDeliveryManagerDraft,
      ).allowed,
    ).toBe(false);

    const activeManager = { ...managerDraft, lifecycle: "ACTIVE" as const };
    expect(
      canPublishMilestone(authorizationActors.deliveryManager, activeManager)
        .allowed,
    ).toBe(true);
    expect(
      canManageMilestoneLifecycle(
        authorizationActors.deliveryManager,
        activeManager,
      ).allowed,
    ).toBe(true);
    expect(
      canPublishMilestone(authorizationActors.agencyMember, {
        ...memberDraft,
        lifecycle: "ACTIVE" as const,
      }).allowed,
    ).toBe(false);
    expect(
      canMoveProjectToActive(authorizationActors.deliveryManager, {
        ...managerDraft,
        lifecycle: "ONBOARDING" as const,
      }).allowed,
    ).toBe(true);
    expect(
      canMoveProjectToActive(authorizationActors.deliveryManager, activeManager)
        .allowed,
    ).toBe(false);
  });
});
