import type { TestIdentity } from "../helpers/authentication";

const baseIdentity: TestIdentity = {
  userId: "user_test_001",
  email: "studioflow-test@example.invalid",
  sessionId: "session_test_001",
};

export function createTestIdentity(
  overrides: Partial<TestIdentity> = {},
): TestIdentity {
  return {
    ...baseIdentity,
    ...overrides,
  };
}
