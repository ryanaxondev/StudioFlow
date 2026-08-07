export type TestIdentity = Readonly<{
  userId: string;
  email: string;
  sessionId: string;
}>;

export type AuthenticationTestStub = {
  authenticate(): Promise<TestIdentity | null>;
  setIdentity(identity: TestIdentity | null): void;
};

export function createAuthenticationTestStub(
  initialIdentity: TestIdentity | null = null,
): AuthenticationTestStub {
  let identity = initialIdentity;

  return {
    authenticate: async () => identity,
    setIdentity: (nextIdentity) => {
      identity = nextIdentity;
    },
  };
}
