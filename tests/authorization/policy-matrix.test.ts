import { describe, expect, it } from "vitest";

import {
  canCreateClientOrganization,
  canCreateProject,
  canEnterClientPortal,
  canManageAgencyMembers,
  canManageClientMembers,
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

describe("M07 authorization policy matrix", () => {
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

  it("keeps Project viewing behind the M07 Project policy interface", () => {
    expect(
      canViewProject(authorizationActors.owner, {
        workspaceId: workspaceA,
        actorAssignment: null,
      }).allowed,
    ).toBe(true);

    expect(
      canViewProject(authorizationActors.deliveryManager, {
        workspaceId: workspaceA,
        actorAssignment: { kind: "AGENCY", role: "DELIVERY_MANAGER" },
      }).allowed,
    ).toBe(true);
    expect(
      canViewProject(authorizationActors.deliveryManager, {
        workspaceId: workspaceA,
        actorAssignment: null,
      }).allowed,
    ).toBe(false);

    expect(
      canViewProject(authorizationActors.agencyMember, {
        workspaceId: workspaceA,
        actorAssignment: { kind: "AGENCY", role: "AGENCY_MEMBER" },
      }).allowed,
    ).toBe(true);

    for (const role of ["CLIENT_APPROVER", "CLIENT_CONTRIBUTOR"] as const) {
      expect(
        canViewProject(authorizationActors.clientUser, {
          workspaceId: workspaceA,
          actorAssignment: {
            kind: "CLIENT",
            clientOrganizationId: clientA,
            role,
          },
        }).allowed,
      ).toBe(true);
    }

    expect(
      canViewProject(authorizationActors.otherWorkspaceOwner, {
        workspaceId: workspaceA,
        actorAssignment: null,
      }).allowed,
    ).toBe(false);
    expect(
      canViewProject(authorizationActors.removedUser, {
        workspaceId: workspaceA,
        actorAssignment: null,
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
});
