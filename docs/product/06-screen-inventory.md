# StudioFlow

# Screen Inventory

## Document Information

**Document Type:** Screen Inventory

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`
- `docs/product/03-product-specification.md`
- `docs/product/04-demo-narrative.md`
- `docs/product/05-information-architecture.md`

**Includes:**

- Screen Taxonomy
- Screen Priority Model
- Shared Access Screens
- Agency Global Screens
- Agency Project Screens
- Client Portal Screens
- Focused Decision Interactions
- Role Coverage
- Lifecycle Coverage
- State Coverage
- Responsive Priority
- Demo Walkthrough Coverage
- Screen Dependencies
- Scope Boundaries
- Approval Criteria
- Approval Decision

**Produces:**

- Visual Direction
- Layout Requirements
- Interaction Design Scope
- Responsive Design Scope
- Prototype Plan
- Screenshot Plan
- Engineering Route Inventory
- Implementation Sequence
- QA Coverage Matrix

---

## 1. Executive Summary

This document translates the approved Information Architecture into the exact Screen surfaces required for the StudioFlow MVP.

The inventory contains:

- **46 primary Screens**
- **26 focused decision or mutation interactions**
- Two independent authenticated product shells
- Complete Agency and Client workflow coverage
- Canonical Demo priorities
- Responsive requirements
- Empty, loading, error, historical, and read-only state obligations

The inventory does not treat every dialog, drawer, or confirmation as a new route-level Screen.

Instead:

- Stable destinations and workspaces are listed as primary Screens.
- Binding Decisions and destructive mutations are listed separately in the Focused Interaction Inventory.
- Visual variants are treated as states unless they materially change the user’s purpose or information hierarchy.
- Image review and file/link review are separate Screens because their workspaces and interaction needs differ materially.
- Agency and Client versions of the same underlying object remain separate Screens because their information boundaries and available actions differ.

The architecture remains consistent with the approved distinction:

> Agency users move from portfolio attention into Project operations.
> Client users move from required action into Project context.

The highest-priority portfolio Screens are:

1. Agency Delivery Overview
2. Agency Project Overview
3. Agency Image Review Workspace
4. Agency Revision Request Detail
5. Agency Change Request Detail
6. Agency Handoff Workspace
7. Client Action Center
8. Client Project Overview
9. Client Image Review Workspace
10. Client Change Request Detail
11. Client Handoff

These Screens communicate the product thesis most clearly:

> The agency sees operations. The client sees confidence.

---

## 2. Screen Inventory Objective

The Screen Inventory must answer:

1. Which stable Screens are required
2. Which roles may access each Screen
3. How users enter each Screen
4. What one job the Screen primarily performs
5. Which content must be present
6. Which action must dominate
7. Which secondary actions remain available
8. Which states must be designed
9. Which Screens must work especially well on mobile
10. Which Screens are essential to the portfolio Demo
11. Which Screen depends on which Product Objects and prior Screens
12. Which interactions require focused confirmation
13. Which capabilities remain outside the MVP

This document defines Screen scope and relationships.

It does not define:

- Final visual style
- Component APIs
- Exact spacing
- Final responsive breakpoints
- Animation details
- Database models
- Framework routes
- API contracts
- Technical folder structure

---

## 3. Screen Definition Rules

### 3.1 What Counts as a Screen

A Screen is a stable product destination with a distinct:

- User purpose
- Information hierarchy
- Role boundary
- Route or durable navigation context
- State model

### 3.2 What Does Not Count as a Separate Screen

The following are not counted as primary Screens unless their purpose becomes materially distinct:

- Confirmation dialogs
- Delete dialogs
- Simple drawers
- Toasts
- Inline validation
- Loading placeholders
- Filters
- Search overlays
- Version selectors
- Comment popovers

They are still required and appear in the Focused Interaction or State Coverage sections.

### 3.3 Screen Variants

A single Screen may contain role or lifecycle variants when:

- The underlying purpose remains the same.
- The information hierarchy remains stable.
- Only controls, status, or read-only behavior change.

Agency and Client surfaces are not merged as variants because their information boundaries differ fundamentally.

### 3.4 Conceptual Routes

Routes in this document preserve the approved hierarchy.

They are not final framework decisions.

Engineering Architecture may adjust syntax but must preserve:

- Agency and Client namespace separation
- Project context
- Historical deep-link stability
- Object-level authorization

---

## 4. Priority Model

### P0 Signature

The Screen is central to the portfolio story and should receive the highest visual, interaction, and screenshot quality.

### P1 Core

The Screen is required for the end-to-end MVP workflow and must be fully functional and polished.

### P2 Supporting

The Screen is required for credible product operation but is not a primary portfolio moment.

### P3 Admin or Recovery

The Screen is required for safe administration, access, or recovery, but is not part of the canonical Demo walkthrough.

### Priority Count

| Priority            | Screen Count |
| ------------------- | -----------: |
| P0 Signature        |           11 |
| P1 Core             |           25 |
| P2 Supporting       |            7 |
| P3 Admin / Recovery |            3 |
| **Total**           |       **46** |

---

## 5. Responsive Importance Model

### Mobile Critical

The Screen must support the complete primary workflow on a phone.

This applies especially to:

- Client Action Center
- Client Actions
- Client Decisions
- Handoff
- Access and invitation flows

### Responsive Required

The Screen must preserve complete capability across desktop, tablet, and mobile, although density may reduce.

### Desktop Primary

The Screen is optimized for operational density or large visual review.

It must remain accessible and understandable on smaller devices, but the richest working experience may be desktop or tablet.

### Mobile Readable

Historical or agency-dense information must remain readable on mobile, even when creation or advanced manipulation is desktop-oriented.

---

## 6. Master Screen Inventory

| ID    | Screen                              | Area                    | Surface                             | Roles                                                                                     | Priority      | Responsive                                  |
| ----- | ----------------------------------- | ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------- | ------------------------------------------- |
| SH-01 | Access Entry                        | Shared Access           | Entry                               | All unauthenticated users                                                                 | P1 Core       | Mobile Critical                             |
| SH-02 | Invitation Acceptance               | Shared Access           | Focused Entry                       | Invited Agency Member, Client Approver, Client Contributor                                | P1 Core       | Mobile Critical                             |
| SH-03 | Account and Product Context         | Shared Access           | Utility                             | All authenticated users                                                                   | P2 Supporting | Mobile Critical                             |
| SH-04 | Access Denied                       | Shared Recovery         | Recovery                            | Any authenticated or unauthenticated user                                                 | P3 Recovery   | Mobile Critical                             |
| SH-05 | Invitation and Link Recovery        | Shared Recovery         | Recovery                            | Invited or deep-linked users                                                              | P3 Recovery   | Mobile Critical                             |
| AG-01 | Delivery Overview                   | Agency Global           | Collection / Dashboard              | Agency Owner, Delivery Manager                                                            | P0 Signature  | Desktop Primary; Tablet Required            |
| AG-02 | Projects                            | Agency Global           | Collection                          | Agency Owner, Delivery Manager, Agency Member                                             | P1 Core       | Responsive Required                         |
| AG-03 | Client Organizations                | Agency Global           | Collection                          | Agency Owner, Delivery Manager                                                            | P2 Supporting | Responsive Required                         |
| AG-04 | Client Organization Detail          | Agency Global           | Hub                                 | Agency Owner, Delivery Manager with access                                                | P2 Supporting | Responsive Required                         |
| AG-05 | Workspace Settings — General        | Agency Settings         | Settings                            | Agency Owner                                                                              | P3 Admin      | Responsive Required                         |
| AG-06 | Workspace Settings — Branding       | Agency Settings         | Workspace                           | Agency Owner                                                                              | P1 Core       | Desktop Primary; Mobile Supported           |
| AG-07 | Workspace Settings — Agency Members | Agency Settings         | Collection / Settings               | Agency Owner                                                                              | P2 Supporting | Responsive Required                         |
| AG-08 | Project Setup                       | Agency Project          | Multi-Step Workspace                | Agency Owner, Delivery Manager                                                            | P1 Core       | Desktop Primary; Tablet Required            |
| AG-09 | Agency Project Overview             | Agency Project          | Hub                                 | Agency Owner, assigned Delivery Manager, assigned Agency Member with reduced controls     | P0 Signature  | Desktop Primary; Tablet Required            |
| AG-10 | Delivery Plan — Milestones          | Agency Project          | Collection / Sequence               | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Desktop Primary; Tablet Required            |
| AG-11 | Milestone Detail                    | Agency Project          | Hub / Detail                        | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Responsive Required                         |
| AG-12 | Delivery Plan — Client Actions      | Agency Project          | Collection                          | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Responsive Required                         |
| AG-13 | Agency Client Action Detail         | Agency Project          | Detail                              | Agency Owner, assigned Delivery Manager, assigned Agency Member with limited actions      | P1 Core       | Responsive Required                         |
| AG-14 | Client Action Composer              | Agency Project          | Route-Backed Contextual Composer    | Agency Owner, assigned Delivery Manager; Agency Member may prepare Draft                  | P1 Core       | Desktop Wide Drawer; Mobile Full Screen     |
| AG-15 | Agency Deliverables                 | Agency Project          | Collection                          | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Responsive Required                         |
| AG-16 | Agency Deliverable Detail           | Agency Project          | Hub                                 | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Desktop Primary; Tablet Required            |
| AG-17 | Deliverable Version Composer        | Agency Project          | Composer / Preview                  | Agency Owner, assigned Delivery Manager, assigned Agency Member for Draft preparation     | P1 Core       | Desktop Primary; Tablet Required            |
| AG-18 | Agency Image Review Workspace       | Agency Project          | Review Workspace                    | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P0 Signature  | Desktop/Tablet Primary; Mobile Mode-Based   |
| AG-19 | Agency File or Link Version Detail  | Agency Project          | Review Detail                       | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Responsive Required                         |
| AG-20 | Agency Revision Request Detail      | Agency Project          | Decision Detail                     | Agency Owner, assigned Delivery Manager; assigned Agency Member read access as permitted  | P0 Signature  | Desktop Primary; Tablet Required            |
| AG-21 | Changes                             | Agency Project          | Collection                          | Agency Owner, assigned Delivery Manager, assigned Agency Member with read access          | P1 Core       | Responsive Required                         |
| AG-22 | Change Request Composer             | Agency Project          | Composer / Client Preview           | Agency Owner, assigned Delivery Manager                                                   | P1 Core       | Desktop Primary; Tablet Required            |
| AG-23 | Agency Change Request Detail        | Agency Project          | Decision Record                     | Agency Owner, assigned Delivery Manager, assigned Agency Member with read access          | P0 Signature  | Desktop Primary; Tablet Required            |
| AG-24 | Agency Project Activity             | Agency Project          | Timeline                            | Agency Owner, assigned Delivery Manager, assigned Agency Member                           | P1 Core       | Responsive Required                         |
| AG-25 | Agency Handoff Workspace            | Agency Project          | Workspace with Embedded Item Editor | Agency Owner, assigned Delivery Manager; assigned Agency Member read-only where permitted | P0 Signature  | Desktop Primary; Tablet Required            |
| AG-26 | Project Settings — General          | Agency Project Settings | Settings                            | Agency Owner, assigned Delivery Manager                                                   | P2 Supporting | Responsive Required                         |
| AG-27 | Project Settings — People & Access  | Agency Project Settings | Settings / People & Access          | Agency Owner, assigned Delivery Manager                                                   | P2 Supporting | Responsive Required                         |
| AG-28 | Project Settings — Lifecycle        | Agency Project Settings | Settings / Destructive Actions      | Agency Owner, assigned Delivery Manager according to permission                           | P2 Supporting | Responsive Required                         |
| CL-01 | Client Action Center                | Client Global           | Collection / Home                   | Client Approver, Client Contributor                                                       | P0 Signature  | Mobile Critical                             |
| CL-02 | Client Projects                     | Client Global           | Collection                          | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-03 | Client Project Overview             | Client Project          | Hub                                 | Client Approver, Client Contributor                                                       | P0 Signature  | Mobile Critical                             |
| CL-04 | Client Milestone Detail             | Client Project          | Contextual Detail                   | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-05 | Client Action Detail                | Client Project          | Task Detail                         | Assigned Client Approver or Contributor; other Project members view-only when permitted   | P1 Core       | Mobile Critical                             |
| CL-06 | Client Deliverables                 | Client Project          | Collection                          | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-07 | Client Deliverable Detail           | Client Project          | Hub                                 | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-08 | Client Image Review Workspace       | Client Project          | Review Workspace                    | Client Approver, Client Contributor                                                       | P0 Signature  | Mobile Mode-Based; Tablet/Desktop Preferred |
| CL-09 | Client File or Link Review          | Client Project          | Review Detail                       | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-10 | Client Revision Request Detail      | Client Project          | Contextual Decision Detail          | Client Approver, Client Contributor with Project access                                   | P1 Core       | Mobile Critical                             |
| CL-11 | Client Change Request Detail        | Client Project          | Binding Decision Detail             | Client Approver; Client Contributor view-only                                             | P0 Signature  | Mobile Critical                             |
| CL-12 | Client Project Activity             | Client Project          | Timeline                            | Client Approver, Client Contributor                                                       | P1 Core       | Mobile Critical                             |
| CL-13 | Client Handoff                      | Client Project          | Final Delivery Workspace            | Client Approver, Client Contributor                                                       | P0 Signature  | Mobile Critical                             |

---

## 7. Shared Access and Recovery Screens

### SH-01 — Access Entry

**Product Area:** Shared Access
**Surface Type:** Entry
**Conceptual Route:** `/access`
**Available To:** All unauthenticated users
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Establish the user’s authenticated product context without mixing Agency and Client environments.

**Entry Points**

- Direct product visit
- Expired session
- Sign-out redirect

**Core Content**

- StudioFlow identity
- Sign-in method
- Safe context explanation
- Support path

**Primary Action**

- Continue to the authenticated destination.

**Secondary Actions**

- Switch account
- Return to invitation when preserved

**Key States**

- Default
- Submitting
- Invalid credentials or link
- Service error

**Screen Dependencies**

- Authentication policy
- Context resolver
- Role-based landing rules

**Canonical Demo Use**

Supports Agency and Client Demo account entry; not a signature screenshot.

---

### SH-02 — Invitation Acceptance

**Product Area:** Shared Access
**Surface Type:** Focused Entry
**Conceptual Route:** `/invite/:token`
**Available To:** Invited Agency Member, Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Explain the invitation, establish identity, and preserve the intended Workspace and Project destination.

**Entry Points**

- Invitation email
- Resent invitation link

**Core Content**

- Inviting agency
- Invited role
- Project context when safe
- Invitation expiry
- Identity confirmation

**Primary Action**

- Accept invitation and continue.

**Secondary Actions**

- Use another account
- Decline or leave

**Key States**

- Valid
- Already accepted
- Expired
- Revoked
- Wrong account
- Error

**Screen Dependencies**

- Invitation lifecycle
- Membership creation
- Deep-link resolver

**Canonical Demo Use**

Useful for onboarding validation, but outside the canonical walkthrough.

---

### SH-03 — Account and Product Context

**Product Area:** Shared Access
**Surface Type:** Utility
**Conceptual Route:** `/account`
**Available To:** All authenticated users
**Demo Priority:** P2 Supporting
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Let the current user understand their identity and intentionally leave or change product context.

**Entry Points**

- User menu
- Account utility

**Core Content**

- Name
- Email
- Current role
- Current Workspace or Client context
- Sign-out

**Primary Action**

- Save permitted account changes.

**Secondary Actions**

- Return to product
- Sign out

**Key States**

- Default
- Saving
- Saved
- Validation error

**Screen Dependencies**

- Authenticated user
- Context membership

**Canonical Demo Use**

Uses Daniel or Elena identity; no standalone Demo moment.

---

### SH-04 — Access Denied

**Product Area:** Shared Recovery
**Surface Type:** Recovery
**Conceptual Route:** `/access-denied`
**Available To:** Any authenticated or unauthenticated user
**Demo Priority:** P3 Recovery
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Fail safely without revealing protected Project or object information.

**Entry Points**

- Unauthorized deep link
- Removed membership
- Cross-tenant request

**Core Content**

- Minimal denial message
- Safe next destination
- Account-switch option when applicable

**Primary Action**

- Return to the user’s valid Home.

**Secondary Actions**

- Switch account

**Key States**

- Authenticated denial
- Unauthenticated denial
- Context mismatch

**Screen Dependencies**

- Authorization boundary
- Deep-link resolver

**Canonical Demo Use**

Covered by tests and controlled state, not canonical Demo data.

---

### SH-05 — Invitation and Link Recovery

**Product Area:** Shared Recovery
**Surface Type:** Recovery
**Conceptual Route:** `/recover-access`
**Available To:** Invited or deep-linked users
**Demo Priority:** P3 Recovery
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Recover from expired, revoked, or invalid invitation and sign-in links.

**Entry Points**

- Expired invitation
- Expired sign-in link
- Invalid token

**Core Content**

- Reason when safe
- Agency identity when safe
- Request-new-link path
- Support guidance

**Primary Action**

- Request a new access link.

**Secondary Actions**

- Return to sign in

**Key States**

- Expired
- Revoked
- Unknown link
- Request sent
- Rate limited

**Screen Dependencies**

- Invitation lifecycle
- Email delivery

**Canonical Demo Use**

Not part of the canonical Demo walkthrough.

---

## 8. Agency Global and Workspace Screens

### AG-01 — Delivery Overview

**Product Area:** Agency Global
**Surface Type:** Collection / Dashboard
**Conceptual Route:** `/agency`
**Available To:** Agency Owner, Delivery Manager
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Provide an exception-focused operating view across Projects the user may access.

**Entry Points**

- Agency role landing
- Agency global navigation → Delivery

**Core Content**

- Summary counts
- Needs Attention
- Prioritized open Projects
- Recent client activity
- Health reasons

**Primary Action**

- Open the highest-priority attention item or Project.

**Secondary Actions**

- Create Project
- Filter Projects
- Open recent event source

**Key States**

- Canonical populated
- No Projects
- Delivery clear
- Loading
- Partial data failure

**Screen Dependencies**

- Project health calculation
- Role-scoped Project access
- Activity events

**Canonical Demo Use**

Daniel sees 4 open Projects: 2 Waiting on Client, 1 At Risk, 1 On Track; Orbit Health is first priority.

---

### AG-02 — Projects

**Product Area:** Agency Global
**Surface Type:** Collection
**Conceptual Route:** `/agency/projects`
**Available To:** Agency Owner, Delivery Manager, Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

List all Projects available to the current agency user across active and historical lifecycles.

**Entry Points**

- Agency navigation → Projects
- Search result
- Client Organization Detail

**Core Content**

- Open, Completed, Cancelled, Archived categories
- Lifecycle and health
- Client
- Delivery Manager
- Target date
- Filters and sorting

**Primary Action**

- Open a Project.

**Secondary Actions**

- Create Project when authorized
- Filter
- Sort
- Search

**Key States**

- Populated
- No assigned Projects
- No filter results
- Loading
- Error

**Screen Dependencies**

- Project membership
- Project lifecycle
- Health model

**Canonical Demo Use**

Shows Kestrelon, Orbit Health, Cedar & Finch, MonoGrid, and historical Fieldnote according to role.

---

### AG-03 — Client Organizations

**Product Area:** Agency Global
**Surface Type:** Collection
**Conceptual Route:** `/agency/clients`
**Available To:** Agency Owner, Delivery Manager
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Organize Client Organizations as membership and Project groupings without becoming a CRM.

**Entry Points**

- Agency navigation → Clients
- Global search result

**Core Content**

- Organization identity
- Primary contacts
- Open Project count
- Past Project count
- Current delivery summary

**Primary Action**

- Open Client Organization Detail.

**Secondary Actions**

- Create Client Organization
- Search
- Filter by active status

**Key States**

- Populated
- Empty
- No search results
- Loading
- Error

**Screen Dependencies**

- Client Organization records
- Client memberships
- Project counts

**Canonical Demo Use**

Kestrelon appears with one open Project and three represented client members.

---

### AG-04 — Client Organization Detail

**Product Area:** Agency Global
**Surface Type:** Hub
**Conceptual Route:** `/agency/clients/:clientOrganizationId`
**Available To:** Agency Owner, Delivery Manager with access
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Provide a narrow organization context for identity, members, and Projects.

**Entry Points**

- Client Organizations
- Global search
- Project client link

**Core Content**

- Organization summary
- Client members
- Open Projects
- Past Projects

**Primary Action**

- Open an active Project.

**Secondary Actions**

- Add Client Member
- Edit organization identity
- Create Project for this Client

**Key States**

- Populated
- No open Projects
- No members
- Archived organization
- Access denied

**Screen Dependencies**

- Client Organization
- Membership
- Project access

**Canonical Demo Use**

Kestrelon detail links to Kestrelon Website Rebuild and Elena, Marcus, and Nia.

---

### AG-05 — Workspace Settings — General

**Product Area:** Agency Settings
**Surface Type:** Settings
**Conceptual Route:** `/agency/settings`
**Available To:** Agency Owner
**Demo Priority:** P3 Admin
**Responsive Importance:** Responsive Required

**Primary Purpose**

Manage basic Workspace identity and default display currency.

**Entry Points**

- Workspace menu → Settings

**Core Content**

- Workspace name
- Workspace description
- Default display currency

**Primary Action**

- Save Workspace settings.

**Secondary Actions**

- Return to Delivery

**Key States**

- Default
- Saving
- Saved
- Validation error
- Unauthorized

**Screen Dependencies**

- Workspace identity
- Owner permission

**Canonical Demo Use**

Sableframe Studio and EUR are the canonical values.

---

### AG-06 — Workspace Settings — Branding

**Product Area:** Agency Settings
**Surface Type:** Workspace
**Conceptual Route:** `/agency/settings/branding`
**Available To:** Agency Owner
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Mobile Supported

**Primary Purpose**

Configure agency branding and preview the Client Portal presentation.

**Entry Points**

- Workspace menu → Branding
- Workspace Settings

**Core Content**

- Logo upload
- Primary brand color
- Client Portal preview
- Accessibility feedback

**Primary Action**

- Save branding.

**Secondary Actions**

- Reset draft changes
- Preview sample Project

**Key States**

- Unconfigured
- Configured
- Uploading
- Invalid asset
- Inaccessible color
- Saved

**Screen Dependencies**

- Branding rules
- File upload
- Contrast guardrails

**Canonical Demo Use**

Uses Sableframe branding and a Kestrelon Client Portal preview.

---

### AG-07 — Workspace Settings — Agency Members

**Product Area:** Agency Settings
**Surface Type:** Collection / Settings
**Conceptual Route:** `/agency/settings/members`
**Available To:** Agency Owner
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Manage agency membership, Workspace roles, and invitation state.

**Entry Points**

- Workspace menu → Agency Members
- Workspace Settings

**Core Content**

- Member list
- Role
- Invitation status
- Last access when appropriate

**Primary Action**

- Invite an Agency Member.

**Secondary Actions**

- Change eligible role
- Resend invitation
- Remove access

**Key States**

- Populated
- Pending invitation
- Empty beyond owner
- Invite error
- Removal confirmation

**Screen Dependencies**

- Agency membership
- Role model
- Invitation lifecycle

**Canonical Demo Use**

Shows Maya, Daniel, Priya, and Theo as represented members.

---

## 9. Agency Project Screens

### AG-08 — Project Setup

**Product Area:** Agency Project
**Surface Type:** Resumable Multi-Step Workspace
**Conceptual Route:** `/agency/projects/new` and `/agency/projects/:projectId/setup`
**Available To:** Agency Owner, Delivery Manager
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Create a minimal Project Draft early, then complete the required people, delivery plan, and client-facing context before publication.

**Entry Points**

- Projects → New Project
- Client Organization Detail → New Project
- Draft Project → Complete setup

**Core Content**

- Initial Draft creation: Client Organization, Project title, Delivery Manager
- Resumable setup checklist
- Client Approver and Project members
- Client-facing summary and target completion
- Milestone creation and ordering
- Publication requirements
- Client Portal preview

**Primary Action**

- Save the minimal Draft, complete setup, and publish into Onboarding when all requirements are satisfied.

**Secondary Actions**

- Save and exit
- Create Client Organization
- Invite a missing Client Member
- Return to the Draft Project

**Key States**

- New and unsaved
- Minimal Draft created
- Setup incomplete
- Ready for client preview
- Ready to publish
- Validation blocked
- Save or publication error

**Screen Dependencies**

- Draft Project persistence
- Membership requirements
- Milestone creation
- Client preview boundary
- Publish Project interaction

**Canonical Demo Use**

## Draft state is demonstrated through the creation flow rather than canonical seeded Project data. Client access begins only after publication.

### AG-09 — Agency Project Overview

**Product Area:** Agency Project
**Surface Type:** Hub
**Conceptual Route:** `/agency/projects/:projectId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member with reduced controls
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Summarize one Project’s operational state and direct the agency to the next meaningful action.

**Entry Points**

- Projects
- Delivery attention item
- Client Organization Detail
- Activity source

**Core Content**

- Identity
- Lifecycle
- Health and cause
- Target date
- Active Milestone
- Progress
- Blocking obligation
- People
- Recent activity

**Primary Action**

- Perform the single highest-priority Project action.

**Secondary Actions**

- Open Delivery Plan
- Open Deliverables
- Open Changes
- Preview Client Portal
- Open settings

**Key States**

- Draft
- Onboarding
- Active
- Handoff
- Completed read-only
- Cancelled read-only
- Archived

**Screen Dependencies**

- Project lifecycle
- Health
- Attention resolver
- Membership

**Canonical Demo Use**

Kestrelon is in Handoff, Waiting on Client, blocked by final acknowledgment since May 26.

---

### AG-10 — Delivery Plan — Milestones

**Product Area:** Agency Project
**Surface Type:** Collection / Sequence
**Conceptual Route:** `/agency/projects/:projectId/delivery?view=milestones`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Show the client-facing delivery sequence and the completion dependencies of each Milestone.

**Entry Points**

- Project navigation → Delivery Plan
- Project Overview current Milestone

**Core Content**

- Ordered Milestones
- Purpose
- Dates
- Lifecycle
- Action completion
- Deliverable decision completion

**Primary Action**

- Open the Active Milestone.

**Secondary Actions**

- Create Milestone Draft
- Reorder planned Milestones
- Switch to Client Actions

**Key States**

- Draft sequence
- One Active Milestone
- All completed
- Cancelled Milestone
- Empty

**Screen Dependencies**

- Milestone lifecycle
- Client Action and Deliverable relationships

**Canonical Demo Use**

Kestrelon shows 4 completed Milestones and active Launch & Handoff.

---

### AG-11 — Milestone Detail

**Product Area:** Agency Project
**Surface Type:** Hub / Detail
**Conceptual Route:** `/agency/projects/:projectId/delivery/milestones/:milestoneId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Manage one Milestone’s purpose, related client responsibilities, Deliverables, and completion state.

**Entry Points**

- Delivery Plan → Milestone
- Project Overview current Milestone

**Core Content**

- Purpose
- Dates
- Lifecycle
- Related Client Actions
- Related Deliverables
- Completion requirements
- Milestone activity

**Primary Action**

- Perform the valid Milestone lifecycle action.

**Secondary Actions**

- Create related Client Action
- Create Deliverable
- Edit Draft
- Return to sequence

**Key States**

- Planned
- Active
- Ready to complete
- Blocked
- Completed
- Cancelled
- Read-only

**Screen Dependencies**

- Milestone rules
- Related object state
- Permission model

**Canonical Demo Use**

Launch & Handoff shows the published Handoff and pending acknowledgment requirement.

---

### AG-12 — Delivery Plan — Client Actions

**Product Area:** Agency Project
**Surface Type:** Collection
**Conceptual Route:** `/agency/projects/:projectId/delivery?view=actions`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Create and monitor client responsibilities while preserving assignee, deadline, and blocking context.

**Entry Points**

- Project navigation → Delivery Plan
- Milestone Detail
- Project Overview attention

**Core Content**

- Action rows
- Type
- Assignee
- Milestone
- Due date
- Lifecycle
- Blocking status
- Filters

**Primary Action**

- Open the most urgent Client Action.

**Secondary Actions**

- Create Client Action when authorized
- Switch to Milestones
- Filter
- Send manual reminder when eligible

**Key States**

- Open
- Completed
- Overdue
- Reopened
- Cancelled
- No Actions
- No filter results

**Screen Dependencies**

- Client Action lifecycle
- Assignee
- Due dates
- Blocking model

**Canonical Demo Use**

Kestrelon includes ACT-004 with preserved reopen history; Orbit Health supports the overdue state.

---

### AG-13 — Agency Client Action Detail

**Product Area:** Agency Project
**Surface Type:** Detail
**Conceptual Route:** `/agency/projects/:projectId/delivery/actions/:actionId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member with limited actions
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Inspect one Client Action’s instructions, submission, completion, reminder, and reopen history.

**Entry Points**

- Client Actions view
- Milestone Detail
- Project Overview attention
- Activity

**Core Content**

- Instructions
- Type
- Assignee
- Due date
- Blocking status
- Submission
- Completion record
- Reopen history

**Primary Action**

- Perform the next authorized operational action.

**Secondary Actions**

- Reassign
- Reopen
- Cancel
- Send reminder
- Open related Milestone

**Key States**

- Draft
- Open
- Overdue
- Completed
- Reopened
- Cancelled
- Read-only

**Screen Dependencies**

- Action record
- Submission
- Permission rules

**Canonical Demo Use**

ACT-004 demonstrates initial submission, agency reopen note, and final accepted response.

---

### AG-14 — Client Action Composer

**Product Area:** Agency Project
**Surface Type:** Route-Backed Contextual Composer
**Conceptual Route:** `/agency/projects/:projectId/delivery/actions/new` and `/edit`
**Available To:** Agency Owner, assigned Delivery Manager; Agency Member may prepare Draft
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Wide Drawer; Mobile Full Screen

**Primary Purpose**

Create or edit a Client Action without losing the Milestone or Client Actions context from which the work began.

**Entry Points**

- Client Actions → New
- Milestone Detail → Add Client Action
- Project Overview contextual action
- Direct composer route

**Core Content**

- Source Project and Milestone context
- Action type
- Title and instructions
- Assignee
- Due date
- Required status
- Blocks Progress
- Client-facing preview

**Primary Action**

- Save Draft or publish when authorized.

**Secondary Actions**

- Cancel and return to the source context
- Switch the related Milestone before publication

**Key States**

- New
- Draft
- Validation error
- Publishing
- Published
- Save failure
- Direct-route full-page fallback

**Screen Dependencies**

- Client members
- Milestones
- Draft persistence
- Route-backed overlay behavior
- Publish Action interaction

**Canonical Demo Use**

## Can reproduce an onboarding file-upload Action. When opened contextually on desktop it uses a wide side drawer; direct links and mobile use a full-screen presentation.

### AG-15 — Agency Deliverables

**Product Area:** Agency Project
**Surface Type:** Collection
**Conceptual Route:** `/agency/projects/:projectId/deliverables`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Organize reviewable work by current state while keeping Milestone and Version context visible.

**Entry Points**

- Project navigation → Deliverables
- Project Overview attention
- Milestone Detail

**Core Content**

- Draft
- Awaiting Decision
- Revision Requested
- Revision In Progress
- Approved
- Milestone and type filters

**Primary Action**

- Open the Deliverable that requires agency attention.

**Secondary Actions**

- Create Deliverable
- Filter
- Open current Version

**Key States**

- Populated
- No Deliverables
- No filter results
- Loading
- Read-only

**Screen Dependencies**

- Deliverable state
- Version state
- Milestone relation

**Canonical Demo Use**

Shows five approved Kestrelon Deliverables and historical revision counts.

---

### AG-16 — Agency Deliverable Detail

**Product Area:** Agency Project
**Surface Type:** Hub
**Conceptual Route:** `/agency/projects/:projectId/deliverables/:deliverableId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Provide the persistent container for Versions, review history, Decisions, Comments, Revisions, and linked Change Requests.

**Entry Points**

- Deliverables
- Milestone Detail
- Activity
- Project Overview attention

**Core Content**

- Identity
- Review context
- Current Version
- Version history
- Decision history
- Revision history
- Comment summary
- Linked Change Request

**Primary Action**

- Open or prepare the current relevant Version.

**Secondary Actions**

- Add Version
- Open Revision Request
- Open linked Change Request
- Reopen approved Deliverable when authorized

**Key States**

- Draft
- Awaiting Decision
- Revision Requested
- Revision In Progress
- Approved
- Reopened
- Read-only

**Screen Dependencies**

- Deliverable and Version state
- Revision relationships
- Permissions

**Canonical Demo Use**

Homepage Visual Direction exposes v1 Revision Requested and v2 Approved from one persistent record.

---

### AG-17 — Deliverable Version Composer

**Product Area:** Agency Project
**Surface Type:** Composer / Preview
**Conceptual Route:** `/agency/projects/:projectId/deliverables/:deliverableId/versions/new`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member for Draft preparation
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Prepare an immutable review snapshot with asset, instructions, and due date before publication.

**Entry Points**

- Deliverable Detail → Add Version
- Revision Request → Prepare replacement

**Core Content**

- Version type
- Asset or external link
- Version label
- Review instructions
- Review due date
- Client preview

**Primary Action**

- Publish Version when authorized.

**Secondary Actions**

- Save Draft
- Replace asset before publication
- Cancel

**Key States**

- New
- Uploading
- Draft
- Preview
- Validation blocked
- Publish conflict
- Published

**Screen Dependencies**

- File handling
- Version numbering
- Publish Version interaction

**Canonical Demo Use**

Supports creation of Homepage Visual Direction v2 and Staging Build v2.

---

### AG-18 — Agency Image Review Workspace

**Product Area:** Agency Project
**Surface Type:** Review Workspace
**Conceptual Route:** `/agency/projects/:projectId/deliverables/:deliverableId/versions/:versionId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop/Tablet Primary; Mobile Mode-Based

**Primary Purpose**

Review an image Version with full historical, shared, and internal context while keeping the asset visually dominant.

**Entry Points**

- Deliverable Detail
- Activity
- Revision Request source
- Deep link

**Core Content**

- Persistent Version and status bar
- Primary image canvas with zoom and pin markers
- Persistent desktop Comment panel with Shared and Agency-only visibility filters
- Pin list and active thread
- Compact Version history and review instructions
- Decision and historical state
- Mobile Canvas, Comments, and Details modes

**Primary Action**

- Respond to or resolve the highest-priority Comment.

**Secondary Actions**

- Add shared Comment
- Add agency-only note
- Resolve Comment
- Switch Version
- Open Decision or Revision history
- Return to the current Version

**Key States**

- Current Awaiting Decision
- Historical Revision Requested
- Approved
- Stale
- Unavailable asset
- Read-only
- Mobile pin thread open

**Screen Dependencies**

- Image asset
- Comments and visibility
- Version history
- Review Decision
- Preserved zoom and selected-pin state

**Canonical Demo Use**

## Signature screen: Homepage Visual Direction v1 with three shared pins, one internal note, and preserved Revision Requested history.

### AG-19 — Agency File or Link Version Detail

**Product Area:** Agency Project
**Surface Type:** Review Detail
**Conceptual Route:** `/agency/projects/:projectId/deliverables/:deliverableId/versions/:versionId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Present file or external-link review context without pretending the external resource is immutable.

**Entry Points**

- Deliverable Detail
- Activity
- Deep link

**Core Content**

- File or link identity
- Metadata
- Review instructions
- General Comments
- Version history
- Decision state
- External-resource warning

**Primary Action**

- Open the asset or respond to review discussion.

**Secondary Actions**

- Download file
- Open controlled preview
- Comment
- Switch Version

**Key States**

- Current
- Historical
- Approved
- Revision Requested
- Unavailable external resource
- Read-only

**Screen Dependencies**

- File authorization
- Controlled preview links
- Comments and Decisions

**Canonical Demo Use**

Responsive Staging Build v1/v2 and approved PDF Deliverables use this family.

---

### AG-20 — Agency Revision Request Detail

**Product Area:** Agency Project
**Surface Type:** Decision Detail
**Conceptual Route:** `/agency/projects/:projectId/revisions/:revisionRequestId`
**Available To:** Agency Owner, assigned Delivery Manager; assigned Agency Member read access as permitted
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Let the agency understand a client revision request and classify its scope impact without losing review context.

**Entry Points**

- Delivery attention
- Project Overview attention
- Deliverable Detail
- Version Decision history

**Core Content**

- Source Version
- Client summary
- Related Comments
- Classification state
- Client-visible note
- Agency-only note
- Clarification
- Linked Change Request
- Resolution history

**Primary Action**

- Classify an open Revision Request.

**Secondary Actions**

- Open source Version
- Create linked Change Request
- Ask clarification
- Open resolution history

**Key States**

- Unclassified
- In Scope
- Needs Clarification
- Potential Scope Change
- Resolved
- Read-only

**Screen Dependencies**

- Review Decision
- Comment context
- Classification rules

**Canonical Demo Use**

RR-002 demonstrates Potential Scope Change and links directly to CR-001.

---

### AG-21 — Changes

**Product Area:** Agency Project
**Surface Type:** Collection
**Conceptual Route:** `/agency/projects/:projectId/changes`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member with read access
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

List Project Change Requests and make commercial decision state visible.

**Entry Points**

- Project navigation → Changes
- Project Overview attention
- Revision Request link

**Core Content**

- Title
- Related Revision or Milestone
- State
- Decision deadline
- Cost impact
- Timeline impact
- Decision

**Primary Action**

- Open the active or most recent Change Request.

**Secondary Actions**

- Create Change Request when authorized
- Filter by state

**Key States**

- No Changes
- Draft
- Sent
- Accepted
- Rejected
- Applied
- Withdrawn
- Closed

**Screen Dependencies**

- Change Request lifecycle
- Project access

**Canonical Demo Use**

Contains CR-001 as Accepted and Applied.

---

### AG-22 — Change Request Composer

**Product Area:** Agency Project
**Surface Type:** Composer / Client Preview
**Conceptual Route:** `/agency/projects/:projectId/changes/new and /edit`
**Available To:** Agency Owner, assigned Delivery Manager
**Demo Priority:** P1 Core
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Create a formal, client-readable impact proposal without turning StudioFlow into invoicing or contracting.

**Entry Points**

- Changes → New
- Revision Request → Create Change Request

**Core Content**

- Reason
- Requested change
- Scope impact
- Timeline impact
- Optional cost impact
- Currency
- Deadline
- Linked Revision
- Client preview

**Primary Action**

- Send Change Request.

**Secondary Actions**

- Save Draft
- Return to Revision Request
- Cancel

**Key States**

- New
- Draft
- Validation blocked
- Preview
- Sending
- Sent
- Error

**Screen Dependencies**

- Project currency
- Revision link
- Send interaction

**Canonical Demo Use**

Can reproduce CR-001 with €3,600 and five-business-day impact.

---

### AG-23 — Agency Change Request Detail

**Product Area:** Agency Project
**Surface Type:** Decision Record
**Conceptual Route:** `/agency/projects/:projectId/changes/:changeRequestId`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member with read access
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Show the complete scope decision, client response, and explicit application history.

**Entry Points**

- Changes
- Revision Request
- Activity
- Project Overview attention

**Core Content**

- Reason
- Scope impact
- Timeline impact
- Cost impact
- Deadline
- Client Decision
- Decision note
- Application state
- Related Revision

**Primary Action**

- Apply an accepted Change Request when not yet applied.

**Secondary Actions**

- Withdraw before decision
- Open related Revision
- Open affected schedule

**Key States**

- Draft
- Sent
- Accepted
- Rejected
- Applied
- Withdrawn
- Closed
- Read-only

**Screen Dependencies**

- Change Request lifecycle
- Client Decision
- Application effects

**Canonical Demo Use**

CR-001 shows Accepted by Elena and Applied by Daniel with target date updated to May 29.

---

### AG-24 — Agency Project Activity

**Product Area:** Agency Project
**Surface Type:** Timeline
**Conceptual Route:** `/agency/projects/:projectId/activity`
**Available To:** Agency Owner, assigned Delivery Manager, assigned Agency Member
**Demo Priority:** P1 Core
**Responsive Importance:** Responsive Required

**Primary Purpose**

Provide a Project-scoped chronological record of meaningful client-visible and agency-only events.

**Entry Points**

- Project navigation → Activity
- Project Overview preview

**Core Content**

- Event timeline
- Actor
- Time
- Visibility
- Category filters
- Source links

**Primary Action**

- Open an event’s source object.

**Secondary Actions**

- Filter by category
- Show client-visible only

**Key States**

- Populated
- No events
- Filtered empty
- Loading
- Read-only

**Screen Dependencies**

- Activity events
- Visibility boundary
- Object links

**Canonical Demo Use**

Kestrelon timeline covers kickoff through Handoff publication without passive page views.

---

### AG-25 — Agency Handoff Workspace

**Product Area:** Agency Project
**Surface Type:** Workspace with Embedded Item Editor
**Conceptual Route:** `/agency/projects/:projectId/handoff`
**Available To:** Agency Owner, assigned Delivery Manager; assigned Agency Member read-only where permitted
**Demo Priority:** P0 Signature
**Responsive Importance:** Desktop Primary; Tablet Required

**Primary Purpose**

Prepare, publish, monitor, and complete the final Project delivery package without turning each Handoff Item into a separate Screen.

**Entry Points**

- Project navigation → Handoff
- Project Overview primary action

**Core Content**

- Handoff state
- Introduction and instructions
- Inline ordered Handoff Item collection
- Type-aware local Item editor
- Required or optional markers
- Item-level client preview and access validation
- Overall Client Handoff preview
- Acknowledgment due date and state
- Completion controls

**Primary Action**

- Publish Handoff or complete Project according to current state.

**Secondary Actions**

- Add, edit, reorder, or withdraw an Item
- Preview the complete Client Handoff
- Validate file and link access
- Complete with override when eligible

**Key States**

- Not started
- Draft
- Item editor open
- Item validation failure
- Ready to publish
- Published pending
- Acknowledged
- Completed read-only

**Screen Dependencies**

- Handoff rules
- Type-aware Item fields
- File and link authorization
- Client preview
- Project completion

**Canonical Demo Use**

## HO-KES-001 is Published with six required Items and acknowledgment pending. Item creation uses a local side panel on desktop and a full-screen sheet on mobile.

### AG-26 — Project Settings — General

**Product Area:** Agency Project Settings
**Surface Type:** Settings
**Conceptual Route:** `/agency/projects/:projectId/settings`
**Available To:** Agency Owner, assigned Delivery Manager
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Manage Project identity, dates, Delivery Manager, and Client Approver outside delivery navigation.

**Entry Points**

- Project utility menu → Settings

**Core Content**

- Title
- Client-facing summary
- Target completion
- Delivery Manager
- Client Approver

**Primary Action**

- Save permitted Project settings.

**Secondary Actions**

- Reassign role through confirmation
- Return to Project

**Key States**

- Editable
- Read-only completed
- Validation error
- Save conflict

**Screen Dependencies**

- Project settings
- Atomic reassignment rules

**Canonical Demo Use**

Kestrelon shows Daniel and Elena as required authorities.

---

### AG-27 — Project Settings — People & Access

**Product Area:** Agency Project Settings
**Surface Type:** Settings / People & Access
**Conceptual Route:** `/agency/projects/:projectId/settings/people`
**Available To:** Agency Owner, assigned Delivery Manager
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Manage Project participation, invitation state, decision authority, and access from one destination while keeping agency assignment and client authentication conceptually distinct.

**Entry Points**

- Project Settings → People & Access
- Missing authority warning
- Pending or expired invitation state

**Core Content**

- Agency Team section
- Client Participants section
- Client Approver and decision authority
- Project role labels
- Invitation and access state
- Resend, revoke, and reassignment controls

**Primary Action**

- Add a person or resolve the highest-priority access issue.

**Secondary Actions**

- Reassign Client Approver
- Resend invitation
- Remove Project access
- Remove an eligible Project member

**Key States**

- Healthy access
- Pending invitation
- Expired invitation
- Revoked access
- No Client Contributors
- Missing decision authority
- Removal blocked
- Read-only

**Screen Dependencies**

- Project memberships
- Invitation lifecycle
- Access rules
- Atomic Client Approver reassignment

**Canonical Demo Use**

## Kestrelon shows Priya and Theo in Agency Team, Marcus and Nia as Client Contributors, and Elena as the active Client Approver.

### AG-28 — Project Settings — Lifecycle

**Product Area:** Agency Project Settings
**Surface Type:** Settings / Destructive Actions
**Conceptual Route:** `/agency/projects/:projectId/settings/lifecycle`
**Available To:** Agency Owner, assigned Delivery Manager according to permission
**Demo Priority:** P2 Supporting
**Responsive Importance:** Responsive Required

**Primary Purpose**

Expose lifecycle transitions and destructive actions away from normal delivery work.

**Entry Points**

- Project Settings → Lifecycle
- Project utility menu

**Core Content**

- Current lifecycle
- Eligibility conditions
- Publish
- Enter Handoff
- Complete
- Cancel
- Archive
- Delete Draft

**Primary Action**

- Perform the valid selected lifecycle transition.

**Secondary Actions**

- Review transition consequences
- Return to Project

**Key States**

- Draft
- Onboarding
- Active
- Handoff
- Completed
- Cancelled
- Archived
- Transition blocked

**Screen Dependencies**

- Project lifecycle
- Completion conditions
- Override rules

**Canonical Demo Use**

Kestrelon allows completion after acknowledgment; Fieldnote demonstrates completed read-only.

---

## 10. Client Portal Screens

### CL-01 — Client Action Center

**Product Area:** Client Global
**Surface Type:** Collection / Home
**Conceptual Route:** `/portal`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P0 Signature
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Prioritize everything the current client user must complete or decide across assigned Projects.

**Entry Points**

- Client role landing
- Client navigation → Home
- Post-completion return

**Core Content**

- Greeting
- Prioritized attention cards
- Due dates
- Why action matters
- Project progress
- Recently completed
- Recent decisions

**Primary Action**

- Open the highest-priority action.

**Secondary Actions**

- Open Project
- Review recently completed work

**Key States**

- Canonical pending action
- Multiple actions
- All caught up
- Loading
- Partial failure

**Screen Dependencies**

- Authority-aware priority resolver
- Assigned obligations
- Projects

**Canonical Demo Use**

Elena sees one dominant final Handoff acknowledgment for Kestrelon due May 29.

---

### CL-02 — Client Projects

**Product Area:** Client Global
**Surface Type:** Collection
**Conceptual Route:** `/portal/projects`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

List the current user’s assigned open and historical Projects without exposing administrative lifecycle concepts.

**Entry Points**

- Client navigation → Projects
- All-caught-up Home

**Core Content**

- Open and Past groups
- Project title
- Agency
- Lifecycle
- Current Milestone
- Current user action
- Target date

**Primary Action**

- Open a Project.

**Secondary Actions**

- Switch Open/Past group

**Key States**

- One Project
- Multiple Projects
- No open Projects
- Past only
- Loading
- Error

**Screen Dependencies**

- Project membership
- Published/accessible lifecycle policy

**Canonical Demo Use**

Kestrelon appears Open; published Completed or Cancelled Projects can appear under Past.

---

### CL-03 — Client Project Overview

**Product Area:** Client Project
**Surface Type:** Hub
**Conceptual Route:** `/portal/projects/:projectId`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P0 Signature
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Explain current Project state and make the current user’s next action unmistakable.

**Entry Points**

- Client Projects
- Action Center Project link
- Activity source
- Post-decision return

**Core Content**

- Project identity
- Agency identity
- Lifecycle
- Current attention
- Progress
- Milestone timeline
- Recent decisions
- Recent activity

**Primary Action**

- Perform the current user’s primary Project action.

**Secondary Actions**

- Open Deliverables
- Open current Milestone
- Open Handoff or Change Request
- View full Activity

**Key States**

- Onboarding
- Active
- Handoff
- Completed read-only
- Cancelled read-only
- No current action

**Screen Dependencies**

- Project lifecycle
- Role-aware attention
- Published data boundary

**Canonical Demo Use**

Kestrelon shows Website live, 4 of 5 Milestones complete, and Review final Handoff.

---

### CL-04 — Client Milestone Detail

**Product Area:** Client Project
**Surface Type:** Contextual Detail
**Conceptual Route:** `/portal/projects/:projectId/milestones/:milestoneId`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Explain one Milestone’s purpose, dates, published responsibilities, Deliverables, and completion state.

**Entry Points**

- Project Overview timeline
- Client Action context
- Deliverable context

**Core Content**

- Purpose
- Dates
- Lifecycle
- Published Client Actions
- Published Deliverables
- Completion state

**Primary Action**

- Open the current user’s relevant Action or Deliverable.

**Secondary Actions**

- Return to Project Overview

**Key States**

- Planned
- Active
- Completed
- Cancelled
- No published items
- Read-only

**Screen Dependencies**

- Milestone visibility
- Published object filtering

**Canonical Demo Use**

Launch & Handoff connects the final Project phase to the Handoff package.

---

### CL-05 — Client Action Detail

**Product Area:** Client Project
**Surface Type:** Task Detail
**Conceptual Route:** `/portal/projects/:projectId/actions/:actionId`
**Available To:** Assigned Client Approver or Contributor; other Project members view-only when permitted
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Let the responsible client complete one clear text, upload, or confirmation Action.

**Entry Points**

- Action Center
- Project Overview
- Milestone Detail
- Email deep link
- Activity

**Core Content**

- Instructions
- Project and Milestone
- Assignee
- Due date
- Input control
- Submission history
- Reopen note

**Primary Action**

- Submit and complete the assigned Action.

**Secondary Actions**

- Download prior upload when allowed
- Return to Home or Project

**Key States**

- Open
- Overdue
- Submitting
- Completed
- Reopened
- Cancelled
- View-only
- Upload failure

**Screen Dependencies**

- Action type
- Assignment
- File upload
- Completion rules

**Canonical Demo Use**

ACT-004 provides the most complete reopened state; ACT-002 supports file upload.

---

### CL-06 — Client Deliverables

**Product Area:** Client Project
**Surface Type:** Collection
**Conceptual Route:** `/portal/projects/:projectId/deliverables`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Provide stable access to current and historical reviewable work from Project publication onward.

**Entry Points**

- Client Project navigation → Deliverables
- Project Overview
- Post-review return

**Core Content**

- Needs Attention
- In Revision
- Approved groups
- Milestone
- Current Version
- Decision state
- Due date
- Comment status

**Primary Action**

- Open the Deliverable that needs attention.

**Secondary Actions**

- Filter by Milestone or status

**Key States**

- Pre-publication empty
- Needs Attention
- In Revision
- All Approved
- Loading
- Error
- Read-only

**Screen Dependencies**

- Published Deliverables
- Role-specific decision need

**Canonical Demo Use**

Kestrelon shows five Approved Deliverables; historical revisions remain reachable.

---

### CL-07 — Client Deliverable Detail

**Product Area:** Client Project
**Surface Type:** Hub
**Conceptual Route:** `/portal/projects/:projectId/deliverables/:deliverableId`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Keep current review context, Version history, Comments, Decisions, and visible Revision classification together.

**Entry Points**

- Client Deliverables
- Milestone Detail
- Activity
- Project Overview attention

**Core Content**

- Review context
- Current Version
- Version history
- Shared Comments
- Decision history
- Client-visible Revision classification
- Linked Change Request

**Primary Action**

- Open the current Version.

**Secondary Actions**

- Open historical Version
- Open linked Change Request
- Return to Deliverables

**Key States**

- Awaiting Decision
- Revision Requested
- Revision In Progress
- Approved
- Read-only

**Screen Dependencies**

- Published Version history
- Client visibility rules

**Canonical Demo Use**

Homepage Visual Direction shows v1 Revision Requested and v2 Approved.

---

### CL-08 — Client Image Review Workspace

**Product Area:** Client Project
**Surface Type:** Review Workspace
**Conceptual Route:** `/portal/projects/:projectId/deliverables/:deliverableId/versions/:versionId`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P0 Signature
**Responsive Importance:** Mobile Mode-Based; Tablet/Desktop Preferred

**Primary Purpose**

Enable contextual image feedback while keeping the current Version, active Comment, and decision authority explicit on every viewport.

**Entry Points**

- Deliverable Detail
- Action Center decision card
- Email deep link
- Activity

**Core Content**

- Persistent Version and status context
- Image canvas with zoom and pins
- Persistent desktop Comment panel
- Shared Comment threads and pin list
- Compact Version history and review instructions
- Mobile Canvas, Comments, and Details modes
- Sticky mobile Decision bar for the Client Approver on the current Version

**Primary Action**

- Approver: approve or request revision. Contributor: add feedback.

**Secondary Actions**

- Reply
- Reopen own eligible Comment
- Switch Version
- Open a pin thread in the mobile sheet
- Return to the current Version

**Key States**

- Current Awaiting Decision
- Historical Revision Requested
- Approved
- Stale deep link
- Asset failure
- Read-only
- Mobile pin thread open

**Screen Dependencies**

- Image Comments
- Role authority
- Version state
- Preserved zoom and selected-pin state

**Canonical Demo Use**

## Signature review of Homepage Visual Direction. Client view never exposes COM-004 agency-only note.

### CL-09 — Client File or Link Review

**Product Area:** Client Project
**Surface Type:** Review Detail
**Conceptual Route:** `/portal/projects/:projectId/deliverables/:deliverableId/versions/:versionId`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Support file and controlled external-link review with general Comments and formal Decision inside StudioFlow.

**Entry Points**

- Deliverable Detail
- Action Center decision card
- Email deep link
- Activity

**Core Content**

- File/link identity
- Metadata
- Instructions
- General Comments
- Version history
- Decision state

**Primary Action**

- Approver: make the valid Decision. Contributor: add feedback.

**Secondary Actions**

- Download
- Open preview
- Reply
- Switch Version

**Key States**

- Awaiting Decision
- Approved
- Revision Requested
- Historical
- Unavailable link
- Read-only

**Screen Dependencies**

- Authorized files
- Controlled previews
- Review Decision

**Canonical Demo Use**

Responsive Staging Build and PDF Deliverables use this family.

---

### CL-10 — Client Revision Request Detail

**Product Area:** Client Project
**Surface Type:** Contextual Decision Detail
**Conceptual Route:** `/portal/projects/:projectId/revisions/:revisionRequestId`
**Available To:** Client Approver, Client Contributor with Project access
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Show what the client requested, how the agency classified it, and whether clarification or a Change Request is required.

**Entry Points**

- Deliverable Detail
- Version history
- Activity
- Clarification email

**Core Content**

- Source Version
- Client summary
- Related shared Comments
- Client-visible classification
- Clarification question/response
- Linked Change Request
- Resolution state

**Primary Action**

- Submit clarification when requested.

**Secondary Actions**

- Open source Version
- Open linked Change Request
- Return to Deliverable

**Key States**

- Open
- Needs Clarification
- In Scope
- Potential Scope Change
- Resolved
- Read-only

**Screen Dependencies**

- Revision classification
- Visibility boundary
- Change Request link

**Canonical Demo Use**

RR-001 shows In Scope; RR-002 shows Potential Scope Change linked to CR-001.

---

### CL-11 — Client Change Request Detail

**Product Area:** Client Project
**Surface Type:** Binding Decision Detail
**Conceptual Route:** `/portal/projects/:projectId/changes/:changeRequestId`
**Available To:** Client Approver; Client Contributor view-only
**Demo Priority:** P0 Signature
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Present a scope decision in clear business language with authority-aware controls.

**Entry Points**

- Action Center
- Project Overview
- Revision Request
- Activity
- Email deep link

**Core Content**

- Decision required
- Requested change
- Reason outside scope
- Scope impact
- Timeline impact
- Cost impact
- Deadline
- Decision history

**Primary Action**

- Client Approver accepts or rejects an active request.

**Secondary Actions**

- Add optional note
- Open related Revision or Project context

**Key States**

- Sent
- Accepted
- Rejected
- Applied
- Withdrawn
- Late decision
- Contributor view-only
- Read-only

**Screen Dependencies**

- Client authority
- Change Request lifecycle
- Project currency

**Canonical Demo Use**

CR-001 shows €3,600, five business days, Elena’s acceptance, and Applied state.

---

### CL-12 — Client Project Activity

**Product Area:** Client Project
**Surface Type:** Timeline
**Conceptual Route:** `/portal/projects/:projectId/activity`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P1 Core
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Provide a transparent Project-scoped history of client-visible delivery events and Decisions.

**Entry Points**

- Client Project navigation → Activity
- Project Overview preview

**Core Content**

- Event
- Actor
- Time
- Related object
- Decision or state

**Primary Action**

- Open the event’s source object.

**Secondary Actions**

- Return to Project Overview

**Key States**

- Populated
- No events
- Loading
- Read-only

**Screen Dependencies**

- Client-visible Activity events
- Source links

**Canonical Demo Use**

Kestrelon shows publication, Decisions, classifications, Change Request, launch, and Handoff.

---

### CL-13 — Client Handoff

**Product Area:** Client Project
**Surface Type:** Final Delivery Workspace
**Conceptual Route:** `/portal/projects/:projectId/handoff`
**Available To:** Client Approver, Client Contributor
**Demo Priority:** P0 Signature
**Responsive Importance:** Mobile Critical

**Primary Purpose**

Present the final package as a coherent conclusion and allow the authorized client to acknowledge receipt.

**Entry Points**

- Action Center
- Project Overview
- Activity
- Email deep link

**Core Content**

- Final message
- Published Items
- Required markers
- Instructions
- Support window
- Acknowledgment due date
- Acknowledgment state

**Primary Action**

- Client Approver acknowledges final Handoff.

**Secondary Actions**

- Open or download Item
- Return to Project
- Contributor views without acknowledgment control

**Key States**

- Published pending
- Acknowledging
- Acknowledged
- Completed read-only
- Unavailable Item
- Access error

**Screen Dependencies**

- Handoff publication
- Authorized files and links
- Client authority
- Project completion

**Canonical Demo Use**

Canonical final action: Elena reviews six required Kestrelon Items and acknowledgment remains pending.

---

## 11. Focused Interaction Inventory

Focused interactions are binding Decisions, publications, exceptional overrides, or destructive mutations.

They may be implemented as dialogs, drawers, sheets, or dedicated confirmation steps.

The chosen surface must:

- Keep the object and Project context visible
- State the exact consequence
- Identify the acting authority
- Prevent duplicate submission
- Provide accessible keyboard and mobile behavior
- Record success or failure clearly

| ID     | Interaction                     | Recommended Surface                        | Authority                       | Origin Screen                  | Required Confirmation Content                                                                                |
| ------ | ------------------------------- | ------------------------------------------ | ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| INT-01 | Publish Project                 | Confirmation step                          | Agency Owner / Delivery Manager | Project Setup                  | Show missing requirements; confirm Client access begins; publish into Onboarding.                            |
| INT-02 | Publish Client Action           | Confirmation step                          | Agency Owner / Delivery Manager | Client Action Composer         | Confirm assignee, due date, blocking effect, and email notification.                                         |
| INT-03 | Send Manual Reminder            | Compact confirmation                       | Agency Owner / Delivery Manager | Client Action Detail           | Name recipient, Action, due state, and reminder consequence.                                                 |
| INT-04 | Reopen Client Action            | Dialog or mobile sheet                     | Agency Owner / Delivery Manager | Agency Client Action Detail    | Require a client-visible explanation and preserve prior submission.                                          |
| INT-05 | Publish Deliverable Version     | Confirmation step                          | Agency Owner / Delivery Manager | Version Composer               | Confirm Version, review due date, current-Version effect, and notification.                                  |
| INT-06 | Withdraw Published Version      | Destructive confirmation                   | Agency Owner / Delivery Manager | Version Detail                 | Explain visibility and preserve historical publication event.                                                |
| INT-07 | Resolve or Reopen Comment       | Inline confirmation where needed           | Authorized Comment participants | Review Workspace               | Preserve thread and resolution history.                                                                      |
| INT-08 | Approve Version                 | Decision dialog / mobile full-screen sheet | Client Approver                 | Client Review Workspace        | Name Deliverable and Version; warn about unresolved shared Comments; record immutable Decision.              |
| INT-09 | Request Revision                | Decision dialog / mobile full-screen sheet | Client Approver                 | Client Review Workspace        | Require revision summary; preserve open Comments; create Revision Request.                                   |
| INT-10 | Classify Revision Request       | Focused form                               | Agency Owner / Delivery Manager | Agency Revision Request Detail | Choose In Scope, Needs Clarification, or Potential Scope Change; separate client-visible and internal notes. |
| INT-11 | Send Clarification Question     | Focused form                               | Agency Owner / Delivery Manager | Revision Request Detail        | Publish one focused question and create a client obligation.                                                 |
| INT-12 | Send Change Request             | Confirmation step                          | Agency Owner / Delivery Manager | Change Request Composer        | Confirm client-facing scope, timeline, cost, deadline, and Approver.                                         |
| INT-13 | Withdraw Change Request         | Destructive confirmation                   | Agency Owner / Delivery Manager | Change Request Detail          | Block future Decision and preserve withdrawal history.                                                       |
| INT-14 | Accept Change Request           | Decision dialog / mobile sheet             | Client Approver                 | Client Change Request Detail   | Repeat scope, cost, timeline, and exact Decision effect; clarify no payment is processed.                    |
| INT-15 | Reject Change Request           | Decision dialog / mobile sheet             | Client Approver                 | Client Change Request Detail   | Confirm original scope remains authoritative; allow optional note.                                           |
| INT-16 | Apply Accepted Change Request   | Confirmation step                          | Agency Owner / Delivery Manager | Agency Change Request Detail   | List Project fields that will change and record application event.                                           |
| INT-17 | Publish Handoff                 | Confirmation step                          | Agency Owner / Delivery Manager | Agency Handoff Workspace       | Confirm required Items, due date, Client Approver, and final client notification.                            |
| INT-18 | Acknowledge Handoff             | Decision dialog / mobile full-screen sheet | Client Approver                 | Client Handoff                 | Confirm access to required Items; clarify receipt rather than legal signature.                               |
| INT-19 | Complete Project                | Confirmation dialog                        | Agency Owner / Delivery Manager | Agency Handoff / Lifecycle     | Require acknowledged Handoff and explain read-only transition.                                               |
| INT-20 | Complete Without Acknowledgment | Exceptional confirmation                   | Agency Owner / Delivery Manager | Agency Handoff / Lifecycle     | Require reason; distinguish agency completion from client acknowledgment.                                    |
| INT-21 | Reassign Client Approver        | Atomic reassignment dialog                 | Agency Owner / Delivery Manager | Project Settings               | Select replacement before removing current authority; preserve prior Decisions.                              |
| INT-22 | Reassign Delivery Manager       | Atomic reassignment dialog                 | Agency Owner                    | Project Settings               | Select eligible replacement and preserve Project continuity.                                                 |
| INT-23 | Cancel Project                  | Destructive confirmation                   | Authorized agency role          | Project Lifecycle              | Require reason; explain read-only and client historical-access behavior.                                     |
| INT-24 | Archive Project                 | Confirmation dialog                        | Authorized agency role          | Project Lifecycle              | Remove from active views while preserving history.                                                           |
| INT-25 | Delete Eligible Draft           | Destructive confirmation                   | Agency Owner / Delivery Manager | Project Lifecycle              | Show eligibility rules and permanent deletion consequence.                                                   |
| INT-26 | Remove Project Access           | Destructive confirmation                   | Agency Owner / Delivery Manager | Client Access                  | Name member and Project; revoke immediately without erasing history.                                         |

---

## 12. Screen Relationship Map

### 12.1 Agency Core Path

```text
Delivery Overview
   ↓
Agency Project Overview
   ├── Delivery Plan
   │   ├── Milestones
   │   │   └── Milestone Detail
   │   └── Client Actions
   │       ├── Client Action Detail
   │       └── Client Action Composer
   ├── Deliverables
   │   └── Deliverable Detail
   │       ├── Version Composer
   │       ├── Image Review Workspace
   │       ├── File or Link Version Detail
   │       └── Revision Request Detail
   ├── Changes
   │   ├── Change Request Composer
   │   └── Change Request Detail
   ├── Activity
   ├── Handoff
   └── Project Settings
```

### 12.2 Client Core Path

```text
Client Action Center
   ↓
Client Project Overview
   ├── Milestone Detail
   ├── Client Action Detail
   ├── Deliverables
   │   └── Deliverable Detail
   │       ├── Image Review Workspace
   │       ├── File or Link Review
   │       └── Revision Request Detail
   ├── Change Request Detail
   ├── Activity
   └── Handoff
```

### 12.3 Scope-Control Path

```text
Client Review Workspace
   ↓
Request Revision
   ↓
Agency Revision Request Detail
   ↓
Potential Scope Change
   ↓
Agency Change Request Composer
   ↓
Client Change Request Detail
   ↓
Accept or Reject
   ↓
Agency Change Request Detail
   ↓
Apply
```

### 12.4 Final Delivery Path

```text
Agency Handoff Workspace
   ↓
Publish Handoff
   ↓
Client Action Center
   ↓
Client Handoff
   ↓
Acknowledge
   ↓
Agency Project Completion
```

---

## 13. Role Coverage

| Role               | Landing Screen          | Core Screens                                                      | Restricted Areas                                                                       |
| ------------------ | ----------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Agency Owner       | AG-01 Delivery Overview | All Agency Screens                                                | No Client binding Decisions                                                            |
| Delivery Manager   | AG-01 Delivery Overview | Assigned Project Screens                                          | Workspace branding and Agency role management                                          |
| Agency Member      | AG-02 Projects          | Assigned Project content and review Screens                       | Delivery Overview, publication, commercial Decisions, Project lifecycle administration |
| Client Approver    | CL-01 Action Center     | Assigned Client Project Screens and binding Decision interactions | Agency-only information and Workspace administration                                   |
| Client Contributor | CL-01 Action Center     | Assigned Actions, Deliverables, Comments, Activity, Handoff view  | Approval, Revision Decision, Change Request Decision, Handoff acknowledgment           |

### Role Presentation Rule

A Screen must not present disabled controls as a substitute for correct role design when the control is irrelevant to that role.

Prefer:

- Hiding unavailable creation actions
- Replacing Decision controls with clear authority information
- Showing who is responsible
- Preserving read access where allowed

---

## 14. Lifecycle Coverage

| Project Lifecycle | Agency Primary Screen                         | Client Primary Screen                            | Required Screen Behavior                                           |
| ----------------- | --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Draft             | AG-08 Project Setup                           | No Client Screen                                 | Agency-only; incomplete setup; publish requirements visible        |
| Onboarding        | AG-09 Project Overview / AG-12 Client Actions | CL-01 Action Center / CL-03 Project Overview     | Welcome context and assigned inputs dominate                       |
| Active            | AG-09 Project Overview                        | CL-03 Project Overview                           | Current Milestone, review, Decisions, and next step dominate       |
| Handoff           | AG-25 Handoff Workspace                       | CL-13 Client Handoff                             | Final package and acknowledgment dominate                          |
| Completed         | Read-only Agency Project Screens              | Read-only Client Project Screens                 | Mutation controls removed; history preserved                       |
| Cancelled         | Read-only Agency Project Screens              | Read-only Past Project when previously published | Cancellation state and permitted reason visible                    |
| Archived          | AG-02 Projects filter / read-only Project     | No separate Archived concept                     | Removed from active Agency views; historical access follows policy |

---

## 15. Product State Coverage

### 15.1 Collection States

Every collection Screen must define:

- Loading
- Populated
- Empty
- Filtered empty
- Error
- Permission-limited content
- Read-only historical state when applicable

### 15.2 Detail States

Every detail Screen must define:

- Loading
- Valid current record
- Historical record
- Missing or removed record
- Access denied
- Read-only lifecycle
- Concurrent state change
- Recoverable write failure

### 15.3 Review States

Review Screens must explicitly cover:

- Draft not client-visible
- Awaiting Decision
- Revision Requested
- Revision In Progress
- Approved
- Historical Version
- Stale deep link
- Unavailable external resource
- Unresolved shared Comments
- Missing Client Approver

### 15.4 Client Action States

- Draft
- Open
- Overdue
- Completing
- Completed
- Reopened
- Cancelled
- View-only
- Upload failure

### 15.5 Change Request States

- Draft
- Sent
- Accepted
- Rejected
- Applied
- Withdrawn
- Closed
- Late Decision
- Contributor view-only

### 15.6 Handoff States

- Not started
- Draft
- Ready to publish
- Published pending acknowledgment
- Acknowledging
- Acknowledged
- Completed read-only
- Item unavailable
- Completion without acknowledgment

---

## 16. Demo Priority and Screenshot Plan

### 16.1 Primary Portfolio Screens

The first visual design and implementation pass should prioritize:

1. AG-01 — Delivery Overview
2. AG-09 — Agency Project Overview
3. AG-18 — Agency Image Review Workspace
4. AG-20 — Agency Revision Request Detail
5. AG-23 — Agency Change Request Detail
6. AG-25 — Agency Handoff Workspace
7. CL-01 — Client Action Center
8. CL-03 — Client Project Overview
9. CL-08 — Client Image Review Workspace
10. CL-11 — Client Change Request Detail
11. CL-13 — Client Handoff

### 16.2 Canonical Walkthrough Mapping

| Walkthrough Step                            | Screen        |
| ------------------------------------------- | ------------- |
| See agency delivery health                  | AG-01         |
| Open Kestrelon Project                      | AG-09         |
| Inspect Visual Direction history and pins   | AG-16 → AG-18 |
| Understand scope classification             | AG-20         |
| Inspect accepted and applied Change Request | AG-23         |
| Switch to client attention                  | CL-01         |
| Understand client Project state             | CL-03         |
| Review final package                        | CL-13         |
| Confirm final acknowledgment                | INT-18        |

### 16.3 Secondary Demo Screens

Useful for expanding the walkthrough:

- AG-10 Delivery Plan — Milestones
- AG-12 Delivery Plan — Client Actions
- AG-13 Client Action Detail
- AG-15 Agency Deliverables
- AG-24 Agency Activity
- CL-06 Client Deliverables
- CL-07 Client Deliverable Detail
- CL-12 Client Activity

### 16.4 Controlled State Screens

These states should be available for QA or a secondary case-study gallery, not the primary walkthrough:

- SH-04 Access Denied
- SH-05 Link Recovery
- AG-27 Missing Client Approver
- Stale Version
- Withdrawn Change Request
- Cancelled Project
- Archived Project
- Completion without acknowledgment

---

## 17. Responsive Requirements by Product Area

### 17.1 Client Portal

The complete Client workflow must be usable on mobile:

- Find the next action
- Complete Client Action
- Read Project status
- Review Deliverable context
- Comment
- Approve or request revision
- Decide Change Request
- Review and acknowledge Handoff

### 17.2 Agency Workspace

Mobile must support:

- Reading Project health
- Opening attention items
- Viewing Project context
- Reading Comments and Decisions
- Sending a manual reminder
- Performing urgent simple actions

Desktop or tablet may remain primary for:

- Project Setup
- Dense Delivery Overview
- Image review with many pins
- Deliverable Version composition
- Change Request composition
- Handoff composition
- Workspace Branding

### 17.3 Responsive Degradation Rule

Smaller viewports may:

- Collapse navigation
- Reduce supporting metadata
- Move secondary actions into overflow menus
- Stack dense comparison areas
- Open focused interactions full-screen

They may not:

- Hide the current Version identity
- Hide Decision consequence
- Hide the responsible person
- Remove due dates
- Make a binding action depend on hover
- Expose internal content

---

## 18. Screen Dependency Matrix

| Screen Group            | Depends On                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| Delivery Overview       | Project access, lifecycle, health, obligations, recent Activity       |
| Project Overview        | Project identity, Membership, Milestone, attention resolver, Activity |
| Delivery Plan           | Milestones, Client Actions, Deliverable completion conditions         |
| Deliverables            | Deliverable and Version state, Comments, Decisions                    |
| Revision Request        | Review Decision, source Version, Comments, classification             |
| Change Request          | Project context, optional Revision Request, Client Approver           |
| Handoff                 | Eligible Project state, Handoff Items, Client Approver                |
| Client Action Center    | Assigned obligations, authority, deadlines, Project access            |
| Client Project Overview | Published Project context, current user authority, Milestone progress |
| Client Review           | Published current Version, shared Comments, Client Approver authority |
| Activity                | Immutable Project events and visibility classification                |
| Settings                | Workspace or Project authority and lifecycle rules                    |

---

## 19. Screen Completion Criteria

A Screen is not complete merely because its default layout exists.

Every implemented Screen must satisfy:

### 19.1 Information

- Displays the correct role-scoped data
- Identifies Project or Workspace context
- Shows authoritative status
- Shows due date or decision state when relevant
- Preserves historical context

### 19.2 Actions

- Presents one clear primary action when action is required
- Hides or replaces unauthorized actions
- Provides success and failure feedback
- Prevents duplicate binding Decisions
- Handles stale state safely

### 19.3 States

- Loading
- Empty when relevant
- Error
- Permission-limited
- Read-only
- Responsive behavior
- Keyboard and focus behavior

### 19.4 Demo Integrity

- Uses approved Sableframe and Kestrelon data
- Preserves dates from the fixed Demo Snapshot
- Does not invent unsupported metrics
- Does not expose internal notes to Client users
- Does not show dead external links or empty downloadable files

---

## 20. Screen Scope Boundaries

The MVP does not require Screens for:

- Global Approvals
- Global Deliverables
- Global Comments
- Global Change Requests
- Global Handoff Items
- Client global Activity
- Client global search
- Notification Center
- Billing
- Subscription management
- CRM pipeline
- Proposals
- Contracts
- Invoices
- Payment processing
- Time tracking
- Resource planning
- Internal task boards
- Chat
- Advanced analytics
- Custom workflow builder
- Multiple Approver chains
- External Reviewer access
- Video review
- PDF coordinate annotation
- AI features

Any request for these Screens must return to Product Specification and Information Architecture.

---

## 21. Design and Implementation Sequence

The Screen Inventory does not define engineering architecture, but it establishes a product-risk order.

### Phase A — Shells and Access

- SH-01
- SH-02
- Agency Shell
- Client Shell
- Role-based landing
- Access boundaries

### Phase B — Signature Read Surfaces

- AG-01
- AG-09
- CL-01
- CL-03
- AG-15 / AG-16
- CL-06 / CL-07

### Phase C — Review Workflow

- AG-17
- AG-18
- AG-19
- CL-08
- CL-09
- Comment interactions
- Approval and Revision Decisions

### Phase D — Scope Control

- AG-20
- AG-21
- AG-22
- AG-23
- CL-10
- CL-11

### Phase E — Delivery Plan and Handoff

- AG-10 through AG-14
- CL-04 and CL-05
- AG-25
- CL-13
- Project completion

### Phase F — Administration and Recovery

- Workspace Settings
- Project Settings
- Invitation recovery
- Access denied
- Cancelled and Archived states
- Exceptional overrides

This order prioritizes the product thesis before administrative breadth.

---

## 22. Screen Inventory Decisions

| Decision                                                                                 | Status   |
| ---------------------------------------------------------------------------------------- | -------- |
| Primary route-level Screens in MVP: 46                                                   | Approved |
| Focused interactions listed separately from Screens                                      | Approved |
| Agency and Client versions remain distinct Screens                                       | Approved |
| Image and file/link review use separate Screen families                                  | Approved |
| Delivery Plan uses one destination with Milestones and Client Actions views              | Approved |
| Workspace Settings use separate General, Branding, and Members Screens                   | Approved |
| Project Settings use General, People & Access, and Lifecycle Screens                     | Approved |
| Project Setup creates a minimal Draft before resumable setup continues                   | Approved |
| At least one Milestone is required before Project publication                            | Approved |
| Client Action Composer is route-backed: wide drawer on desktop and full-screen on mobile | Approved |
| Deliverable Version Composer remains a dedicated preparation and preview Screen          | Approved |
| Binding client Decisions use focused confirmation interactions                           | Approved |
| Agency global search uses a command-style overlay                                        | Approved |
| Dedicated Agency search-results Screen in MVP                                            | Rejected |
| Persistent search-results URL in MVP                                                     | Rejected |
| Desktop image review uses a persistent Comment panel                                     | Approved |
| Mobile image review uses Canvas, Comments, and Details modes                             | Approved |
| Handoff Items are managed inline with a type-aware local editor                          | Approved |
| Separate route-level Handoff Item Screen                                                 | Rejected |
| Project Members and Client Access remain separate Screens                                | Rejected |
| Project People & Access is one combined Settings Screen                                  | Approved |
| Client Deliverables remains visible before first publication                             | Approved |
| Completed and Cancelled Projects reuse Project Screens in read-only mode                 | Approved |
| Recovery and error conditions are states unless they require a safe destination          | Approved |
| P0 Signature Screens receive first visual and screenshot priority                        | Approved |

---

## 23. Resolved Review Decisions

### 23.1 Agency Global Search

Agency global search uses a command-style overlay opened from the Agency Shell.

The overlay:

- Searches Projects, Client Organizations, and Client Members
- Groups results by object type
- Supports keyboard navigation
- Shows a clear no-results state
- Navigates directly to durable destination Screens
- Respects Workspace, assignment, and role boundaries

The MVP does not require a dedicated search-results Screen or persistent search-results URL.

Search is a navigation accelerator rather than a separate Product Area.

### 23.2 Client Action Composer

The Client Action Composer is route-backed.

On desktop and tablet, contextual entry points open it as a wide side drawer so the source Milestone or Client Actions view remains visible.

On mobile, it opens full-screen.

When its URL is opened directly, the same composer may render as a full-page destination without losing Draft state.

This choice preserves context while supporting type-specific instructions, assignee selection, due date, blocking behavior, and client preview.

### 23.3 Project Setup and Milestone Creation

Project Setup begins by creating a minimal persistent Draft after the agency provides:

- Client Organization
- Project title
- Delivery Manager

The remaining setup continues in a resumable Project Setup Workspace.

Milestones are created after the minimal Draft exists but before publication.

A Project cannot be published into Onboarding without:

- One Client Approver
- Required Project members
- Client-facing summary
- Target date when required
- At least one Milestone

The Client Portal preview becomes available after the minimum client-facing context and first Milestone exist.

Preview does not create Client access. Client access begins only when the Project is published.

### 23.4 Image Review Workspace

Desktop and tablet use three stable structural regions:

1. Version and status context
2. Primary image canvas
3. Persistent Comment panel

The Comment panel contains:

- Pin list
- Active thread
- Shared Comment context
- Agency-only visibility controls for agency users

Version history and review instructions remain compact but immediately reachable.

Mobile does not attempt to preserve a split-screen layout.

It uses three modes:

- Canvas
- Comments
- Details

Selecting a pin from the Canvas opens its thread in a full-height bottom sheet and preserves zoom and selected-pin state when the user returns.

For a Client Approver reviewing the current Version, Decision controls remain available through a sticky mobile action bar.

Historical Versions remain clearly read-only.

### 23.5 Handoff Item Composition

The Agency Handoff Workspace keeps the Handoff Item list inline so order, required status, and package completeness remain visible.

Adding or editing an Item opens a type-aware local editor:

- Side panel on desktop
- Full-screen sheet on mobile

This editor is not a separate route-level Screen.

Every Item type requires client-facing preview before Handoff publication:

- Downloadable files show identity, metadata, and authorized-access validation.
- External links show label, destination context, and availability validation.
- Documentation shows formatted client-facing content.
- Confirmation Items show the exact statement the client will acknowledge.

The complete Handoff also requires one overall Client Portal preview before publication.

### 23.6 Project People and Access

Project Members and Client Access are combined into one Screen:

> Project Settings — People & Access

The Screen contains three distinct sections:

1. Agency Team
2. Client Participants
3. Decision Authority and Access

This keeps invitation state and access controls beside the people they affect while preserving the distinction between:

- Project participation
- Client authentication
- Binding decision authority

Lifecycle actions remain on a separate Settings Screen.

The merge reduces the primary inventory from 47 to 46 Screens without removing any capability.

### 23.7 Final Inventory Size

The approved MVP inventory contains:

- 46 primary Screens
- 26 focused decision or mutation interactions

No resolved decision requires reopening Information Architecture or Product Specification.

---

## 24. Approval Criteria

This Screen Inventory is ready for approval when:

- Every approved IA destination has a Screen.
- No Screen introduces an unapproved Product Area.
- Role availability matches the Permission Model.
- Agency and Client information boundaries remain distinct.
- Every binding Decision has a focused interaction.
- Every primary workflow has a complete Screen path.
- Project lifecycle states can reuse stable Screens without navigation changes.
- Completed and Cancelled read-only behavior is represented.
- Empty, loading, error, stale, and access states are covered.
- Mobile-critical Client workflows are explicitly identified.
- P0 Signature Screens cover the complete portfolio story.
- Supporting Demo Projects do not require unnecessary full-fidelity Screens.
- Conceptual routes preserve deep-link intent.
- The inventory can produce Visual Direction and Engineering route planning without reopening IA.

All criteria are satisfied.

---

## 25. Approval Decision

**Decision:** Approved

The Screen Inventory is approved because:

- All approved Information Architecture destinations are represented.
- The final inventory is limited to 46 primary Screens.
- Search remains a lightweight navigation overlay rather than a new Product Area.
- Contextual composers preserve source context without creating unnecessary Screens.
- Project Setup supports early Draft persistence and resumable completion.
- Image review has a clear desktop and mobile interaction model.
- Handoff composition remains coherent without per-Item route expansion.
- Project participation and Client access are consolidated without weakening permission boundaries.
- Every binding Decision and exceptional mutation has an explicit focused interaction.
- Agency and Client Screens remain structurally and informationally distinct.
- P0 Screens cover the full portfolio walkthrough.
- No unresolved Screen-level question blocks Visual Direction.

---

## 26. Next Document

After approval, the next document is:

- `docs/product/07-visual-direction.md`

Visual Direction must define:

- Brand relationship between StudioFlow, agency branding, and Client Portal
- Visual principles
- Color system
- Typography
- Density
- Elevation and borders
- Status presentation
- Agency and Client differentiation
- Signature Screen composition
- Review Workspace visual behavior
- Responsive visual priorities
- Motion principles
- Accessibility guardrails

Visual Direction must design the approved Screens without changing their purpose or hierarchy.
