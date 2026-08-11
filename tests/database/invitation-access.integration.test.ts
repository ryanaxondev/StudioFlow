import { eq } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { users, workspaceMembers } from "../../src/db/schema";
import { prepareInvitationAccess } from "../../src/modules/invitations/access-service";
import type { AuthenticationEmailSender } from "../../src/modules/auth/email";
import { createStudioFlowAuth } from "../../src/modules/auth/server/auth";
import { getInvitationPresentation } from "../../src/modules/invitations/presentation";
import {
  acceptInvitation,
  inviteWorkspaceMember,
} from "../../src/modules/invitations/service";
import { listWorkspaceMemberManagementState } from "../../src/modules/memberships/queries";
import { createWorkspaceForControlledSetup } from "../../src/modules/memberships/service";
import { createFixedClock } from "../helpers/clock";
import { resetPublicSchemaData } from "../helpers/database-reset";
import {
  createMigratedTestDatabase,
  type MigratedTestDatabase,
} from "../helpers/migrated-database";

const baseClock = createFixedClock("2026-08-11T12:00:00.000Z");
const expiredClock = createFixedClock("2026-08-18T12:00:00.001Z");
const delivery = {
  baseUrl: "http://127.0.0.1:3000",
  encryptionSecret: "studioflow-m06-invitation-access-test-secret-123456",
};

const authenticationEnvironment = {
  NODE_ENV: "test" as const,
  BETTER_AUTH_URL: delivery.baseUrl,
  BETTER_AUTH_SECRET: "studioflow-m06-invitation-bridge-auth-secret-1234567890",
};

class RecordingEmailSender implements AuthenticationEmailSender {
  readonly messages: { to: string; url: string }[] = [];

  async sendMagicLink(message: { to: string; url: string }): Promise<void> {
    this.messages.push(message);
  }
}

describe("M06 invitation access bridge", () => {
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
  });

  afterAll(async () => {
    await testDatabase?.drop();
  });

  async function createOwnerAndInvitation(email: string) {
    const [owner] = await testDatabase.database.db
      .insert(users)
      .values({
        name: "Owner",
        email: "owner.bridge@example.com",
        emailVerified: true,
        emailVerifiedAt: baseClock.now(),
      })
      .returning({ id: users.id });

    const workspace = await createWorkspaceForControlledSetup({
      database: testDatabase.database,
      ownerUserId: owner!.id,
      name: "Bridge Workspace",
      timezone: "UTC",
      displayCurrency: "USD",
      clock: baseClock,
    });

    const invitation = await inviteWorkspaceMember({
      database: testDatabase.database,
      actorUserId: owner!.id,
      workspaceId: workspace.workspaceId,
      email,
      role: "AGENCY_MEMBER",
      delivery,
      clock: baseClock,
    });

    return { workspace, invitation };
  }

  it("sends an existing invited identity back to the same invitation", async () => {
    const email = "existing.bridge@example.com";
    await testDatabase.database.db.insert(users).values({
      name: "Existing Member",
      email,
      emailVerified: true,
      emailVerifiedAt: baseClock.now(),
    });
    const { invitation } = await createOwnerAndInvitation(email);
    const issueMagicLink = vi.fn(async () => undefined);

    const result = await prepareInvitationAccess({
      database: testDatabase.database,
      token: invitation.token,
      requestIp: "127.0.0.10",
      requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
      clock: baseClock,
      issueMagicLink,
    });

    expect(result).toEqual({ status: "request-sent" });
    expect(issueMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email,
        callbackURL: `/invite/${invitation.token}`,
      }),
    );
  });

  it("requires a display name before creating an invitation-only identity", async () => {
    const email = "new.bridge@example.com";
    const { invitation } = await createOwnerAndInvitation(email);
    const issueMagicLink = vi.fn(async () => undefined);

    await expect(
      prepareInvitationAccess({
        database: testDatabase.database,
        token: invitation.token,
        requestIp: "127.0.0.11",
        requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
        clock: baseClock,
        issueMagicLink,
      }),
    ).resolves.toEqual({ status: "name-required" });
    expect(issueMagicLink).not.toHaveBeenCalled();

    await expect(
      prepareInvitationAccess({
        database: testDatabase.database,
        token: invitation.token,
        displayName: "New Member",
        requestIp: "127.0.0.12",
        requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
        clock: baseClock,
        issueMagicLink,
      }),
    ).resolves.toEqual({ status: "request-sent" });

    const [created] = await testDatabase.database.db
      .select({
        name: users.name,
        emailVerified: users.emailVerified,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    expect(created).toEqual({
      name: "New Member",
      emailVerified: false,
      emailVerifiedAt: null,
    });
    expect(issueMagicLink).toHaveBeenCalledTimes(1);
  });

  it("does not create identity or send authentication for an expired invitation", async () => {
    const email = "expired.bridge@example.com";
    const { invitation } = await createOwnerAndInvitation(email);
    const issueMagicLink = vi.fn(async () => undefined);

    const result = await prepareInvitationAccess({
      database: testDatabase.database,
      token: invitation.token,
      displayName: "Expired Member",
      requestIp: "127.0.0.13",
      requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
      clock: expiredClock,
      issueMagicLink,
    });

    expect(result).toEqual({ status: "expired" });
    expect(issueMagicLink).not.toHaveBeenCalled();
    const [created] = await testDatabase.database.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    expect(created).toBeUndefined();
  });

  it("completes the invited-new-user bridge through real Magic Link verification", async () => {
    const email = "full-bridge@example.com";
    const { workspace, invitation } = await createOwnerAndInvitation(email);
    const sender = new RecordingEmailSender();
    const authentication = createStudioFlowAuth({
      database: testDatabase.database,
      environment: authenticationEnvironment,
      emailSender: sender,
      clock: baseClock,
    });
    const headers = new Headers({
      origin: delivery.baseUrl,
      referer: `${delivery.baseUrl}/invite/${invitation.token}`,
      "x-forwarded-for": "127.0.0.14",
    });

    const access = await prepareInvitationAccess({
      database: testDatabase.database,
      token: invitation.token,
      displayName: "Full Bridge Member",
      requestIp: "127.0.0.14",
      requestHeaders: headers,
      clock: baseClock,
      issueMagicLink: async ({
        email: targetEmail,
        callbackURL,
        errorCallbackURL,
        headers: authHeaders,
      }) => {
        await authentication.api.signInMagicLink({
          body: {
            email: targetEmail,
            callbackURL,
            errorCallbackURL,
          },
          headers: authHeaders,
        });
      },
    });

    expect(access).toEqual({ status: "request-sent" });
    expect(sender.messages).toHaveLength(1);
    expect(
      new URL(sender.messages[0]!.url).searchParams.get("callbackURL"),
    ).toBe(`/invite/${invitation.token}`);

    const verificationResponse = await authentication.handler(
      new Request(sender.messages[0]!.url, {
        method: "GET",
        headers,
        redirect: "manual",
      }),
    );
    expect(verificationResponse.status).toBeGreaterThanOrEqual(300);
    expect(verificationResponse.status).toBeLessThan(400);
    expect(verificationResponse.headers.get("location") ?? "").toContain(
      `/invite/${invitation.token}`,
    );

    const [verifiedUser] = await testDatabase.database.db
      .select({
        id: users.id,
        emailVerified: users.emailVerified,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    expect(verifiedUser?.emailVerified).toBe(true);
    expect(verifiedUser?.emailVerifiedAt?.toISOString()).toBe(
      baseClock.now().toISOString(),
    );

    await expect(
      acceptInvitation({
        database: testDatabase.database,
        authenticatedUserId: verifiedUser!.id,
        token: invitation.token,
        clock: baseClock,
      }),
    ).resolves.toMatchObject({
      status: "accepted",
      workspaceId: workspace.workspaceId,
    });

    const [membership] = await testDatabase.database.db
      .select({
        role: workspaceMembers.role,
        status: workspaceMembers.status,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, verifiedUser!.id))
      .limit(1);
    expect(membership).toEqual({
      role: "AGENCY_MEMBER",
      status: "ACTIVE",
    });
  });

  it("keeps the latest expired invitation actionable for Agency resend", async () => {
    const email = "expired-management@example.com";
    const { workspace, invitation } = await createOwnerAndInvitation(email);

    const state = await listWorkspaceMemberManagementState(
      testDatabase.database,
      workspace.workspaceId,
      expiredClock.now(),
    );

    expect(state.invitations).toEqual([
      expect.objectContaining({
        invitationId: invitation.invitationId,
        email,
        status: "EXPIRED",
      }),
    ]);
  });

  it("presents accepted invitations as terminal", async () => {
    const email = "present.bridge@example.com";
    const [member] = await testDatabase.database.db
      .insert(users)
      .values({
        name: "Present Member",
        email,
        emailVerified: true,
        emailVerifiedAt: baseClock.now(),
      })
      .returning({ id: users.id });
    const { invitation } = await createOwnerAndInvitation(email);
    await acceptInvitation({
      database: testDatabase.database,
      authenticatedUserId: member!.id,
      token: invitation.token,
      clock: baseClock,
    });

    const presentation = await getInvitationPresentation(
      testDatabase.database,
      invitation.token,
      expiredClock,
    );
    expect(presentation.state).toBe("accepted");
  });
});
