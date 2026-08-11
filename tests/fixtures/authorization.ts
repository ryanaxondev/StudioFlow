import type { ActorContext } from "../../src/modules/authorization/types";

export const authorizationFixture = {
  workspaceA: "00000000-0000-4000-8000-0000000000a1",
  workspaceB: "00000000-0000-4000-8000-0000000000b1",
  clientA: "00000000-0000-4000-8000-0000000000c1",
  clientB: "00000000-0000-4000-8000-0000000000c2",
} as const;

function actor(
  name: string,
  input: Omit<ActorContext, "userId" | "sessionId">,
): ActorContext {
  return {
    userId: `user:${name}`,
    sessionId: `session:${name}`,
    ...input,
  };
}

export const authorizationActors = {
  owner: actor("owner", {
    workspaceMemberships: [
      { workspaceId: authorizationFixture.workspaceA, role: "AGENCY_OWNER" },
    ],
    clientMemberships: [],
  }),
  deliveryManager: actor("delivery-manager", {
    workspaceMemberships: [
      {
        workspaceId: authorizationFixture.workspaceA,
        role: "DELIVERY_MANAGER",
      },
    ],
    clientMemberships: [],
  }),
  agencyMember: actor("agency-member", {
    workspaceMemberships: [
      { workspaceId: authorizationFixture.workspaceA, role: "AGENCY_MEMBER" },
    ],
    clientMemberships: [],
  }),
  clientUser: actor("client-user", {
    workspaceMemberships: [],
    clientMemberships: [{ clientOrganizationId: authorizationFixture.clientA }],
  }),
  otherWorkspaceOwner: actor("other-owner", {
    workspaceMemberships: [
      { workspaceId: authorizationFixture.workspaceB, role: "AGENCY_OWNER" },
    ],
    clientMemberships: [],
  }),
  removedUser: actor("removed", {
    workspaceMemberships: [],
    clientMemberships: [],
  }),
} as const;
