# StudioFlow

# Project Setup and Milestones

**Document Type:** Engineering Milestone Brief

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/03-product-specification.md`
- `docs/product/05-information-architecture.md`
- `docs/product/06-screen-inventory.md`
- `docs/product/08-engineering-architecture.md`
- `docs/engineering/01-implementation-roadmap.md`
- `docs/engineering/09-workspace-client-project-and-activity-core.md`

## Goal

Turn the authoritative M09 Draft Project into a publishable delivery plan with ordered Milestones, a real Onboarding transition, one Active Milestone, transactionally persisted Activity, and a durable Product-notification Outbox intent that can remain safely pending until M19 registers its delivery processor.

M10 is the first milestone where Client Project access becomes meaningful. Publication is therefore a binding domain command, not a page-level flag change.

## Migration

M10 owns one migration:

```text
0007_milestones.sql
```

It introduces:

- `milestones`
- tenant-safe Project ownership
- ordered Project positions
- independent Milestone publication timestamp
- Milestone lifecycle timestamps
- optimistic Milestone `row_version`
- one-Active-Milestone partial unique index
- client-visible Milestone index
- registered-event Outbox claim index for deferred Product intents
- database checks for lifecycle/timestamp consistency

M10 does not edit migration `0006`.

## Milestone Publication and Lifecycle

Milestone publication is intentionally separate from Milestone lifecycle.

```text
Agency-only Draft
published_at = NULL
state = PLANNED

Published upcoming
published_at != NULL
state = PLANNED

Current
published_at != NULL
state = ACTIVE

Terminal
published_at != NULL
state = COMPLETED | CANCELLED
```

This resolves the Product contract that distinguishes Draft and Published Milestones without inventing a second `DRAFT` lifecycle value that conflicts with the approved lifecycle map.

Publishing a Project publishes its current Milestone plan atomically and activates the first Milestone. After Project publication, authorized agency users may still create agency-only Milestone Drafts; Agency Owner or the Project-assigned Delivery Manager may publish those later drafts independently.

Client read models in Batch 3 must filter on `published_at IS NOT NULL`. Project lifecycle alone is not sufficient to expose a newly created Milestone Draft. Client DTOs also derive visible ordinal order from the published subset rather than exposing raw `position` gaps that could reveal hidden Draft Milestones. Client-visible Milestone Activity follows the same rule and uses published ordinals rather than raw positions.

## Ordering

Milestone `position` is unique per Project. Migration `0007` makes that uniqueness constraint deferrable so a reorder can rewrite multiple positions atomically without temporarily violating uniqueness inside the transaction.

Draft creation appends at the current end of the sequence. Reordering operates on the complete set of `PLANNED` Milestones while preserving the position slots occupied by Active or terminal Milestones.

Before publication, assigned Agency Members may reorder Draft Milestones. After publication they may still reorder only unpublished Draft Milestones when the persisted positions of published Milestones remain unchanged. Once a reorder changes any published Milestone position, Project-manager authority is required because published sequence state is already client-facing. Client-visible reorder Activity contains only published Milestone identifiers; the complete mixed Draft/Published ordering snapshot remains agency-only.

The first Milestone on Project publication is the lowest-position Milestone. No separate `activate_on_publish` field is introduced.

## Authorization

M10 introduces explicit Project-scoped capabilities rather than inferring authority from Workspace role alone.

### Draft Milestone editing

Allowed:

- Agency Owner
- assigned Delivery Manager
- assigned Agency Member

Applies to:

```text
createMilestoneDraft
updateMilestoneDraft
agency-only draft reorder
```

### Client-visible publication and lifecycle

Allowed:

- Agency Owner
- Project-assigned Delivery Manager

Applies to:

```text
publishProject
publishMilestone
published-plan reorder
activateMilestone
completeMilestone
completeMilestoneWithOverride
cancelMilestone
moveProjectToActive
```

A Workspace Delivery Manager assigned to a particular Project only as `AGENCY_MEMBER` receives the Agency Member drafting capability on that Project but does not receive Project publication or lifecycle authority.

Client roles remain read-only for M10 domain commands.

## Commands

M10 implements:

```text
createMilestoneDraft
updateMilestoneDraft
reorderMilestones
publishProject
publishMilestone
activateMilestone
completeMilestone
completeMilestoneWithOverride
cancelMilestone
moveProjectToActive
```

Binding commands use the M09 Project command transaction helper and idempotency record.

Milestone mutations carry the expected Project row version. Commands targeting an existing Milestone also carry the expected Milestone row version.

Semantic no-ops do not advance Project or Milestone row versions and do not create false Activity.

## Project Publication

`publishProject` is atomic.

The command:

1. authorizes Agency Owner or Project-assigned Delivery Manager
2. locks the Project
3. verifies expected Project row version
4. requires `DRAFT`
5. requires non-empty client-facing Project summary
6. requires target completion date
7. revalidates active Delivery Manager authority
8. requires active Client Approver authority
9. locks the complete Milestone plan
10. requires at least one unpublished `PLANNED` Milestone
11. publishes the current Milestone plan
12. activates the first Milestone
13. moves Project `DRAFT → ONBOARDING`
14. creates client-visible Project-publication Activity
15. creates client-visible first-Milestone activation Activity
16. inserts `project.published` Outbox intent with payload schema version 1
17. persists the idempotency result

Any failure rolls back all state, Activity, Outbox, and idempotency writes.

## Project Publication Outbox Contract

M10 deliberately persists `project.published` before its Product-email processor exists.

This is not a failed notification. It is a durable domain intent awaiting the M19 delivery capability.

The Worker runtime therefore changes its claim contract in M10. Migration `0007` also adds an `event_type`-led ready index so accumulated deferred intents do not force the Worker to repeatedly scan unrelated event types:

```text
claim only event types registered in the running ProcessorRegistry
```

Consequences:

- authentication and invitation events continue processing because their processors already exist
- `project.published` remains pending before M19
- the pending row remains unlocked
- `attempt_count` remains zero
- `failed_at` remains null
- M19 makes historical pending rows claimable by registering the matching processor
- M19 does not rewrite or clone historical Outbox rows
- the M10 payload stores identifiers and `schemaVersion`, not recipient email; M19 resolves delivery from authoritative current identity/access and must not send to a stale removed Project recipient

The existing processor-missing failure path remains a defensive guard for an unexpected registry/claim mismatch. It is no longer the normal behavior for future Product event types.

This contract is recorded in both the Engineering Architecture and M19 roadmap so M19 cannot accidentally create a second notification source of truth.

## Milestone Completion Criteria Boundary

M10 creates the stable command boundary:

```text
evaluateMilestoneCompletionCriteria
```

In M10, Client Actions and Deliverables do not exist, so the evaluator has no authoritative blockers and standard completion can pass.

M11 and M13 must extend this boundary with their persisted blockers rather than teaching `completeMilestone` about future tables in advance.

Standard completion:

- requires Active published Milestone
- requires criteria satisfied
- records client-visible completion Activity

Override completion:

- requires Agency Owner or assigned Delivery Manager
- requires a non-empty reason
- may complete despite criteria blockers
- records client-visible completion without leaking the reason
- records a separate agency-only override Activity containing the reason and blocker snapshot

## Milestone Activation and Cancellation

Activation requires:

- Project `ONBOARDING` or `ACTIVE`
- published `PLANNED` target Milestone
- no other Active Milestone
- all earlier-position Milestones terminal

The partial unique index remains the final concurrency boundary for exactly one Active Milestone.

Cancellation supports published `PLANNED` or `ACTIVE` Milestones. Cancelling the Active Milestone does not silently activate the next Milestone; activation remains an explicit command.

## Onboarding to Active

M10 implements the base transition:

```text
ONBOARDING → ACTIVE
```

It requires an Active published Milestone.

M11 adds required onboarding Client Action criteria. M10 does not invent placeholder Client Action tables or fake obligations. The transition command is structured so M11 can add those authoritative checks without changing Project lifecycle semantics.

## Development Seed v2

M09 seed v1 remains available and continues to represent the Draft Project foundation.

M10 adds cumulative development seed v2:

```text
Sableframe Studio
Kestrelon
Kestrelon Website Rebuild
Project lifecycle: ONBOARDING
five published Milestones
Milestone 1: ACTIVE
Milestones 2–5: PLANNED
```

Sequence:

```text
01 Kickoff & Discovery
02 Content & Information Architecture
03 Visual Design
04 Development & QA
05 Launch & Handoff
```

Dates use the pre-Change-Request baseline. The final Milestone ends on the original Project target of May 22; M16 will later apply the accepted schedule extension to May 29 as part of the canonical narrative rather than M10 pre-seeding a future Change Request outcome.

Seed v2 creates deterministic Project-publication and first-Milestone activation Activity but does not synthesize a notification-delivery record. Product Outbox behavior is exercised by real M10 commands and tests.

## Implementation Batches

### Batch 1 — Milestone and Publication Domain Foundation

- `0007_milestones.sql`
- Drizzle Milestone schema
- Milestone publication boundary
- M10 Project authorization capabilities
- Milestone drafting and ordering commands
- Project publication
- later Milestone publication
- Milestone lifecycle commands
- completion-criteria boundary
- Onboarding-to-Active base transition
- Activity and Outbox atomicity
- registered-event Worker claiming
- development seed v2
- migration, authorization, database, concurrency, rollback, Worker, and seed regression coverage
- Product/Engineering documentation reconciliation, including the M19 Outbox handoff

### Batch 2 — Agency Delivery Plan

Populate the existing M08/M09 Agency product anatomy with M10 truth:

- AG-08 Project Setup complete workflow
- AG-09 Agency Project Overview structural base
- AG-10 Delivery Plan — Milestones
- AG-11 Milestone Detail
- AG-01 Active Milestone context
- Project routing from Draft Setup to published Overview
- publication confirmation and readiness

No shell redesign.

### Batch 2 Realization Contract

The Agency slice uses the approved Project routes without introducing a parallel workflow:

```text
Draft Project + manager authority → /setup
Draft Project + assigned Agency Member → /agency/projects/:projectId with reduced controls
Published Project → /agency/projects/:projectId
Delivery Plan → /agency/projects/:projectId/delivery
Milestone Detail → /agency/projects/:projectId/delivery/milestones/:milestoneId
```

AG-08 owns publication readiness, the Milestone sequence, and an embedded Client Portal preview boundary. The preview is presentation-only in Batch 2; it does not bypass the Batch 3 Client projection or expose unpublished data through a Client route.

AG-09 deliberately omits Project Health and fabricated blocking obligations because their authoritative inputs arrive in later milestones. It exposes lifecycle, target, current Milestone, published progress, people, and real Activity only.

AG-10 exposes the Milestones view while Client Actions remains visibly unavailable until M11. This is not a placeholder data model: no Client Action records, fake counts, or completion blockers are synthesized in M10.

Draft Milestone editing, ordering, publication, and lifecycle controls call the Batch 1 domain commands through Server Actions. UI authorization is advisory only; every write is re-authorized transactionally by the command.

Project `row_version` is shared across Project and Milestone writes. Long-lived Client Components therefore use the greater of their locally acknowledged version and the newest Server Component prop rather than remounting on every version change. This preserves unsaved Project form input while preventing stale sibling controls after a Milestone command touches the Project aggregate.

### Batch 3 — Client Published Slice

- CL-02 Client Projects real collection population required to enter published Project detail
- CL-03 Client Project Overview structural Onboarding state
- CL-04 Client Milestone Detail
- published-only Milestone projections that never expose `completion_override_reason`
- client-safe Activity
- client-facing recency must not expose raw Project `updated_at` changes caused only by agency-only Milestone Draft mutations; derive or present recency from client-visible truth
- Draft Milestone leakage regression
- responsive Client shell integration

### Batch 3 Realization Contract

Client read models are separate from Agency projections. A Client Project detail DTO contains only client-facing Project identity, lifecycle presentation, dates, agency/client identity, and the current actor's client Project role. It does not contain Workspace IDs, row versions, required-authority IDs, internal cancellation reasons, or agency-only Project membership data.

Client Milestone projections query only `published_at IS NOT NULL` rows and derive ordinal numbering from that published subset. Raw persisted `position` is not returned to Client surfaces, so an unpublished Draft inserted between published Milestones cannot leak through a numbering gap. `completion_override_reason`, Milestone row versions, and publication internals remain absent from the Client DTO.

Client Activity is both visibility-filtered and subject-filtered. `CLIENT_VISIBLE` Milestone Activity is returned only when the referenced Milestone is currently published. The Client Activity DTO omits raw metadata and agency role snapshots; client screens render a bounded presentation label rather than exposing internal event payloads.

CL-02 sorts by the latest client-visible Activity timestamp, with immutable Project creation time only as a legacy/foundation fallback. Raw `projects.updated_at` is never used for Client recency because agency-only Draft Milestone work legitimately touches the Project aggregate.

CL-02 provides Open/Past collection switching and routes only assigned, non-Draft Projects into Client Project detail. CL-03 exposes published Milestone progress, the current Active Milestone, target date, structural empty decision/attention states, and client-safe recent Activity without fabricating Client Actions, Deliverables, or Project Health. CL-04 is a contextual destination reached from the Milestone timeline and returns not-found semantics for unpublished Milestone IDs.

The Client Project local-navigation structure keeps Overview active in M10. Deliverables and Activity remain non-link labels until their owning milestones implement CL-06 and CL-12; M10 does not create empty routes or fake data merely to satisfy the final navigation shape.

## Validation

M10 must prove:

- migration 0007 applies incrementally and from empty database
- one Active Milestone is enforced by PostgreSQL
- Milestone date/order constraints
- assigned Agency Member can create/edit/reorder agency-only Draft Milestones
- Agency Member cannot publish Project or client-visible Milestone state
- Project publication requirements
- active required Delivery Manager and Client Approver are revalidated
- at least one Milestone required
- Project publication publishes the current plan
- later agency-only Milestone Draft stays client-hidden until an authorized manager publishes it
- first Milestone activation
- second Active Milestone blocked
- sequential activation after completion/cancellation
- Client Project access begins after Project publication
- standard completion uses the completion-criteria boundary
- override reason required and not leaked in Client-visible Activity
- publication state, Activity, Outbox, and idempotency rollback together
- unregistered Product Outbox intent remains pending with no attempt consumed and becomes claimable after processor registration
- seed v2 is deterministic and uses the approved Kestrelon order/baseline dates

## Non-Goals

- No Client Actions
- No Deliverables
- No Project Health
- No Revision workflow
- No Change Requests
- No Handoff
- No Product-email processor for `project.published`
- No Scheduled Jobs or Notification Delivery table
- No public Demo clone
- No final P0 polish
- No M08 shell redesign

## Exit Gate

M10 is not Approved until a valid Draft Project can publish atomically into Onboarding with its current Milestone plan published, exactly one first Active Milestone, durable client-visible Activity, a safely deferred Project-publication Outbox intent, and complete Agency/Client Milestone product slices passing regression and manual role QA.

## Final Regression — Passed

The complete M10 gate is green:

- Static/unit suite: 47 tests passed
- Authorization policy suite: 10 tests passed
- Integration suite: 23 tests passed
- PostgreSQL/database suite: 96 tests passed
- Migration validation: 7 implemented migrations contiguous and valid
- Production Web build and Worker typecheck: passed
- Bundle budget: `/` initial JavaScript `145.97 KB gzip` against the `170 KB` budget
- E2E coverage: all 10 smoke tests passed
- Accessibility coverage: all 3 browser accessibility tests passed with Axe
- `git diff --check`: passed
- Development migration application: `0007_milestones.sql` applied successfully with runtime grants
- Development seed v2: replayed successfully against the migrated local database

Browser regression ran with one Playwright worker against the local development server because the known slow-filesystem environment can turn parallel cold compilation into infrastructure timeouts. The complete E2E and accessibility suites passed without application-code changes.

Manual role QA passed for:

- Maya Chen — Agency Owner
- Daniel Ortiz — assigned Delivery Manager
- Priya Shah — assigned Agency Member
- Elena Rossi — Client Approver

Manual QA additionally confirms:

- Project publication enters Onboarding with the published Milestone plan and one first Active Milestone
- assigned Delivery Manager retains published Milestone lifecycle controls without regaining Draft-content editing for already published Milestones
- assigned Agency Member receives reduced Draft-Milestone contribution without Project publication or lifecycle authority
- Agency Project Overview, Delivery Plan, Milestone Detail, setup readiness, publication confirmation, and Onboarding-to-Active surfaces operate against persisted M10 truth
- Client Projects, Project Overview, and Milestone Detail expose published-only, client-safe projections
- unpublished Milestones and agency-only Activity do not appear on Client surfaces
- Client Milestone numbering is derived from the published subset and does not expose hidden Draft position gaps
- completion override reason and agency-only override Activity remain absent from Client projections
- Product Health, Client Actions, Deliverables, and later-domain obligations are not fabricated in M10
- the `project.published` Outbox intent remains safely pending until a matching Product processor is registered

## Final Approval

M10 is Approved. Project publication, ordered Milestones, Milestone publication/lifecycle commands, the completion-criteria extension boundary, Onboarding-to-Active transition, transactionally consistent Activity and Outbox behavior, development seed v2, and the Agency and Client Milestone product slices are complete and validated.

The M10 Outbox handoff is authoritative for later Product notification work: pre-M19 Product intents remain pending while no matching processor is registered, the Worker claims registered event types only, and M19 must activate accumulated intents through processor registration with payload-version compatibility and current-access recipient resolution rather than rewriting historical rows.

M11 may now introduce Client Actions and blocking obligations on migration `0008_client_actions_and_blocking.sql`. M11 extends `evaluateMilestoneCompletionCriteria` and the Onboarding-to-Active readiness checks with authoritative Client Action state; it does not replace the M10 Milestone lifecycle, publication boundary, Client projection rules, or deferred-Outbox contract.

