import type { ActorContext } from "../../src/modules/authorization/types";

export function testActor(
  userId: string,
  overrides: Partial<ActorContext> = {},
): ActorContext {
  return {
    userId,
    sessionId: `test-session:${userId}`,
    workspaceMemberships: [],
    clientMemberships: [],
    ...overrides,
  };
}
