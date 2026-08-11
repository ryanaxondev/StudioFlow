import "server-only";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import type { DatabaseClient } from "../../../db/client";
import { users, workspaceMembers, workspaces } from "../../../db/schema";
import type { TransactionDatabase } from "../../../db/transactions";
import { resolveActiveMembershipContexts } from "../../memberships/queries";
import { getCurrentStudioFlowSession } from "../../auth/server/session";
import { createAuthorizationLogContext } from "../logging";
import { toAuthorizedWorkspaceScope, type WorkspacePolicy } from "../policies";
import type {
  ActorContext,
  AuthorizedWorkspaceScope,
  AuthorizationCapability,
  CapabilityResult,
} from "../types";
import { AuthorizationError } from "../types";
import { logger } from "../../../server/observability/logger";

export async function buildActorContext(
  database: DatabaseClient,
  identity: Readonly<{ userId: string; sessionId: string }>,
): Promise<ActorContext> {
  const memberships = await resolveActiveMembershipContexts(
    database,
    identity.userId,
  );

  return {
    userId: identity.userId,
    sessionId: identity.sessionId,
    workspaceMemberships: memberships.workspaceMemberships,
    clientMemberships: memberships.clientMemberships.map((membership) => ({
      clientOrganizationId: membership.clientOrganizationId,
    })),
  };
}

export async function getCurrentActorContext(
  requestHeaders: Headers,
  database: DatabaseClient,
): Promise<ActorContext | null> {
  const session = await getCurrentStudioFlowSession(requestHeaders);
  if (!session) {
    return null;
  }

  return buildActorContext(database, {
    userId: session.user.id,
    sessionId: session.session.id,
  });
}

async function refreshWorkspaceMembership(
  db: TransactionDatabase,
  actor: ActorContext,
  workspaceId: string,
): Promise<ActorContext> {
  const [membership] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, actor.userId),
        eq(workspaceMembers.status, "ACTIVE"),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);

  return {
    ...actor,
    workspaceMemberships: [
      ...actor.workspaceMemberships.filter(
        (item) => item.workspaceId !== workspaceId,
      ),
      ...(membership ? [{ workspaceId, role: membership.role }] : []),
    ],
  };
}

export async function authorizeWorkspaceCapability<
  Capability extends AuthorizationCapability,
>(
  db: TransactionDatabase,
  actor: ActorContext,
  workspaceId: string,
  policy: WorkspacePolicy<Capability>,
): Promise<AuthorizedWorkspaceScope<Capability>> {
  const authoritativeActor = await refreshWorkspaceMembership(
    db,
    actor,
    workspaceId,
  );
  const result = policy(authoritativeActor, workspaceId);
  const scope = toAuthorizedWorkspaceScope(result, workspaceId);
  if (!scope) {
    if (result.allowed) {
      throw new Error("Authorization scope could not be created.");
    }
    throw new AuthorizationError(result.capability, result.reason);
  }

  return scope;
}

export type AuthorizedAgencyWorkspaceSelection<
  Capability extends AuthorizationCapability,
> = Readonly<{
  selected: Readonly<{
    workspaceId: string;
    workspaceName: string;
    scope: AuthorizedWorkspaceScope<Capability>;
  }>;
  options: readonly Readonly<{
    workspaceId: string;
    workspaceName: string;
  }>[];
}>;

export type AgencyWorkspaceSelectionResult<
  Capability extends AuthorizationCapability,
> =
  | Readonly<{
      status: "allowed";
      selection: AuthorizedAgencyWorkspaceSelection<Capability>;
    }>
  | Readonly<{ status: "denied"; result: CapabilityResult<Capability> }>
  | Readonly<{ status: "not-found" }>;

export async function resolveAuthorizedAgencyWorkspaceSelection<
  Capability extends AuthorizationCapability,
>(
  database: DatabaseClient,
  actor: ActorContext,
  input: Readonly<{
    requestedWorkspaceId?: string;
    policy: WorkspacePolicy<Capability>;
  }>,
): Promise<AgencyWorkspaceSelectionResult<Capability>> {
  if (input.requestedWorkspaceId) {
    const requestedMembership = actor.workspaceMemberships.find(
      (membership) => membership.workspaceId === input.requestedWorkspaceId,
    );
    if (!requestedMembership) {
      return { status: "not-found" };
    }

    const result = input.policy(actor, input.requestedWorkspaceId);
    const scope = toAuthorizedWorkspaceScope(
      result,
      input.requestedWorkspaceId,
    );
    if (!scope) {
      return result.allowed
        ? { status: "not-found" }
        : { status: "denied", result };
    }

    const [workspace] = await database.db
      .select({ workspaceId: workspaces.id, workspaceName: workspaces.name })
      .from(workspaces)
      .where(eq(workspaces.id, input.requestedWorkspaceId))
      .limit(1);
    if (!workspace) {
      return { status: "not-found" };
    }

    const eligibleIds = actor.workspaceMemberships
      .filter(
        (membership) => input.policy(actor, membership.workspaceId).allowed,
      )
      .map((membership) => membership.workspaceId);
    const options = await loadWorkspaceOptions(database, eligibleIds);

    return {
      status: "allowed",
      selection: {
        selected: { ...workspace, scope },
        options,
      },
    };
  }

  const eligibleMemberships = actor.workspaceMemberships.filter(
    (membership) => input.policy(actor, membership.workspaceId).allowed,
  );
  if (eligibleMemberships.length === 0) {
    const fallbackWorkspaceId = actor.workspaceMemberships[0]?.workspaceId;
    const result = fallbackWorkspaceId
      ? input.policy(actor, fallbackWorkspaceId)
      : input.policy(actor, "00000000-0000-0000-0000-000000000000");
    return { status: "denied", result };
  }

  const options = await loadWorkspaceOptions(
    database,
    eligibleMemberships.map((membership) => membership.workspaceId),
  );
  const selected = options[0];
  if (!selected) {
    return { status: "not-found" };
  }

  const result = input.policy(actor, selected.workspaceId);
  const scope = toAuthorizedWorkspaceScope(result, selected.workspaceId);
  if (!scope) {
    return result.allowed
      ? { status: "not-found" }
      : { status: "denied", result };
  }

  return {
    status: "allowed",
    selection: { selected: { ...selected, scope }, options },
  };
}

async function loadWorkspaceOptions(
  database: DatabaseClient,
  workspaceIds: readonly string[],
): Promise<
  readonly Readonly<{ workspaceId: string; workspaceName: string }>[]
> {
  if (workspaceIds.length === 0) {
    return [];
  }

  return database.db
    .select({ workspaceId: workspaces.id, workspaceName: workspaces.name })
    .from(workspaces)
    .where(inArray(workspaces.id, [...workspaceIds]))
    .orderBy(asc(workspaces.name), asc(workspaces.id));
}

export function logAuthorizationDenied(
  result: CapabilityResult,
  surface: string,
): void {
  if (!result.allowed) {
    logger.warn(
      "authorization.denied",
      createAuthorizationLogContext(result, surface),
    );
  }
}
