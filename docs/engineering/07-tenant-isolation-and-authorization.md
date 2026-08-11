# StudioFlow Tenant Isolation and Authorization

## Purpose

M07 centralizes server-side tenant isolation and authorization before Project-domain persistence expands. Authentication remains owned by Better Auth. StudioFlow authorization is derived from authoritative Workspace and Client membership and evaluated through explicit policy functions.

M07 adds no database migration. The implemented migration ceiling remains:

```text
0005_clients_and_invitations.sql
```

Project persistence remains deferred to M09.

## ActorContext

Every protected query or command begins from the authenticated identity and builds an `ActorContext` containing:

- authenticated user ID;
- authenticated session ID;
- active Workspace memberships with Workspace role;
- active Client Organization memberships;
- optional Demo ownership when introduced later.

Only active authoritative memberships for a non-disabled identity enter `ActorContext`. Revoked memberships and disabled identities are absent.

Project membership and Project authority are not fabricated in M07. The Project policy interface accepts a future authoritative Project assignment as input when Project persistence exists.

## Capability policies

Authorization decisions are pure policy results rather than ad hoc role comparisons.

M07 establishes:

```text
canViewAgencyWorkspace
canViewAgencyDelivery
canManageWorkspace
canManageAgencyMembers
canCreateClientOrganization
canViewClientOrganizations
canViewClientOrganization
canManageClientMembers
canCreateProject
canViewProject
canEnterClientPortal
```

The approved M07 policy surface includes `canCreateProject` and `canViewProject`, but these functions do not create Project records, Project membership, or binding Client Approver authority. They define the contract that later Project milestones must supply with authoritative Project context.

A capability evaluation returns an explicit allowed/denied result with a non-sensitive denial reason.

## Workspace authority

Workspace-level authority in M07 is:

- Agency Owner — Agency Delivery, Workspace management, Agency member management, Client Organization collection/detail, Client member management, future Project creation;
- Delivery Manager — Agency Delivery, Client Organization collection and creation, future Project creation; Client Organization detail and member management remain fail-closed until authoritative assigned client/project access exists in M09;
- Agency Member — authenticated Agency shell only; no Workspace management or Client Organization management authority;
- Client Member — no Agency Workspace authority.

A user from another Workspace is treated as having no membership for the requested Workspace.

## Client Organization access before Project persistence

The Product Specification limits Delivery Manager Client member management to an assigned client/project, and AG-04 is available only to a Delivery Manager with access. M07 has no Project persistence or assignment source, so it must not fabricate that authority.

Therefore M07 permits a Delivery Manager to view the AG-03 Client Organization collection and create a Client Organization, but AG-04 Client Organization detail and Client member management remain denied for Delivery Managers until M09 can prove authoritative Project/client access. Agency Owners retain Workspace-wide detail and member-management authority.

This is intentionally fail-closed rather than temporary permissive access.

## Authoritative command re-check

`ActorContext` is an authenticated request snapshot, not a durable authorization grant.

Protected Workspace commands re-query the actor's active Workspace membership inside the command transaction immediately before policy evaluation. This defeats stale `ActorContext` after membership revocation or account disable and preserves the M06 immediate-revocation contract.

The browser-supplied `workspaceId` is only a requested context. The server derives whether that actor may use it.

## Authorized repository convention

Tenant-scoped Agency queries do not accept a raw Workspace ID as sufficient authority.

Policy evaluation produces an `AuthorizedWorkspaceScope`. Protected repository/query functions accept that scope and derive their tenant predicate from it.

This convention makes the authorization step explicit at the call site and prevents Server Components from treating an arbitrary request parameter as authorization.

The database remains the authoritative enforcement source for membership and tenant relationships. M07 does not add RLS.

## Safe not-found versus Access Denied

Protected route resolution distinguishes two safe outcomes:

- `notFound()` when the requested tenant/object is outside the actor's known authorized context and confirming existence would disclose protected information;
- `/access-denied` when the actor has a known context but the current role lacks the required capability.

SH-04 `/access-denied` contains only a generic denial, a safe role-based destination, and account switching. It does not render Project titles, Client object identity, file identity, decision content, or another membership's details.

## Protected shells and landing resolution

M07 introduces server-side protected layouts for:

```text
/agency
/portal
```

The Agency layout requires an active Agency Workspace membership. The Client placeholder layout requires an active Client Organization membership.

Role-based landing is resolved centrally:

- Agency Owner / Delivery Manager → Agency Delivery placeholder;
- Agency Member → Assigned Projects authorization placeholder;
- Client Member → Client Portal authorization placeholder;
- authenticated identity with no active membership → Account.

The placeholders contain no fabricated Project data. Stable Product shells and navigation belong to M08; Project records and assignment-aware screens begin later.

## Server Actions for authenticated Screen commands

Same-origin authenticated Agency Screen commands use Server Actions in M07 rather than internal `/api/agency/*` Route Handlers.

Server Actions:

1. parse untrusted form input;
2. derive the current authenticated `ActorContext` on the server;
3. call the same application/domain command used by tests;
4. authorize again from authoritative membership inside the transaction;
5. map expected authorization/domain failures to safe Screen results;
6. revalidate affected Screens.

Route Handlers remain appropriate for authentication, invitation browser bridging, health checks, uploads, webhooks, and other approved infrastructure boundaries.

## Agency and Client projections

Agency and Client read models are separate projection types.

Agency context may include:

- Workspace ID;
- Workspace name;
- Agency role.

Client context deliberately omits Agency-only authority fields. The initial Client projection contains only the Client Organization identity and safe Workspace display name needed for context.

Internal Agency fields must be omitted at query/projection time rather than serialized and hidden in the browser.

## Authorization logging

Authorization denial logging contains only:

- logical surface name;
- capability;
- allowed/denied outcome;
- generic denial reason.

Logs do not include email, token, raw URL, user ID, Workspace ID, Client Organization ID, future Project ID, or protected object content.

## Test matrix

M07 validates:

- Agency Owner;
- Delivery Manager;
- Agency Member;
- Client user;
- user from another Workspace;
- removed user;
- unauthenticated access at the authentication boundary.

The pure policy matrix runs in the static gate. PostgreSQL tests verify authoritative ActorContext construction, cross-Workspace denial, safe known-context denial, removed-user behavior, stale-context write rejection, and disabled-user behavior.

## Validation

M07 validation uses the existing gates:

```bash
pnpm ci:static
pnpm ci:database
pnpm ci:integration
pnpm ci:build
pnpm ci:bundle
pnpm ci:e2e
pnpm ci:a11y
git diff --check
```

No migration ceiling change is expected.

## Exit Gate

M07 is complete when G2 passes and every protected StudioFlow route/command introduced so far obtains authority from centralized policy modules rather than ad hoc role comparisons.

Cross-tenant actors, removed actors, disabled actors, Client-only actors, and insufficient Agency roles must fail closed while authorized roles continue to succeed.

## Explicit non-goals

M07 does not introduce:

- Project persistence;
- Project membership persistence;
- binding Client Approver or Client Contributor authority;
- domain-specific publication permissions;
- Project publication workflows;
- Row-Level Security;
- browser/client-side authorization as a security boundary;
- M08 final Agency/Client shell design;
- Demo seed data;
- a new database migration.
