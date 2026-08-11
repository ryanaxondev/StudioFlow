# StudioFlow

# Execution Protocol

## Document Information

**Document Type:** Execution Protocol
**Status:** Active — Living Document
**Owner:** Architecture Room

**Primary Roadmap:**

- `docs/engineering/01-implementation-roadmap.md`

**Purpose:**

Define how the Approved product documents and the Implementation Roadmap are used during daily implementation so the project does not lose direction.

---

## 1. Document Roles

### 1.1 Product Research Dossier

**File**

- `docs/product/01-product-research-dossier.md`

**Use When**

- Rechecking the original market problem
- Evaluating whether a proposed capability fits the product category
- Preventing drift toward CRM, project management, or general collaboration

### 1.2 Business Context

**File**

- `docs/product/02-business-context.md`

**Use When**

- Confirming the paying customer
- Evaluating agency value
- Checking positioning and commercial assumptions

### 1.3 Product Specification

**File**

- `docs/product/03-product-specification.md`

**Use When**

- Defining Product Objects
- Checking roles and permissions
- Checking lifecycle and State Transitions
- Checking required and rejected capabilities
- Confirming business rules

**Authority**

The primary behavioral contract.

### 1.4 Demo Narrative

**File**

- `docs/product/04-demo-narrative.md`

**Use When**

- Creating deterministic seed data
- Validating Dashboard counts
- Writing realistic copy
- Creating Demo assets
- Testing the canonical walkthrough
- Checking names, dates, Comments, Decisions, and Activity

**Authority**

The acceptance dataset and portfolio story.

### 1.5 Information Architecture

**File**

- `docs/product/05-information-architecture.md`

**Use When**

- Creating routes and navigation
- Choosing entry points
- Resolving object placement
- Defining Agency versus Client hierarchy
- Defining deep-link destinations

### 1.6 Screen Inventory

**File**

- `docs/product/06-screen-inventory.md`

**Use When**

- Implementing a Screen
- Checking Screen ID and available roles
- Checking actions, states, responsive importance, and priority

**Authority**

The implementation checklist for all 46 Screens and 26 focused interactions.

### 1.7 Visual Direction

**File**

- `docs/product/07-visual-direction.md`

**Use When**

- Creating design tokens
- Styling components
- Choosing density
- Implementing Agency and Client visual differences
- Implementing Review Workspace and responsive behavior
- Checking accessibility guardrails

### 1.8 Engineering Architecture

**File**

- `docs/product/08-engineering-architecture.md`

**Use When**

- Designing schema and migrations
- Implementing authorization
- Implementing commands and transactions
- Implementing Outbox and Worker behavior
- Handling files and annotations
- Designing tests and deployment

**Authority**

The technical Source of Truth.

### 1.9 Implementation Roadmap

**File**

- `docs/engineering/01-implementation-roadmap.md`

**Use When**

- Choosing what to implement next
- Checking prerequisites, migration order, tests, Exit Gates, and commit boundary
- Preventing premature work

**Authority**

The master sequence from M00 through M24.

---

## 2. Source-of-Truth Precedence

When documents appear to conflict:

```text
Product Specification
        ↓
Demo Narrative
        ↓
Information Architecture
        ↓
Screen Inventory
        ↓
Visual Direction
        ↓
Engineering Architecture
        ↓
Implementation Roadmap
        ↓
Current implementation
```

Later documents translate earlier documents but may not silently change approved Product behavior.

When a real conflict is found:

1. Stop the affected implementation work.
2. Record the conflict in the current Milestone engineering brief or an ADR when the decision is durable.
3. Identify the highest-authority document involved.
4. Resolve the document conflict.
5. Resume implementation only after the decision is explicit.

---

## 3. Library Versus Repository

### Repository Copy

The files inside the active Git repository are the implementation Source of Truth.

### Library Copy

The ChatGPT Library is a durable reference and recovery source.

### Conflict Rule

When Library and repository copies differ:

> The repository copy wins.

### What Must Be Provided

The full documentation set does not need to be uploaded every session.

At the beginning of a Milestone, provide:

- Current repository tree relevant to the Milestone
- Files that will be modified
- Current configuration files
- Current migration state when applicable
- Current test output when applicable
- Any Approved document that differs from the Library copy

Unchanged Approved documents may be retrieved from the Library.

---

## 4. Three Levels of Planning

### Level 1 — Master Roadmap

`docs/engineering/01-implementation-roadmap.md`

Answers where the project starts, where it ends, and which Milestone comes next.

### Level 2 — Milestone Brief

Created at the beginning of each Milestone.

Contains:

- Goal
- Exact scope
- Relevant Approved documents
- Files expected to change
- Commands or Screens
- Required tests
- Explicit non-goals
- Exit Gate
- Final commit boundary

### Level 3 — Session Plan

Created at the beginning of each implementation session.

Contains:

- Current checkpoint
- Work for this session
- Files needed
- Validation commands
- Expected stopping point

---

## 5. Milestone Start Protocol

1. Read the Milestone section in `01-implementation-roadmap.md`.
2. Confirm the previous Milestone is Approved.
3. Identify relevant Product documents.
4. Inspect the current repository and Git state.
5. Confirm the current migration number.
6. Confirm explicit non-goals.
7. Produce or update the Milestone engineering brief when the Milestone needs one.
8. Begin implementation.

---

## 6. Session Start Protocol

State:

```text
Current Milestone:
Current Checkpoint:
Goal for This Session:
Relevant Documents:
Files Needed:
Validation Commands:
Expected Stopping Point:
```

The session continues from the repository, Git history, the active Roadmap Milestone, and its engineering brief rather than from memory alone.

---

## 7. Implementation Loop

```text
Inspect
   ↓
Design the smallest compliant change
   ↓
Implement
   ↓
Run focused tests
   ↓
Review against Approved documents
   ↓
Run Milestone Gate checks
   ↓
Record only durable decisions in the relevant engineering document
```

Avoid temporary permissive authorization, static authoritative mocks, duplicate state, premature generic abstractions, and unapproved scope.

---

## 8. Milestone Completion Protocol

A Milestone may enter `In Review` only when:

- Scope is implemented
- Explicit non-goals remain excluded
- Required migration passes
- Authorization and domain tests pass
- Screen state is real
- Accessibility checks pass
- Error and read-only states exist
- Activity and Outbox behavior exist when applicable
- Documentation is updated

Review sequence:

1. Inspect Git diff.
2. Check Approved-document compliance.
3. Run Milestone Gate commands.
4. Fix defects.
5. Mark the Milestone Approved in the implementation conversation/review checkpoint.
6. Create one coherent integration commit.

A commit is not considered created until the user confirms the command succeeded.

---

## 9. Change-Control Protocol

### Implementation Detail

May proceed without reopening Product documents when it preserves Product behavior, IA, Screen purpose, visual direction, and architecture boundaries.

### Architecture Change

Update Engineering Architecture or create an ADR when a change affects runtime topology, data ownership, authentication, authorization, transactions, Worker behavior, storage, deployment, or security.

### Product Change

Return to Product documents when a change affects roles, Product Objects, lifecycle, State Transitions, navigation, Client workflow, or MVP scope.

---

## 10. Decision Records

Create ADRs only for durable engineering decisions not already settled in `08-engineering-architecture.md`.

Location:

```text
docs/engineering/adr/
```

Each ADR contains:

- Context
- Decision
- Consequences
- Alternatives rejected
- Related Milestone
- Related Approved documents

---

## 11. Progress Tracking Rules

StudioFlow does not maintain a separate living `STATUS.md`.

Operational progress is derived from:

- Git history and the clean/dirty working tree
- the active Milestone in `01-implementation-roadmap.md`
- the Milestone engineering brief when one exists
- current validation output

Only durable architecture, Product, migration, or security decisions belong in repository documentation. Session-by-session progress notes stay out of the repository.

---

## 12. Communication Protocol

The user does not need to resend every document.

Request only:

- Repository files required for the current step
- Exact terminal output required for diagnosis
- A document when the Library copy is missing or stale
- A deliberate decision when Approved documents do not resolve it

Always identify:

- Active Milestone
- Governing Approved documents
- Files being changed
- Target Gate
- Current Milestone status

---

## 13. Default Session Rhythm

### Start

- Confirm Milestone from the Roadmap and Git history
- Inspect repository
- Define checkpoint

### Build

- One coherent slice
- Focused tests
- No unrelated changes

### Review

- Code, architecture, permission, and test review

### Close

- State exact next action
- Record only durable decisions in repository docs
- Do not commit until Milestone review is complete

---

## 14. Project Completion Path

```text
M00 Contract and Repository Baseline
   ↓
M01–M08 Foundation, Identity, Security, and Shells
   ↓
M09–M17 Core Product Domains
   ↓
M18–M20 Operational Product and Async Delivery
   ↓
M21 Public Demo Isolation
   ↓
M22 Staging and P0 Hardening
   ↓
M23 Full MVP Completion
   ↓
M24 Production Launch and Stabilization
```

The project is complete only when M24 passes G7.

---

## 15. Repository Progress Source

This protocol intentionally does not embed a static current Milestone. The active implementation point is derived from Git history, the Milestone sequence in `01-implementation-roadmap.md`, the current working tree, and the active Milestone engineering brief when one exists.
