# StudioFlow

# Implementation Roadmap

## Document Information

**Document Type:** Implementation Roadmap

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`
- `docs/product/03-product-specification.md`
- `docs/product/04-demo-narrative.md`
- `docs/product/05-information-architecture.md`
- `docs/product/06-screen-inventory.md`
- `docs/product/07-visual-direction.md`
- `docs/product/08-engineering-architecture.md`

**Includes:**

- Delivery Strategy
- Milestone Sequence
- Dependency Graph
- Repository Bootstrap
- Local Infrastructure
- Continuous Integration
- Migration Sequence
- Authentication
- Invitations and Sessions
- Tenant Isolation
- Authorization
- Design-System Foundation
- Agency and Client Shells
- Domain Implementation Order
- P0 Signature Screen Order
- Worker Rollout
- File Pipeline
- Public Demo Clone and Reset
- Test Gates
- Accessibility Gates
- Performance Gates
- Production Deployment
- Launch Readiness
- Stabilization
- Documentation Requirements
- Commit and Review Boundaries
- Risk Controls
- Resolved Review Decisions
- Approval Criteria
- Approval Decision

**Produces:**

- Executable Implementation Sequence
- Milestone Exit Criteria
- Migration Order
- Domain Command Order
- Screen Delivery Order
- Test-Gate Matrix
- Deployment Runbook Inputs
- Production Launch Checklist
- Portfolio Demo Completion Plan

---

## 1. Executive Summary

This document defines the exact implementation order for the StudioFlow MVP.

The Roadmap converts the Approved Engineering Architecture into 25 sequential Milestones:

```text
M00 → M01 → M02 → ... → M24
```

The sequence begins with repository and infrastructure foundations, then establishes:

- Database migrations
- Authentication
- Invitations and sessions
- Tenant isolation
- Authorization
- Shared visual foundations
- Agency and Client shells
- Core Project delivery domains
- Review and Decision workflows
- Worker and notification processing
- Demo isolation
- Full Screen completion
- Production deployment
- Launch stabilization

The Roadmap uses a vertical-slice strategy.

A Milestone is not complete merely because its database tables or UI layout exist.

Each Milestone must include, when applicable:

1. Schema and migration
2. Domain command
3. Authorization policy
4. Audience-specific query
5. Screen or interaction
6. Activity Event
7. Outbox effect
8. Automated tests
9. Error and read-only states
10. Documentation update

The implementation must not:

- Build all tables before validating domain behavior
- Build Signature Screens against static mock state
- Defer authorization until the end
- Treat email delivery as part of the transaction
- Add infrastructure not approved by Engineering Architecture
- Start Production deployment before Demo reset and critical tests are stable
- Reopen approved Product structure through implementation shortcuts

The critical path is:

```text
Repository
   ↓
Local Infrastructure
   ↓
Database Foundation
   ↓
Authentication
   ↓
Tenant and Authorization
   ↓
Product Shells
   ↓
Project Core
   ↓
Client Actions and Files
   ↓
Deliverables and Review
   ↓
Revision and Scope Control
   ↓
Handoff
   ↓
Activity, Health, and Worker
   ↓
Demo Isolation
   ↓
P0 Hardening
   ↓
Full MVP Completion
   ↓
Production Launch
```

The Roadmap defines sequence, dependency, and quality gates.

It does not estimate calendar duration.

---

## 2. Roadmap Objective

The Roadmap must answer:

1. What is implemented first
2. Which Milestones are blocked by earlier work
3. Which migration is introduced by each domain
4. When Authentication and Authorization become mandatory
5. When each Product Object becomes authoritative
6. When each P0 Screen becomes real
7. When Worker processing begins
8. When Demo data becomes interactive
9. Which tests block progress
10. Which release checks block Production
11. Which implementation outputs require review
12. What constitutes MVP completion

This document is the implementation sequence Source of Truth.

It does not replace:

- Product Specification
- Information Architecture
- Screen Inventory
- Visual Direction
- Engineering Architecture

When implementation uncovers a conflict, work stops at the affected Milestone and the Approved source document is reviewed.

Implementation does not silently redefine Product behavior.

---

## 3. Roadmap Principles

### 3.1 Foundations Before Features

Repository, local services, environment validation, migrations, sessions, and authorization must exist before Product workflows depend on them.

### 3.2 Vertical Slices Over Horizontal Completion

The Roadmap does not implement every database table first and every Screen later.

Each Product slice should become usable through:

```text
Data
  ↓
Command
  ↓
Policy
  ↓
Query
  ↓
Screen
  ↓
Test
```

### 3.3 Authorization From the First Protected Route

No protected Screen may ship with temporary permissive access.

Authorization is not a later hardening phase.

### 3.4 Real State Before Signature Polish

P0 Screens may receive structural shells early, but final composition and interaction polish begin only after their authoritative domain state exists.

### 3.5 One Source of Truth

Seed data, UI status, Activity, metrics, and email all derive from PostgreSQL state.

No Screen-specific duplicate state may become authoritative.

### 3.6 Every Binding Action Is Transactional

Formal Decisions, publication, role reassignment, Change Requests, Handoff acknowledgment, and Project completion must use approved domain commands from their first implementation.

### 3.7 Quality Gates Are Cumulative

A passed Gate remains active for all later Milestones.

Later work may not reduce:

- Type safety
- Tenant isolation
- Accessibility
- Bundle budgets
- Migration safety
- Test coverage of critical behavior

### 3.8 Demo Is Production-Like

The public Demo uses real commands, permissions, State Transitions, and reset behavior.

It is not a parallel mocked application.

### 3.9 No Premature Generalization

Implement only Approved MVP behavior.

Do not add:

- Generic workflow engine
- Generic polymorphic permissions
- Generic notification preference system
- Public API
- RLS
- Redis
- External-link crawler
- Comment editing
- Multi-Approver abstractions

### 3.10 One Reviewable Integration Boundary Per Milestone

Each Milestone ends with:

- Clean diff
- Passing Gate
- Updated documentation
- One coherent integration commit after review

Local work may use temporary commits, but the final Milestone history should remain deliberate.

`AGENTS.md` is local-only and must remain ignored.

It must never be staged, committed, or pushed.

---

## 4. Milestone Model

Each Milestone uses the following structure:

### Goal

What becomes possible.

### Prerequisites

What must already be complete.

### Implementation Scope

What must be built.

### Required Artifacts

What files, migrations, tests, or documentation must exist.

### Required Tests

What automated behavior must pass.

### Exit Gate

What must be true before the next Milestone begins.

### Explicit Non-Goals

What must not be pulled forward.

---

## 5. Milestone Statuses

```text
Planned
   ↓
In Progress
   ↓
In Review
   ↓
Approved
```

Alternative path:

```text
In Progress / In Review
          ↓
       Blocked
```

A Milestone may move to Approved only after its Exit Gate passes.

---

## 6. Quality Gate Model

## 6.1 G0 — Repository Integrity

Requires:

- Formatting
- Lint
- Typecheck
- Build
- No secret files
- `AGENTS.md` ignored
- Lockfile committed
- Environment schema valid

### 6.2 G1 — Migration Integrity

Requires:

- Migration applies to empty database
- Migration applies to previous schema
- Constraints tested
- Migration order deterministic
- Rollback or forward-fix note
- Seed remains compatible

### 6.3 G2 — Authorization Integrity

Requires:

- Authorized role succeeds
- Unauthorized role fails
- Unassigned user fails
- Cross-Workspace user fails
- Removed user fails
- Client projection excludes internal fields

### 6.4 G3 — Domain Integrity

Requires:

- Valid State Transition succeeds
- Invalid transition fails
- Activity written
- Outbox written when applicable
- Idempotency works
- Concurrent duplicate action is prevented

### 6.5 G4 — Screen Integrity

Requires:

- Correct authoritative data
- Loading state
- Empty state when applicable
- Error state
- Read-only state
- Responsive behavior
- Keyboard operation
- Role-correct action visibility

### 6.6 G5 — Worker Integrity

Requires:

- Job claim
- Retry
- Deduplication
- Failure visibility
- Lock recovery
- Demo suppression
- Idempotent processor behavior

### 6.7 G6 — Demo Integrity

Requires:

- Deterministic seed
- Role switching
- Reset
- Per-visitor isolation
- Metric consistency
- No real email
- Fixed Clock
- Cleanup

### 6.8 G7 — Production Readiness

Requires:

- Production migration
- Deployment smoke tests
- Backup
- Restore test
- Observability
- Security review
- Performance baseline
- Accessibility review
- Launch rollback plan

---

## 7. Milestone Sequence

| Milestone | Name                                           | Primary Output                             | Gate  |
| --------- | ---------------------------------------------- | ------------------------------------------ | ----- |
| M00       | Contract and Repository Baseline               | Implementation contract                    | G0    |
| M01       | Application Bootstrap                          | Buildable Next.js repository               | G0    |
| M02       | Local Infrastructure                           | PostgreSQL, MinIO, Mailpit, ClamAV         | G0    |
| M03       | CI and Test Harness                            | Automated baseline Gates                   | G0    |
| M04       | Database Foundation                            | Migration system and core conventions      | G1    |
| M05       | Authentication Foundation                      | Magic Link and session lifecycle           | G1–G3 |
| M06       | Invitations and Membership Bootstrap           | Invitation acceptance and identity linking | G1–G4 |
| M07       | Tenant Isolation and Authorization             | ActorContext and capability policies       | G2–G3 |
| M08       | Visual Foundation and Product Shells           | Agency and Client shells                   | G0–G4 |
| M09       | Workspace, Client, and Project Core            | Draft Project and Project membership       | G1–G4 |
| M10       | Project Setup and Milestones                   | Publish Project and Delivery Plan          | G1–G4 |
| M11       | Client Actions                                 | Assignment, completion, reopen             | G1–G4 |
| M12       | File and Asset Pipeline                        | Authorized upload and download             | G1–G5 |
| M13       | Deliverables and Versions                      | Version publication and history            | G1–G4 |
| M14       | Comments and Image Review                      | Pin review and shared/internal threads     | G1–G4 |
| M15       | Review Decisions and Revisions                 | Approval and Revision workflow             | G1–G4 |
| M16       | Change Requests                                | Scope Decision and application             | G1–G4 |
| M17       | Handoff and Project Completion                 | Final delivery workflow                    | G1–G4 |
| M18       | Operational Read Models and Health             | Dashboard truth and blocked-time metrics   | G1–G4 |
| M19       | Product Notifications and Worker Expansion     | Email, reminders, and async delivery       | G1–G5 |
| M20       | Search, Settings, and Recovery                 | Supporting Product surfaces                | G2–G4 |
| M21       | Public Demo Clone and Reset                    | Isolated public Demo                       | G6    |
| M22       | Staging and Staging and P0 Signature Hardening | Production-like P0 validation              | G2–G6 |
| M23       | Full MVP Screen Completion                     | All 46 Screens and 26 interactions         | G0–G6 |
| M24       | Production Launch and Stabilization            | Live portfolio deployment                  | G7    |

---

## 8. Dependency Graph

```text
M00
 ↓
M01
 ↓
M02
 ↓
M03
 ↓
M04
 ↓
M05
 ↓
M06
 ↓
M07
 ↓
M08
 ↓
M09
 ↓
M10
 ↓
M11 ───────────────┐
 ↓                 │
M12                │
 ↓                 │
M13                │
 ↓                 │
M14                │
 ↓                 │
M15                │
 ↓                 │
M16                │
 ↓                 │
M17                │
 ↓                 │
M18                │
 ↓                 │
M19                │
 ↓                 │
M20                │
 ↓                 │
M21                │
 ↓                 │
M22                │
 ↓                 │
M23                │
 ↓                 │
M24                │
```

The sequence is intentionally mostly linear.

Parallel work is allowed only inside a Milestone when it does not create competing sources of truth.

---

## 9. Workstream Ownership

The implementation contains seven workstreams.

### 9.1 Foundation

- Repository
- Tooling
- Environment
- CI
- Deployment skeleton

### 9.2 Identity and Security

- Authentication
- Invitations
- Sessions
- Tenant isolation
- Authorization
- Access recovery

### 9.3 Product Domains

- Workspace
- Client
- Project
- Milestone
- Client Action
- Deliverable
- Review
- Change Request
- Handoff

### 9.4 Files and Processing

- Upload intents
- Object storage
- Malware scan
- Image derivatives
- Authorized download
- Annotation dimensions

### 9.5 Async Runtime

- Outbox
- Worker
- Scheduled Jobs
- Email
- Reminders
- Cleanup

### 9.6 Experience

- Design tokens
- Shells
- Screens
- Interactions
- Responsive behavior
- Accessibility

### 9.7 Demo and Production

- Deterministic seed
- Per-visitor clone
- Reset
- Railway deployment
- Observability
- Backup
- Launch

---

# Part I — Foundation

## 10. M00 — Contract and Repository Baseline

### Goal

Establish the implementation contract before generating application code.

### Prerequisites

- Product documents 01–08 are Approved.
- Architecture decisions are frozen.

### Implementation Scope

Create or confirm:

- Repository root
- `docs/product/`
- `docs/engineering/`
- `.gitignore`
- `.editorconfig`
- Node and pnpm version contract
- License decision
- Repository README placeholder
- Contribution and commit conventions
- Architecture decision directory
- Local-only `AGENTS.md` exclusion

### Required Artifacts

```text
.editorconfig
.gitignore
.nvmrc or .node-version
package.json
pnpm-lock.yaml
docs/engineering/01-implementation-roadmap.md
docs/engineering/adr/
README.md
```

### Required Checks

- `AGENTS.md` ignored
- No `.env` file tracked
- No credentials tracked
- Approved documents remain unchanged
- Repository starts clean

### Exit Gate

G0 passes for repository structure.

### Explicit Non-Goals

- No Product code
- No database
- No UI
- No package-heavy bootstrap before architecture review

---

## 11. M01 — Application Bootstrap

### Goal

Create a minimal production-buildable Next.js application and Worker entry point.

### Prerequisites

- M00 Approved

### Implementation Scope

Bootstrap:

- Next.js App Router
- TypeScript strict mode
- pnpm
- Tailwind CSS v4
- ESLint flat config
- Prettier
- Server-only boundary helper
- Environment validation
- Basic Web and Worker TypeScript entry points
- Health Route Handlers
- Error and not-found foundations

### Initial Structure

```text
src/
├── app/
├── modules/
├── server/
├── db/
├── components/
├── styles/
├── lib/
└── types/

worker/
tests/
```

### Required Artifacts

- Buildable `web` target
- Buildable `worker` target
- `/api/health/live`
- `/api/health/ready`
- Typed environment schema
- Base logging interface
- Base error result type

### Required Tests

- Environment validation
- Health endpoint smoke test
- Build test
- Server-only import boundary test

### Exit Gate

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

all pass.

### Explicit Non-Goals

- No Product routes
- No database schema
- No auth provider
- No component library expansion

---

## 12. M02 — Local Infrastructure

### Goal

Create production-like local dependencies before Product persistence begins.

### Prerequisites

- M01 Approved

### Implementation Scope

Docker Compose services:

- PostgreSQL
- MinIO
- MinIO bucket initialization
- Mailpit
- ClamAV
- Optional local database admin tool, disabled by default

Create:

- Local service health checks
- Named volumes
- Private local network
- Development environment template
- Storage bucket bootstrap
- ClamAV signature persistence
- Mailpit developer instructions

### Required Artifacts

```text
compose.yaml
docker/
├── minio/
├── clamav/
└── postgres/
.env.example
```

### Required Tests

- PostgreSQL connection
- MinIO PUT and GET smoke
- Mailpit SMTP smoke
- ClamAV clean-file scan
- ClamAV known test-signature rejection
- Service restart persistence

### Exit Gate

A new developer can start all dependencies with one documented command.

### Explicit Non-Goals

- No Railway deployment
- No R2
- No Resend
- No Product uploads

---

## 13. M03 — CI and Test Harness

### Goal

Make quality checks automatic before domain implementation begins.

### Prerequisites

- M02 Approved

### Implementation Scope

Configure:

- Vitest
- React Testing Library
- Disposable PostgreSQL integration-test database
- Playwright
- Axe Playwright
- CI workflow
- Test fixtures
- Test Clock
- Database reset helper
- Worker processor test harness
- Bundle reporting
- Migration validation job

### Required CI Jobs

```text
static
database
integration
build
e2e-smoke
accessibility-smoke
bundle-budget
```

### Required Artifacts

- CI configuration
- Test database helper
- Authentication test stub
- Fixed Clock helper
- Screenshot directory convention
- Test data factory convention

### Required Tests

- Unit sample
- Database integration sample
- Browser smoke sample
- Axe smoke sample
- Worker sample
- Bundle report generation

### Exit Gate

A deliberately failing check blocks CI.

### Explicit Non-Goals

- No full workflow E2E
- No visual baseline before real P0 Screens

---

# Part II — Database, Identity, and Authorization

## 14. M04 — Database and Async Foundation

### Goal

Establish migration discipline, transaction utilities, idempotency, the transactional Outbox, and the Worker runtime before Product commands begin.

### Prerequisites

- M03 Approved

### Implementation Scope

Configure:

- Drizzle
- PostgreSQL connection pooling
- Migration generation and execution
- Transaction helper
- Row-version helper
- UUID convention
- UTC timestamp convention
- Database error normalization
- Migration release command
- Idempotency-record service
- Transactional Outbox repository
- Worker polling and claim runtime
- Processor registry
- Graceful shutdown
- Retry metadata foundation

### Initial Migrations

```text
0001_extensions_and_system.sql
0002_identity_foundation.sql
0003_outbox_and_idempotency.sql
```

### `0001_extensions_and_system.sql`

Creates:

- Required PostgreSQL extensions
- Migration metadata
- Common helper functions only when justified
- No Product domain tables

Expected extension:

```text
pg_trgm
```

### `0002_identity_foundation.sql`

Creates Better Auth-compatible identity foundation:

- Users
- Sessions
- Verification records
- Provider-account compatibility table when required

### `0003_outbox_and_idempotency.sql`

Creates:

- `outbox_events`
- `idempotency_records`
- Worker claim and retry indexes
- Generic payload and aggregate references
- Processing, failure, and lease fields

The Outbox exists before any Product command or invitation creates asynchronous intent.

The Worker runtime exists here, but Product-specific processors are introduced by later Milestones.

### Required Tests

- Empty database migration
- Migration replay
- Transaction rollback
- UUID creation
- UTC persistence
- Database error mapping
- Outbox insert commits with domain transaction
- Failed transaction leaves no Outbox Event
- Idempotency-key replay
- Conflicting idempotency fingerprint
- Worker claim with `FOR UPDATE SKIP LOCKED`
- Expired Worker lease recovery

### Exit Gate

G1 passes.

The base Outbox and Worker runtime pass the foundational portion of G5.

### Explicit Non-Goals

- No Workspace or Project tables
- No Product email templates
- No file processors
- No reminder scheduler
- No seed narrative
- No RLS

---

## 15. Approved Migration Sequence

The Roadmap uses 19 planned migrations.

The sequence is fixed by domain dependency.

| Migration                                    | Introduced In | Scope                                                      |
| -------------------------------------------- | ------------- | ---------------------------------------------------------- |
| `0001_extensions_and_system.sql`             | M04           | Extensions and migration foundation                        |
| `0002_identity_foundation.sql`               | M04           | Users, sessions, verifications                             |
| `0003_outbox_and_idempotency.sql`            | M04           | Transactional Outbox and command idempotency               |
| `0004_workspaces_and_members.sql`            | M06           | Workspaces, branding, Workspace members                    |
| `0005_clients_and_invitations.sql`           | M06           | Client Organizations, Client Members, invitations          |
| `0006_projects_memberships_and_activity.sql` | M09           | Projects, Project Members, immutable Activity              |
| `0007_milestones.sql`                        | M10           | Milestones, publication boundary, active constraint, registered-event Outbox claim index |
| `0008_client_actions_and_blocking.sql`       | M11           | Actions, submissions, reopen history, blocking obligations |
| `0009_assets_and_uploads.sql`                | M12           | Assets, variants, upload intents                           |
| `0010_deliverables_and_versions.sql`         | M13           | Deliverables and Versions                                  |
| `0011_comments_and_threads.sql`              | M14           | Threads, Comments, state history                           |
| `0012_review_decisions_and_revisions.sql`    | M15           | Decisions and Revision Requests                            |
| `0013_change_requests.sql`                   | M16           | Change Requests, Decisions, Applications                   |
| `0014_handoff.sql`                           | M17           | Handoffs, Items, Acknowledgments                           |
| `0015_operational_read_models.sql`           | M18           | Health, blocked-time, priority, and dashboard read models  |
| `0016_jobs_notifications_and_webhooks.sql`   | M19           | Scheduled Jobs, deliveries, and webhook receipts           |
| `0017_analytics_and_search.sql`              | M20           | Product Events and search indexes                          |
| `0018_demo_instances.sql`                    | M21           | Demo instances and Demo identity mapping                   |
| `0019_performance_indexes.sql`               | M22           | Measured P0 query indexes                                  |

### Migration Timing Decisions

- Outbox and idempotency exist in M04.
- Activity persistence begins with Project persistence in M09.
- Blocking obligations begin with Client Actions in M11.
- M18 introduces derived operational views, not delayed source records.
- No migration number is reserved for speculative launch hardening.
- Any measured Production correction after `0019` uses the next sequential migration.

### Migration Rules

- No migration may depend on seed data.
- No migration silently rewrites published history.
- Partial unique indexes must be integration-tested.
- Backfills must be resumable.
- Production schema is never changed with application startup auto-sync.
- Migration filenames remain stable after merge.
- An already-deployed migration is never edited.
- Launch hardening uses measured migrations only, never a predeclared catch-all migration.

---

## 16. M05 — Authentication Foundation

### Goal

Provide real passwordless identity and secure session handling.

### Prerequisites

- M04 Approved

### Implementation Scope

Integrate Better Auth with:

- Email Magic Link
- Database-backed opaque sessions
- 15-minute single-use links
- 14-day rolling session
- 30-day absolute session
- Secure production cookie configuration
- Intended-destination preservation
- Account disable and session revoke
- Database-backed request rate limiting

Implement Screens:

- SH-01 Access Entry
- SH-03 Account and Product Context, minimal identity state
- SH-05 link failure foundation

### Provider Behavior

Development:

- Mailpit

Production adapter:

- Resend interface, not yet live

### Required Tests

- Request Magic Link
- Token hash storage
- Token expiry
- Single use
- Wrong email
- Session creation
- Session rotation
- Rolling expiry
- Absolute expiry
- Account disable
- Redirect preservation
- Rate limit

### Exit Gate

A real user can authenticate locally without a password.

### Explicit Non-Goals

- No Workspace access
- No Project access
- No invitation acceptance
- No Demo bypass

---

## 17. M06 — Invitations and Membership Bootstrap

### Goal

Connect authenticated identity to Workspace and Client membership.

### Prerequisites

- M05 Approved

### Implementation Scope

Apply:

```text
0004_workspaces_and_members.sql
0005_clients_and_invitations.sql
```

Implement:

- Workspace creation service for controlled setup and tests
- Workspace Member roles
- Client Organization
- Client Member
- Invitation records
- Seven-day invitation expiry
- Resend invitation
- Revoke invitation
- Invitation acceptance transaction
- Wrong-account recovery
- Historical identity snapshots foundation

Implement Screens:

- SH-02 Invitation Acceptance
- SH-05 Invitation and Link Recovery
- AG-07 Workspace Settings — Agency Members, initial version
- AG-03 Client Organizations, initial collection
- AG-04 Client Organization Detail, initial version

### Required Tests

- Agency invitation
- Client invitation
- Expiry
- Revocation
- Resend invalidates old token
- Matching email requirement
- Duplicate acceptance
- Existing user acceptance
- New user acceptance
- Membership status
- Immediate revoked-access effect

### Exit Gate

Identity can enter one valid Workspace or Client context only through authoritative membership.

### Explicit Non-Goals

- No Project membership
- No binding Client Approver authority
- No public Client Portal

---

## 18. M07 — Tenant Isolation and Authorization

### Goal

Make every protected route and command policy-driven before Product domain work expands.

### Prerequisites

- M06 Approved

### Implementation Scope

Create:

- `ActorContext`
- Workspace authorization policies
- Project policy interface
- Capability result type
- Authorized repository conventions
- Agency and Client projection rules
- Safe `notFound` versus Access Denied behavior
- Cross-tenant test fixture
- Removed-user behavior
- Authorization logging without sensitive content

Initial policy functions:

```text
canViewAgencyDelivery
canManageWorkspace
canManageAgencyMembers
canCreateClientOrganization
canViewClientOrganization
canCreateProject
canViewProject
```

Implement:

- SH-04 Access Denied
- Protected Agency layout
- Protected Client layout placeholder
- Role-based landing resolver

### Required Tests

Matrix for:

- Agency Owner
- Delivery Manager
- Agency Member
- Client user
- User from another Workspace
- Removed user
- Unauthenticated user

### Exit Gate

G2 passes.

No protected route may use ad hoc role comparisons outside policy modules.

### Explicit Non-Goals

- No domain-specific publication permissions yet
- No RLS
- No browser authorization boundary

---

# Part III — Visual Foundation and Core Product

## 19. M08 — Visual Foundation and Product Shells

### Goal

Establish the approved visual language and stable Agency and Client navigation.

### Prerequisites

- M07 Approved

### Implementation Scope

Create tokens for:

- Neutral palette
- StudioFlow indigo
- Sableframe evergreen
- Semantic colors
- Typography
- Spacing
- Radius
- Border
- Elevation
- Focus
- Motion duration

Create shared primitives:

- Button
- Link
- Input
- Textarea
- Select
- Checkbox
- Dialog
- Drawer
- Sheet
- Tabs
- Badge
- Status
- Avatar
- Table
- Empty State
- Error State
- Skeleton
- Breadcrumb
- Page Header
- Section Header
- Toast / live announcement

Create:

- Agency Shell
- Client Shell
- Agency Sidebar
- Client Top Navigation
- Project horizontal tab shell
- Responsive Project section switcher
- Powered by StudioFlow footer attribution
- Search overlay shell without data

### Required Screens

- Agency layout
- Client layout
- Account utility
- Basic unauthorized and not-found surfaces

### Required Tests

- Token contrast
- Keyboard navigation
- Dialog focus
- Sheet focus
- Mobile shell
- Top navigation
- Agency sidebar
- Reduced motion
- Visual smoke

### Exit Gate

Shells are real, responsive, and accessible before domain Screens populate them.

### Explicit Non-Goals

- No final dashboard
- No Project data
- No P0 visual polish
- No broad component catalogue beyond approved Screen needs

### M08 Approved Handoff

M08 completed the owner-approved **Obsidian Operations** visual foundation and product shells. M09 and later domain Milestones extend these shells; they do not rebuild the visual architecture as part of ordinary domain work.

Durable handoff rules:

- Agency desktop keeps the Product Rail → Context Navigation → Workspace silhouette.
- Agency mobile keeps the top-context / scrolling-content / bottom-navigation shell.
- Agency navigation and command actions remain capability-projected from server authorization. An unavailable destination is absent from navigation but remains fail-closed by direct URL.
- Agency Member lands on Projects and does not gain Delivery Overview access merely because Project persistence now exists. Product Specification and Screen Inventory continue to govern that boundary.
- Client Portal keeps its calmer Obsidian shell and top navigation on desktop and mobile.
- Existing M08 empty collection anatomy is replaced with real read-model data incrementally; domain Milestones should inject truth rather than reintroduce placeholder copy or parallel shell variants.
- The M08 Access, Invitation, Recovery, Access Denied, Not Found, Account, and shell accessibility/responsive contracts remain regression gates.

---

## 20. M09 — Workspace, Client, Project, and Activity Core

### Goal

Create the authoritative Project container, Project-scoped membership, immutable Activity foundation, and the first deterministic development seed.

### Prerequisites

- M08 Approved

### Implementation Scope

Apply:

```text
0006_projects_memberships_and_activity.sql
```

Implement:

- Draft Project creation
- Project identity
- Client Organization relation
- Delivery Manager relation
- Client Approver relation
- Project Members
- Project lifecycle base
- Row version
- Hard-delete eligibility guard
- Atomic required-role references
- Project-safe Agency and Client queries
- Project route authorization
- Immutable Project Activity Events
- Actor identity snapshots
- Client-visible and Agency-only visibility
- Transaction helper that writes state, Activity, Outbox, and idempotency result together
- Private deterministic development-seed framework
- Seed versioning and validation hooks

Initial commands:

```text
createDraftProject
updateDraftProjectIdentity
assignProjectMember
removeProjectMember
reassignDeliveryManager
reassignClientApprover
deleteEligibleDraftProject
```

Implement Screens:

- AG-01 Delivery Overview, first real Project collection and lifecycle summary for Agency Owner and Delivery Manager
- AG-02 Projects, Draft-capable and assignment-aware for Agency Owner, Delivery Manager, and Agency Member
- AG-08 Project Setup, first step
- AG-26 Project Settings — General
- AG-27 Project Settings — People & Access
- AG-28 Project Settings — Lifecycle, Draft subset

### Development Seed v1

Create a private development seed containing:

- Sableframe Workspace
- Agency identities
- Kestrelon Client Organization
- Project authority assignments
- Kestrelon Draft Project shell
- Supporting Project shells as needed for collection testing

The seed evolves with every later domain Milestone.

It is not yet the public per-visitor Demo.

### Required Tests

- Create Draft
- Owner access
- Assigned Delivery Manager access
- Assigned Agency Member Project access while Delivery Overview remains denied
- Client has no Draft access
- Required-role reassignment
- Cross-tenant membership
- Delete eligibility
- Removed member
- Client DTO exclusion
- Project-created Activity
- Membership Activity visibility
- State and Activity transaction rollback together
- Deterministic seed replay
- Seed version validation

### Exit Gate

A Draft Project can be created, resumed, authorized, audited, seeded, and safely deleted.

### Explicit Non-Goals

- No Project publication
- No Milestones
- No Client Project detail/domain population; the existing M08 `/portal/projects` collection shell remains presentation-only in M09
- No Project Health
- No public Demo clone

---

## 21. M10 — Project Setup and Milestones

### Goal

Publish a valid Project into Onboarding and manage one Active Milestone with transactionally persisted Activity.

### Prerequisites

- M09 Approved

### Implementation Scope

Apply:

```text
0007_milestones.sql
```

Implement:

- Milestone Draft as an agency-only publication state, separate from Milestone lifecycle
- Explicit `published_at` visibility boundary for Milestones
- Position ordering
- One Active Milestone partial unique index
- Project publication validation
- Publish into Onboarding
- Atomic publication of the current Draft Milestone plan
- First Milestone activation
- Independent publication of later Milestone Drafts
- Milestone completion criteria interface
- Milestone cancel
- Onboarding-to-Active transition
- Transactional Activity for publication and lifecycle changes
- Outbox intent for Project-publication communication
- Worker claim filtering plus a registered-event ready index so domain Outbox intents without a registered processor remain pending for M19 without starving current processors
- Kestrelon Milestone sequence in development seed v2

Commands:

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

Implement Screens:

- AG-08 Project Setup, complete workflow
- AG-10 Delivery Plan — Milestones
- AG-11 Milestone Detail
- CL-02 Client Projects, real published collection population required to enter Project detail
- CL-03 Client Project Overview, structural Onboarding state
- CL-04 Client Milestone Detail, published-only
- AG-09 Agency Project Overview, structural base
- AG-01 Delivery Overview, Active Milestone context

### Required Tests

- Publish requirements
- Exactly one Delivery Manager
- Exactly one Client Approver
- At least one Milestone
- Semantic no-op Milestone update does not advance row versions or Activity
- Later Milestone Draft remains agency-only until manager publication
- First Milestone activation
- Second Active Milestone blocked
- Client cannot view Draft
- Client can view Onboarding
- Override reason required
- Lifecycle read-only guard foundation
- Project publication Activity
- Milestone lifecycle Activity
- Publication and Outbox atomicity
- Unregistered Product Outbox intent remains pending and unclaimed until its processor exists, then becomes claimable after processor registration
- Seed Milestone order and dates

### Exit Gate

A Project can move from Draft to Onboarding with one valid Active Milestone and permanent Activity history.

### Explicit Non-Goals

- No Client Actions
- No Deliverables
- No Project Health
- No Project-publication email processor before M19
- No final P0 polish

---

## 22. M11 — Client Actions and Blocking Obligations

### Goal

Implement client-owned responsibilities and persist client-blocking intervals from the first actionable obligation.

### Prerequisites

- M10 Approved

### Implementation Scope

Apply:

```text
0008_client_actions_and_blocking.sql
```

Implement:

- Text response
- File upload metadata placeholder
- Confirmation
- One responsible Client Member
- Due date
- Blocks Progress
- Draft and publication
- Completion
- Cancellation
- Reopen
- Submission history
- Assignee and due-date change
- Manual reminder command intent
- Assigned-only completion
- Generic Blocking Obligation records
- Open and close obligation transaction integration
- New interval on Action reopen
- Action Activity and Outbox intent
- Kestrelon Client Actions in the development seed

Commands:

```text
createClientActionDraft
updateClientActionDraft
publishClientAction
completeClientAction
cancelClientAction
reopenClientAction
reassignClientAction
changeClientActionDueDate
changeClientActionBlockingStatus
requestManualReminder
```

Implement Screens:

- AG-12 Delivery Plan — Client Actions
- AG-13 Agency Client Action Detail
- AG-14 Client Action Composer
- CL-01 Client Action Center, real Client Action subset
- CL-05 Client Action Detail
- AG-01 first Client Action attention items
- AG-09 and CL-03 Action summaries

### Required Tests

- Type-specific validation
- Assigned-only completion
- View-only other client member
- Completion history
- Reopen history
- Prior completed interval preserved
- Assignee change
- Due-date change
- Blocking flag change
- Obligation opens with publication
- Obligation closes with completion or cancellation
- Reopen creates a new interval
- State, Activity, obligation, and Outbox atomicity
- Read-only Project guard
- Agency Member cannot publish
- Client cannot publish
- Seed ACT-004 history

### Exit Gate

ACT-001, ACT-003, and ACT-004 narrative behavior can execute against real state with traceable blocking intervals.

### Explicit Non-Goals

- File bytes
- Automated email delivery
- Final overlapping-interval union query
- Final Project Health
- Final Action Center composite priority

---

## 23. M12 — File and Asset Pipeline

### Goal

Provide private, authorized, scanned, and processed files for later Product workflows using the Worker runtime established in M04.

### Prerequisites

- M11 Approved

### Implementation Scope

Apply:

```text
0009_assets_and_uploads.sql
```

Implement:

- Asset records
- Upload intents
- Presigned MinIO PUT
- Finalize endpoint
- HEAD verification
- MIME detection
- Size validation
- ClamAV scan
- Image metadata
- Image orientation normalization
- Derivative generation
- Asset READY guard
- Authorized 60-second GET
- Safe `Content-Disposition`
- Failed upload recovery
- Upload progress UI primitive
- Asset-processing Outbox events

Extend the existing Worker runtime with:

- `scan_asset`
- `inspect_asset`
- `generate_image_variants`
- Processor-specific concurrency
- Retry and dead-letter behavior
- Processing-state observability

### Required Tests

- Authorized upload intent
- Unauthorized upload intent
- Wrong Project
- Oversize
- Rejected type
- MIME mismatch
- Clean scan
- Malware rejection
- Image orientation
- Derivatives
- Authorized download
- Expired URL
- Removed access
- Failed finalize
- Retry
- Duplicate processing delivery
- Finalization and Outbox atomicity

### Exit Gate

A permitted user can upload a safe file and retrieve it only through authorization.

G5 passes for file processors.

### Explicit Non-Goals

- No Deliverable publication
- No R2 production connection
- No arbitrary HTML or SVG
- No Product notification templates

---

## 24. M13 — Deliverables and Versions

### Goal

Create persistent Deliverables and immutable published Versions.

### Prerequisites

- M12 Approved

### Implementation Scope

Apply:

```text
0010_deliverables_and_versions.sql
```

Implement:

- Deliverable Draft
- Version Draft
- Image, file, and external-link types
- Asset READY publication guard
- Manual external-link confirmation
- Review due date
- Version number
- Current Version
- Supersession
- Withdrawal
- Historical Version query
- Deliverable derived state foundation

Commands:

```text
createDeliverableDraft
updateDeliverableDraft
createVersionDraft
attachAssetToVersionDraft
setExternalLink
confirmExternalLinkPreview
publishDeliverableVersion
withdrawDeliverableVersion
```

Implement Screens:

- AG-15 Agency Deliverables
- AG-16 Agency Deliverable Detail
- AG-17 Deliverable Version Composer
- AG-19 Agency File or Link Version Detail
- CL-06 Client Deliverables
- CL-07 Client Deliverable Detail
- CL-09 Client File or Link Review

### Required Tests

- Draft visibility
- Publish authority
- Review due date required
- Asset READY required
- Version numbering
- Current Version
- Supersession
- Withdrawal
- Historical access
- External-link disclosure
- Client cannot see Version Draft
- File download authorization

### Exit Gate

DEL-001, DEL-002, DEL-004, and DEL-005 can exist as real Versioned Deliverables.

### Explicit Non-Goals

- No Comments
- No Review Decision
- No image Pin interaction
- No Revision Request

---

## 25. M14 — Comments and Image Review

### Goal

Implement image review, Pins, shared discussion, and Agency-only notes.

### Prerequisites

- M13 Approved

### Implementation Scope

Apply:

```text
0011_comments_and_threads.sql
```

Implement:

- General threads
- Pin threads
- Normalized coordinates
- Stable pin numbering
- Shared visibility
- Agency-only visibility
- Immutable submitted Comments
- Replies as corrections
- Resolve
- Reopen
- Comment State Events
- Local unsent draft persistence
- Current versus historical Version rules
- Canvas Dark, Light, and Checker modes

Commands:

```text
createCommentThread
replyToCommentThread
resolveCommentThread
reopenCommentThread
```

Implement Screens:

- AG-18 Agency Image Review Workspace
- CL-08 Client Image Review Workspace
- Comment panel in AG-19 and CL-09
- Accessible Pin list
- Mobile Canvas / Comments / Details modes

### Required Tests

- Coordinate conversion
- Letterbox rejection
- Zoom stability
- Shared visibility
- Internal visibility
- Client cannot access Agency note
- Resolve authority
- Reopen rule
- Approved Deliverable blocks reopen
- Historical Version read-only
- Keyboard Pins
- Screen-reader Pin labels
- Mobile mode preservation

### Exit Gate

DEL-003-V1 can show three shared Pins and one Agency-only note with real behavior.

### Explicit Non-Goals

- No Review Decision
- No Comment edit
- No PDF annotations
- No automatic image analysis

---

## 26. M15 — Review Decisions and Revision Requests

### Goal

Implement immutable Client Approver Decisions and agency Revision classification.

### Prerequisites

- M14 Approved

### Implementation Scope

Apply:

```text
0012_review_decisions_and_revisions.sql
```

Implement:

- One Review Decision per Version
- Approved
- Revision Requested
- Approver identity snapshot
- Unresolved Comment count snapshot
- Revision summary
- Revision Request creation
- In Scope
- Needs Clarification
- Potential Scope Change
- Clarification question
- Clarification response
- Replacement Version resolution
- Approved Deliverable reopen
- Binding command idempotency
- Row locking
- Duplicate Decision conflict
- Stale Version conflict

Commands:

```text
recordReviewDecision
classifyRevisionRequest
requestRevisionClarification
respondToRevisionClarification
reopenApprovedDeliverable
resolveInScopeRevisionOnPublication
```

Implement Screens:

- AG-20 Agency Revision Request Detail
- CL-10 Client Revision Request Detail
- INT-08 Approve Version
- INT-09 Request Revision
- INT-10 Classify Revision
- INT-11 Clarification
- Decision history in Review Workspaces
- Awaiting Decision cards in CL-01

### Required Tests

- Only Client Approver decides
- Contributor cannot decide
- Current Version only
- Duplicate Decision
- Concurrent Decision
- Approval with open Comments warning and snapshot
- Revision summary required
- Classification permissions
- Clarification obligation interface
- Replacement publication resolves In-Scope Revision
- Original approval preserved on reopen
- Client projection excludes internal classification note

### Exit Gate

RR-001 and Review Decisions DEC-003 / DEC-004 can execute end to end.

### Explicit Non-Goals

- No Change Request persistence
- No email

---

# Part V — Scope Control, Handoff, and Operational Truth

## 27. M16 — Change Requests

### Goal

Implement explicit scope, timeline, and cost Decisions.

### Prerequisites

- M15 Approved

### Implementation Scope

Apply:

```text
0013_change_requests.sql
```

Implement:

- Draft
- Send
- Decision deadline
- Optional monetary impact
- No-cost impact
- Accept
- Reject
- Withdraw
- Late Decision
- Applied
- Target-date application
- Revision linkage
- Immutable Decision
- Immutable Application
- Idempotency and locking

Commands:

```text
createChangeRequestDraft
updateChangeRequestDraft
sendChangeRequest
withdrawChangeRequest
recordChangeRequestDecision
applyChangeRequest
```

Implement Screens:

- AG-21 Changes
- AG-22 Change Request Composer
- AG-23 Agency Change Request Detail
- CL-11 Client Change Request Detail
- INT-12 through INT-16

### Required Tests

- Agency authority
- Client Approver authority
- Contributor view-only
- Sent only decision
- Decision after withdrawal blocked
- Duplicate Decision
- Accepted separate from Applied
- Currency minor units
- No-cost impact
- Late decision
- Project date application
- Revision state update
- Client-safe DTO

### Exit Gate

CR-001 can be created, accepted, and applied against real Project state.

### Explicit Non-Goals

- No invoice
- No payment
- No legal signature
- No structured cost breakdown

---

## 28. M17 — Handoff and Project Completion

### Goal

Implement the final Project package, acknowledgment, and completion.

### Prerequisites

- M16 Approved

### Implementation Scope

Apply:

```text
0014_handoff.sql
```

Implement:

- One Handoff per Project
- Draft and Published state
- File, external link, and documentation Items
- Required and optional Items
- Embedded Item editor
- Order
- Publication readiness
- Client preview
- Acknowledgment due date
- One Project-level acknowledgment
- Completion
- Completion without acknowledgment
- Read-only transition
- Item withdrawal and replacement

Commands:

```text
createHandoff
updateHandoff
createHandoffItem
updateHandoffItem
reorderHandoffItems
publishHandoffItem
withdrawHandoffItem
publishHandoff
acknowledgeHandoff
completeProject
completeProjectWithoutAcknowledgment
```

Implement Screens:

- AG-25 Agency Handoff Workspace
- CL-13 Client Handoff
- INT-17 through INT-20
- Handoff state in AG-09, CL-01, and CL-03
- Completed read-only Project variants

### Required Tests

- Required Items Published
- Only Client Approver acknowledges
- Contributor view-only
- Duplicate acknowledgment
- Completion requirements
- Override reason
- Historical distinction
- Read-only after completion
- Withdrawn Item replacement
- Authorized file access
- Documentation sanitization

### Exit Gate

HO-KES-001 can be published and acknowledged through real Client state.

### Explicit Non-Goals

- No legal signature
- No credential storage
- No Item-level acknowledgment

---

## 29. M18 — Operational Read Models and Health

### Goal

Complete the authoritative operational projections used by Agency and Client dashboards without delaying Activity or Blocking persistence.

### Prerequisites

- M17 Approved

### Implementation Scope

Apply:

```text
0015_operational_read_models.sql
```

Activity has existed since M09.

Blocking Obligations have existed since M11.

This Milestone implements:

- Client-Blocked Time union query
- Project Health query
- Overdue precedence
- Waiting on Client
- At Risk
- On Track
- Agency Delivery Overview composite read model
- Client Action Center composite priority read model
- Agency Project Overview final read model
- Client Project Overview final read model
- Activity pagination
- Activity source links
- Read-model query instrumentation
- Complete private Kestrelon narrative seed validation
- Supporting Project metric validation

Incremental read projections introduced in M09–M17 are consolidated here into final authoritative Screen queries.

No historical command event is backfilled from a temporary collector.

### Required Screen Completion

- AG-01 Delivery Overview, final real data
- AG-09 Agency Project Overview, final real data
- CL-01 Client Action Center, final authority-aware priority
- CL-03 Client Project Overview, final real data
- AG-24 Agency Project Activity
- CL-12 Client Project Activity

### Required Tests

- Event visibility
- No page-view Activity
- Historical identity
- Obligation open and close
- Overlapping interval union
- Reopened Action interval
- Health precedence
- Three-day At Risk threshold
- Draft and terminal no health
- Action Center ordering
- Agency access scope
- Client internal-data exclusion
- Cursor pagination
- Exact canonical Dashboard metrics
- Full Kestrelon narrative consistency

### Exit Gate

All Dashboard counts, priorities, blocked durations, and Project statuses in the Approved Demo Narrative are derivable from authoritative state.

The complete private development seed now represents the full canonical narrative.

### Explicit Non-Goals

- No email delivery
- No analytics trend dashboard
- No manual Health override
- No public Demo cloning yet

---

## 30. M19 — Product Notifications and Worker Expansion

### Goal

Add Product email, reminders, webhooks, and complete asynchronous delivery using the Outbox and Worker foundation established in M04.

### Prerequisites

- M18 Approved

### Implementation Scope

Apply:

```text
0016_jobs_notifications_and_webhooks.sql
```

Implement:

- Scheduled Job table
- Notification Delivery table
- Webhook receipt table
- Product email processor
- Worker retry schedule
- Lock recovery
- Dead-letter visibility
- Resend adapter
- Mailpit adapter
- Email templates
- Provider webhook
- Fixed due reminders
- One manual reminder
- Delivery failure state
- Wiring of accumulated domain Outbox event types from M06–M18
- Activation of previously pending Product Outbox intents by registering their processors; processor registration makes those event types claim-eligible without rewriting historical rows
- Historical payload-version compatibility for accumulated pending intents
- Current-access recipient resolution for pre-M19 Product intents; persisted domain payload identifiers do not bypass access revalidation at delivery time
- Notification operational queries

Pre-M19 Worker rule:

- The Worker claims only Outbox event types registered in the running processor registry.
- Domain intents introduced before their Product notification processor exists remain pending with zero delivery attempts; they are not marked failed merely because M19 has not been implemented yet.
- Events already processed by earlier foundation processors, including authentication and invitation delivery, are never replayed simply because M19 adds more processors.

Required email events:

- Invitations
- Project publication
- Client Action assignment
- Reminder
- Deliverable ready
- Shared Comment or reply
- Approval
- Revision
- Clarification
- Change Request
- Handoff
- Project completion

### Required Tests

- Existing Outbox Event reaches correct processor
- Failed domain transaction creates no Outbox
- Claim concurrency
- Duplicate processor delivery
- Retry
- Dead letter
- Provider idempotency
- Webhook dedupe
- Reminder scheduling
- Reminder cancellation
- Manual reminder uniqueness
- Access removed before send
- Due date changed before send
- Email failure does not roll back state
- Historical Outbox payload compatibility
- Pending pre-M19 domain intent becomes claimable only after the matching processor is registered
- Already processed foundation events are not redelivered when M19 expands the registry

### Exit Gate

G5 passes for all required Product notification and reminder processors.

### Explicit Non-Goals

- No Notification Center
- No custom schedules
- No SMS
- No Slack
- No push
- No Demo suppression until M21

---

## 31. M20 — Search, Settings, and Recovery

### Goal

Complete supporting Product surfaces after the critical workflow is stable.

### Prerequisites

- M19 Approved

### Implementation Scope

Apply:

```text
0017_analytics_and_search.sql
```

Implement:

- `pg_trgm` search indexes
- Agency command-style search overlay
- Workspace Settings — General
- Workspace Settings — Branding
- Agency Members completion
- Client Organizations completion
- Project Settings completion
- Account completion
- Invitation recovery completion
- Access Denied completion
- Archived state
- Cancelled state
- Stale Version recovery
- Missing authority recovery
- Product Analytics Event persistence
- Demo-event tagging interface

Complete Screens:

- AG-03 through AG-07
- AG-26 through AG-28
- SH-03 through SH-05
- Search overlay
- P2 and P3 recovery variants

### Required Tests

- Search scope by role
- Cross-tenant search
- No Client search
- Branding contrast adjustment
- Workspace Owner only
- Cancelled Client historical access
- Archived removal from active views
- Stale Version route to current
- Missing Approver warning
- Analytics payload privacy
- No Comment body in analytics

### Exit Gate

All supporting navigation and recovery paths are real.

### Explicit Non-Goals

- No Deliverable search
- No persistent search-results URL
- No advanced analytics UI
- No Project archive restoration

---

# Part VII — Demo, P0 Hardening, and Complete MVP

## 32. M21 — Public Demo Clone and Reset

### Goal

Expose the already-complete deterministic development seed as an isolated, interactive public Demo.

### Prerequisites

- M20 Approved
- The complete private Kestrelon narrative seed passed validation in M18.
- M19 Product notifications are stable.

### Implementation Scope

Apply:

```text
0018_demo_instances.sql
```

Implement:

- Per-visitor Workspace clone
- Demo-instance ownership
- Agency and Client Demo identities
- Agency / Client role switching
- Generation tracking
- Reset
- Two-hour expiry
- Cleanup every ten minutes
- Active-instance ceiling 25
- One instance per browser
- Three starts per IP per hour
- Demo email suppression
- Immutable shared Demo assets
- Demo-event tagging
- Capacity and cleanup observability

The canonical seed is not first created here.

It has evolved incrementally since M09 and is already complete.

This Milestone owns only public isolation, cloning, role switching, reset, suppression, capacity, and cleanup.

### Seed Assertions

```text
Open Projects = 4
Waiting on Client = 2
At Risk = 1
On Track = 1
Overdue Client Actions = 1
Unclassified Revisions = 1
Pending Handoff Acknowledgments = 1
```

### Required Tests

- Seed validation before clone
- Clone isolation
- Reset
- Role switching
- Fixed time
- Metrics
- Cleanup
- Capacity ceiling
- Rate limit
- No real email
- Template asset preservation
- Generation mismatch refresh
- Two visitors cannot mutate each other’s data

### Exit Gate

G6 passes.

The entire canonical walkthrough can be executed without shared mutable state.

### Explicit Non-Goals

- No anonymous writes outside Demo instance
- No lazy supporting Project seed
- No real invitation sending
- No second independent Demo application

---

## 33. P0 Signature Screen Order

P0 implementation begins structurally in earlier Milestones.

Final Signature hardening occurs in this exact order.

### 33.1 P0-01 — AG-01 Delivery Overview

Reason:

- Establishes Product category
- Validates Project Health
- Validates exception prioritization
- Exercises supporting Projects

Required before completion:

- Exact Demo counts
- Priority order
- Responsive Agency layout
- Loading, clear, and partial-error states
- Performance query review

### 33.2 P0-02 — AG-09 Agency Project Overview

Reason:

- Central Project operational hub
- Validates Handoff and blocking truth

Required before completion:

- Kestrelon Handoff state
- Waiting on Client reason
- Active Milestone
- Role and target date
- Primary action

### 33.3 P0-03 — CL-01 Client Action Center

Reason:

- Defines Client attention model
- Validates authority-aware priority

Required before completion:

- Dominant Handoff action
- Mobile-first composition
- All-caught-up state
- Contributor variant

### 33.4 P0-04 — CL-03 Client Project Overview

Reason:

- Defines Client confidence experience
- Connects Project narrative to action

### 33.5 P0-05 — AG-18 Agency Image Review Workspace

Reason:

- Most technically complex visual workspace
- Exercises assets, Pins, internal visibility, history

### 33.6 P0-06 — CL-08 Client Image Review Workspace

Reason:

- Exercises mobile modes
- Exercises Approver versus Contributor authority
- Validates internal-content exclusion

### 33.7 P0-07 — AG-20 Revision Request Detail

Reason:

- Demonstrates agency scope judgment

### 33.8 P0-08 — AG-23 Agency Change Request Detail

Reason:

- Demonstrates scope protection and application history

### 33.9 P0-09 — CL-11 Client Change Request Detail

Reason:

- Demonstrates clear mobile commercial Decision

### 33.10 P0-10 — AG-25 Agency Handoff Workspace

Reason:

- Demonstrates package completeness and preparation

### 33.11 P0-11 — CL-13 Client Handoff

Reason:

- Canonical final Client action
- Final portfolio conclusion

---

## 34. M22 — Staging and Staging and P0 Signature Hardening

### Goal

Validate the full product in a required Railway Staging environment and bring all 11 P0 Screens to portfolio quality against production-like services.

### Prerequisites

- M21 Approved

### Implementation Scope

Apply:

```text
0019_performance_indexes.sql
```

Only add indexes justified by measured P0 queries.

Provision the required Railway Staging environment:

- Staging Web
- Staging Worker
- Staging PostgreSQL
- Staging ClamAV
- Private networking
- Pre-deploy migration command
- Separate environment variables
- Separate R2 bucket or strictly isolated Staging prefix and credentials
- Resend test or Staging sender configuration
- Error-monitoring Staging environment
- Staging Demo capacity below Production ceiling

For every P0 Screen:

- Final visual hierarchy
- Real state
- Empty state
- Error state
- Read-only state
- Role variant
- Responsive behavior
- Accessibility
- Loading behavior
- Performance instrumentation
- Visual regression baseline
- Screenshot-ready Demo state

### Required Tests

- Fresh Staging migration
- Staging Worker and Web health
- Private ClamAV connectivity
- Staging R2 upload and download
- No Production email recipient
- P0 E2E walkthrough
- Axe
- Keyboard
- Mobile
- Visual regression
- Query count
- Bundle budget
- Server timing
- Cross-role visibility
- Demo reset stability
- Staging backup and restore smoke

### Exit Gate

Every P0 Screen passes G2, G3, G4, G5 when applicable, and G6 in Staging.

Staging is the source environment for P0 performance baselines and release-regression thresholds.

### Explicit Non-Goals

- No decorative redesign outside Approved Visual Direction
- No additional P0 Screens
- No new Dashboard metrics
- No Production traffic
- No shared Staging database with Production

---

## 35. M23 — Full MVP Screen Completion

### Goal

Complete all 46 Screens and 26 focused interactions.

### Prerequisites

- M22 Approved

### Implementation Scope

Complete:

- 25 P1 Core Screens
- 7 P2 Supporting Screens
- 3 P3 Admin or Recovery Screens
- All focused interactions
- All lifecycle variants
- Completed, Cancelled, and Archived read-only behavior
- Error and recovery coverage
- Tablet and mobile behavior
- Final copy consistency
- Final Activity source links
- Final direct-email destinations

### Completion Order

1. Remaining P1 workflow Screens
2. P1 focused interactions
3. P2 Settings and administration
4. P3 access and recovery
5. Historical and terminal variants
6. Final responsive pass
7. Final copy and accessibility pass

### Required Tests

- Full Screen inventory route smoke
- Full authorization matrix
- Complete end-to-end delivery loop
- File failure paths
- Concurrent binding actions
- All interaction dialogs
- Read-only lifecycle
- Direct deep links
- Mobile Client workflow
- Tablet Agency workflow

### Exit Gate

All approved Screens and interactions have real behavior.

No primary workflow is represented only by static mock data.

### Explicit Non-Goals

- No deferred Screen
- No hidden placeholder Route
- No disabled button standing in for missing permission behavior

---

# Part VIII — Production and Launch

## 36. M24 — Production Launch and Stabilization

### Goal

Promote the Staging-proven release to Production, verify recovery, and stabilize the public portfolio deployment.

### Prerequisites

- M23 Approved
- M22 Staging environment remains healthy.
- P0 baselines and release-regression thresholds are recorded.

### Schema Rule

No speculative `launch_hardening` migration is reserved.

If Production readiness reveals a measured schema or index need:

- Create the next sequential migration after `0019`
- Review it through G1
- Apply it to Staging first
- Re-run affected Gates
- Promote only after verification

The change must not introduce a new Product model.

### Implementation Scope

Configure Railway Production:

- Web
- Worker
- PostgreSQL
- ClamAV
- Pre-deploy migration command
- Private networking
- Health checks
- Environment variables
- Resource limits

Configure Production external services:

- Cloudflare R2 Production bucket
- Resend Production sending domain
- Error monitoring
- DNS
- HTTPS
- Provider webhook

### Launch Sequence

```text
Confirm Staging release candidate
   ↓
Build immutable image
   ↓
Provision Production infrastructure
   ↓
Configure Production secrets
   ↓
Verify private networking
   ↓
Run Production migrations
   ↓
Deploy Worker
   ↓
Deploy Web
   ↓
Validate Demo template assets
   ↓
Run Production smoke tests
   ↓
Run accessibility checks
   ↓
Create database backup
   ↓
Verify restore procedure
   ↓
Open public Demo
```

### Required Production Tests

- Authentication Magic Link
- Demo start
- Role switch
- Reset
- Agency walkthrough
- Client walkthrough
- File download
- Worker email suppression in Demo
- Real test email outside Demo
- ClamAV scan
- R2 upload and download
- Webhook verification
- Health checks
- Backup
- Restore smoke
- Rate limits
- Access denial
- Mobile Client experience
- Staging and Production data isolation

### Exit Gate

G7 passes.

The public Demo is stable, resettable, observable, and independently recoverable.

### Explicit Non-Goals

- No direct Production experimentation
- No shared Production and Staging database
- No deferred Product feature during launch

---

## 37. Domain Command Implementation Order

Commands must be introduced in this order:

```text
1. createDraftProject
2. updateDraftProjectIdentity
3. assignProjectMember
4. reassignDeliveryManager
5. reassignClientApprover
6. createMilestoneDraft
7. updateMilestoneDraft
8. reorderMilestones
9. publishProject
10. publishMilestone
11. activateMilestone
12. completeMilestone
13. completeMilestoneWithOverride
14. cancelMilestone
15. moveProjectToActive
16. createClientActionDraft
17. publishClientAction
18. completeClientAction
19. reopenClientAction
20. createUploadIntent
21. finalizeUpload
22. createDeliverableDraft
23. createVersionDraft
24. publishDeliverableVersion
25. createCommentThread
26. replyToCommentThread
27. resolveCommentThread
28. reopenCommentThread
29. recordReviewDecision
30. classifyRevisionRequest
31. requestRevisionClarification
32. respondToRevisionClarification
33. createChangeRequestDraft
34. sendChangeRequest
35. recordChangeRequestDecision
36. applyChangeRequest
37. createHandoff
38. publishHandoff
39. acknowledgeHandoff
40. completeProject
41. completeProjectWithoutAcknowledgment
42. cancelProject
43. archiveProject
```

A later command may depend on earlier infrastructure.

It may not be implemented as an unguarded direct update.

---

## 38. Screen Delivery Mapping

| Screen Group            | Domain Dependency              | Primary Milestone |
| ----------------------- | ------------------------------ | ----------------- |
| Shared access           | Authentication and invitations | M05–M07           |
| Agency shell            | Visual foundation              | M08               |
| Client shell            | Visual foundation              | M08               |
| Projects and Settings   | Project core                   | M09               |
| Milestones              | Delivery Plan                  | M10               |
| Client Actions          | Client Actions                 | M11               |
| File surfaces           | Asset pipeline                 | M12               |
| Deliverables            | Deliverables and Versions      | M13               |
| Review Workspaces       | Comments and image review      | M14               |
| Revision Screens        | Review Decisions               | M15               |
| Change Screens          | Change Requests                | M16               |
| Handoff Screens         | Handoff                        | M17               |
| Dashboards and Activity | Read models                    | M18               |
| Notification states     | Worker and email               | M19               |
| Search and recovery     | Supporting Product             | M20               |
| Canonical Demo          | Demo                           | M21               |
| Signature polish        | All core dependencies          | M22               |
| All remaining Screens   | Full domain                    | M23               |

---

## 39. P1 Screen Completion Order

After P0 structural implementation, P1 Screens are completed by workflow dependency.

### Wave 1 — Project Foundation

- AG-02 Projects
- AG-08 Project Setup
- AG-10 Delivery Plan — Milestones
- AG-11 Milestone Detail

### Wave 2 — Client Responsibility

- AG-12 Client Actions
- AG-13 Client Action Detail
- AG-14 Client Action Composer
- CL-04 Milestone Detail
- CL-05 Client Action Detail

### Wave 3 — Deliverable Management

- AG-15 Deliverables
- AG-16 Deliverable Detail
- AG-17 Version Composer
- AG-19 File or Link Review
- CL-06 Deliverables
- CL-07 Deliverable Detail
- CL-09 File or Link Review

### Wave 4 — Scope and History

- AG-21 Changes
- AG-22 Change Request Composer
- AG-24 Activity
- CL-10 Revision Request
- CL-12 Activity

### Wave 5 — Global Product

- CL-02 Client Projects
- SH-02 Invitation Acceptance
- AG-03 Client Organizations
- AG-04 Client Organization Detail

---

## 40. P2 and P3 Completion Order

### P2 Supporting

1. Workspace Settings — General
2. Workspace Settings — Branding
3. Workspace Settings — Agency Members
4. Project Settings — General
5. Project Settings — People & Access
6. Project Settings — Lifecycle
7. Account and Product Context

### P3 Admin and Recovery

1. Access Denied
2. Invitation and Link Recovery
3. Terminal and exceptional recovery variants

---

## 41. Focused Interaction Delivery Order

### Identity and Publication

- Publish Project
- Publish Client Action
- Send Manual Reminder
- Reopen Client Action
- Publish Deliverable Version
- Withdraw Published Version

### Review

- Resolve or Reopen Comment
- Approve Version
- Request Revision
- Classify Revision
- Send Clarification

### Scope

- Send Change Request
- Withdraw Change Request
- Accept
- Reject
- Apply

### Final Delivery

- Publish Handoff
- Acknowledge Handoff
- Complete Project
- Complete Without Acknowledgment

### Administration

- Reassign Client Approver
- Reassign Delivery Manager
- Cancel Project
- Archive Project
- Delete Eligible Draft
- Remove Project Access

Each interaction ships with the Milestone that owns its domain command.

---

## 42. Testing Gate by Milestone

| Milestone | Minimum Test Gate                            |
| --------- | -------------------------------------------- |
| M00–M01   | Static and build                             |
| M02       | Infrastructure smoke                         |
| M03       | CI self-test                                 |
| M04       | Migration integration                        |
| M05       | Authentication integration and browser smoke |
| M06       | Invitation integration                       |
| M07       | Authorization matrix                         |
| M08       | Component accessibility and responsive smoke |
| M09–M11   | Domain, authorization, and Screen tests      |
| M12       | Storage, scan, and processing tests          |
| M13–M17   | Transaction, concurrency, and E2E slice      |
| M18       | Read-model and metric consistency            |
| M19       | Worker, retry, and email tests               |
| M20       | Search and recovery                          |
| M21       | Demo isolation and reset                     |
| M22       | P0 visual, accessibility, and performance    |
| M23       | Full E2E and inventory smoke                 |
| M24       | Production smoke and recovery                |

---

## 43. Authorization Test Matrix

Every critical domain command must test:

| Actor                                   | Expected                        |
| --------------------------------------- | ------------------------------- |
| Agency Owner in Workspace               | According to capability         |
| Assigned Delivery Manager               | According to Project capability |
| Unassigned Delivery Manager             | Denied                          |
| Assigned Agency Member                  | Contribution only               |
| Unassigned Agency Member                | Denied                          |
| Current Client Approver                 | Binding Client Decisions        |
| Client Contributor                      | Participation only              |
| Client user assigned to another Project | Denied                          |
| User in another Workspace               | Denied without leakage          |
| Removed user                            | Denied immediately              |
| Unauthenticated user                    | Authentication required         |
| Demo user outside Demo instance         | Denied                          |

No command is complete without this matrix where relevant.

---

## 44. Concurrency Test Gate

Binding workflows require concurrent integration tests.

Required races:

- Two Review Decisions
- Review Decision while new Version publishes
- Two Version publications
- Change Decision after withdrawal
- Two Change Decisions
- Two Handoff acknowledgments
- Two Active Milestone attempts
- Role reassignment during Decision
- Project archive during write
- Duplicate manual reminder
- Duplicate Worker processor delivery

Expected result:

- One authoritative success
- Safe conflict for competing request
- No silent loss
- No duplicate history
- No duplicate email side effect

---

## 45. Accessibility Gate

### Before M22

Every new interactive primitive must pass:

- Keyboard operation
- Visible focus
- Labeling
- Dialog focus management
- Error association

### M22 P0 Gate

Each P0 Screen requires:

- Automated Axe pass
- Manual keyboard walkthrough
- 200% zoom test
- Mobile reflow test
- Touch-target review
- Reduced-motion check
- Screen-reader smoke for Decisions and Pins

### M23 Full Gate

All primary workflows meet WCAG 2.2 AA implementation targets.

---

## 46. Performance Gate

### Deterministic Hard Gates From M03

- Build succeeds
- Ordinary Screen bundle ≤ 170 KB gzip
- Image Review route bundle ≤ 300 KB gzip
- No tested N+1 regression
- P0 query-plan regression blocks
- Load-smoke error rate ≤ 1%
- P0 accessibility smoke passes

### Warning-First From First Real P0 Screen

Track:

- LCP
- INP
- CLS
- Server render
- Binding command latency
- Search
- Upload intent

### Release Regression Gate After M22 Baseline

- More than 20% regression blocks release
- More than 2× target blocks immediately
- Any regression caused by avoidable client-side work must be corrected

---

## 47. Database Gate

Every migration Milestone requires:

1. Empty-database apply
2. Upgrade from previous migration
3. Constraint test
4. Seed compatibility
5. Query index review
6. Lock-risk review
7. Forward-fix plan
8. Production command documentation

No developer may edit an already-deployed migration.

Corrections use a new migration.

---

## 48. Worker Rollout Plan

### M04 — Runtime and Outbox Foundation

Introduce:

- Transactional Outbox
- Idempotency records
- Worker polling
- `SKIP LOCKED` claiming
- Retry metadata
- Lease recovery
- Processor registry
- Graceful shutdown

No Product-specific processor is required yet.

### M05–M06 — Identity Communication

Enable minimal processors for:

- Magic Link delivery when routed through the application adapter
- Agency invitation
- Client invitation

Development uses Mailpit.

### M12 — File Processing

Add:

- Scan asset
- Inspect asset
- Generate variants
- Processor-specific concurrency
- File-processing observability

### M19 — Product Notifications

Add:

- Product email
- Scheduled reminders
- Provider webhook processing
- Dead-letter operational views
- All approved notification templates

### M21 — Demo Runtime

Add:

- Suppress Demo email
- Cleanup Demo instance
- Enforce expiry
- Monitor capacity

### M22 — Staging Hardening

Validate:

- Multi-process Worker behavior
- Private ClamAV connection
- Retry and dead-letter behavior
- Staging provider configuration
- Load and backlog thresholds

### M24 — Production Hardening

Add:

- Production alerts
- Dead-letter replay procedure
- Worker resource tuning
- Graceful deployment validation
- Production capacity monitoring

---

## 49. Demo Asset Production Order

Demo assets are implementation dependencies, not final decoration.

Create in this order:

1. Sableframe logo
2. Kestrelon identity assets
3. Homepage Visual Direction v1
4. Homepage Visual Direction v2
5. Discovery Summary PDF
6. Homepage IA PDF
7. Launch Readiness PDF
8. Component Usage Guide PDF
9. CMS Editorial Guide PDF
10. Launch and Analytics Checklist PDF
11. Controlled staging preview v1
12. Controlled staging preview v2
13. Controlled production preview
14. Final Design Source preview

Each asset must:

- Contain coherent content
- Match the Demo Narrative
- Open successfully
- Pass upload validation
- Support intended Comments or review
- Remain available after Demo reset

---

## 50. Demo Walkthrough Gate

The canonical walkthrough must execute in this order:

```text
Start Agency Demo
   ↓
AG-01 Delivery Overview
   ↓
AG-09 Kestrelon Project
   ↓
AG-18 Visual Direction v1
   ↓
AG-20 RR-002
   ↓
AG-23 CR-001
   ↓
Switch to Client
   ↓
CL-01 Action Center
   ↓
CL-03 Project Overview
   ↓
CL-13 Handoff
   ↓
Acknowledge
   ↓
Reset
```

The walkthrough must not require:

- Manual database edits
- Hidden debug controls
- Real email
- Shared global Demo state
- Dead external links
- Static non-interactive Decision records

---

## 51. Railway Environment Sequence

### 51.1 Required Staging Environment

Staging is mandatory.

It is provisioned in M22 after the local workflow and public Demo architecture are stable.

Staging contains separate:

- Web
- Worker
- PostgreSQL
- ClamAV
- Environment variables
- Error-monitoring environment
- Demo instances

Staging must not share a database with Production.

### 51.2 Staging External Resources

Use:

- Separate R2 bucket when practical, or a strictly isolated prefix with separate credentials
- Resend test mode or a dedicated Staging sender
- No real client recipients
- Separate webhook secret
- Separate base URL

### 51.3 Production Environment

Production is provisioned in M24 only after Staging passes:

- P0 E2E
- Migration
- Backup and restore smoke
- File pipeline
- Worker
- Accessibility
- Performance regression
- Demo reset

### 51.4 Private Networking

Verify independently in Staging and Production:

- Web to PostgreSQL
- Worker to PostgreSQL
- Worker to ClamAV
- No public ClamAV port
- No public PostgreSQL port beyond provider-controlled administration

### 51.5 Release Migration

Use Railway pre-deploy commands.

Migrations complete before incompatible Web or Worker code receives traffic.

### 51.6 Promotion Rule

Production uses the same immutable image already validated in Staging.

Configuration changes are environment-specific.

Application code is not rebuilt differently for Production.

---

## 52. Production Launch Gate

Production launch is blocked until all are true:

### Product

- End-to-end delivery loop works
- 46 Screens implemented
- 26 focused interactions implemented
- Demo reset works
- No static-only primary workflow

### Security

- Cross-tenant tests pass
- Session rules verified
- Signed URL expiry verified
- ClamAV enforced
- Secrets validated
- CSP enabled
- Rate limits active
- Webhooks verified

### Reliability

- Outbox retries
- Dead-letter procedure
- Worker lock recovery
- Database backup
- Restore smoke
- Health checks
- Error monitoring

### Experience

- P0 visual baselines
- Mobile Client path
- Tablet Agency path
- Accessibility gate
- Performance baseline
- No dead Demo asset

### Operations

- Deployment runbook
- Migration runbook
- Rollback plan
- Demo capacity monitoring
- Support contact path
- Known limitations documented

---

## 53. Rollback and Forward-Fix Strategy

### Application Failure

- Roll back Web and Worker image when schema remains compatible.

### Migration Failure Before Completion

- Stop release.
- Do not deploy new application.
- Correct with reviewed migration process.

### Migration Succeeds but Application Fails

- Prefer forward-fix or deploy previous compatible application.
- Never manually mutate formal Product data to recover.

### Worker Failure

- Web remains available.
- Outbox accumulates.
- Recover Worker.
- Replay idempotently.

### Email Provider Failure

- Product state remains authoritative.
- Delivery retries continue.
- Agency may see failure status.

### Object Storage Failure

- New upload and download fail safely.
- Decisions and history remain available.
- No published metadata is deleted.

---

## 54. Post-Launch Stabilization

After launch, the first stabilization cycle focuses only on:

- Production errors
- Demo reset failures
- Worker backlog
- Email failures
- File-processing failures
- Access-control defects
- Mobile Client defects
- P0 performance regressions
- Accessibility regressions

Do not add deferred features during stabilization.

### Stabilization Exit

- No unresolved critical security issue
- No repeated Demo corruption
- No sustained Worker backlog
- No broken P0 route
- No critical accessibility blocker
- Restore procedure verified
- Known limitations documented

---

## 55. Documentation Deliverables by Milestone

| Milestone | Documentation                                      |
| --------- | -------------------------------------------------- |
| M00       | Repository conventions                             |
| M01       | Development setup                                  |
| M02       | Local infrastructure                               |
| M03       | CI and test guide                                  |
| M04       | Migration guide                                    |
| M05       | Authentication notes                               |
| M06       | Invitation lifecycle                               |
| M07       | Authorization policy matrix                        |
| M09       | Project data contract                              |
| M10       | Lifecycle and Milestone command notes              |
| M11       | Client Action command notes                        |
| M12       | File pipeline runbook                              |
| M13       | Version publication rules                          |
| M14       | Annotation coordinate note                         |
| M15       | Decision transaction note                          |
| M16       | Change Request application note                    |
| M17       | Handoff completion note                            |
| M18       | Health and blocked-time query note                 |
| M19       | Worker and email runbook                           |
| M21       | Demo seed and reset guide                          |
| M22       | P0 performance and accessibility baseline          |
| M24       | Deployment, backup, restore, and rollback runbooks |

Documentation must be updated in the same Milestone as behavior.

---

## 56. Commit and Review Boundaries

Each Milestone should end with one coherent reviewed integration commit.

Recommended message pattern:

```text
feat(foundation): bootstrap StudioFlow application
feat(auth): add passwordless authentication
feat(projects): add project setup and milestone lifecycle
feat(actions): add client action workflow
feat(files): add authorized upload pipeline
feat(review): add image comments and formal decisions
feat(scope): add change request workflow
feat(handoff): add final delivery workflow
feat(demo): add isolated demo reset
chore(release): add production deployment
```

Rules:

- Do not combine unrelated Milestones.
- Do not commit generated secrets.
- Do not commit `.env`.
- Do not commit `AGENTS.md`.
- Migration and domain command belong in the same reviewed Milestone.
- Tests belong with the behavior they protect.
- Documentation belongs with the behavior it explains.

---

## 57. Definition of Done for a Milestone

A Milestone is done only when:

- Scope is complete
- Explicit non-goals remain excluded
- Migration passes when applicable
- Authorization passes
- Domain tests pass
- Screen state is real
- Accessibility checks pass
- Error states exist
- Activity exists when applicable
- Outbox exists when applicable
- Documentation is updated
- Diff is reviewed
- Integration commit is clean

“Backend complete” or “UI complete” alone is not a valid Milestone status.

---

## 58. Critical Risks and Controls

| Risk                          | Control                                              |
| ----------------------------- | ---------------------------------------------------- |
| Authorization drift           | Central policies and matrix tests                    |
| Cross-tenant leakage          | Composite keys, scoped repositories, negative tests  |
| Duplicate Decisions           | Unique constraints, row locks, idempotency           |
| Shared Demo corruption        | Per-visitor clone and reset generation               |
| File security                 | Private storage, MIME detection, ClamAV, signed URLs |
| Worker duplicate side effects | Outbox, dedupe, idempotent processors                |
| P0 built on mocks             | Real domain dependency before hardening              |
| Migration instability         | Sequential migrations and integration gate           |
| Client internal-data exposure | Separate query projections                           |
| Scope expansion               | Explicit Milestone non-goals                         |
| Performance discovered late   | Bundle gates from M03 and P0 baselines at M22        |
| Accessibility discovered late | Primitive gate at M08 and cumulative checks          |
| Infrastructure overgrowth     | No Redis, RLS, microservices, or crawler             |
| Demo cost growth              | 25-instance ceiling and cleanup                      |

---

## 59. Blocking Conditions

Implementation pauses when:

- Approved documents conflict
- A new Product capability is required
- A permission rule is ambiguous
- A State Transition cannot be represented safely
- A migration would silently alter published history
- A Client query requires loading internal data
- A binding action cannot be made idempotent
- Demo isolation cannot be guaranteed
- P0 performance requires changing approved hierarchy
- Production hosting cannot enforce private ClamAV or database access

A blocker is documented.

It is not bypassed with temporary permissive behavior.

---

## 60. Scope-Control Rules

The following requests must return to Product Definition rather than entering this Roadmap:

- Multiple Client Approvers
- External Reviewer
- Custom reminder schedules
- Notification Center
- Comment editing
- PDF annotations
- Video review
- Live website annotation
- Figma sync
- Payment processing
- Legal signing
- CRM
- Time tracking
- Resource planning
- Custom workflow builder
- AI classification
- Public API
- Enterprise SSO
- Custom domains
- Advanced white-labeling

---

## 61. Roadmap Decision Summary

| Decision                                                                | Status   |
| ----------------------------------------------------------------------- | -------- |
| Implementation uses 25 ordered Milestones                               | Approved |
| Roadmap estimates calendar duration                                     | Rejected |
| Vertical slices include data, command, policy, query, Screen, and tests | Approved |
| Authorization begins before Product domains                             | Approved |
| All database tables implemented before UI                               | Rejected |
| P0 Screens finalized against static mocks                               | Rejected |
| Migration sequence contains 19 planned migrations                       | Approved |
| Outbox and idempotency begin in M04                                     | Approved |
| Activity persistence begins with Project Core in M09                    | Approved |
| Blocking obligations begin with Client Actions in M11                   | Approved |
| Worker runtime begins in M04                                            | Approved |
| File processors begin in M12                                            | Approved |
| Full Product email and reminders begin in M19                           | Approved |
| Read models grow incrementally with real domain state                   | Approved |
| Final composite Dashboard truth is completed in M18                     | Approved |
| Private deterministic development seed begins in M09                    | Approved |
| Complete Kestrelon seed is validated in M18                             | Approved |
| M21 owns public clone, reset, suppression, and cleanup                  | Approved |
| Per-visitor Demo is required before P0 final screenshots                | Approved |
| Railway Staging is required before P0 baselines and Production          | Approved |
| Staging and Production share a database                                 | Rejected |
| P0 hardening occurs in the approved 11-Screen order                     | Approved |
| All 46 Screens complete before Production launch                        | Approved |
| Deterministic performance Gates begin in M03                            | Approved |
| Runtime performance becomes release regression Gate after M22 baseline  | Approved |
| Accessibility is cumulative from primitives onward                      | Approved |
| One coherent integration commit ends each Milestone                     | Approved |
| `AGENTS.md` may be committed                                            | Rejected |
| Deferred Product features may enter stabilization                       | Rejected |
| Production is configured only after Staging and Demo are stable         | Approved |

---

## 62. Resolved Review Decisions

### 62.1 Migration Granularity

**Decision:** Retain 19 planned migrations and move foundational records earlier.

Final placement:

- Outbox and idempotency — M04
- Project Activity — M09
- Blocking Obligations — M11
- Operational read models — M18
- Scheduled Jobs and notification delivery — M19
- Performance indexes — M22

This prevents temporary event collectors and delayed blocking history.

No speculative launch-hardening migration is reserved.

### 62.2 Worker Timing

**Decision:** Introduce the Worker runtime in M04 and add processors incrementally.

Rollout:

- M04 — claim, retry, lease, idempotency foundation
- M05–M06 — identity and invitation communication
- M12 — file processors
- M19 — Product notification and reminder processors
- M21 — Demo cleanup and suppression
- M22–M24 — Staging and Production hardening

The Worker is one runtime with staged capabilities, not separate temporary implementations.

### 62.3 Dashboard and Read-Model Sequencing

**Decision:** Build real incremental read models; do not create static Dashboard prototypes.

- AG-01 receives its first real Project projection in M09.
- Active Milestone context is added in M10.
- Client Action attention is added in M11.
- Deliverable, Revision, Change, and Handoff projections are added with their domains.
- M18 consolidates the final priority, Health, blocked-time, and Dashboard queries.

This provides early Product feedback without introducing mock authority.

### 62.4 Development Seed Timing

**Decision:** Begin the private deterministic seed in M09.

The seed evolves with every domain Milestone.

- M09 — Workspace, people, Client, Project shell
- M10 — Milestones
- M11 — Client Actions
- M13–M17 — Deliverables, reviews, Change Request, and Handoff
- M18 — complete Kestrelon narrative and Dashboard validation
- M21 — public per-visitor clone, role switch, reset, suppression, and cleanup

M21 is not the first seed implementation.

### 62.5 Activity Persistence Timing

**Decision:** Persist Activity from the first Project transaction.

Activity tables arrive with Projects in M09.

Project publication in M10 and every later meaningful command write Activity in the same transaction.

No temporary Activity collector and no historical backfill phase are permitted.

### 62.6 Production Staging

**Decision:** Require a separate Railway Staging environment.

Staging uses separate:

- Web and Worker services
- PostgreSQL database
- ClamAV service
- Environment variables
- Provider secrets
- Demo instances
- Error-monitoring environment

R2 uses a separate bucket or strictly isolated Staging prefix and credentials.

Resend uses test mode or a dedicated Staging sender.

P0 performance baselines, migration validation, backup and restore smoke, and release-candidate E2E run in Staging before Production.

### 62.7 Review Outcome

All Roadmap review questions are resolved.

Implementation can begin without temporary collectors, mock authoritative dashboards, late seed construction, or direct Production-first deployment.

---

## 63. Approval Criteria

This Roadmap is ready for approval when:

- The Milestone order respects all domain dependencies.
- Repository and Infrastructure foundations precede Product work.
- Migration order is explicit.
- Authentication precedes Product access.
- Authorization precedes protected Product commands.
- Every core domain has an implementation Milestone.
- Activity, Outbox, and Blocking history begin before dependent workflows.
- File processing is available before Deliverable publication.
- Review Decisions and Change Requests use real transactional state.
- Handoff follows approved review and scope behavior.
- Health and blocked time are derived from authoritative history.
- Worker rollout is incremental, recoverable, and idempotent.
- The private seed evolves with each domain.
- Public Demo clone and reset are isolated.
- P0 Screen order is explicit.
- All 46 Screens and 26 interactions are covered.
- Testing Gates are cumulative.
- Accessibility and Performance Gates are implementable.
- Staging precedes Production.
- Production Launch has a clear sequence and rollback path.
- Deferred capabilities remain excluded.
- Roadmap review questions are resolved.
- Implementation can begin without reopening Engineering Architecture.

All criteria are satisfied.

---

## 64. Approval Decision

**Decision:** Approved

The Implementation Roadmap is approved because:

- All 25 Milestones have explicit dependencies and Exit Gates.
- The 19 planned migrations follow domain dependency.
- Outbox and idempotency exist before asynchronous Product intent.
- Activity persists from the first Project transaction.
- Blocking Obligations persist from the first Client Action.
- Worker capabilities expand through one stable runtime.
- Read models grow from real state rather than static Dashboard mocks.
- The deterministic development seed begins early and evolves with the domains.
- The complete Kestrelon narrative is validated before public Demo cloning.
- Railway Staging is mandatory before Production.
- P0 Screens receive production-like baseline validation.
- All 46 Screens and 26 focused interactions are covered.
- Testing, accessibility, performance, Demo, and launch Gates are cumulative.
- No deferred Product capability enters implementation.
- No unresolved Roadmap question blocks M00.

---

## 65. Next Stage

Implementation begins with:

```text
M00 — Contract and Repository Baseline
```

The first implementation review must confirm:

- Approved documents are present.
- Repository guardrails are correct.
- `AGENTS.md` is ignored.
- Environment and package versions are fixed.
- No Product code has bypassed the Roadmap.
- G0 can run locally and in CI.
