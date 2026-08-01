# StudioFlow

# Engineering Architecture

## Document Information

**Document Type:** Engineering Architecture

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

**Includes:**

- Architecture Principles
- Technology Stack
- System Context
- Deployment Topology
- Repository Structure
- Runtime Boundaries
- Route Architecture
- Rendering and Data Access
- Command and Transaction Architecture
- Domain Modules
- Authentication
- Invitations and Sessions
- Tenant Isolation
- Authorization
- Data Modeling Conventions
- Relational Data Model
- State Transitions
- Blocking Obligations and Project Health
- Concurrency and Idempotency
- File and Asset Handling
- Image Processing
- Annotation Coordinates
- Comments and Review
- External-Link Safety
- Activity Events
- Email Notifications and Reminders
- Transactional Outbox
- Background Worker
- Search
- Product Analytics
- Read Models
- Caching
- Error Handling
- Security
- Privacy and Retention
- Accessibility Implementation
- Performance Budgets
- Observability
- Testing Strategy
- Continuous Integration
- Database Migrations
- Demo Seed and Reset
- Local Development
- Production Deployment
- Backup and Recovery
- Environment Configuration
- Engineering Decisions
- Resolved Review Decisions
- Approval Criteria
- Approval Decision

**Produces:**

- Repository Bootstrap
- Database Schema
- Migration Plan
- Authorization Policy Matrix
- Domain Command Inventory
- Worker and Outbox Design
- Test Architecture
- Deployment Configuration
- Implementation Roadmap
- Production Readiness Checklist

---

## 1. Executive Summary

StudioFlow will be implemented as a server-first, modular monolith.

The approved architecture uses:

- Next.js App Router
- React Server Components
- TypeScript in strict mode
- PostgreSQL
- Drizzle ORM and SQL migrations
- Better Auth
- Passwordless email Magic Link authentication
- S3-compatible private object storage
- Cloudflare R2 in production
- MinIO in local development
- Resend for transactional email
- A PostgreSQL-backed transactional Outbox
- A separate Worker process from the same repository
- Playwright, Vitest, and PostgreSQL integration tests
- Docker-based local and production execution

The system contains two authenticated product shells:

```text
Agency Workspace
Client Portal
```

Both shells use the same authoritative domain records.

They do not use separate client-facing copies of Project state.

The central architectural goals are:

1. Enforce Workspace and Project access boundaries
2. Preserve immutable formal Decisions and published history
3. Make State Transitions explicit and atomic
4. Prevent stale or duplicate binding actions
5. Keep internal agency content out of Client responses
6. Support direct, authorized file upload and download
7. Preserve image annotations across responsive layouts
8. Deliver email reliably without making email the Source of Truth
9. Provide a realistic interactive Demo without shared-state corruption
10. Remain understandable and defensible as one portfolio-scale codebase

The architecture deliberately rejects:

- Microservices
- Event Sourcing as the primary persistence model
- Redis as a required dependency
- A browser-accessible database client
- Client-side authorization as a security boundary
- Public object-storage buckets
- Permanent file URLs
- A generic workflow engine
- A standalone analytics warehouse
- A standalone search service
- Automatic AI classification
- Complex enterprise tenancy

The product uses:

> Current-state relational tables, immutable domain history, transactional commands, and asynchronous side effects.

---

## 2. Architecture Objective

This document translates approved Product, Information, Screen, and Visual decisions into a buildable system design.

It must define:

1. The application and runtime topology
2. The selected implementation stack
3. The authoritative persistence model
4. Tenant and Project isolation
5. Role and permission enforcement
6. Route and rendering boundaries
7. Domain module ownership
8. Transactional State Transitions
9. Concurrency and duplicate-action protection
10. File upload, validation, processing, and delivery
11. Image annotation storage
12. Activity and analytics separation
13. Email and reminder execution
14. Background processing
15. Demo seeding and reset
16. Testing and release standards
17. Production deployment and recovery

This document does not define:

- Final implementation tickets
- Sprint estimates
- Final package versions
- Final infrastructure pricing
- Final marketing-site architecture
- Deferred Product capabilities

Exact dependency versions belong in the lockfile and repository runtime configuration.

---

## 3. Architecture Principles

### 3.1 Modular Monolith First

StudioFlow is one product with strongly connected transactions.

Project publication, review Decisions, Change Requests, Handoff, and Activity frequently update several related records together.

They benefit from:

- One relational database
- One transaction boundary
- One authorization model
- One deployment repository
- Shared domain types

Microservices would add operational and consistency cost without solving an approved Product requirement.

### 3.2 PostgreSQL Is the Source of Truth

Authoritative state lives in PostgreSQL.

This includes:

- Membership
- Lifecycle state
- Current Version identity
- Formal Decisions
- Blocking obligations
- Activity
- Email delivery records
- Demo-instance ownership

Object storage holds file bytes.

Email providers deliver communication.

Neither replaces authoritative database state.

### 3.3 Server-Side Trust Boundary

The browser is untrusted.

The browser may provide:

- User input
- Expected row version
- Idempotency key
- Upload metadata
- Requested destination

The server derives:

- Authenticated identity
- Workspace context
- Project access
- Decision authority
- Allowed transition
- Object-storage path
- Client-visible response shape

### 3.4 Explicit Domain Commands

Binding actions are implemented as named domain commands.

Examples:

- `publishProject`
- `publishClientAction`
- `completeClientAction`
- `publishDeliverableVersion`
- `recordReviewDecision`
- `classifyRevisionRequest`
- `sendChangeRequest`
- `recordChangeRequestDecision`
- `applyChangeRequest`
- `publishHandoff`
- `acknowledgeHandoff`
- `completeProject`

No Screen may directly update lifecycle columns.

### 3.5 Transactional History

A successful domain command writes all of the following in one database transaction when applicable:

- Current state
- Immutable history or Decision record
- Activity Event
- Blocking-obligation change
- Outbox Event
- Idempotency result

The user must never see a successful Decision without its related history.

### 3.6 Separate Read Shapes by Audience

Agency and Client Screens use separate read-model functions.

A single broad Project object must not be serialized and filtered in the browser.

The Client read model never loads:

- Agency-only Comments
- Internal classification notes
- Private override reasons
- Draft content
- Internal Activity Events

### 3.7 Async Side Effects, Sync Decisions

The following complete synchronously:

- Authorization
- Validation
- State Transition
- Formal Decision
- Activity creation
- Outbox creation

The following may complete asynchronously:

- Email delivery
- Image derivative generation
- Virus scanning
- Link availability checks
- Reminder delivery
- Analytics aggregation
- Demo cleanup

### 3.8 History Over Silent Mutation

Published and formal records are corrected through:

- Replacement
- Withdrawal
- New Version
- Explicit administrative event
- Reopen command

They are not edited silently.

### 3.9 Fewer Infrastructure Dependencies

The MVP does not require Redis or a dedicated queue.

PostgreSQL provides:

- Transactional Outbox
- Scheduled Jobs
- Worker locking
- Idempotency storage
- Rate-limit storage where needed

A future scale review may add specialized infrastructure when measured load justifies it.

### 3.10 Accessibility Is Architectural

Accessibility is not a visual cleanup phase.

The architecture must support:

- Server-rendered semantic structure
- Stable focus destinations
- Keyboard-operable review pins
- Accessible dialogs
- Reduced-motion behavior
- Role-correct control rendering
- Error association
- Mobile-complete Client workflows

---

## 4. Technology Stack

## 4.1 Application

| Concern               | Decision                                                                                |
| --------------------- | --------------------------------------------------------------------------------------- |
| Web framework         | Next.js App Router                                                                      |
| UI runtime            | React                                                                                   |
| Language              | TypeScript, strict mode                                                                 |
| Package manager       | pnpm                                                                                    |
| Styling               | Tailwind CSS v4                                                                         |
| Accessible primitives | Radix-based primitives through local wrappers                                           |
| Validation            | Zod                                                                                     |
| Forms                 | Native forms and Server Actions; React Hook Form only for complex client-side composers |
| Date handling         | Temporal-ready utility boundary; UTC persistence                                        |
| Email rendering       | React Email-compatible templates                                                        |
| Logging               | Structured JSON logging                                                                 |
| Error monitoring      | Sentry-compatible adapter                                                               |

### 4.2 Persistence

| Concern               | Decision                                             |
| --------------------- | ---------------------------------------------------- |
| Primary database      | PostgreSQL                                           |
| ORM / query builder   | Drizzle ORM                                          |
| Migrations            | Drizzle Kit plus reviewed SQL migrations             |
| IDs                   | UUID generated server-side or by PostgreSQL          |
| State columns         | Text with database `CHECK` constraints               |
| Full-text-like search | PostgreSQL `pg_trgm` and indexed normalized fields   |
| Money                 | Integer minor units plus ISO currency code           |
| Timestamps            | `timestamptz` in UTC                                 |
| Calendar dates        | PostgreSQL `date` when time-of-day is not meaningful |

### 4.3 Identity

| Concern                | Decision                                           |
| ---------------------- | -------------------------------------------------- |
| Authentication library | Better Auth                                        |
| Primary sign-in        | Email Magic Link                                   |
| Session                | Database-backed opaque session                     |
| Invitation             | Custom domain invitation record linked to identity |
| OAuth                  | Deferred                                           |
| Passkeys               | Deferred                                           |
| Enterprise SSO         | Deferred                                           |

### 4.4 Files

| Concern           | Production                           | Local                                |
| ----------------- | ------------------------------------ | ------------------------------------ |
| Object storage    | Cloudflare R2                        | MinIO                                |
| API compatibility | S3-compatible                        | S3-compatible                        |
| Upload            | Short-lived presigned PUT            | Short-lived presigned PUT            |
| Download          | Short-lived authorized presigned GET | Short-lived authorized presigned GET |
| Image processing  | Sharp-compatible Worker pipeline     | Same pipeline                        |
| Malware scanning  | ClamAV-compatible scanner adapter    | Optional local container / test stub |

### 4.5 Communication

| Concern                    | Decision                  |
| -------------------------- | ------------------------- |
| Transactional email        | Resend                    |
| Email scheduling           | PostgreSQL scheduled jobs |
| Email retries              | Worker retry policy       |
| Provider webhooks          | Signed webhook endpoint   |
| In-app notification center | Not implemented           |

### 4.6 Testing

| Concern                  | Decision                              |
| ------------------------ | ------------------------------------- |
| Unit tests               | Vitest                                |
| Component tests          | React Testing Library where valuable  |
| Database integration     | Vitest against disposable PostgreSQL  |
| End-to-end               | Playwright                            |
| Accessibility automation | `@axe-core/playwright`                |
| Visual regression        | Playwright screenshots for P0 Screens |
| Load testing             | k6-compatible scripts                 |
| Security regression      | Permission and cross-tenant matrices  |

### 4.7 Deployment

Canonical portfolio deployment:

- One Dockerized Web service
- One Dockerized Worker service
- One managed PostgreSQL database
- One private R2 bucket
- Resend transactional email
- CDN delivery through the Web application and object-storage signed URLs

The architecture remains portable to any platform supporting:

- Docker
- Persistent environment variables
- PostgreSQL
- Long-running Worker processes
- HTTPS

---

## 5. Technology Selection Rationale

### 5.1 Next.js App Router

The App Router supports:

- Server-rendered authenticated Screens
- Nested Agency and Client layouts
- Route Handlers for auth, uploads, webhooks, and health
- Server Actions for same-origin commands
- Progressive loading boundaries
- Client Components only where interaction requires them

Server Components call application services directly.

They do not call internal HTTP endpoints.

### 5.2 PostgreSQL

StudioFlow requires:

- Relational integrity
- Multi-record transactions
- Unique formal Decisions
- Partial indexes
- Range-based time calculations
- Row locking
- Worker queue locking
- Search indexes

PostgreSQL supports these requirements in one system.

### 5.3 Drizzle

Drizzle provides:

- Type-safe SQL composition
- Explicit schema definitions
- Transaction support
- Database constraints
- Migrations that remain reviewable as SQL

Complex indexes, partial uniqueness, extensions, and triggers may use explicit SQL migration files.

### 5.4 Better Auth

Better Auth provides the authentication and session foundation.

StudioFlow retains ownership of:

- Workspace roles
- Client Organizations
- Project Memberships
- Client Approver authority
- Invitations
- Demo identities

Authentication-library organization features are not used as the Product tenancy model.

### 5.5 PostgreSQL-Backed Worker

A PostgreSQL-backed Outbox keeps business state and asynchronous work consistent.

It avoids:

- Publishing an email job before the Decision commits
- Losing jobs between database commit and queue publish
- Adding Redis before scale requires it

---

## 6. System Context

```text
Browser
   │
   │ HTTPS
   ▼
Next.js Web Application
   ├── Authentication
   ├── Agency Screens
   ├── Client Screens
   ├── Server Actions
   ├── Route Handlers
   ├── Authorization Policies
   └── Application Services
          │
          ▼
      PostgreSQL
          │
          ├── Domain State
          ├── Activity
          ├── Outbox
          ├── Scheduled Jobs
          └── Analytics Events
          │
          ▼
      Worker Service
          ├── Email
          ├── File Processing
          ├── Reminders
          ├── Demo Cleanup
          └── Aggregation

Browser ── presigned PUT/GET ── Private Object Storage

Worker ── private TCP ── ClamAV Service
Worker ── API ── Resend
Worker ── S3 API ── Object Storage
Provider ── signed webhook ── Next.js Route Handler
```

---

## 7. Deployment Topology

## 7.1 Web Service

Responsibilities:

- Render Screens
- Authenticate sessions
- Enforce authorization
- Execute synchronous commands
- Generate upload and download grants
- Receive provider webhooks
- Provide health endpoints
- Serve Demo entry and reset controls

The Web service must remain stateless between requests.

### 7.2 Worker Service

Responsibilities:

- Poll Outbox Events
- Execute Scheduled Jobs
- Send email
- Process uploaded files
- Generate image derivatives
- Submit uploaded files for malware scanning
- Clean expired Demo instances
- Retry transient failures
- Aggregate optional read metrics

Multiple Worker replicas may run safely.

### 7.3 PostgreSQL

Use one primary Railway PostgreSQL service with:

- Separate migration credentials
- Restricted application credentials
- Restricted Worker credentials when practical
- Daily automated backups
- Connection pooling
- Private-network access from Web and Worker

### 7.4 Object Storage

Use one private Cloudflare R2 production bucket with logical prefixes:

```text
workspaces/{workspaceId}/...
demo-template/...
quarantine/...
```

Object keys are generated by the server.

Original filenames are metadata, not object paths.

### 7.5 Malware Scanner

Production uses one dedicated private ClamAV `clamd` service deployed from the official ClamAV container image.

The Scanner:

- Has no public domain
- Is reachable only from the Worker through Railway private networking
- Maintains its signature database through `freshclam`
- Exposes health and signature-age checks to the Worker
- Scans every user-uploaded file before publication or client access
- Uses bounded file-size and archive-expansion limits

A managed scanning API is not used in the canonical MVP deployment.

The Scanner is a separate service rather than a process inside the Worker so that:

- Signature memory is not duplicated across Worker replicas
- Scanner restarts do not stop email and reminder processing
- Resource limits can be tuned independently
- The official ClamAV runtime can be upgraded separately

### 7.6 Email Provider

Email delivery is external.

Provider availability must not block:

- Project publication
- Formal Decisions
- Change Request acceptance
- Handoff acknowledgment

The user-facing event succeeds when database state commits.

Email failure is recorded separately.

### 7.7 Canonical Hosting Platform

The canonical portfolio deployment uses Railway for:

- Web service
- Worker service
- PostgreSQL
- Private ClamAV service
- Release migrations
- Service logs and health checks

Cloudflare R2 remains external object storage and Resend remains the email provider.

Railway is selected because the approved architecture needs multiple long-running Docker services, a Worker, PostgreSQL, private service-to-service networking, and pre-deploy migration support in one small operational surface.

The repository remains Docker-portable and must not depend on Railway-only application APIs.

---

## 8. Repository Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (agency)/
│   ├── (portal)/
│   ├── api/
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx
│
├── modules/
│   ├── identity/
│   ├── workspaces/
│   ├── clients/
│   ├── projects/
│   ├── delivery-plan/
│   ├── client-actions/
│   ├── deliverables/
│   ├── reviews/
│   ├── change-requests/
│   ├── handoff/
│   ├── files/
│   ├── activity/
│   ├── notifications/
│   ├── analytics/
│   └── demo/
│
├── server/
│   ├── auth/
│   ├── authorization/
│   ├── commands/
│   ├── queries/
│   ├── transactions/
│   ├── outbox/
│   ├── storage/
│   ├── email/
│   ├── observability/
│   └── security/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── views/
│   ├── seeds/
│   └── client.ts
│
├── components/
│   ├── ui/
│   ├── agency/
│   ├── portal/
│   └── review/
│
├── styles/
├── lib/
└── types/

worker/
├── index.ts
├── processors/
├── schedulers/
└── runtime/

tests/
├── unit/
├── integration/
├── authorization/
├── e2e/
├── accessibility/
├── visual/
└── load/
```

### 8.1 Module Structure

Each domain module may contain:

```text
module/
├── domain/
├── application/
├── infrastructure/
├── presentation/
├── schemas.ts
└── types.ts
```

Rules:

- Domain code must not import React.
- Application commands must not import page components.
- Route code may call application commands and queries.
- Database access occurs through server-only modules.
- Client Components must not import database or authorization code.

---

## 9. Runtime Boundaries

### 9.1 Server Components

Use Server Components for:

- Collection Screens
- Project Overview
- Detail Screens
- Read-only history
- Initial Review data
- Settings reads

Server Components:

- Authenticate
- Build `ActorContext`
- Call audience-specific query functions
- Return serializable view models

### 9.2 Client Components

Use Client Components only for:

- Image canvas interaction
- Pin placement
- Comment composition
- Drag reordering
- Rich upload progress
- Drawer and sheet state
- Optimistic Comment UI
- Search overlay
- Focused Decision interactions

### 9.3 Server Actions

Use Server Actions for same-origin commands initiated from authenticated Screens.

Examples:

- Complete Client Action
- Resolve Comment
- Publish Project
- Record Decision
- Apply Change Request
- Acknowledge Handoff

Every Server Action calls the same application command used by tests.

### 9.4 Route Handlers

Use Route Handlers for:

- Better Auth endpoints
- Upload intent creation
- Upload finalization
- Authorized download grants
- Provider webhooks
- Health checks
- Demo entry and reset
- Controlled external preview routes

Route Handlers are not used as an internal data-fetch layer for Server Components.

### 9.5 Worker Runtime

The Worker imports application infrastructure but not UI code.

It uses:

- Database polling
- Explicit processor registry
- Structured logs
- Graceful shutdown
- Retry and dead-letter policy

---

## 10. Route Architecture

## 10.1 Authentication

```text
/access
/invite/:token
/recover-access
/access-denied
/account
```

### 10.2 Agency

```text
/agency
/agency/projects
/agency/projects/new
/agency/projects/:projectId
/agency/projects/:projectId/setup
/agency/projects/:projectId/delivery
/agency/projects/:projectId/delivery/milestones/:milestoneId
/agency/projects/:projectId/delivery/actions/:actionId
/agency/projects/:projectId/deliverables
/agency/projects/:projectId/deliverables/:deliverableId
/agency/projects/:projectId/deliverables/:deliverableId/versions/:versionId
/agency/projects/:projectId/revisions/:revisionRequestId
/agency/projects/:projectId/changes
/agency/projects/:projectId/changes/:changeRequestId
/agency/projects/:projectId/activity
/agency/projects/:projectId/handoff
/agency/projects/:projectId/settings
/agency/projects/:projectId/settings/people
/agency/projects/:projectId/settings/lifecycle
/agency/clients
/agency/clients/:clientOrganizationId
/agency/settings
/agency/settings/branding
/agency/settings/members
```

### 10.3 Client

```text
/portal
/portal/projects
/portal/projects/:projectId
/portal/projects/:projectId/milestones/:milestoneId
/portal/projects/:projectId/actions/:actionId
/portal/projects/:projectId/deliverables
/portal/projects/:projectId/deliverables/:deliverableId
/portal/projects/:projectId/deliverables/:deliverableId/versions/:versionId
/portal/projects/:projectId/revisions/:revisionRequestId
/portal/projects/:projectId/changes/:changeRequestId
/portal/projects/:projectId/activity
/portal/projects/:projectId/handoff
```

### 10.4 Infrastructure Routes

```text
/api/auth/*
/api/uploads/intents
/api/uploads/:uploadId/finalize
/api/files/:assetId/download
/api/webhooks/resend
/api/health/live
/api/health/ready
/api/demo/start
/api/demo/switch-role
/api/demo/reset
```

### 10.5 Route Security

Every dynamic route:

1. Authenticates the session
2. Loads the route object through an authorized query
3. Returns `notFound` when existence must remain private
4. Returns Access Denied only when safe context is already known
5. Never trusts a route `workspaceId` supplied by the browser

---

## 11. Rendering and Data Access

### 11.1 No Browser Database Access

The browser never receives database credentials.

No public database SDK is used for Product data.

### 11.2 Query Functions

Query functions are organized by Screen.

Examples:

```text
getAgencyDeliveryOverview(actor)
getAgencyProjectOverview(actor, projectId)
getClientActionCenter(actor)
getClientProjectOverview(actor, projectId)
getAgencyReviewWorkspace(actor, versionId)
getClientReviewWorkspace(actor, versionId)
```

Each function returns an explicit view model.

### 11.3 Agency and Client Projections

Agency and Client projections must use separate selectors.

Client selectors never include internal columns, even if the UI would later ignore them.

### 11.4 Query Composition

Use:

- Explicit column selection
- Batched joins
- Aggregated counts
- Limited Activity windows
- Cursor pagination for long histories

Avoid:

- N+1 queries
- Loading full Comment histories for collection rows
- Loading file bytes through the Web server
- Returning unrestricted JSON domain records

---

## 12. Command Architecture

Every command follows:

```text
Authenticate
   ↓
Build ActorContext
   ↓
Validate input
   ↓
Open transaction
   ↓
Lock aggregate rows
   ↓
Authorize current state
   ↓
Validate transition
   ↓
Write state and history
   ↓
Write Activity Event
   ↓
Open or close Blocking Obligation
   ↓
Write Outbox Event
   ↓
Store idempotency result
   ↓
Commit
   ↓
Revalidate affected Screens
```

### 12.1 Command Result

Commands return a discriminated result:

```ts
type CommandResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "VALIDATION_ERROR"
        | "STATE_CONFLICT"
        | "STALE_VERSION"
        | "DUPLICATE_COMMAND"
        | "RATE_LIMITED"
        | "DEPENDENCY_UNAVAILABLE";
      message: string;
      fieldErrors?: Record<string, string[]>;
      currentState?: unknown;
    };
```

### 12.2 Domain Error Mapping

Expected domain failures are not logged as application crashes.

They are mapped to:

- Inline form errors
- Conflict state
- Stale-state refresh
- Access Denied
- Safe retry guidance

Unexpected failures receive a correlation ID.

---

## 13. Domain Modules

| Module          | Owns                                            |
| --------------- | ----------------------------------------------- |
| Identity        | Users, sessions, Magic Links                    |
| Workspaces      | Workspace identity, branding, agency membership |
| Clients         | Client Organizations and Client Members         |
| Projects        | Project identity, memberships, lifecycle        |
| Delivery Plan   | Milestones and completion                       |
| Client Actions  | Assignment, submission, completion, reopening   |
| Deliverables    | Deliverable and Version records                 |
| Reviews         | Comments, Decisions, Revision Requests          |
| Change Requests | Scope Decision and application                  |
| Handoff         | Final package and acknowledgment                |
| Files           | Assets, validation, storage grants, derivatives |
| Activity        | Immutable Product history                       |
| Notifications   | Outbox, email, reminders                        |
| Analytics       | Privacy-safe Product Events and derived metrics |
| Demo            | Ephemeral Demo instances and reset              |

### 13.1 Cross-Module Rule

Modules communicate through:

- Application commands
- Read queries
- Domain event payloads
- Shared identifiers

They do not update each other’s tables from page code.

A transaction coordinator may call multiple module repositories for one approved command.

---

## 14. Authentication Architecture

## 14.1 Sign-In Method

The MVP uses passwordless email Magic Links for both Agency and Client users.

Reasons:

- Low-friction Client access
- One identity model
- No password storage
- Invitation-compatible onboarding
- Easy Demo-account separation

### 14.2 Magic Link Rules

- Single use
- 15-minute validity
- Stored as a cryptographic hash
- Invalidated after successful exchange
- Bound to intended email address
- Preserves intended destination
- Rate-limited by email and IP

### 14.3 Session Rules

Agency and Client users use the same session policy:

- Opaque database-backed session
- Secure cookie
- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production
- Rolling idle expiry: 14 days
- Absolute expiry: 30 days
- Session rotation after authentication
- Immediate revocation when the account or relevant access is disabled

Using one policy avoids surprising role-dependent sign-in behavior and keeps Client access low-friction.

### 14.4 Formal Decisions

Formal Decisions require:

- Authenticated session
- Current Project access
- Current Client Approver authority
- Explicit focused confirmation
- Server-side state validation
- Idempotency protection

### 14.5 Step-Up Authentication Decision

Email step-up authentication is not required in the MVP.

The approved controls are:

- Focused confirmation for every binding Decision
- Atomic authority checks at command execution
- Immediate session and membership revocation
- Explicit confirmation for destructive administrative actions
- Immutable Activity for role and access changes

Step-up authentication is deferred until one of the following becomes true:

- Enterprise authentication is introduced
- Payment or legal-signature actions are introduced
- A commercial security review requires it
- Real usage demonstrates a meaningful account-takeover risk for administrative commands

### 14.6 Email Address Ownership

The first accepted Magic Link confirms ownership of the email address.

Invitation acceptance must match the invitation email.

---

## 15. Invitation Architecture

## 15.1 Invitation Record

An invitation stores:

- ID
- Workspace ID
- Project ID when Project-scoped
- Email
- Intended membership type
- Intended role
- Token hash
- Created by
- Created at
- Expires at
- Accepted at
- Revoked at

### 15.2 Invitation Duration

Default invitation validity:

> 7 calendar days

The agency may resend.

Resending revokes the previous pending token and creates a new token.

### 15.3 Acceptance Transaction

Invitation acceptance:

1. Validates token
2. Validates expiry and revocation
3. Validates email identity
4. Creates or activates membership
5. Marks invitation Accepted
6. Creates Activity Event when Project-visible
7. Redirects to the preserved destination

### 15.4 Wrong-Account Handling

The system does not reveal Project details.

It allows the user to:

- Switch account
- Request a new link
- Return safely

---

## 16. Tenant Model

### 16.1 Tenancy Unit

The Agency Workspace is the tenant.

All customer-owned domain records belong to one Workspace.

### 16.2 Shared Schema

The MVP uses one shared PostgreSQL schema.

Tenant-owned tables include `workspace_id`.

Project-owned child records include:

- `workspace_id`
- `project_id`

### 16.3 Composite Integrity

Tenant-owned roots use:

```text
UNIQUE (workspace_id, id)
```

Project children use composite foreign keys where practical:

```text
(workspace_id, project_id)
    REFERENCES projects(workspace_id, id)
```

This prevents a child row from referencing a Project in another Workspace.

### 16.4 Database RLS Decision

PostgreSQL Row-Level Security is not used in the MVP.

The architecture instead uses:

- Server-only database access
- Central authorization policies
- Workspace-scoped repositories
- Composite tenant foreign keys
- Explicit Agency and Client projection functions
- Cross-tenant integration tests
- Restricted database credentials
- No arbitrary SQL path exposed to users

This is sufficient for the portfolio MVP because every application and Worker access path is controlled by the same repository and policy layer.

RLS is not treated as a substitute for application authorization.

### 16.5 RLS Reassessment Gate

RLS must be reconsidered before a commercial multi-customer beta when any of the following is introduced:

- Public or partner API access
- Customer-authored reporting queries
- Additional independent backend services
- Direct database analytics access
- Enterprise compliance requirements

The reassessment must include policy-owner bypass behavior, Worker context propagation, migration behavior, connection-pool session state, and automated policy tests.

---

## 17. Actor and Authorization Model

## 17.1 ActorContext

Every protected query and command receives:

```ts
type ActorContext = {
  userId: string;
  sessionId: string;
  workspaceMemberships: Array<{
    workspaceId: string;
    role: "AGENCY_OWNER" | "DELIVERY_MANAGER" | "AGENCY_MEMBER";
  }>;
  clientMemberships: Array<{
    clientOrganizationId: string;
  }>;
  demoInstanceId?: string;
};
```

Project membership and authority are loaded as required.

### 17.2 Authorization Layers

Authorization has four layers:

1. Authentication
2. Workspace membership
3. Project assignment
4. Capability and current state

### 17.3 Policy Functions

Examples:

```text
canViewAgencyDelivery
canViewProject
canEditProject
canPublishClientAction
canPublishVersion
canResolveComment
canRecordReviewDecision
canClassifyRevision
canSendChangeRequest
canRecordChangeDecision
canPublishHandoff
canAcknowledgeHandoff
canCompleteProject
```

### 17.4 Role Authority

- Agency Owner: all Projects in Workspace
- Delivery Manager: assigned Projects
- Agency Member: assigned Projects with non-publishing contribution
- Client Approver: assigned Project, binding client Decisions
- Client Contributor: assigned Project, participation without binding Decisions

### 17.5 Atomic Required-Role Reassignment

A published Project always has:

- One Delivery Manager
- One Client Approver

Reassignment:

1. Locks Project and relevant memberships
2. Verifies replacement eligibility
3. Activates replacement access
4. Updates required-role reference
5. Optionally changes previous holder to another Project role
6. Creates Activity Event
7. Commits atomically

### 17.6 Client-Safe DTO Rule

A Client DTO type must not contain internal fields.

Internal data should be omitted at query time, not marked hidden after serialization.

---

## 18. Data Modeling Conventions

### 18.1 IDs

Use UUID primary keys.

IDs are opaque.

No sequential tenant-visible database IDs are exposed.

### 18.2 State Values

Use text columns with `CHECK` constraints.

This keeps migrations explicit and avoids rigid database enum evolution.

### 18.3 Row Version

Mutable aggregate roots include:

```text
row_version INTEGER NOT NULL DEFAULT 1
```

Every accepted mutation increments `row_version`.

### 18.4 Time

- Persist instants as UTC `timestamptz`
- Display using Workspace timezone
- Demo timezone: `Europe/Amsterdam`
- Persist date-only targets as `date` when no time is meaningful
- Due dates use `timestamptz`

### 18.5 Money

Store:

```text
cost_kind: NONE | AMOUNT
cost_amount_minor: BIGINT NULL
cost_currency: CHAR(3) NULL
```

No floating-point money.

### 18.6 Content

Use relational columns for business fields.

Use JSONB only for:

- Event metadata
- Immutable actor snapshots
- Provider payload summaries
- Non-authoritative processing metadata

### 18.7 Deletion

Prefer lifecycle state and revocation.

Hard deletion is limited to eligible Draft Projects and expired Demo data.

### 18.8 Naming

Database names:

- `snake_case`
- Singular foreign-key names
- Explicit unique and check constraint names
- Index names that describe query purpose

---

## 19. Relational Data Model Overview

```text
users
auth_sessions
auth_verifications
invitations

workspaces
workspace_branding
workspace_members

client_organizations
client_members

projects
project_members
milestones

client_actions
client_action_submissions
client_action_submission_assets

deliverables
deliverable_versions

comment_threads
comments
comment_state_events

review_decisions
revision_requests
revision_internal_notes

change_requests
change_request_decisions
change_request_applications

handoffs
handoff_items
handoff_acknowledgments

assets
asset_variants
upload_intents
external_links

blocking_obligations

activity_events
product_events

outbox_events
scheduled_jobs
notification_deliveries
webhook_receipts

idempotency_records

demo_instances
demo_instance_users
```

---

## 20. Identity and Workspace Tables

## 20.1 `users`

Key fields:

- `id`
- `email_normalized`
- `display_name`
- `email_verified_at`
- `disabled_at`
- `created_at`
- `updated_at`

Constraints:

- Unique normalized email
- Disabled users cannot create new sessions

### 20.2 Auth Tables

Better Auth owns its required:

- Sessions
- Verification tokens
- Provider accounts when introduced

Auth tables remain separate from Product role tables.

### 20.3 `workspaces`

Key fields:

- `id`
- `name`
- `description`
- `timezone`
- `display_currency`
- `created_at`
- `row_version`

### 20.4 `workspace_branding`

Key fields:

- `workspace_id`
- `logo_asset_id`
- `requested_accent_hex`
- `applied_accent_hex`
- `accent_contrast_result`
- `updated_at`

### 20.5 `workspace_members`

Key fields:

- `workspace_id`
- `user_id`
- `role`
- `status`
- `joined_at`
- `revoked_at`

Unique:

```text
(workspace_id, user_id)
```

---

## 21. Client and Project Tables

## 21.1 `client_organizations`

Key fields:

- `id`
- `workspace_id`
- `name`
- `status`
- `created_at`
- `row_version`

### 21.2 `client_members`

Connects a user to one Client Organization.

Key fields:

- `id`
- `workspace_id`
- `client_organization_id`
- `user_id`
- `status`
- `joined_at`
- `revoked_at`

Unique:

```text
(client_organization_id, user_id)
```

### 21.3 `projects`

Key fields:

- `id`
- `workspace_id`
- `client_organization_id`
- `title`
- `client_summary`
- `lifecycle`
- `planned_start_date`
- `target_completion_date`
- `delivery_manager_user_id`
- `client_approver_user_id`
- `cancelled_reason_client`
- `cancelled_reason_internal`
- `completed_at`
- `archived_at`
- `row_version`
- `created_at`
- `updated_at`

### 21.4 `project_members`

Key fields:

- `workspace_id`
- `project_id`
- `user_id`
- `side`
- `project_role`
- `status`
- `joined_at`
- `revoked_at`

Values:

```text
side:
AGENCY | CLIENT

project_role:
DELIVERY_MANAGER
AGENCY_MEMBER
CLIENT_APPROVER
CLIENT_CONTRIBUTOR
```

Unique active membership:

```text
(project_id, user_id)
```

Required authority references on `projects` are retained for efficient validation.

They must correspond to active Project Memberships.

---

## 22. Delivery Plan Tables

## 22.1 `milestones`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `title`
- `purpose`
- `client_description`
- `position`
- `planned_start_date`
- `planned_end_date`
- `state`
- `activated_at`
- `completed_at`
- `cancelled_at`
- `completion_override_reason`
- `row_version`

Constraints:

- Unique Project position
- Partial unique index: one `ACTIVE` Milestone per Project

### 22.2 `client_actions`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `milestone_id`
- `type`
- `title`
- `instructions`
- `assignee_user_id`
- `due_at`
- `blocks_progress`
- `state`
- `published_at`
- `completed_at`
- `cancelled_at`
- `row_version`

All Client Actions are required for Milestone completion.

`blocks_progress` controls Project blocking metrics.

### 22.3 `client_action_submissions`

Key fields:

- `id`
- `client_action_id`
- `submitted_by_user_id`
- `submission_sequence`
- `text_response`
- `confirmation_value`
- `submitted_at`
- `accepted_at`
- `reopened_at`
- `reopen_reason`
- `is_current`

Prior submissions remain immutable.

### 22.4 Submission Assets

`client_action_submission_assets` links logical assets to a submission.

---

## 23. Deliverable and Review Tables

## 23.1 `deliverables`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `milestone_id`
- `title`
- `description`
- `review_context`
- `state`
- `current_version_id`
- `reopened_at`
- `reopen_reason`
- `row_version`

### 23.2 `deliverable_versions`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `deliverable_id`
- `version_number`
- `type`
- `state`
- `asset_id`
- `external_link_id`
- `review_instructions`
- `review_due_at`
- `published_by_user_id`
- `published_at`
- `withdrawn_at`
- `superseded_at`
- `row_version`

Constraints:

- Unique `(deliverable_id, version_number)`
- One active `AWAITING_DECISION` Version per Deliverable
- Exactly one of `asset_id` or `external_link_id` according to type

### 23.3 `review_decisions`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `deliverable_id`
- `deliverable_version_id`
- `decision`
- `decided_by_user_id`
- `decider_name_snapshot`
- `decider_role_snapshot`
- `approval_note`
- `revision_summary`
- `unresolved_shared_comment_count`
- `decided_at`

Constraint:

```text
UNIQUE (deliverable_version_id)
```

Review Decisions are immutable.

### 23.4 `revision_requests`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `deliverable_id`
- `source_version_id`
- `review_decision_id`
- `state`
- `classification`
- `client_summary`
- `client_visible_note`
- `clarification_question`
- `clarification_requested_at`
- `clarification_response`
- `clarification_responded_at`
- `linked_change_request_id`
- `resolved_at`
- `closed_at`
- `row_version`

### 23.5 `revision_internal_notes`

Internal notes are stored separately from Client-visible Revision fields.

Key fields:

- `revision_request_id`
- `body`
- `author_user_id`
- `created_at`

This reduces accidental Client serialization.

---

## 24. Comment Model

## 24.1 `comment_threads`

One thread belongs to one Deliverable Version.

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `deliverable_version_id`
- `kind`
- `visibility`
- `pin_number`
- `x_normalized`
- `y_normalized`
- `anchor_width`
- `anchor_height`
- `state`
- `created_by_user_id`
- `created_at`
- `resolved_by_user_id`
- `resolved_at`
- `row_version`

Values:

```text
kind:
PIN | GENERAL

visibility:
SHARED | AGENCY_ONLY
```

### 24.2 `comments`

Key fields:

- `id`
- `thread_id`
- `author_user_id`
- `author_name_snapshot`
- `author_role_snapshot`
- `body`
- `created_at`
- `edited_at`

Published Comments are not hard-deleted.

MVP editing may be limited to a short correction window or omitted.

### 24.3 `comment_state_events`

Stores:

- Resolved
- Reopened
- Actor
- Time
- Reason when needed

### 24.4 Visibility

Client queries include only:

```text
visibility = SHARED
```

Agency queries may include both, with explicit visual labeling.

---

## 25. Change Request Tables

## 25.1 `change_requests`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `milestone_id`
- `revision_request_id`
- `title`
- `reason`
- `scope_impact`
- `timeline_impact`
- `cost_kind`
- `cost_amount_minor`
- `cost_currency`
- `decision_due_at`
- `state`
- `sent_at`
- `withdrawn_at`
- `row_version`

### 25.2 `change_request_decisions`

Key fields:

- `id`
- `change_request_id`
- `decision`
- `decided_by_user_id`
- `decider_name_snapshot`
- `decision_note`
- `decided_at`
- `was_late`

Constraint:

```text
UNIQUE (change_request_id)
```

### 25.3 `change_request_applications`

Key fields:

- `id`
- `change_request_id`
- `applied_by_user_id`
- `applied_at`
- `previous_target_date`
- `new_target_date`
- `application_summary`

Constraint:

```text
UNIQUE (change_request_id)
```

Accepted and Applied remain distinct.

---

## 26. Handoff Tables

## 26.1 `handoffs`

One Handoff per Project.

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `introduction`
- `instructions`
- `acknowledgment_due_at`
- `state`
- `published_at`
- `row_version`

Unique:

```text
(project_id)
```

### 26.2 `handoff_items`

Key fields:

- `id`
- `handoff_id`
- `position`
- `type`
- `title`
- `description`
- `is_required`
- `asset_id`
- `external_link_id`
- `documentation_body`
- `state`
- `published_at`
- `withdrawn_at`
- `replacement_for_item_id`
- `row_version`

Documentation uses a restricted Markdown subset.

Raw HTML is not accepted.

### 26.3 `handoff_acknowledgments`

Key fields:

- `id`
- `handoff_id`
- `acknowledged_by_user_id`
- `acknowledger_name_snapshot`
- `statement_snapshot`
- `acknowledged_at`

Constraint:

```text
UNIQUE (handoff_id)
```

---

## 27. State Transition Architecture

State Transitions exist as code-level transition maps and command guards.

Database constraints prevent impossible scalar values.

Application commands prevent invalid business transitions.

### 27.1 Project

```text
DRAFT → ONBOARDING → ACTIVE → HANDOFF → COMPLETED → ARCHIVED
DRAFT | ONBOARDING | ACTIVE | HANDOFF → CANCELLED → ARCHIVED
```

### 27.2 Milestone

```text
PLANNED → ACTIVE → COMPLETED
PLANNED | ACTIVE → CANCELLED
```

### 27.3 Client Action

```text
DRAFT → OPEN → COMPLETED
OPEN → CANCELLED
COMPLETED → REOPENED → OPEN
```

`OVERDUE` is derived.

### 27.4 Deliverable

```text
DRAFT → AWAITING_DECISION → APPROVED
AWAITING_DECISION → REVISION_REQUESTED
REVISION_REQUESTED → REVISION_IN_PROGRESS → AWAITING_DECISION
APPROVED → REOPENED → REVISION_IN_PROGRESS
```

### 27.5 Deliverable Version

```text
DRAFT → AWAITING_DECISION
AWAITING_DECISION → APPROVED
AWAITING_DECISION → REVISION_REQUESTED
AWAITING_DECISION → SUPERSEDED
AWAITING_DECISION → WITHDRAWN
```

### 27.6 Revision Request

```text
OPEN → AWAITING_CLARIFICATION → OPEN
OPEN → IN_SCOPE → RESOLVED
OPEN → AWAITING_CHANGE_DECISION
AWAITING_CHANGE_DECISION → RESOLVED
AWAITING_CHANGE_DECISION → CLOSED
```

### 27.7 Change Request

```text
DRAFT → SENT → ACCEPTED → APPLIED
SENT → REJECTED
SENT → WITHDRAWN
```

### 27.8 Handoff Item

```text
DRAFT → PUBLISHED → WITHDRAWN
```

---

## 28. Command Transition Matrix

| Command                | Required Guard                                         | Primary Writes                                                                               | Async Side Effect              |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Publish Project        | Draft complete; required roles; at least one Milestone | Project Onboarding; first Milestone Active; Activity                                         | Invitations / email            |
| Publish Client Action  | Authorized; Draft; valid assignee/due date             | Action Open; blocking obligation if required; Activity                                       | Assignment email and reminders |
| Complete Client Action | Assigned actor; Open                                   | Submission; Action Completed; close obligation; Activity                                     | Completion email               |
| Reopen Client Action   | Agency authority; Completed                            | New open state; new obligation when blocking; Activity                                       | Reopen email                   |
| Publish Version        | Authorized; processed asset; due date                  | Version Awaiting Decision; current Version; obligation; Activity                             | Review email                   |
| Record Review Decision | Current Version; Client Approver; no prior Decision    | Decision; Version state; Deliverable state; close obligation; Revision when needed; Activity | Decision email                 |
| Classify Revision      | Delivery authority; Open state                         | Classification; Revision state; optional obligation; Activity                                | Clarification email            |
| Send Change Request    | Draft; Client Approver exists                          | Sent state; obligation; Activity                                                             | Change email and reminders     |
| Decide Change Request  | Current Approver; Sent; no prior Decision              | Decision; Accepted/Rejected; close obligation; Activity                                      | Decision email                 |
| Apply Change Request   | Accepted; agency authority                             | Applied state; Project plan changes; Revision resolution; Activity                           | Informational email            |
| Publish Handoff        | Handoff ready; assets processed                        | Handoff Published; obligation; Activity                                                      | Handoff email and reminders    |
| Acknowledge Handoff    | Client Approver; Published; no prior ack               | Acknowledgment; close obligation; Activity                                                   | Agency email                   |
| Complete Project       | Handoff state; requirements satisfied                  | Project Completed; Activity                                                                  | Completion email               |
| Complete With Override | Agency authority; reason                               | Project Completed; override record; close obligations; Activity                              | Completion email               |
| Reassign Required Role | Replacement eligible and active                        | Project role reference; memberships; Activity                                                | Access email                   |

---

## 29. Transaction Boundaries

The following must commit atomically:

### 29.1 Review Decision

- Lock Project
- Lock Deliverable
- Lock current Version
- Verify actor is current Client Approver
- Verify Version is current
- Insert unique Decision
- Update Version
- Update Deliverable
- Close blocking obligation
- Create Revision Request if required
- Create Activity
- Create Outbox
- Save idempotency result

### 29.2 Version Publication

- Lock Deliverable
- Validate asset state
- Supersede prior undecided Version when allowed
- Increment Version number
- Publish current Version
- Update Deliverable
- Create blocking obligation
- Create Activity
- Create Outbox

### 29.3 Change Decision

- Lock Change Request
- Verify current Client Approver
- Verify state is Sent
- Insert unique Decision
- Update state
- Close obligation
- Update Revision state
- Create Activity
- Create Outbox

### 29.4 Handoff Acknowledgment

- Lock Handoff
- Verify current Client Approver
- Verify all required Items remain Published
- Insert unique acknowledgment
- Close obligation
- Create Activity
- Create Outbox

---

## 30. Concurrency Control

### 30.1 Row Locks

Use `SELECT ... FOR UPDATE` for binding commands.

Lock the smallest aggregate set in a consistent order:

1. Project
2. Parent aggregate
3. Current child object

### 30.2 Optimistic Versioning

Non-binding mutable forms send `expectedRowVersion`.

Update condition:

```text
WHERE id = ? AND row_version = ?
```

No affected row produces `STATE_CONFLICT`.

### 30.3 Unique Constraints

Database uniqueness protects:

- One Review Decision per Version
- One Change Decision per Change Request
- One Handoff acknowledgment per Handoff
- One Active Milestone per Project
- One current active review Version per Deliverable
- One manual reminder per outstanding obligation
- One processed provider webhook per provider event ID

### 30.4 Idempotency

Binding commands accept a generated idempotency key.

`idempotency_records` stores:

- Actor
- Command type
- Idempotency key
- Request fingerprint
- Result reference
- Created at
- Expires at

Retry with same payload returns the prior result.

Retry with a different payload returns conflict.

### 30.5 Optimistic UI Policy

Optimistic UI is allowed for:

- New Comment display
- Comment resolution
- Local reordering before save
- Non-binding preference-like UI

Optimistic UI is not used for:

- Approval
- Revision Decision
- Change Request Decision
- Version publication
- Project lifecycle
- Handoff acknowledgment
- Role reassignment

---

## 31. Blocking Obligations

`blocking_obligations` creates a generic, queryable record for client-owned blocking time.

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `type`
- `source_id`
- `responsible_user_id`
- `due_at`
- `opened_at`
- `closed_at`
- `close_reason`
- `created_by_event_id`

Types:

```text
CLIENT_ACTION
REVIEW_DECISION
REVISION_CLARIFICATION
CHANGE_REQUEST_DECISION
HANDOFF_ACKNOWLEDGMENT
```

Unique active obligation:

```text
(type, source_id) WHERE closed_at IS NULL
```

### 31.1 Opening

An obligation opens in the same transaction that makes the client action actionable.

### 31.2 Closing

An obligation closes in the same transaction that resolves, withdraws, cancels, or overrides it.

### 31.3 Reopening

A reopened Client Action creates a new obligation interval.

The completed period between intervals is not counted.

### 31.4 Union Calculation

Historical Client-Blocked Time is calculated from the union of overlapping:

```text
[opened_at, closed_at)
```

intervals per Project.

The query uses SQL window functions or a maintained reporting view.

Intervals are not simply summed.

---

## 32. Project Health

Project Health is computed.

It is not persisted as a manually editable Product state.

Precedence:

```text
Overdue
   ↓
Waiting on Client
   ↓
At Risk
   ↓
On Track
```

### 32.1 Overdue

Project is Overdue when:

- Lifecycle is Onboarding, Active, or Handoff
- Target completion date is before the Workspace-local current date

### 32.2 Waiting on Client

Project is Waiting on Client when an active `blocking_obligations` row exists.

### 32.3 At Risk

Project is At Risk when not Overdue or Waiting and:

- Project target completion is within three calendar days, or
- Active Milestone end date is within three calendar days and completion criteria are not satisfied

### 32.4 On Track

None of the higher-priority conditions apply.

### 32.5 Read Model

Create a database view or tested SQL query:

```text
project_delivery_health
```

It returns:

- Health
- Primary reason
- Source object
- Due date
- Blocking duration
- Priority rank

The Agency Delivery Overview uses this read model.

---

## 33. File and Asset Model

## 33.1 `assets`

A logical authorized file record.

Key fields:

- `id`
- `workspace_id`
- `owner_kind`
- `owner_id`
- `purpose`
- `original_filename`
- `storage_key`
- `declared_mime_type`
- `detected_mime_type`
- `size_bytes`
- `sha256`
- `state`
- `scan_state`
- `processing_state`
- `created_by_user_id`
- `created_at`

States:

```text
UPLOADING
UPLOADED
VALIDATING
QUARANTINED
PROCESSING
READY
FAILED
WITHDRAWN
```

### 33.2 `asset_variants`

Stores generated variants:

- Thumbnail
- Review image
- Optimized preview
- Original-download descriptor

Key fields:

- `asset_id`
- `variant_type`
- `storage_key`
- `mime_type`
- `width`
- `height`
- `size_bytes`
- `created_at`

### 33.3 Upload Intent

`upload_intents` stores:

- Actor
- Workspace
- Project
- Purpose
- Expected filename
- Expected size
- Expected MIME type
- Generated storage key
- Expiry
- Finalized state

---

## 34. File Constraints

### 34.1 Workspace Logo

Allowed:

- PNG
- JPEG
- WebP

Limits:

- 5 MB
- Raster image only
- Minimum useful dimensions validated
- SVG excluded from MVP to avoid active-content handling

### 34.2 Annotatable Deliverable Image

Allowed:

- PNG
- JPEG
- WebP

Limits:

- 25 MB
- Maximum 40 megapixels after orientation normalization
- No animated image formats
- Must complete processing before publication

### 34.3 Downloadable Deliverable and Handoff File

Allowed categories:

- PDF
- DOCX
- XLSX
- PPTX
- TXT
- Markdown
- ZIP
- PNG
- JPEG
- WebP

Limit:

- 100 MB per file

### 34.4 Client Action Upload

Same safe document and archive categories.

Limits:

- Maximum 10 files per submission
- 100 MB per file
- 250 MB total per submission

### 34.5 Rejected Types

Reject:

- Executables
- Scripts
- HTML
- Java archives
- Macro-enabled Office formats
- Disk images
- Unknown binary types
- Files whose detected type conflicts dangerously with declared type

### 34.6 Validation Authority

Filename extension and browser MIME are not trusted.

The Worker verifies:

- Actual size
- MIME signature
- Checksum
- Malware scan
- Image dimensions
- Processing capability

---

## 35. Direct Upload Flow

```text
Browser requests upload intent
   ↓
Server authorizes purpose and limits
   ↓
Database creates upload_intent and asset
   ↓
Server returns short-lived presigned PUT
   ↓
Browser uploads directly to object storage
   ↓
Browser calls finalize
   ↓
Server performs HEAD verification
   ↓
Asset enters VALIDATING
   ↓
Worker scans and processes
   ↓
Asset becomes READY
```

### 35.1 Presigned Upload

- Valid for 10 minutes
- One object key
- One operation
- Private bucket
- No user-controlled path
- Expected size and content type recorded

### 35.2 Publication Guard

An asset cannot be published until:

```text
state = READY
scan_state = CLEAN
processing_state = COMPLETE
```

### 35.3 Failed Upload

Draft form metadata remains.

The Asset record becomes Failed or expires.

No partial client-visible object is created.

---

## 36. Authorized Download Flow

```text
User requests download
   ↓
Server authenticates
   ↓
Server authorizes object access
   ↓
Server creates short-lived presigned GET
   ↓
Browser downloads from object storage
```

Rules:

- URL validity: 60 seconds
- Response uses safe filename
- Private bucket remains private
- Removed Project access invalidates future grants
- Existing grant naturally expires
- Sensitive files are never exposed through permanent URLs

---

## 37. Image Processing

### 37.1 Original Preservation

Store the original immutable file.

### 37.2 Orientation

Read EXIF orientation and produce a normalized review image.

Annotation coordinates refer to the normalized review image.

### 37.3 Derivatives

Generate:

- Thumbnail
- Medium review image
- Large review image
- Optional high-density review image

Reference long-edge targets:

```text
640 px
1280 px
2560 px
```

Do not upscale beyond normalized source dimensions.

### 37.4 Metadata

Persist:

- Normalized width
- Normalized height
- Format
- Color profile summary
- Processing version

### 37.5 Processing Version

Every generated variant stores pipeline version.

A processing algorithm change does not silently alter an already published Review Version.

Published review variants remain stable.

---

## 38. Annotation Coordinate Model

Pin annotations use normalized coordinates.

```text
x_normalized ∈ [0, 1]
y_normalized ∈ [0, 1]
```

Coordinates are measured against the normalized review image’s intrinsic dimensions.

### 38.1 Pointer Conversion

When the image uses `object-fit: contain`:

1. Compute the rendered image rectangle
2. Subtract letterbox offset
3. Divide local pointer position by rendered image width and height
4. Clamp to `[0, 1]`
5. Reject clicks outside the rendered image rectangle

### 38.2 Display Conversion

```text
displayX = imageLeft + x_normalized × renderedWidth
displayY = imageTop + y_normalized × renderedHeight
```

### 38.3 Audit Dimensions

Store:

- `anchor_width`
- `anchor_height`

These record the intrinsic review dimensions at pin creation.

### 38.4 Pin Number

Assign `pin_number` transactionally per Deliverable Version.

Pin numbers remain stable.

Resolved pins do not cause renumbering.

### 38.5 Responsive Stability

Coordinates are independent of:

- Viewport
- Zoom
- Device pixel ratio
- Comment panel width
- Canvas background mode

### 38.6 Accessibility

Each pin receives:

- Button semantics
- Accessible label
- Keyboard order
- Selected state
- Thread association

A non-canvas Comment list provides equivalent access.

---

## 39. Review and Comment Commands

### 39.1 Create Comment Thread

Checks:

- Project access
- Published or historically visible Version
- Valid visibility
- Current Project is not read-only for creation
- Coordinate valid for Pin kind

### 39.2 Reply

Checks:

- Thread visibility
- Project access
- Project not read-only
- Version allows discussion

### 39.3 Resolve

Only agency-side Project members.

Creates Comment State Event.

### 39.4 Reopen

Allowed only when:

- Actor authored the shared thread or has agency resolution authority
- Version remains current
- Deliverable is not Approved
- Project is not read-only

### 39.5 Comment Editing Decision

Submitted Comments are immutable in the MVP.

The product does not provide Edit or Delete actions after successful submission.

Corrections are made through a new reply that clearly records the correction.

Reasons:

- Comments may support a formal Review Decision
- Scope discussions require trustworthy history
- Editing would require content revision history and additional disclosure rules
- Immutability keeps Agency and Client timelines consistent

Moderation and legal removal remain operational administrative procedures outside normal Product workflows.

### 39.6 Unsent Draft

Comment composer text may persist in browser local storage keyed by:

```text
userId + versionId + threadId
```

It is cleared only after confirmed submission.

No sensitive file content is stored locally.

---

## 40. External-Link Safety

External links are not immutable assets.

### 40.1 Allowed Scheme

Only:

```text
https
```

The server validates URL syntax and rejects:

- Embedded credentials
- Control characters
- Non-HTTPS schemes
- Obvious loopback or private literal hosts

### 40.2 Automatic Check Decision

The MVP does not perform automatic server-side availability checks.

The application does not fetch arbitrary customer-provided URLs.

This decision removes an unnecessary SSRF surface and avoids presenting a transient network result as authoritative content state.

### 40.3 Publication Confirmation

Before publication, the agency must:

- Open the destination from the client preview
- Confirm that the label and destination are correct
- Confirm that the intended Client audience can access it

The confirmation time and confirming actor are stored as publication metadata.

### 40.4 Stored Metadata

Store:

- Original URL
- Normalized URL
- Display label
- Confirmed by
- Confirmed at
- Withdrawn or replacement state

The Product does not claim continuous availability.

### 40.5 Client Disclosure

Every external-link Version or Handoff Item displays:

> External content may change or become unavailable outside StudioFlow.

If the destination later changes or fails, the agency may withdraw and replace the record while preserving history.

### 40.6 Decision Integrity

External-link failure does not remove:

- Version record
- Comments
- Formal Decision
- Historical URL

### 40.7 Demo Links

Reserved Demo labels route to controlled internal static preview pages.

The public Demo never links to dead `.test` or unrelated external domains.

Automatic safe-link checking remains a deferred capability and requires a separate SSRF threat model before introduction.

---

## 41. Activity Event Model

Activity is immutable Product history.

It is not Event Sourcing.

### 41.1 `activity_events`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `event_type`
- `visibility`
- `actor_user_id`
- `actor_name_snapshot`
- `actor_role_snapshot`
- `subject_type`
- `subject_id`
- `summary_key`
- `metadata`
- `occurred_at`

Visibility:

```text
CLIENT_VISIBLE
AGENCY_ONLY
```

### 41.2 Event Content

Metadata may contain safe structured facts:

- Previous and new due date
- Previous and new role
- Version number
- Decision type
- Change amount
- Override category

Metadata must not contain:

- Comment bodies
- File contents
- Credentials
- Authentication tokens
- Full provider payloads

### 41.3 Event Generation

Activity Events are created by domain commands.

Page views are not Activity.

### 41.4 Event Rendering

Use template keys and structured metadata.

Do not store final localized prose as the only representation.

### 41.5 Historical Identity

Actor snapshots preserve display identity after membership removal.

---

## 42. Product Analytics Events

Product Analytics and Project Activity are separate.

### 42.1 `product_events`

Key fields:

- `id`
- `workspace_id`
- `project_id`
- `actor_user_id`
- `event_name`
- `properties`
- `occurred_at`
- `demo_instance_id`

### 42.2 Privacy

Analytics properties exclude:

- Comment body
- Revision text
- File names when sensitive
- Uploaded content
- Credentials
- Full Project copy

### 42.3 Server-Side Capture

Core workflow events are emitted server-side after successful commit.

Client-side analytics are limited to:

- Screen performance
- Non-sensitive interaction usability
- Demo walkthrough behavior

### 42.4 Demo

Demo analytics are tagged.

They are excluded from real customer metrics.

---

## 43. Transactional Outbox

## 43.1 `outbox_events`

Key fields:

- `id`
- `workspace_id`
- `aggregate_type`
- `aggregate_id`
- `event_type`
- `payload`
- `available_at`
- `attempt_count`
- `locked_at`
- `locked_by`
- `processed_at`
- `failed_at`
- `last_error`

### 43.2 Creation

Outbox Events are inserted inside the domain transaction.

### 43.3 Claiming

Workers claim batches using:

```text
FOR UPDATE SKIP LOCKED
```

### 43.4 Processing

A Worker:

1. Claims Event
2. Commits claim
3. Performs side effect
4. Records result
5. Marks processed

### 43.5 Retry

Reference retry schedule:

```text
1 minute
5 minutes
15 minutes
1 hour
6 hours
24 hours
```

After the maximum attempts:

- Mark Failed
- Preserve error category
- Alert operational monitoring
- Allow manual replay when safe

### 43.6 At-Least-Once Delivery

Processors must be idempotent.

Provider idempotency keys are used when supported.

---

## 44. Scheduled Jobs

## 44.1 `scheduled_jobs`

Key fields:

- `id`
- `job_type`
- `workspace_id`
- `project_id`
- `source_type`
- `source_id`
- `run_at`
- `state`
- `attempt_count`
- `dedupe_key`
- `payload`

### 44.2 Reminder Creation

When a blocking obligation opens with a due date, create:

- One job at `due_at - 24 hours`
- One job at `due_at + 24 hours`

If the first time is already past, omit it.

### 44.3 Execution Guard

Before sending, Worker reloads the source and verifies:

- Obligation remains open
- Recipient still has access
- Due date has not changed
- Job remains applicable

### 44.4 Cancellation

Closing the obligation cancels pending reminder jobs.

### 44.5 Manual Reminder

One manual reminder per active obligation.

Enforce with unique dedupe key.

---

## 45. Email Delivery

## 45.1 Provider Adapter

The email module exposes:

```ts
interface EmailProvider {
  send(message: EmailMessage, idempotencyKey: string): Promise<EmailSendResult>;
}
```

Production adapter: Resend.

Local adapter: Mailpit or log transport.

### 45.2 `notification_deliveries`

Stores:

- Notification type
- Recipient
- Related Project and object
- Provider message ID
- Idempotency key
- State
- Attempt count
- Sent at
- Delivered at
- Bounced at
- Failure category

### 45.3 Templates

Every email includes:

- Agency identity when client-facing
- Project context
- Exact requested action
- Due date when applicable
- Deep link
- Reason the recipient received it

### 45.4 Deep Links

Email links preserve the exact destination through authentication.

### 45.5 Provider Webhook

Webhook endpoint:

- Verifies signature
- Stores provider event ID
- Deduplicates
- Updates delivery status
- Responds quickly
- Processes expensive follow-up asynchronously

### 45.6 Failure Semantics

Email failure never reverses the domain event.

Agency users may see operational failure when action is required.

---

## 46. Background Worker

### 46.1 Processors

Initial processors:

- `send_email`
- `schedule_reminders`
- `scan_asset`
- `inspect_asset`
- `generate_image_variants`
- `cleanup_demo_instance`
- `aggregate_delivery_metrics`
- `process_email_webhook`

### 46.2 Concurrency

Worker concurrency is configured per processor.

File processing uses lower concurrency than email.

### 46.3 Graceful Shutdown

Worker:

- Stops claiming new work
- Finishes active jobs within timeout
- Releases expired locks through lease recovery
- Exits with health state

### 46.4 Lock Recovery

Jobs with expired locks become claimable again.

Processors use idempotency to tolerate retries.

### 46.5 Dead Letter

Failed Outbox and scheduled jobs remain inspectable.

They are not deleted automatically.

---

## 47. Search Architecture

Agency global search covers:

- Projects
- Client Organizations
- Client Members

### 47.1 Normalized Search Fields

Store normalized lower-case text.

Enable PostgreSQL `pg_trgm`.

Indexes:

- Project title
- Client Organization name
- User display name
- User normalized email

### 47.2 Scope

Search query always includes actor authorization scope.

Agency Owner:

- Workspace-wide

Delivery Manager:

- Assigned Projects and relevant Client members

Agency Member:

- Search overlay not available according to approved Screen scope

### 47.3 Result Shape

Return grouped results:

- Projects
- Clients
- People

Limit first response.

No persistent search-result page in MVP.

---

## 48. Read Models

Read models are query-layer projections, not duplicate writable entities.

### 48.1 Agency Delivery Overview

Inputs:

- Accessible Projects
- Project Health query
- Open obligations
- Unclassified Revisions
- Sent Change Requests
- Pending Handoffs
- Recent Client-visible Activity

### 48.2 Client Action Center

Priority sort:

1. Overdue
2. Closest due date
3. Binding authority
4. Blocking effect
5. Most recently published

The query filters to actions the current user may perform.

### 48.3 Project Overview

Separate:

- `AgencyProjectOverviewView`
- `ClientProjectOverviewView`

### 48.4 Review Workspace

Load:

- Current Version metadata
- Selected Version
- Comment thread summary
- Active thread
- Decision
- Version history summary

Do not load every full thread initially when the Version has many Comments.

### 48.5 Pagination

Use cursor pagination for:

- Activity
- Long Comment histories
- Large Project collections

Cursor contains stable sort keys, not arbitrary page number only.

---

## 49. Caching Strategy

### 49.1 Authenticated Domain Data

Do not use shared public caching for authorized tenant data.

Use:

- Per-request memoization
- Database query optimization
- Explicit Screen revalidation after commands
- Private browser cache rules where safe

### 49.2 Static Assets

Use CDN caching for:

- JavaScript
- CSS
- Fonts
- Public product assets
- Immutable generated image variants through signed URLs

### 49.3 Authorization-Sensitive URLs

Presigned download URLs are short-lived and should not be stored as durable application state.

### 49.4 Revalidation

After successful commands, revalidate affected route paths or tags.

The command result remains authoritative.

### 49.5 Demo Reset

Reset increments Demo instance generation.

Stale pages detect generation mismatch and refresh.

---

## 50. Error Handling

### 50.1 Categories

- Validation
- Authorization
- Not found
- State conflict
- Stale version
- Dependency failure
- Rate limit
- Unexpected server failure

### 50.2 HTTP Mapping

For Route Handlers:

| Error                  |          Status |
| ---------------------- | --------------: |
| Validation             |       400 / 422 |
| Unauthenticated        |             401 |
| Unauthorized           | 403 or safe 404 |
| Not found              |             404 |
| State conflict         |             409 |
| Rate limited           |             429 |
| Dependency unavailable |             503 |

### 50.3 Server Action Mapping

Server Actions return typed results.

Expected errors do not throw across the UI boundary.

### 50.4 Safe Disclosure

Access errors do not reveal:

- Other Workspace identity
- Project title
- File name
- Membership details

### 50.5 Correlation

Unexpected errors include a correlation ID shown to the user.

Logs include the same ID.

---

## 51. Security Architecture

### 51.1 Input Validation

Validate all command input with Zod.

Database constraints remain the final integrity layer.

### 51.2 CSRF

Use:

- SameSite cookies
- Origin validation
- Framework Server Action protections
- CSRF validation for custom mutation Route Handlers

### 51.3 Content Security Policy

Production CSP should:

- Restrict scripts to application origins
- Restrict object embedding
- Restrict frames
- Restrict connections to required services
- Prevent arbitrary inline execution where practical

### 51.4 Markdown

Handoff documentation uses restricted Markdown.

Render through a sanitizing pipeline.

Raw HTML is disabled.

### 51.5 Rate Limits

Database-backed or edge-backed limits for:

- Magic Link requests
- Invitation resend
- Comment creation
- Decision submission
- Upload intents
- Demo start and reset
- Webhook failures

### 51.6 Secrets

Secrets exist only in deployment environment configuration.

Never store:

- Object-storage secret keys
- Email API keys
- Session secrets
- Provider webhook secrets

in repository files.

### 51.7 Database Roles

Separate credentials for:

- Migrations
- Web application
- Worker

Application credentials must not own schema objects.

### 51.8 SSRF

The MVP does not fetch arbitrary customer-provided external URLs.

External-link validation is syntactic and publication confirmation is performed by the authorized agency user in the browser.

Any future automatic checker requires:

- Network egress restrictions
- DNS and redirect revalidation
- Private-address blocking
- Response-size and timeout limits
- Dedicated security tests

### 51.9 File Security

- Private bucket
- Short-lived grants
- MIME inspection
- Malware scan
- No inline rendering of dangerous document types
- Safe `Content-Disposition`
- No executable uploads

### 51.10 Audit

Formal Decisions, access changes, lifecycle overrides, and role reassignments create immutable events.

---

## 52. Privacy and Retention

### 52.1 Data Minimization

Store only Product-delivery data required by approved workflows.

### 52.2 Content Separation

Do not place sensitive content in:

- Logs
- Analytics
- Outbox error messages
- Provider metadata
- URL query strings

### 52.3 Historical Records

Completed and Cancelled Projects retain:

- Decisions
- Comments
- Activity
- Files
- Handoff

according to Workspace retention.

### 52.4 Demo Data

Demo data is fictional.

It is isolated from real user data.

### 52.5 Provider Payloads

Store only required email webhook fields.

Do not store full provider payload indefinitely.

### 52.6 Deletion

Workspace account deletion and configurable retention are not MVP Product Screens.

Operational deletion procedures must still exist for development and administrative compliance.

---

## 53. Accessibility Implementation

### 53.1 Semantic Server Output

Server-rendered Screens use:

- Correct landmarks
- Heading order
- Native buttons and links
- Label associations
- Tables only for tabular data

### 53.2 Focus Management

Drawers, sheets, and dialogs:

- Trap focus
- Set meaningful initial focus
- Restore focus
- Support Escape when safe

### 53.3 Decision Confirmation

Decision dialogs expose:

- Object name
- Version
- Consequence
- Errors
- Current authority

to assistive technology.

### 53.4 Pin Review

Canvas pins are duplicated in an accessible ordered Comment list.

Keyboard users can:

- Move through pins
- Select pin
- Open thread
- Return to canvas
- Submit Comment

### 53.5 Live Regions

Use restrained live announcements for:

- Upload completion
- Comment success
- State conflict
- Decision recorded
- Error summary

### 53.6 Reduced Motion

Client Components read reduced-motion preference.

Functional state remains understandable without animation.

### 53.7 Automated and Manual Testing

Automated accessibility checks supplement:

- Keyboard walkthrough
- Screen-reader smoke tests
- Zoom and reflow tests
- Contrast verification
- Mobile touch testing

---

## 54. Performance Budgets

## 54.1 User Experience Targets

For production-like data:

| Metric                                          |          Target |
| ----------------------------------------------- | --------------: |
| LCP on primary Client Screens                   |  ≤ 2.5 s at p75 |
| INP                                             | ≤ 200 ms at p75 |
| CLS                                             |           ≤ 0.1 |
| Server render for common authenticated reads    |    ≤ 750 ms p95 |
| Binding command excluding external side effects |    ≤ 500 ms p95 |
| Search overlay response                         |    ≤ 300 ms p95 |
| Upload-intent generation                        |    ≤ 300 ms p95 |

### 54.2 JavaScript Budgets

Hard route budgets:

- Ordinary Screen initial client JavaScript: ≤ 170 KB gzip
- Image Review route: ≤ 300 KB gzip
- Heavy review libraries load only on Review routes

### 54.3 Database Budgets

- No N+1 query pattern
- Typical Project Overview: ≤ 12 database round trips
- Typical collection query: one main query plus bounded supporting queries
- Every foreign key used in common filtering has an index
- Explain plans reviewed for P0 Screens

### 54.4 Image Budgets

- Responsive derivative selection
- No full original image for initial canvas when a review derivative exists
- Lazy-load historical Version assets
- Thumbnail lists use thumbnail variants

### 54.5 Background Work

Email, scanning, and processing do not block interactive command response.

### 54.6 CI Enforcement Policy

The following fail Pull Request CI immediately:

- Production build failure
- Route bundle exceeding the approved JavaScript budget
- New N+1 regression detected by integration instrumentation
- Missing index or query-plan regression explicitly covered by a P0 query test
- Load-smoke error rate above 1%
- Accessibility smoke failure on a P0 workflow

The following produce warnings and trend reports during early implementation:

- LCP, INP, and CLS from synthetic browser runs
- Server-render p95
- Binding-command p95
- Search latency
- Upload-intent latency

Runtime timing measurements are initially warnings because shared CI hardware introduces noise.

### 54.7 Promotion to Hard Gates

After the first stable P0 implementation baseline:

- Synthetic budgets run nightly and on release candidates
- A regression greater than 20% from the stored baseline fails the release check
- Gross thresholds greater than twice the approved target fail immediately
- Production p75 and p95 metrics are monitored separately from CI

Changing a hard budget requires an explicit Architecture update or documented technical exception.

---

## 55. Observability

### 55.1 Structured Logs

Every log includes when available:

- Correlation ID
- Request ID
- Actor ID
- Workspace ID
- Project ID
- Command name
- Job ID
- Demo instance ID
- Error category

Never include sensitive body content.

### 55.2 Error Monitoring

Capture:

- Unexpected server errors
- Client rendering failures
- Worker job exhaustion
- Webhook verification failures
- Repeated email failures
- Processing failures

### 55.3 Metrics

Operational metrics:

- Request latency
- Command latency
- Database latency
- Outbox depth
- Oldest Outbox age
- Scheduled-job delay
- Email failure rate
- File-processing time
- Demo instance count
- Worker failure count

### 55.4 Health Endpoints

`/api/health/live`

- Process is running

`/api/health/ready`

- Database reachable
- Required configuration loaded
- Worker uses its own readiness check

Object storage and email provider should not make Web readiness fail unless the application cannot operate safely.

---

## 56. Testing Strategy

## 56.1 Unit Tests

Cover:

- State transition guards
- Permission policies
- Project Health precedence
- Client Action priority
- Blocking interval union
- Money validation
- Annotation conversion
- Reminder scheduling
- Safe URL rules

### 56.2 Database Integration Tests

Run against real PostgreSQL.

Cover:

- Constraints
- Partial unique indexes
- Transactions
- Row locks
- Idempotency
- Outbox creation
- Cross-tenant composite foreign keys
- Search indexes
- Read models

### 56.3 Authorization Matrix Tests

For every critical command:

- Agency Owner
- Assigned Delivery Manager
- Unassigned Delivery Manager
- Assigned Agency Member
- Client Approver
- Client Contributor
- User from another Workspace
- Removed user

### 56.4 Concurrency Tests

Test:

- Two simultaneous Review Decisions
- Two Version publications
- Decision after Version supersession
- Change Decision after withdrawal
- Simultaneous role reassignment
- Duplicate Handoff acknowledgment
- Worker duplicate claim

### 56.5 End-to-End Tests

Critical workflows:

1. Create and publish Project
2. Accept Client invitation
3. Complete Client Action
4. Publish image Version
5. Add Pin Comment
6. Request Revision
7. Classify In Scope
8. Publish replacement Version
9. Approve
10. Create and accept Change Request
11. Apply Change
12. Publish Handoff
13. Acknowledge Handoff
14. Complete Project

### 56.6 File Tests

Cover:

- Allowed and rejected types
- MIME mismatch
- Oversize file
- Failed direct upload
- Scan failure
- Image orientation
- Derivative generation
- Authorized and unauthorized download
- Expired signed URL

### 56.7 Accessibility Tests

Automated checks on:

- P0 Screens
- Forms
- Decision dialogs
- Review Workspace
- Handoff
- Access flows

Manual tests remain required.

### 56.8 Visual Regression

Reference screenshots for P0 Screens at:

- Desktop
- Tablet when structurally different
- Mobile Client Screens
- Mobile Review modes

### 56.9 Load Tests

Target scenarios:

- Delivery Overview
- Client Action Center
- Review Comment burst
- Presigned upload intent
- Worker Outbox processing
- Demo-instance creation

---

## 57. Continuous Integration

Required checks:

```text
Install
   ↓
Format check
   ↓
Lint
   ↓
Typecheck
   ↓
Unit tests
   ↓
Migration validation
   ↓
Database integration tests
   ↓
Build
   ↓
End-to-end smoke tests
   ↓
Accessibility smoke tests
   ↓
Bundle budget check
```

### 57.1 Pull Request Rules

A Pull Request affecting state or permissions must include:

- Tests
- Migration when required
- Authorization review
- Activity and Outbox impact
- Client visibility review

### 57.2 Main Branch

Main must remain deployable.

### 57.3 Dependency Updates

Use automated update Pull Requests.

Security-critical updates receive priority.

---

## 58. Database Migrations

### 58.1 Migration Ownership

Schema changes are committed.

Production does not auto-generate migrations.

### 58.2 Review

Every migration is reviewed for:

- Lock duration
- Data backfill
- Default behavior
- Index build cost
- Rollback or forward-fix plan
- Tenant constraints

### 58.3 Expand and Contract

For breaking changes:

1. Add compatible schema
2. Deploy compatible code
3. Backfill
4. Switch reads and writes
5. Remove old schema later

### 58.4 Production Execution

Run migration as a release step before new Web and Worker replicas receive traffic.

### 58.5 Seed Separation

Production migrations never load Demo seed data automatically.

---

## 59. Demo Architecture

The public portfolio Demo must be interactive without letting visitors corrupt one shared canonical dataset.

### 59.1 Per-Visitor Demo Instance

Entering Demo creates an ephemeral Demo instance.

Each instance receives:

- New Workspace
- New Project and domain records
- Fixed canonical dates
- Agency and Client Demo identities
- Reference to immutable Demo assets
- Expiry time
- Seed version

A full relational clone is approved because the seed is small, deterministic, and isolated while file bytes remain shared immutable template assets.

### 59.2 Demo Entry

The visitor chooses:

- Agency Demo
- Client Demo

Both roles use the same Demo instance.

This allows switching between Daniel and Elena while preserving changes made during the session.

### 59.3 Demo Authentication

Demo sessions do not send Magic Links.

A server-only Demo endpoint creates a restricted short-lived session for one approved Demo identity.

This endpoint exists only when:

```text
DEMO_MODE=true
```

### 59.4 Demo Restrictions

Demo users may exercise approved workflows.

They may not:

- Change Workspace ownership
- Invite arbitrary email addresses
- Send real emails
- Upload dangerous or large arbitrary files
- Access non-Demo Workspaces
- Remove the final Demo authority
- Change deployment configuration

### 59.5 Email Suppression

Outbox Events are still created for transaction realism.

Email processors mark Demo deliveries:

```text
SUPPRESSED_DEMO
```

No real message is sent.

### 59.6 Demo Assets

Canonical Demo files live under:

```text
demo-template/
```

Logical asset rows in each Demo instance reference immutable template objects.

Deleting a Demo instance does not delete template bytes.

### 59.7 Reset

Reset:

1. Validates Demo session
2. Locks Demo instance
3. Deletes tenant-owned cloned data
4. Reseeds canonical snapshot
5. Increments `generation`
6. Preserves browser Demo session
7. Returns to selected role landing Screen

### 59.8 Expiry

Default Demo instance lifetime:

> 2 hours after last activity

Worker cleanup runs every 10 minutes and deletes expired instances in bounded batches.

### 59.9 Capacity Controls

Approved initial limits:

- One active instance per browser session
- Maximum 3 new instances per IP per hour
- Maximum 25 active Demo instances globally
- Seed transaction target: ≤ 3 seconds p95
- Instance row-count and storage metrics recorded
- Oldest inactive instance removed first under pressure
- Clear retry message when capacity is exhausted

The limits are configuration values, not hard-coded domain constants.

### 59.10 Capacity Review

Raise the active-instance ceiling only after measuring:

- Clone duration
- Database size per instance
- Worker cleanup lag
- Database connection pressure
- Public Demo traffic

Supporting Project detail is seeded eagerly in the canonical MVP.

Lazy seeding is rejected until capacity measurements demonstrate a need.

---

## 60. Seed Architecture

### 60.1 Deterministic Seed

Seed source is TypeScript data validated by schemas.

It creates:

- Sableframe Workspace
- Kestrelon Client Organization
- Users and roles
- Primary Project
- Five Milestones
- Client Actions
- Deliverables and Versions
- Comments
- Decisions
- Revision Requests
- CR-001
- Handoff
- Supporting Projects
- Activity
- Blocking obligations

### 60.2 Stable Narrative Codes

Human-readable codes such as:

```text
PRJ-KES-001
DEL-003
CR-001
```

are seed metadata, not primary keys.

### 60.3 Metric Consistency

Seed validation asserts:

- Four open Projects
- Two Waiting on Client
- One At Risk
- One On Track
- One overdue Client Action
- One unclassified Revision
- One pending Handoff acknowledgment

### 60.4 Snapshot Time

Demo calculations use a fixed clock:

```text
2026-05-28T10:30:00+02:00
```

Application services receive an injectable Clock.

Production uses real time.

Tests and Demo use fixed time.

---

## 61. Local Development

### 61.1 Services

Docker Compose provides:

- PostgreSQL
- MinIO
- Mailpit
- ClamAV
- Optional local observability service

### 61.2 Application

Web and Worker may run:

- On the host for fast reload
- In containers for production parity

### 61.3 Commands

Recommended scripts:

```text
pnpm dev
pnpm dev:worker
pnpm db:generate
pnpm db:migrate
pnpm db:reset
pnpm db:seed
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

### 61.4 Environment Validation

The application validates environment variables at startup.

Missing required values fail fast.

### 61.5 Local Email

Mailpit captures emails.

No external email is required for local development.

---

## 62. Production Deployment

### 62.1 Canonical Platform

The canonical portfolio deployment uses Railway.

Railway hosts:

- Next.js Web service
- Background Worker service
- PostgreSQL service
- Private ClamAV service
- Release migration command

Cloudflare R2 provides private object storage.

Resend provides transactional email.

### 62.2 Containers and Services

Build two application targets from one repository:

- `web`
- `worker`

Deploy ClamAV from the official scanner container as an independent Railway service.

The ClamAV service has no public domain and communicates with the Worker over Railway private networking.

### 62.3 Web Scaling

Web replicas are stateless.

Sessions live in PostgreSQL.

### 62.4 Worker Scaling

Worker replicas coordinate through PostgreSQL locks.

### 62.5 Scanner Scaling

Start with one ClamAV replica.

The Worker uses bounded scan concurrency and timeout protection.

Increase Scanner resources or replicas only after measured queue pressure.

### 62.6 Release Order

```text
Build immutable images
   ↓
Run migrations as pre-deploy release step
   ↓
Verify ClamAV health and signature age
   ↓
Deploy Worker-compatible code
   ↓
Deploy Web
   ↓
Run smoke tests
```

For incompatible changes, use expand-and-contract deployment.

### 62.7 Networking

- Web has the public HTTPS domain
- Worker has no public domain
- ClamAV has no public domain
- Web, Worker, PostgreSQL, and ClamAV use private service networking
- R2 and Resend are reached through outbound HTTPS

### 62.8 TLS and Domains

All public production traffic uses HTTPS.

Initial deployment may use a Railway-provided domain.

Custom agency domains remain deferred.

### 62.9 Email Domain

Use a verified application sending domain.

Client-facing sender identity may include the agency name while using the StudioFlow-managed sending domain.

### 62.10 Portability

Deployment configuration may use Railway service variables and private DNS, but Product code must depend only on standard:

- HTTP
- PostgreSQL
- S3-compatible APIs
- SMTP or email-provider adapter contracts
- ClamD protocol

A future platform migration must not require Domain-layer changes.

---

## 63. Backup and Recovery

### 63.1 PostgreSQL

Production requires:

- Automated daily backups
- Point-in-time recovery when offered
- Tested restore procedure
- Backup retention appropriate to portfolio operation

### 63.2 Object Storage

Object storage should use:

- Versioning or protected immutable keys where available
- No overwrite of published asset objects
- Lifecycle rules only for expired uploads and Demo temporary objects

### 63.3 Recovery Targets

Portfolio deployment targets:

- RPO: 24 hours maximum for portfolio deployment
- RTO: 4 hours

A stronger commercial target may be defined after real customer validation.

### 63.4 Restore Test

Perform a periodic restore into a non-production environment.

Verify:

- Tenant rows
- Decisions
- Activity
- Asset references
- Demo seed compatibility

---

## 64. Environment Configuration

Required groups:

### Application

- Base URL
- Environment
- Session secret
- Demo mode
- Log level

### Database

- Application database URL
- Migration database URL
- Pool settings

### Object Storage

- S3 endpoint
- Region
- Bucket
- Access key
- Secret key

### Email

- Resend API key
- Sending domain
- Webhook secret

### Security

- Encryption key for protected operational fields
- CSP configuration
- Rate-limit values

### Observability

- Error-monitoring DSN
- Release version
- Environment tag

All values are validated through a typed environment schema.

---

## 65. Performance and Data Indexes

Required indexes include:

- Workspace membership by user and status
- Project membership by user and status
- Projects by Workspace and lifecycle
- Projects by Delivery Manager
- Milestones by Project and position
- Client Actions by Project, state, due date
- Deliverables by Project and state
- Versions by Deliverable and Version number
- Comments by Thread and creation time
- Activity by Project and occurrence time
- Blocking obligations by Project and active state
- Outbox by processing state and availability
- Scheduled Jobs by state and run time
- Search trigram indexes
- Demo instances by expiry

Partial indexes should target active states.

---

## 66. Engineering Decision Summary

| Decision                                                     | Status   |
| ------------------------------------------------------------ | -------- |
| Architecture style: Modular Monolith                         | Approved |
| One PostgreSQL Source of Truth                               | Approved |
| Next.js App Router                                           | Approved |
| React Server Components by default                           | Approved |
| TypeScript strict mode                                       | Approved |
| PostgreSQL and Drizzle                                       | Approved |
| Better Auth with Magic Link                                  | Approved |
| OAuth in MVP                                                 | Rejected |
| Shared-schema multi-tenancy                                  | Approved |
| Browser-accessible database client                           | Rejected |
| PostgreSQL RLS in MVP                                        | Rejected |
| Composite Workspace and Project foreign keys                 | Approved |
| Domain commands own State Transitions                        | Approved |
| Full Event Sourcing                                          | Rejected |
| Immutable Activity plus current-state tables                 | Approved |
| PostgreSQL transactional Outbox                              | Approved |
| Redis required in MVP                                        | Rejected |
| Separate Worker process                                      | Approved |
| Cloudflare R2 production object storage                      | Approved |
| MinIO local object storage                                   | Approved |
| Private buckets and short-lived signed URLs                  | Approved |
| Direct browser upload to object storage                      | Approved |
| File scan before publication                                 | Approved |
| Annotatable image types limited to PNG, JPEG, WebP           | Approved |
| Normalized image coordinates                                 | Approved |
| Automatic external-link availability checker in MVP          | Rejected |
| Resend transactional email                                   | Approved |
| Fixed reminder scheduling in PostgreSQL                      | Approved |
| Provider email state is authoritative Product state          | Rejected |
| Formal actions use pessimistic server confirmation           | Approved |
| Optimistic binding Decisions                                 | Rejected |
| Per-visitor Demo tenant clone                                | Approved |
| Shared mutable public Demo Workspace                         | Rejected |
| Fixed injectable Clock for Demo                              | Approved |
| Railway-hosted Docker Web and Worker                         | Approved |
| WCAG 2.2 AA engineering target                               | Approved |
| Client content stored in analytics                           | Rejected |
| Public Product API in MVP                                    | Rejected |
| Session policy: 14-day rolling, 30-day absolute              | Approved |
| Step-up authentication in MVP                                | Rejected |
| Dedicated private ClamAV service                             | Approved |
| Managed malware-scanning API in canonical deployment         | Rejected |
| Canonical hosting platform: Railway                          | Approved |
| Full relational Demo clone per visitor                       | Approved |
| Global active Demo-instance ceiling: 25                      | Approved |
| Submitted Comment editing in MVP                             | Rejected |
| Publication-time manual confirmation for external links      | Approved |
| Hard CI gates for deterministic budgets                      | Approved |
| Runtime latency and Core Web Vitals as warning-first budgets | Approved |

---

## 67. Resolved Review Decisions

### 67.1 PostgreSQL RLS

**Decision:** Do not use RLS in the MVP.

Application-enforced authorization, composite tenant constraints, server-only database access, and cross-tenant tests are the approved security boundary.

RLS must be reconsidered before commercial multi-customer beta or when independent backend access paths are introduced.

### 67.2 Session Duration and Step-Up

**Decision:** Use one 14-day rolling and 30-day absolute session policy for Agency and Client users.

Step-up authentication is not implemented in the MVP.

Binding Decisions and destructive administrative commands require focused confirmation, current authority validation, and immutable Activity.

### 67.3 Malware Scanning

**Decision:** Use a dedicated private ClamAV service based on the official container image.

It scans every user-uploaded file before publication or client access.

A managed scanning API is rejected for the canonical deployment.

### 67.4 Hosting Platform

**Decision:** Railway is the canonical portfolio hosting platform.

Railway hosts Web, Worker, PostgreSQL, ClamAV, and release migrations.

Cloudflare R2 and Resend remain specialized external providers.

### 67.5 Demo Clone Capacity

**Decision:** Use a full relational clone per visitor.

Initial controls:

- 25 active instances globally
- One instance per browser session
- Three new instances per IP per hour
- Two-hour inactivity expiry
- Cleanup every 10 minutes

Supporting Project data is not seeded lazily in the MVP.

### 67.6 Comment Editing

**Decision:** Submitted Comments are immutable.

Corrections use a new reply.

A user-facing edit window and Comment revision history are rejected for the MVP.

### 67.7 External-Link Checking

**Decision:** Do not perform automatic server-side availability checks.

The agency confirms the destination during publication preview.

The Client surface always discloses that external content may change outside StudioFlow.

### 67.8 Performance Budget Enforcement

**Decision:** Split budgets into deterministic hard gates and runtime warning-first metrics.

Hard Pull Request gates include:

- Build and bundle budgets
- Tested N+1 and query-plan regressions
- Load-smoke error rate
- P0 accessibility smoke checks

Core Web Vitals and runtime latency remain warning-first until a stable P0 baseline exists, then become release regression gates.

### 67.9 Review Outcome

All eight engineering questions are resolved.

No unresolved technical decision blocks implementation planning.

---

## 68. Approval Criteria

This Engineering Architecture is ready for approval when:

- The selected stack can implement all 46 approved Screens.
- Agency and Client route namespaces remain separate.
- Tenant and Project authorization are enforced server-side.
- Every binding command has a transaction boundary.
- Formal Decisions are immutable and uniquely constrained.
- Required role reassignment is atomic.
- Project Health and Client-Blocked Time are derivable.
- File upload and download remain private and authorized.
- Every uploaded file is scanned before publication or client access.
- Image annotations remain stable across responsive layouts.
- Internal agency content cannot enter Client projections.
- Email delivery is asynchronous and non-authoritative.
- Worker processing is idempotent and recoverable.
- Demo reset cannot corrupt another visitor’s session.
- Critical workflows have unit, integration, and E2E coverage.
- Accessibility and performance budgets are implementable.
- Railway deployment supports Web, Worker, PostgreSQL, and private ClamAV.
- No deferred Product capability is introduced.
- Engineering review decisions are resolved.
- The architecture can produce an implementation roadmap without reopening Product Definition.

All criteria are satisfied.

---

## 69. Approval Decision

**Decision:** Approved

The Engineering Architecture is approved because:

- A Modular Monolith matches the transaction-heavy Product workflow.
- PostgreSQL remains the single authoritative state store.
- Agency and Client data are projected through separate server-side read models.
- Tenant integrity is enforced without adding premature RLS complexity.
- Session and Decision-security rules are explicit.
- Formal Decisions, Version history, Activity, and overrides are immutable and transactional.
- File handling uses private storage, direct upload, malware scanning, and short-lived authorized downloads.
- Normalized annotation coordinates preserve Pin placement across responsive layouts.
- Email, reminders, processing, and retries are isolated through the Outbox and Worker.
- External-link behavior avoids unnecessary SSRF risk.
- The public Demo is isolated per visitor and bounded by explicit capacity controls.
- Performance enforcement distinguishes deterministic CI gates from noisy runtime measurements.
- Railway provides the required Web, Worker, database, migration, and private-service topology while the Product remains Docker-portable.
- No unresolved engineering question blocks implementation planning.

---

## 70. Next Stage

After Approval, the next stage is implementation planning.

Recommended next document:

- `docs/engineering/01-implementation-roadmap.md`

The Implementation Roadmap should define:

- Repository bootstrap
- Infrastructure setup
- Database migration sequence
- Authentication milestone
- Authorization milestone
- Agency shell
- Client shell
- Domain implementation order
- P0 Screen order
- Worker rollout
- Demo seed rollout
- Testing gates
- Production launch gate

Implementation planning must use this Architecture as the technical Source of Truth.
