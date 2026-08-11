# StudioFlow Invitations and Membership Bootstrap

## Purpose

M06 connects authenticated StudioFlow identity to authoritative Agency Workspace and Client Organization membership through controlled invitations.

Authentication remains owned by Better Auth and M05. Product membership remains owned by StudioFlow persistence and domain services. Authentication alone never grants Workspace or Client authority.

## Membership boundary

M06 introduces two authoritative membership types:

- Workspace Membership — one agency role inside one Workspace
- Client Membership — organization membership inside one Client Organization

Workspace roles are:

```text
AGENCY_OWNER
DELIVERY_MANAGER
AGENCY_MEMBER
```

Workspace and Client membership lifecycle is:

```text
ACTIVE → REVOKED
```

Pending access is represented by an Invitation, not by a pending membership row.

Client Organization membership does not grant Project access or Project authority. Client Approver and Client Contributor remain Project-scoped concepts for later milestones.

## Persistence ownership

M06 owns exactly these release migrations:

```text
0004_workspaces_and_members.sql
0005_clients_and_invitations.sql
```

`0004` introduces Workspace persistence, Workspace branding, Workspace members, and the deferred foreign key from `outbox_events.workspace_id` to `workspaces.id`.

`0005` introduces Client Organizations, Client Members, and Invitations.

Previously applied migrations remain immutable. Any future correction uses a new forward migration.

## Invitation record and lifecycle

An Invitation records:

- Workspace
- optional Client Organization target
- normalized invited email
- intended membership type
- intended Workspace role when applicable
- SHA-256 token hash
- creator identity
- creation and expiry timestamps
- acceptance timestamp
- revocation timestamp

Raw invitation tokens are never persisted.

Default validity is seven calendar days.

Invitation lifecycle is derived from authoritative timestamps:

```text
Pending → Accepted
Pending → Expired
Pending → Revoked
```

Accepted and Revoked are terminal states. Expiry is evaluated only while an Invitation is otherwise pending, so an accepted Invitation does not later become Expired merely because its original `expires_at` passes.

Resend never reactivates an old record. For a still-pending Invitation it revokes the previous token before creating a replacement. For an already-expired Invitation, expiry already invalidates the old token, so the historical row remains Expired while a new Invitation is created. Resend fails closed when the intended user is already an active member of the target.

## Acceptance transaction

Invitation acceptance is a database transaction that:

1. hashes the presented raw token;
2. locks the Invitation row;
3. validates existence, expiry, revocation, and acceptance state;
4. loads the authenticated user and validates normalized email equality;
5. validates that the target Workspace or Client Organization is still valid;
6. creates or reactivates the authoritative membership;
7. marks the Invitation accepted;
8. commits once.

Concurrent or repeated acceptance cannot create duplicate membership.

An already accepted token may return the existing active membership as an idempotent outcome, but it must never reactivate a membership that was revoked after acceptance.

## Existing and new users

Batch A keeps identity creation outside the acceptance transaction.

An existing user may accept an invitation when their authenticated normalized email matches the Invitation.

A future new-user flow may create the matching identity after the Invitation exists and then run the same acceptance transaction. The invitation-to-identity authentication bridge and `/invite` browser flow belong to Batch B.

## Wrong-account behavior

Acceptance fails closed when the authenticated email does not match the invited email.

The domain error must not reveal Client or future Project details. Batch B will translate this state into the approved switch-account and recovery UI.

## Membership management preconditions

M06 does not implement the M07 `ActorContext` or capability framework.

Its management commands enforce only narrow domain preconditions:

- Workspace member invitation/revocation requires an active Agency Owner in that Workspace.
- Client Organization creation and Client member invitation/revocation require an active Agency Owner or Delivery Manager in that Workspace.
- Cross-Workspace target mismatches fail closed.

These checks are intentionally local to M06 commands and will be replaced or wrapped by M07 policy functions.

## Active membership resolution

M06 exposes narrow membership-context queries for one authenticated user:

- active Workspace memberships with role
- active Client Organization memberships

Revoked memberships disappear immediately from these active results while the authentication session may remain valid.

This is not `ActorContext` and performs no capability evaluation.

## Invitation delivery

Invitation email delivery reuses the M04 Outbox and Worker runtime.

Two delivery event types are introduced:

```text
invitation.workspace-member.deliver
invitation.client-member.deliver
```

Invitation creation and its Outbox insert occur in the same transaction.

The durable Outbox payload does not contain the recipient email, raw invitation token, or raw invitation URL in plaintext.

M06 reuses `AUTH_MESSAGE_ENCRYPTION_SECRET` and the existing AES-256-GCM/HKDF approach, but invitation delivery uses invitation-specific HKDF salt/info and event-type AAD. A payload protected for one invitation event type cannot be opened as another event type or as the M05 Magic Link event.

The Worker decrypts only in memory and uses the existing Mailpit development transport strategy. Production invitation delivery remains disabled until the approved production email-provider milestone.

## Historical identity foundation

M06 preserves user and membership rows through lifecycle revocation rather than hard deletion. This keeps durable identity references available for the later immutable Activity snapshot model.

M06 does not create Activity tables, actor snapshot columns, or Project-visible Activity before their approved migrations.

## Batch A boundary

Batch A includes:

- migrations `0004` and `0005`
- Drizzle schema
- controlled Workspace bootstrap
- Client Organization creation
- Workspace and Client membership lifecycle
- invitation create/resend/revoke/accept services
- active membership resolution
- protected invitation Outbox delivery
- Worker invitation processors
- migration, database, unit, and Worker regression tests

Batch A stops before:

- `/invite` routes or screens
- invitation/recovery browser flow
- `/account` membership UI expansion
- Agency member-management screens
- Client Organization screens
- M06 browser E2E and accessibility additions

## Validation

Batch A validation is:

```bash
pnpm ci:static
pnpm ci:database
pnpm ci:integration
```

The database suite covers clean and incremental migration application, Workspace and Client membership invariants, invitation lifecycle, matching email, resend/revoke behavior, concurrency, active-membership resolution, protected Outbox payloads, and existing M04/M05 regressions.

## Full M06 Exit Gate

M06 is complete only when an authenticated identity can enter one valid Workspace or Client context exclusively through authoritative membership, invitation acceptance and recovery work for existing and invited new identities, revoked membership takes effect immediately, and the approved initial M06 screens are wired to real persistence.

## Explicit non-goals

M06 does not introduce:

- Project persistence or Project membership
- binding Client Approver authority
- public Client Portal access
- public sign-up or public Workspace creation
- M07 `ActorContext` or capability framework
- RLS
- Demo seed data
- Activity tables or Project-visible Activity
- production email-provider integration

## Batch B implementation

Batch B completes the M06 browser and management boundary without introducing the M07 authorization framework.

It adds:

- `/invite/[token]` as the invitation acceptance surface;
- invitation presentation, access-link request, and acceptance route handlers;
- invitation-only creation of a matching unverified identity before Magic Link verification;
- Magic Link return to the same invitation for both existing and newly invited identities;
- wrong-account switching without exposing Client Organization detail;
- invitation-aware expired, revoked, invalid, accepted, and unavailable states;
- `/account` membership-context expansion;
- `/agency/settings/members` initial Agency membership management, including eligible role changes;
- `/agency/clients` initial Client Organization collection and controlled creation;
- `/agency/clients/[clientOrganizationId]` initial Client Organization detail, Client Member invitation, and access removal;
- a local controlled Workspace bootstrap command for manual development smoke testing.

The invitation-only identity bridge does not enable Better Auth public sign-up. A new identity may be inserted only after a valid, pending invitation token has been presented. The identity remains unverified and receives no membership authority until the invited email is verified through the existing M05 Magic Link flow and the invitation acceptance transaction succeeds.

Agency screens use narrow M06 membership queries and domain-command authorization only. They do not create `ActorContext`, capability evaluation, generic route policy middleware, Project authority, or Client Portal access.

Browser tests stub the invitation HTTP boundary so the existing E2E and accessibility CI jobs remain independent of PostgreSQL. The real invitation-to-identity bridge and persistence behavior are covered in the database suite, while route and component behavior are exercised through browser smoke coverage.

## Full M06 validation

The complete milestone is validated with:

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

Local machines with constrained filesystem or memory may run Playwright with one worker without changing the repository configuration.
