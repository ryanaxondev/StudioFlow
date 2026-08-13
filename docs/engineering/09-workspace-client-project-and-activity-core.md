# StudioFlow

# Workspace, Client, Project, and Activity Core

**Document Type:** Engineering Milestone Brief

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/03-product-specification.md`
- `docs/product/05-information-architecture.md`
- `docs/product/06-screen-inventory.md`
- `docs/product/08-engineering-architecture.md`
- `docs/engineering/01-implementation-roadmap.md`
- `docs/engineering/07-tenant-isolation-and-authorization.md`
- `docs/engineering/08-visual-foundation-and-product-shells.md`

## Goal

Create the authoritative Project aggregate, Project-scoped assignments, immutable Activity foundation, assignment-aware read models, and the first deterministic private development seed while preserving the approved M08 Obsidian Operations product shell.

## Migration

M09 owns one migration:

```text
0006_projects_memberships_and_activity.sql
```

It introduces:

- `projects`
- `project_members`
- `activity_events`
- Project collection and timeline indexes
- Deferred required-authority validation
- Activity immutability enforcement

No M09 implementation may edit an already-applied migration in a later milestone. Any later schema evolution must use the next numbered migration.

## Project Aggregate

The Project root persists:

- Workspace and Client Organization ownership
- Project identity and client-safe summary
- lifecycle base
- date-only planned start and target completion
- required Delivery Manager reference
- optional-at-Draft Client Approver reference
- cancellation/completion/archive foundation fields
- optimistic `row_version`

M09 implements Draft mutation only. Publication and later lifecycle transitions remain M10+ concerns.

## Project Membership and Authority

Project Membership is authoritative Project access context.

Supported sides and roles:

```text
AGENCY
  DELIVERY_MANAGER
  AGENCY_MEMBER

CLIENT
  CLIENT_APPROVER
  CLIENT_CONTRIBUTOR
```

The Project Delivery Manager must resolve to an active Agency-side `DELIVERY_MANAGER` Project Membership. When a Client Approver reference is present, it must resolve to an active Client-side `CLIENT_APPROVER` Project Membership.

These invariants are checked with deferred database constraint triggers so required-authority reassignment can update the old membership, new membership, and Project reference within one transaction without an invalid intermediate state becoming observable.

Application commands additionally validate that Project Members come from the same authoritative Workspace or Client Organization membership context and that disabled identities are not eligible targets.

## Project Authorization

M09 extends the M07 Project policy interface with authoritative persisted assignments.

Rules:

- Agency Owner can view every Project in the Workspace.
- Delivery Manager can view assigned Projects only.
- Agency Member can view assigned Projects only and remains excluded from Workspace Delivery Overview.
- Client users require both active Client Organization membership and active Client Project assignment.
- Client users cannot view `DRAFT` Projects.
- Agency Owner and assigned Delivery Manager may edit Draft Project settings, manage Project Members, and delete an otherwise eligible Draft.
- Agency Member and Client roles cannot perform Project-management commands.

Unknown cross-tenant Project context keeps not-found semantics. Known context with insufficient capability keeps generic Access Denied semantics.

Capability-aware M08 navigation remains a presentation projection only; direct route authorization stays authoritative.

### M07 Client Organization authorization handoff

M07 intentionally kept Delivery Manager access to Client Organization detail and Client member management fail-closed because no authoritative Project assignment existed yet. M09 now introduces that missing assignment source.

Before M09 is Approved, Batch 2 must close that handoff without broadening Workspace-level Client Organization authority: a Delivery Manager may open AG-04 and manage Client members only when an active Project in that Client Organization proves the actor has the assigned `DELIVERY_MANAGER` Project role. Unassigned Delivery Managers remain denied. Agency Owner Workspace-wide authority remains unchanged.

The same final M09 pass must reconcile upstream membership removal with required Project authority. Revoking or role-downgrading a Workspace member who is the current Project Delivery Manager, or revoking a Client member who is the current Client Approver, must remain blocked until the required Project role is reassigned atomically. M09 must not leave a Project pointing at an authority holder whose authoritative Workspace or Client Organization membership is no longer eligible.

## Initial Commands

M09 implements:

```text
createDraftProject
updateDraftProjectIdentity
assignProjectMember
removeProjectMember
reassignDeliveryManager
reassignClientApprover
deleteEligibleDraftProject
```

Every accepted mutable-root mutation increments `row_version` unless the command is a semantic no-op.

Binding commands require an idempotency key. Mutations that edit an existing Project require the expected row version.

## Command Transaction Contract

Project commands execute through a shared transaction helper.

When applicable, the same PostgreSQL transaction contains:

- authoritative Project state
- Project Membership change
- immutable Activity
- Outbox record
- idempotency reservation/result

A failure rolls all of these back together.

M09 commands do not emit Outbox events merely to satisfy the abstraction. Outbox is used when an asynchronous side effect exists; the shared helper and rollback test prove that later domain commands can add it without weakening atomicity.

## Activity

`activity_events` is immutable Product history, not Event Sourcing.

M09 starts Activity persistence with the first Project transaction rather than backfilling it in a later milestone.

Activity records preserve:

- safe event and subject identity
- `CLIENT_VISIBLE` or `AGENCY_ONLY` visibility
- actor user reference when available
- actor display-name snapshot
- actor role snapshot
- safe structured metadata
- occurrence time

Page views do not create Activity.

Update and direct delete of Activity rows are rejected by the database. The only M09 deletion exception is an eligible hard-deleted Draft Project, where the Project command opens a transaction-local cascade-delete capability scoped to that exact Project ID before removing the aggregate.

## Draft Hard Delete

M09 hard delete remains intentionally narrow:

- Project lifecycle must be `DRAFT`.
- Actor must be Agency Owner or the assigned Delivery Manager.
- expected row version must match.
- client-authored or Client-visible Project Activity must not exist.

The Product contract also forbids hard delete after accepted Project-scoped client invitation or formal decision. Those Project-scoped domains do not exist in M09 yet. Their later migrations must extend the same eligibility guard before those records can exist; M09 does not invent placeholder tables or fake checks for future domains.

## Read Models

Agency and Client projections remain separate.

Agency collection behavior:

- Owner sees all non-archived Workspace Projects.
- Delivery Manager sees assigned Projects.
- Agency Member sees assigned Projects.
- current active Workspace membership and non-disabled identity are rechecked in the query.

Client collection behavior:

- requires active Client Organization membership and active Client Project membership
- excludes Drafts at query time
- selects only explicit Client-safe fields
- never broad-serializes an Agency Project object and filters it afterward

Client Activity selects `CLIENT_VISIBLE` rows only.

## Private Development Seed v1

M09 begins the deterministic private development-seed framework.

Version 1 contains fixed identifiers for:

- Sableframe Studio Workspace
- Maya Chen — Agency Owner
- Daniel Ortiz — Delivery Manager
- Priya Shah — Agency Member
- Theo Martin — Agency Member
- Kestrelon Client Organization
- Elena Rossi — Client Approver
- Marcus Reed — Client Contributor
- Nia Patel — Client Contributor
- Kestrelon Website Rebuild Draft Project
- Project authority and contributor memberships
- initial agency-only `project.created` Activity

The seed is idempotent and safe to replay against a local migrated database. It does not clear unrelated developer data and is not the public per-visitor Demo. Where it reuses approved Sableframe/Kestrelon identities, Project identity, schedule, and initial Activity, those canonical narrative values remain aligned with the Demo Narrative; M09 is still allowed to keep the Project itself in `DRAFT` for domain validation.

The CLI accepts only a local database URL and validates the requested seed version before writing.

## Implementation Batches

M09 is delivered in two bounded batches.

### Batch 1 — Domain Foundation

- migration and Drizzle schema
- Project command transaction helper
- Project commands
- authoritative Project authorization
- Agency and Client read models
- Activity immutability and visibility
- deterministic seed v1
- migration, policy, domain, rollback, DTO, and seed regression coverage

### Batch 2 — Product Population

Populate the frozen M08 product anatomy with M09 truth:

- AG-01 Delivery Overview real Project projection and lifecycle summary
- AG-02 assignment-aware Projects collection
- AG-08 Project Setup first step
- AG-26 Project Settings — General
- AG-27 Project Settings — People & Access
- AG-28 Project Settings — Lifecycle, Draft subset
- M07 Delivery Manager Client Organization detail/member-management handoff, resolved only through active assigned `DELIVERY_MANAGER` Project authority
- required-authority upstream membership removal guard so Workspace/Client membership changes cannot orphan the current Delivery Manager or Client Approver

Batch 2 may add route-local presentation needed for these Screens, but it must not redesign the approved M08 shell, navigation geometry, Access surfaces, or Client product shell.

Batch 2 implementation keeps Project navigation capability-aware as well as route-authorized: a Draft-setup affordance appears only when the current actor has Project-management authority for that specific Project. Agency Owners and the Project-assigned `DELIVERY_MANAGER` can resume Draft setup; view-only `AGENCY_MEMBER` Project assignments remain static even when the actor's Workspace role is Delivery Manager. Client Organization Detail can enter New Project with the Client Organization preselected. Required authority reassignment and Draft deletion use explicit in-product confirmation rather than immediate selection/destructive browser prompts. The M08 Client Portal remains untouched and presentation-only for Project data in M09.

## Validation

M09 must prove:

- Create Draft
- Owner access
- assigned Delivery Manager access
- assigned Agency Member Project access while Delivery Overview remains denied
- Client has no Draft access
- required-role reassignment
- cross-tenant membership rejection
- Draft delete eligibility
- removed member loses access
- Client DTO exclusion
- Project-created Activity
- membership Activity remains Agency-only
- state, Activity, Outbox, and idempotency rollback together
- deterministic seed replay
- seed version rejection
- database enforcement of immutable Activity and required active authority memberships
- archived Client Organizations immediately remove Client Project authority and reject new Client authority assignment
- the Activity hard-delete exception is transaction-local and scoped to the exact Project aggregate
- M07 Delivery Manager Client Organization detail/member-management handoff is closed through active assigned Project authority only
- required Delivery Manager and Client Approver upstream membership removal cannot orphan Project authority

## Non-Goals

- No Project publication
- No Milestones
- No Client Project detail/domain population
- No Project Health
- No public Demo clone
- No M08 shell redesign

## Exit Gate

M09 is not Approved until a Draft Project can be created, resumed through the first setup/settings surfaces, assignment-authorized, audited, seeded, and safely deleted with all required regression gates green.

## Final Regression — Passed

The complete M09 gate is green:

- Static/unit suite: 46 tests passed
- Authorization policy suite: 9 tests passed
- Integration suite: 16 tests passed
- PostgreSQL/database suite: 75 tests passed
- Project Core focused regression: 14 tests passed
- Migration validation: 6 implemented migrations contiguous and valid
- Production Web build and Worker typecheck: passed
- Bundle budget: `/` initial JavaScript `145.97 KB gzip` against the `170 KB` budget
- E2E coverage: all 10 smoke tests verified
- Accessibility coverage: all 3 browser accessibility tests verified with Axe
- `git diff --check`: passed
- Human Owner manual Product/authorization QA: passed for Agency Owner, assigned Agency Member, and assigned Delivery Manager flows

On the resource-constrained local development machine, cold Turbopack compilation caused browser-test timeouts when multiple workers competed for the development server. In accordance with the M08 testing contract for slow filesystems, the browser gate was rerun with one worker against a warmed local server; the previously timed-out E2E and accessibility cases then passed without application-code changes.

Manual QA additionally confirms:

- required Delivery Manager and Client Approver authority cannot be orphaned by upstream membership changes
- Project-specific management affordances remain absent for view-only Agency assignments and direct Setup access stays denied
- assigned Delivery Manager Project authority unlocks only the matching Client Organization detail/member-management context
- Project authority confirmation does not discard unsaved Project identity/date fields
- management warnings are action-local, transient, accessible, and visually distinct
- Draft Project creation, resumable setup, authority reassignment, Project-member management, identity/date updates, and eligible hard delete operate against persisted Project truth
- semantic no-op Project identity updates do not create false Activity or advance `row_version`

## Final Approval

M09 is Approved. The authoritative Draft Project aggregate, Project-scoped membership and authorization, immutable Activity foundation, deterministic development seed v1, assignment-aware Agency read models, Draft setup/settings surfaces, required-authority guards, and the M07 Client Organization authorization handoff are complete and validated.

M10 may now build Project publication and Milestones on migration `0007_milestones.sql`. M09 does not publish Projects, populate Client Project detail/domain behavior, introduce Project Health, or expand the public Demo.

