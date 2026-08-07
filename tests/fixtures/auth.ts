import type { TestIdentity } from "../helpers/authentication";

export const defaultTestIdentity: TestIdentity = Object.freeze({
  userId: "user_test_001",
  email: "studioflow-test@example.invalid",
  sessionId: "session_test_001",
});
