# StudioFlow

# Information Architecture

## Document Information

**Document Type:** Information Architecture

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`
- `docs/product/03-product-specification.md`
- `docs/product/04-demo-narrative.md`

**Includes:**

- Information Architecture Principles
- Product Shells
- Product Areas
- Navigation Model
- Agency Hierarchy
- Client Hierarchy
- Project Information Model
- Object Placement
- Entry Points
- Deep-Link Behavior
- Action Paths
- Decision Paths
- Lifecycle-Aware Navigation
- Cross-Role Visibility
- Search and Filtering
- Empty, Error, and Read-Only States
- Route Model
- Information Architecture Decisions

**Produces:**

- Screen Inventory
- Page Relationships
- Navigation Components
- Layout Requirements
- Content Hierarchy
- Interaction Entry Points
- Visual Direction Inputs
- Engineering Route Planning

---

## 1. Executive Summary

StudioFlow has two distinct authenticated product experiences:

1. **Agency Workspace**
2. **Client Portal**

These experiences share the same underlying projects and delivery records, but they do not share the same navigation model or information priority.

The Agency Workspace is organized around operational control.

It helps agency users answer:

- Which projects need attention?
- Which projects are waiting on clients?
- What must the agency publish, classify, or resolve?
- Which client decisions are pending?
- Where is delivery risk accumulating?

The Client Portal is organized around attention and confidence.

It helps client users answer:

- What requires my action?
- Where is the project now?
- What am I reviewing?
- What has already been decided?
- What happens next?

The core architectural distinction is:

> Agency users navigate from portfolio to project operations.
> Client users navigate from required attention to project context.

StudioFlow must not expose clients to a reduced copy of the Agency Workspace.

The Client Portal requires a smaller, calmer architecture that prioritizes current actions and project understanding over administrative breadth.

The primary information hierarchy is:

```text
Agency Workspace
   ├── Delivery Overview
   ├── Projects
   ├── Client Organizations
   └── Workspace Settings

Client Portal
   ├── Action Center
   └── Projects
```

Within both experiences, the **Project** is the central shared context.

However, the Project is presented differently to each audience.

The Agency Project Workspace exposes:

- Overview
- Delivery Plan
- Deliverables
- Changes
- Activity
- Handoff
- Project Settings

The Delivery Plan contains two coordinated views:

- Milestones
- Client Actions

The Client Project Portal exposes only:

- Overview
- Deliverables
- Activity

Client Actions, Change Requests, and Handoff remain fully accessible, but they are reached through attention cards, project context, milestone content, and direct links rather than through a dense mirrored navigation system.

This architecture preserves product focus:

- Client Actions remain visible where responsibility is clear.
- Review Decisions remain attached to Deliverable Versions.
- Revision Requests remain attached to Deliverable review history.
- Change Requests remain project-level commercial decisions.
- Handoff remains the final project-level delivery experience.
- Activity remains a record, not a communication inbox.
- Internal production work remains outside StudioFlow.

---

## 2. Information Architecture Objective

The objective of this document is to translate the approved product behavior and Demo Narrative into a stable information structure.

The Information Architecture must define:

1. Which product environments exist
2. Which Product Areas belong to each environment
3. Which navigation items are global
4. Which navigation items are project-local
5. Where each Product Object lives
6. How users enter the product
7. How users move from attention to context
8. How formal decisions are reached
9. How information changes according to role and lifecycle
10. Which content remains visible after completion
11. Which page relationships must be represented in Screen Inventory
12. Which information must never cross agency and client boundaries

This document defines information structure and navigation behavior.

It does not define:

- Final page layout
- Component design
- Visual styling
- Responsive breakpoints
- Database routes
- Framework routing
- API structure
- Final copy for every screen

---

## 3. Information Architecture Principles

### 3.1 Two Experiences, One Source of Truth

The Agency Workspace and Client Portal use the same authoritative Project records.

They present different views of those records according to:

- Role
- Responsibility
- Visibility
- Decision authority
- Project lifecycle

No client-facing state may be maintained separately from the agency-facing state.

### 3.2 Attention Before Exploration

StudioFlow is not primarily a content-browsing product.

The first screen must help the user act.

For agency users, this means delivery exceptions and operational priorities.

For client users, this means assigned actions and pending decisions.

### 3.3 Project Context Before Object Lists

Milestones, Actions, Deliverables, Revision Requests, Change Requests, and Handoff Items exist inside Projects.

The architecture must preserve that context.

StudioFlow will not create global top-level areas for:

- All Deliverables
- All Comments
- All Revision Requests
- All Change Requests
- All Handoff Items

Cross-project exceptions may appear on the Delivery Overview, but detailed work remains inside the relevant Project.

### 3.4 Stable Navigation, Contextual Priority

Primary navigation should remain stable as a Project moves through its lifecycle.

The product should change:

- Status messaging
- Primary calls to action
- Attention cards
- Available creation actions
- Read-only behavior

It should not repeatedly reorganize the entire navigation.

### 3.5 Decisions Stay With Their Subject

A formal decision must remain attached to the object it affects.

- Deliverable approval stays with the Deliverable Version.
- Revision classification stays with the Revision Request inside the Deliverable review context.
- Change Request acceptance stays with the Change Request.
- Handoff acknowledgment stays with the Handoff.

StudioFlow will not create a disconnected global “Approvals” archive in the MVP.

### 3.6 Client Simplicity Over Structural Symmetry

The Client Portal does not mirror every Agency Project section.

Client users reach important objects through:

- Action Center
- Project Overview
- Milestone context
- Direct notification links
- Deliverable history
- Activity history

The absence of a navigation item does not mean the object is inaccessible.

It means the object is reached through its purpose.

### 3.7 Historical Context Must Remain Reachable

Completed Milestones, superseded context, prior Versions, resolved Comments, and past Decisions must remain accessible.

Historical information should become visually subordinate, not disappear.

### 3.8 Internal Structure Must Stay Internal

Client users must never see:

- Agency-only notes
- Internal classification notes
- Operational override reasons marked internal
- Draft client-facing content
- Unpublished Versions
- Agency risk language
- Internal activity events
- Other client organizations
- Unassigned projects

### 3.9 Direct Links Must Preserve Intent

An email link to a Client Action, Deliverable, Change Request, or Handoff must return the authenticated user to that exact object after access is confirmed.

The product must not send the user to a generic dashboard and require rediscovery.

### 3.10 Navigation Labels Must Use Client Language

Labels visible to clients should describe recognizable project concepts.

Preferred labels include:

- Overview
- Deliverables
- Activity
- Review Handoff
- View Change Request
- Complete Action

Avoid exposing internal product vocabulary when a simpler client phrase is available.

---

## 4. Product Architecture Overview

```text
StudioFlow
│
├── Authentication and Access
│
├── Agency Workspace
│   ├── Delivery Overview
│   ├── Projects
│   ├── Client Organizations
│   ├── Workspace Settings
│   └── Agency Account
│
└── Client Portal
    ├── Action Center
    ├── Projects
    └── Client Account
```

The two shells must be visually related but structurally independent.

A user who belongs to an Agency Workspace and also participates as a client in another workspace must enter the correct context intentionally.

Automatic cross-context blending is outside the MVP.

---

## 5. Product Shells

## 5.1 Agency Workspace Shell

The Agency Workspace Shell provides:

- Workspace identity
- Global agency navigation
- Current user identity
- Role-aware creation actions
- Global project and client search
- Project-context breadcrumbs
- Workspace-level settings access

### Primary Global Navigation

The conceptual Agency destinations are:

1. Delivery
2. Projects
3. Clients

Rendered navigation is **capability-projected**, not a promise that every Agency role sees every destination. The server authorization model remains authoritative and the shell exposes only destinations the current actor may enter. This applies consistently to the desktop context navigation, mobile primary navigation, product-rail landing, search/command actions, and role-based landing.

For the approved MVP workspace roles:

- Agency Owner → Delivery, Projects, Clients
- Delivery Manager → Delivery, Projects, Clients, with object-detail access still constrained by assignment rules
- Agency Member → Projects only

A destination hidden from navigation remains protected at the route boundary. Hiding unauthorized navigation is a UX projection and never replaces server-side authorization.

### Utility Navigation

- Workspace settings
- Agency members
- Branding
- Account
- Sign out

Workspace settings and agency-member management are available only to Agency Owners.

They belong in a settings area or workspace menu, not in the primary delivery navigation.

### Primary Create Action

Authorized agency users may access:

> New project

Agency Owners and Delivery Managers may create Projects.

Client Organization creation may be available:

- During Project creation
- From the Clients area
- Through a contextual secondary action

### Agency Shell Principle

The Shell should prioritize delivery work.

It must not resemble a generic SaaS administration console.

---

## 5.2 Client Portal Shell

The Client Portal Shell provides:

- Agency branding
- Client identity
- Minimal global navigation
- Current-action visibility
- Project selection when multiple Projects exist
- Account access
- Sign out

### Primary Global Navigation

1. Home
2. Projects

`Home` represents the Client Action Center.

### Utility Navigation

- Account
- Sign out

The Client Portal MVP does not include:

- Global search
- Global activity
- Client organization settings
- User management
- Notification Center
- Workspace administration

### Client Shell Principle

The Client Shell must communicate:

> Here is what needs your attention, and here is the project context you need to act confidently.

---

## 6. Role-Based Landing Pages

## 6.1 Agency Owner

**Default Landing:** Delivery Overview

**Scope:** All Projects in the Agency Workspace

**Primary Needs:**

- Portfolio-level health
- Client-blocked work
- Overdue obligations
- Projects requiring agency intervention
- Recent client decisions

---

## 6.2 Delivery Manager

**Default Landing:** Delivery Overview

**Scope:** Assigned Projects only

**Primary Needs:**

- Operational priorities
- Client-blocked Projects
- Due and overdue obligations
- Revision Requests awaiting classification
- Change Requests awaiting client decision
- Handoffs awaiting acknowledgment

---

## 6.3 Agency Member

**Default Landing:** Assigned Projects

Agency Members do not have access to the Delivery Overview.

**Primary Needs:**

- Reach assigned Projects
- Access current Milestones
- Prepare Deliverable drafts
- Upload Versions
- Respond to Comments
- View relevant Decisions

The assigned-project list is a filtered form of the Projects area.

It must not expose workspace-wide health metrics.

---

## 6.4 Client Approver

**Default Landing:** Client Action Center

**Primary Needs:**

- Pending formal decisions
- Assigned Client Actions
- Change Requests awaiting decision
- Handoff awaiting acknowledgment
- Due dates
- Current Project context

Formal-decision items should receive higher priority than non-blocking informational content.

---

## 6.5 Client Contributor

**Default Landing:** Client Action Center

**Primary Needs:**

- Actions assigned directly to the user
- Deliverables open for participation
- Relevant Comment threads
- Current Project status
- Recently completed work

Contributor views must not imply formal decision authority.

---

## 7. Agency Global Navigation

## 7.1 Delivery

**Purpose:**

Provide an exception-focused operating view across accessible Projects.

**Contains:**

- Summary health counts
- Prioritized Project list
- Overdue Client Actions
- Projects Waiting on Client
- Agency-owned At Risk Projects
- Revision Requests awaiting classification
- Change Requests awaiting client decision
- Handoffs awaiting acknowledgment
- Recent client-visible Activity

**Does Not Contain:**

- Revenue analytics
- Resource utilization
- Time tracking
- General task management
- All historical activity
- Every Project Object

### Delivery Overview Hierarchy

```text
Delivery
├── Summary
├── Needs Attention
├── Active Projects
└── Recent Client Activity
```

The “Needs Attention” area should order items by operational urgency.

Suggested priority:

1. Overdue blocking client obligations
2. Security or access blockers
3. Client decisions past due
4. Projects Waiting on Client
5. Agency-owned At Risk Projects
6. Agency work awaiting classification or publication
7. Upcoming Handoff obligations

The exact visual arrangement belongs to Screen Inventory and Visual Direction.

---

## 7.2 Projects

**Purpose:**

Provide the complete list of Projects accessible to the current agency user.

### Project List Categories

- Open
- Completed
- Cancelled
- Archived

### Open Project Lifecycles

- Draft
- Onboarding
- Active
- Handoff

### Project Filters

- Lifecycle
- Health
- Client Organization
- Delivery Manager
- Active Milestone
- Waiting on Client
- At Risk
- Overdue
- Handoff

### Project Sorting

Default open-project sorting should prioritize attention.

Alternative sorting may include:

- Target completion
- Recently updated
- Project name
- Client Organization

### Primary Project Entry

Selecting a Project opens the Agency Project Overview.

---

## 7.3 Clients

**Purpose:**

Organize Client Organizations and their related members and Projects.

### Client Organization List

Displays:

- Organization name
- Active Project count
- Total Project count
- Primary client contacts
- Most recent Project activity
- Current delivery state summary

### Client Organization Detail

Contains:

- Organization summary
- Client members
- Open Projects
- Historical Projects
- Organization-level actions available to the agency

### Client Organization Principle

The Client Organization is a grouping and membership context.

It is not a CRM account record.

The MVP must not add:

- Sales pipeline
- Deal value
- Lead source
- Opportunity stage
- Marketing history

---

## 7.4 Workspace Settings

Workspace Settings are outside primary navigation.

### Areas

- General
- Branding
- Agency Members

### General

Contains:

- Workspace name
- Default display currency
- Basic workspace identity

### Branding

Contains:

- Agency logo
- Primary brand color
- Client Portal preview

### Agency Members

Contains:

- Member list
- Workspace role
- Invitation status
- Access removal

Only Agency Owners may access these areas.

---

## 8. Agency Project Workspace

The Agency Project Workspace is the operational center for one Project.

### Project-Local Navigation

1. Overview
2. Delivery Plan
3. Deliverables
4. Changes
5. Activity
6. Handoff

`Delivery Plan` contains the Project’s Milestones and Client Actions as two related internal views.

Milestones and Client Actions remain distinct Product Objects.

They are combined only at the navigation level because both describe how the client-facing delivery sequence moves forward.

### Project Utility Access

- Project settings
- Project members
- Preview Client Portal
- Archive or cancel actions when permitted

Project Settings and membership management should not compete with delivery navigation.

They belong in a Project menu or settings entry.

---

## 9. Agency Project Overview

## 9.1 Purpose

The Project Overview summarizes delivery state and directs the agency to the next meaningful action.

It must not repeat every detail available in local sections.

## 9.2 Information Priority

### Project Identity

- Project title
- Client Organization
- Lifecycle
- Health
- Target completion
- Delivery Manager

### Current Delivery State

- Active Milestone
- Milestone progress
- Current client-facing status
- Client-blocked duration when applicable

### Attention

- Blocking Client Actions
- Deliverables awaiting client decision
- Revision Requests awaiting classification
- Change Requests awaiting client decision
- Handoff acknowledgment state
- Agency-owned risk

### People

- Client Approver
- Client Contributors
- Agency Members

### Recent Meaningful Activity

A limited recent Activity preview with access to full history.

## 9.3 Primary Action Logic

The primary Project action changes according to current need.

Examples:

- Complete Project setup
- Publish onboarding Actions
- Publish Deliverable Version
- Classify Revision Request
- Send Change Request
- Prepare Handoff
- Complete Project

The Project Overview may display only one dominant primary action.

Secondary actions remain available contextually.

---

## 10. Delivery Plan Area

## 10.1 Purpose

Connect the Project’s client-facing sequence with the responsibilities required to move that sequence forward.

The Delivery Plan contains two internal views:

1. Milestones
2. Client Actions

These views share one Project-local navigation destination but preserve separate Object behavior, filters, details, and permissions.

## 10.2 Milestones View

Milestones are displayed in Project order.

Each item includes:

- Title
- Purpose
- Planned date range
- Lifecycle
- Client Action completion
- Deliverable decision completion
- Completion state

Only one Milestone may be Active.

The Active Milestone receives stronger prominence.

Completed Milestones remain accessible in historical order.

Planned Milestones remain visible but secondary.

## 10.3 Milestone Detail

Contains:

- Client-facing purpose
- Planned dates
- Lifecycle
- Related Client Actions
- Related Deliverables
- Completion requirements
- Milestone Activity
- Activate, complete, or cancel actions when authorized

The Milestone is a contextual grouping.

It does not duplicate Client Action or Deliverable records.

## 10.4 Client Actions View

The Client Actions view allows the agency to create, assign, publish, monitor, reopen, and resolve client responsibilities.

It supports:

- Open
- Completed
- Overdue
- Blocking
- Non-blocking
- Assignee
- Milestone

Each Action item includes:

- Title
- Type
- Assignee
- Milestone
- Due date
- Lifecycle
- Blocking status
- Completion or reopen state

## 10.5 Client Action Detail

Contains:

- Action title
- Instructions
- Action type
- Responsible Client Member
- Due date
- Milestone context
- Blocking status
- Submission
- Completion record
- Reopen history
- Reminder history when relevant
- Client-visible and agency-only status context

## 10.6 Cross-Object Placement

Client Actions are accessible from:

- Delivery Plan → Client Actions
- The related Milestone Detail
- Project Overview attention
- Direct links

Deliverables are accessible from:

- The dedicated Deliverables area
- The related Milestone Detail
- Project Overview attention

The Delivery Plan provides sequence and responsibility context without duplicating Object records.

## 10.7 Creation Entry Points

Client Action creation may begin from:

- Delivery Plan → Client Actions
- Milestone Detail
- Project Overview contextual action

All entry points lead to the same creation flow.

## 10.8 Navigation Rule

The Delivery Plan remembers the most recently used internal view for the current Project.

Direct links may open either the Milestones view, the Client Actions view, or a specific Object Detail without requiring an extra selection step.

---

## 11. Delivery Plan Relationship Rules

## 11.1 Milestone and Client Action Independence

A Milestone and Client Action remain separate Product Objects.

Combining them into one navigation area must not:

- Merge their lifecycle states
- Merge their permissions
- Make every Client Action blocking
- Move Deliverables into the Client Action model
- Turn the Delivery Plan into internal task management

## 11.2 Completion Relationship

Milestone completion depends on its required delivery conditions, including related Client Actions and Deliverable decisions.

The Delivery Plan should make those dependencies visible without presenting an internal Gantt chart or task board.

## 11.3 Agency Member Access

Assigned Agency Members may access the Delivery Plan for their Projects.

They may prepare permitted Draft content but may not publish or perform restricted lifecycle actions.

---

## 12. Deliverables Area

## 12.1 Purpose

Manage reviewable work, Versions, Comments, Decisions, and Revision history.

## 12.2 Deliverable List

Supports:

- Draft
- Awaiting Decision
- Revision Requested
- Revision In Progress
- Approved
- Milestone
- Version type

Each Deliverable item includes:

- Title
- Milestone
- Current status
- Current Version
- Review due date
- Decision state
- Open shared Comment count

## 12.3 Deliverable Detail

The Deliverable is the persistent review container.

Contains:

- Deliverable identity
- Milestone context
- Current status
- Current Version
- Version history
- Decision history
- Revision history
- Related Comments
- Related Change Request when applicable

## 12.4 Deliverable Version Detail

The Version is the review surface.

Contains:

- Version number
- Asset or external link
- Review instructions
- Published by
- Published time
- Review due date
- Shared Comments
- Agency-only notes
- Formal Review Decision
- Historical state

## 12.5 Image Review

For image Versions, the Version Detail becomes the Review Workspace.

It contains:

- Image canvas
- Zoom controls
- Pin navigation
- Shared Comment threads
- Agency-only notes for agency users
- Version selector
- Review instructions
- Decision state

The image review route remains nested beneath:

```text
Project
  → Deliverables
    → Deliverable
      → Version
```

## 12.6 Version History

Version history must remain immediately reachable from the Deliverable Detail and Review Workspace.

Historical Versions:

- Remain accessible
- Retain Comments and Decisions
- Are clearly marked as non-current
- Do not allow invalid formal decisions

## 12.7 Review Decision Placement

Approval and Revision Requested controls appear only:

- On the current Version
- For the Client Approver
- While the Version is Awaiting Decision

The Decision confirmation is a focused interaction, not a separate navigation destination.

After submission, the Decision becomes an immutable section in Version history.

---

## 13. Revision Request Placement

Revision Requests do not receive a Project-local navigation item.

They live primarily inside the Deliverable context.

### Agency Entry Points

- Delivery Overview attention item
- Project Overview attention item
- Deliverable Detail
- Version Decision history

### Client Entry Points

- Deliverable Detail
- Version history
- Client Activity
- Direct notification link when clarification is requested

### Revision Request Detail

Contains:

- Source Deliverable Version
- Client revision summary
- Related shared Comments
- Classification state
- Client-visible classification note
- Agency-only classification note
- Clarification question and response when applicable
- Linked Change Request when applicable
- Resolution history

### Placement Principle

Revision is a review outcome.

It must not appear as an unrelated project-management object.

---

## 14. Changes Area

## 14.1 Purpose

Manage formal Change Requests that may affect Project scope, timeline, or cost.

## 14.2 Changes List

Contains Project Change Requests with:

- Title
- Related Milestone or Revision Request
- State
- Decision deadline
- Cost impact
- Timeline impact
- Client decision

## 14.3 Change Request Detail

Contains:

- Title
- Reason
- Original Project context
- Scope impact
- Timeline impact
- Cost impact
- Decision deadline
- Client decision
- Decision note
- Application history
- Related Revision Request
- Client-visible and agency-only context

## 14.4 Agency Actions

Authorized agency users may:

- Create Draft
- Edit Draft
- Send
- Withdraw
- Apply an accepted Change Request

## 14.5 Client Decision Placement

Accept and Reject controls appear in the Client-facing Change Request Detail.

They are available only to the Client Approver.

After a decision, the same Detail becomes the immutable decision record.

## 14.6 Cross-Linking

A Change Request linked to a Revision Request must be reachable from:

- Revision Request Detail
- Deliverable history
- Changes area
- Client Activity
- Direct email link

---

## 15. Activity Area

## 15.1 Purpose

Provide a chronological record of meaningful Project events.

Activity is not a chat system.

## 15.2 Agency Activity

Agency users may see:

- Client-visible events
- Agency-only operational events

Agency Activity supports category filters:

- Client Action
- Deliverable
- Comment
- Review Decision
- Revision
- Change Request
- Handoff
- Membership
- Project state

## 15.3 Client Activity

Client users see only client-visible events.

Client Activity should prioritize clarity over exhaustive system logs.

It may include:

- Actions assigned or completed
- Versions published
- Decisions recorded
- Revision classifications shared
- Change Requests sent or decided
- Milestones completed
- Handoff published
- Project completed

It must not include:

- Draft edits
- Internal notes
- Private classification work
- Notification delivery logs
- View analytics
- Technical events

## 15.4 Activity Entry Behavior

Selecting an Activity item opens the relevant source object.

Examples:

- Version publication → Version Detail
- Change Request accepted → Change Request Detail
- Action completed → Client Action Detail
- Handoff published → Handoff

---

## 16. Handoff Area

## 16.1 Purpose

Present and manage the final delivery package.

## 16.2 Agency Handoff

Contains:

- Handoff state
- Introduction
- Instructions
- Handoff Items
- Required or optional designation
- Publication state
- Acknowledgment due date
- Client acknowledgment
- Completion controls

## 16.3 Client Handoff

Contains:

- Final delivery message
- Published Handoff Items
- Required item status
- Final instructions
- Support-window information
- Acknowledgment control

## 16.4 Lifecycle Visibility

Before Handoff is prepared:

- Agency users may access an empty or setup state.
- Client users do not see a Handoff destination.

After Handoff is published:

- The Project Overview displays a prominent Handoff card.
- The Client Action Center displays acknowledgment when pending.
- The direct Handoff route becomes accessible to the Client Approver and Contributors.
- Only the Client Approver sees acknowledgment controls.

After acknowledgment or Project completion:

- Handoff remains available in read-only form.

## 16.5 Navigation Rule

Handoff remains a stable Agency Project-local section.

In the Client Portal, it is reached through:

- Project Overview
- Action Center
- Direct link
- Activity

It does not require a permanent global navigation item.

---

## 17. Project Settings and Membership

Project Settings are accessible through a Project utility menu.

### Areas

- General
- Members
- Client Access
- Lifecycle

### General

Contains:

- Project title
- Client-facing summary
- Target completion
- Delivery Manager
- Client Approver

### Members

Contains:

- Assigned Agency Members
- Client Contributors
- Membership state

### Client Access

Contains:

- Invitation state
- Access removal
- Resend invitation
- Approver reassignment

### Lifecycle

Contains authorized actions such as:

- Publish Draft Project
- Move from Onboarding to Active
- Enter Handoff
- Complete with override
- Cancel
- Archive
- Delete eligible Draft

Destructive and exceptional actions must not appear in primary delivery navigation.

---

## 18. Client Portal Global Architecture

```text
Client Portal
│
├── Home
│   ├── Required Actions
│   ├── Pending Decisions
│   ├── Upcoming Due Dates
│   ├── Recently Completed
│   └── Project Progress
│
└── Projects
    ├── Open Projects
    └── Past Projects
```

The Client Portal should remain usable for:

- One Project
- Multiple Projects
- One Client Organization
- Different responsibility levels across Projects

---

## 19. Client Action Center

## 19.1 Purpose

Provide one prioritized view of everything the current client user must complete or decide.

## 19.2 Content Priority

Suggested priority:

1. Overdue assigned Client Actions
2. Overdue formal decisions
3. Handoff acknowledgment
4. Change Requests awaiting decision
5. Deliverables awaiting Client Approver decision
6. Blocking Client Actions
7. Non-blocking assigned Client Actions
8. Upcoming due items
9. Recently completed items

The ordering must consider the current user’s authority.

A Client Contributor must not see an Approver-only item as their own required action.

## 19.3 Attention Item Types

The Action Center may include:

- Client Action
- Deliverable decision
- Change Request decision
- Handoff acknowledgment
- Clarification response

## 19.4 Attention Card Content

Each card must identify:

- Project
- Required action
- Due date
- Current state
- Why the action matters
- Primary action label

## 19.5 Completion Behavior

After completion:

- The item leaves the required section.
- It may appear in Recently Completed.
- The user returns to the Action Center or relevant Project context.
- The next required action may receive focus.

## 19.6 All-Caught-Up State

When no action requires attention:

> You are all caught up.

The page may then emphasize:

- Current Projects
- Recent decisions
- Upcoming milestones

It must not manufacture urgency.

---

## 20. Client Projects Area

## 20.1 Project List

The Client Project list contains Projects assigned to the current user.

Categories:

- Open
- Past

`Past` contains:

- Completed Projects
- Cancelled Projects that were previously published and remain accessible

Client users do not see:

- Draft Projects
- Cancelled Projects that were never published
- Archived as a separate administrative category
- Unassigned Projects

## 20.2 Project List Item

Contains:

- Project title
- Agency identity
- Lifecycle
- Current Milestone
- Current client-facing status
- Current user action state
- Target completion when relevant

## 20.3 Primary Project Entry

Selecting a Project opens the Client Project Overview.

---

## 21. Client Project Portal

### Project-Local Navigation

1. Overview
2. Deliverables
3. Activity

This intentionally smaller navigation is not a reduced Agency navigation.

It reflects client goals.

### Contextual Destinations

The following remain accessible without permanent local-navigation items:

- Milestone detail
- Client Action detail
- Revision Request detail
- Change Request detail
- Handoff
- Deliverable Version review

---

## 22. Client Project Overview

## 22.1 Purpose

Explain the current Project state and make the next client action unmistakable.

## 22.2 Information Priority

### Project Identity

- Project title
- Agency identity
- Client-facing summary
- Lifecycle

### Current Attention

- Current user’s required action
- Due date
- Primary CTA
- Why it matters

### Project Progress

- Completed Milestones
- Active Milestone
- Upcoming Milestones
- Target completion

### Current Milestone

- Purpose
- Related Client Actions
- Related Deliverables
- Current progress

### Recent Decisions

- Approved Deliverables
- Revision Decisions
- Accepted or rejected Change Requests

### Recent Activity

A short client-visible Activity preview.

## 22.3 Role-Aware Overview

The Client Approver may see:

- Decision requests
- Change Request decisions
- Handoff acknowledgment

The Client Contributor may see:

- Assigned Client Actions
- Deliverables open for comments
- Current Project progress

The page must not present controls the current user cannot use.

---

## 23. Client Milestone Experience

Milestones appear primarily on the Project Overview as the Project timeline.

### Milestone Detail Access

A client may open a Milestone to view:

- Purpose
- Planned dates
- Lifecycle
- Related published Client Actions
- Related published Deliverables
- Completion state

### Navigation Rule

Milestones do not require a permanent Client Project tab in the MVP.

The timeline itself is the primary entry.

This keeps the Client Portal small while preserving complete access.

---

## 24. Client Action Detail

## 24.1 Entry Points

- Action Center
- Project Overview
- Milestone Detail
- Direct email link
- Activity history

## 24.2 Information

Contains:

- Action title
- Instructions
- Project
- Milestone
- Assignee
- Due date
- Blocking context when client-visible
- Input or confirmation control
- Completion history
- Reopen note when applicable

## 24.3 Completion

A user may complete an Action only when assigned.

Other assigned Project members may view it when permitted but do not receive completion controls.

## 24.4 Reopened State

A reopened Action must clearly show:

- Previous submission
- Reopen time
- Agency explanation
- New required response
- Updated due context when applicable

---

## 25. Client Deliverables Area

## 25.1 Purpose

Provide access to current and historical reviewable work.

## 25.2 Deliverable List

The Client Deliverables area uses one list with status grouping rather than separate permanent views.

Primary groups:

- Needs Attention
- In Revision
- Approved

Optional filtering:

- Milestone
- Status

The navigation remains visible before the first Version is published and shows the approved empty state.

Each item includes:

- Title
- Milestone
- Current Version
- Decision state
- Review due date when active
- Comment status

## 25.3 Deliverable Detail

Contains:

- Review context
- Current Version
- Version history
- Shared Comments
- Formal Decision history
- Revision classification visible to the client
- Linked Change Request when applicable

## 25.4 Client Review Workspace

The Client Approver sees:

- Shared Comments
- Approve
- Request Revision

The Client Contributor sees:

- Shared Comments
- Reply controls
- No formal-decision controls

Agency-only notes never appear.

## 25.5 Historical Versions

Historical Versions remain accessible but are visibly read-only.

The current Version must always be obvious.

A stale direct link must show:

- The historical Version
- Its state
- A route to the current Version
- No invalid decision controls

---

## 26. Client Change Request Experience

## 26.1 Entry Points

- Action Center for Client Approver
- Project Overview
- Linked Revision Request
- Activity
- Direct email link

## 26.2 Detail Hierarchy

1. Decision required
2. Requested change
3. Why it changes approved scope
4. Scope impact
5. Timeline impact
6. Cost impact
7. Decision deadline
8. Original Project context
9. Accept or Reject
10. Decision history

## 26.3 Contributor View

Client Contributors may view the Change Request.

They may not accept or reject it.

The page should identify the Client Approver responsible for the decision.

## 26.4 Decided State

After decision:

- Decision controls disappear.
- The accepted or rejected state becomes prominent.
- Decision identity and time remain visible.
- Application state may be visible when relevant.
- Related Project changes are linked.

---

## 27. Client Activity

## 27.1 Purpose

Provide a transparent record of client-visible Project progress and decisions.

## 27.2 Information Hierarchy

- Event
- Actor
- Time
- Related object
- Decision or state when relevant

## 27.3 Activity Scope

The Client Activity page is Project-specific.

There is no global Client Activity page in the MVP.

## 27.4 Event Navigation

Every event with a source object should link to it.

Historical events remain reachable after Project completion.

---

## 28. Hierarchical Object Model

```text
Agency Workspace
│
├── Agency Members
├── Client Organizations
│   ├── Client Members
│   └── Projects
│       ├── Project Memberships
│       ├── Milestones
│       │   ├── Client Actions
│       │   └── Deliverables
│       │       └── Deliverable Versions
│       │           ├── Comments
│       │           └── Review Decision
│       ├── Revision Requests
│       │   └── Linked Change Request
│       ├── Change Requests
│       ├── Activity Events
│       └── Handoff
│           └── Handoff Items
```

### 28.1 Hierarchy Rules

- A Project belongs to one Client Organization.
- A Milestone belongs to one Project.
- A Client Action belongs to one Milestone.
- A Deliverable belongs to one Milestone.
- A Deliverable Version belongs to one Deliverable.
- A Comment belongs to one Deliverable Version.
- A Review Decision belongs to one Deliverable Version.
- A Revision Request originates from one Review Decision.
- A Change Request belongs to one Project and may link to one Revision Request.
- A Handoff belongs to one Project.
- A Handoff Item belongs to one Handoff.
- Activity Events reference their source objects but remain Project-scoped.

---

## 29. Object Placement Matrix

| Object              | Primary Agency Location                  | Primary Client Location            | Secondary Entry Points              |
| ------------------- | ---------------------------------------- | ---------------------------------- | ----------------------------------- |
| Project             | Projects → Project Overview              | Projects → Project Overview        | Delivery, Action Center             |
| Milestone           | Project → Delivery Plan → Milestones     | Project Overview timeline          | Project Overview                    |
| Client Action       | Project → Delivery Plan → Client Actions | Action Center → Action Detail      | Milestone, email, Activity          |
| Deliverable         | Project → Deliverables                   | Project → Deliverables             | Milestone, Action Center            |
| Deliverable Version | Deliverable Detail                       | Deliverable Detail                 | Email, Activity                     |
| Comment             | Version Review                           | Version Review                     | Activity                            |
| Review Decision     | Version Detail                           | Version Detail                     | Activity, Project Overview          |
| Revision Request    | Deliverable Detail                       | Deliverable Detail                 | Delivery attention, email, Activity |
| Change Request      | Project → Changes                        | Contextual Change Detail           | Action Center, email, Activity      |
| Handoff             | Project → Handoff                        | Project Overview / Action Center   | Email, Activity                     |
| Activity Event      | Project → Activity                       | Project → Activity                 | Overview previews                   |
| Client Organization | Clients → Organization                   | Not exposed as a management object | Project identity                    |
| Agency Member       | Workspace Settings / Project Members     | Agency identity where relevant     | Comments, Activity                  |
| Client Member       | Client Organization / Project Members    | Account identity                   | Actions, Comments, Activity         |

---

## 30. Entry Point Model

## 30.1 Direct Product Entry

After authentication:

- Agency Owner → Delivery
- Delivery Manager → Delivery
- Agency Member → Projects
- Client Approver → Home
- Client Contributor → Home

## 30.2 Email Deep Links

Supported object destinations:

- Client invitation
- Client Action
- Deliverable Version
- Comment thread
- Clarification request
- Change Request
- Handoff
- Project completion

## 30.3 Deep-Link Resolution

```text
Open link
   ↓
Confirm or establish identity
   ↓
Validate workspace and project access
   ↓
Validate object visibility
   ↓
Open intended object
```

If authentication is required, the intended destination must be retained.

## 30.4 Unauthorized Destination

The product must show a safe access-denied state.

It must not reveal:

- Project title
- Client Organization
- File identity
- Decision content
- Other membership details

## 30.5 Removed or Historical Object

When the object remains valid but is historical:

- Open the historical state
- Explain that it is no longer current
- Link to the current related object when available

When the object was withdrawn or is unavailable:

- Explain the state
- Preserve safe context
- Offer the nearest valid destination

---

## 31. Agency Action Paths

## 31.1 Create and Publish Project

```text
Projects
  → New Project
    → Select or create Client Organization
    → Assign Delivery Manager
    → Assign Client Approver
    → Assign members
    → Add Project summary and target date
    → Create Milestones
    → Review setup
    → Publish into Onboarding
```

The creation flow may be multi-step.

Incomplete setup remains Draft.

---

## 31.2 Publish Client Action

```text
Project
  → Delivery Plan
    → Client Actions or Milestone
      → New Client Action
    → Select type
    → Add instructions
    → Assign Client Member
    → Set due date
    → Set blocking status
    → Preview
    → Publish
```

---

## 31.3 Publish Deliverable Version

```text
Project
  → Deliverables
    → Deliverable
    → Add Version
    → Select Version type
    → Add asset or link
    → Add review instructions
    → Set review due date
    → Preview
    → Publish
```

Agency Members may prepare the Draft.

Only the Agency Owner or assigned Delivery Manager may publish.

---

## 31.4 Classify Revision Request

```text
Delivery attention item or Deliverable
  → Revision Request
    → Review source Version
    → Review client summary and Comments
    → Choose classification
       ├── In Scope
       ├── Needs Clarification
       └── Potential Scope Change
    → Add client-visible note
    → Add optional agency-only note
    → Confirm
```

---

## 31.5 Create Change Request

```text
Revision Request or Project Changes
  → New Change Request
    → Describe reason
    → Define scope impact
    → Define timeline impact
    → Define optional cost impact
    → Set decision deadline
    → Preview client view
    → Send
```

---

## 31.6 Publish Handoff

```text
Project
  → Handoff
    → Add introduction
    → Add instructions
    → Add Handoff Items
    → Mark required items
    → Set acknowledgment due date
    → Preview client view
    → Publish
```

---

## 31.7 Complete Project

```text
Project Handoff
  → Handoff acknowledged
    → Complete Project
```

Alternative:

```text
Project Handoff
  → Acknowledgment still pending
    → Complete without acknowledgment
    → Enter reason
    → Confirm override
```

---

## 32. Client Action and Decision Paths

## 32.1 Complete Client Action

```text
Home or Project
  → Client Action
    → Review instructions
    → Submit response, upload file, or confirm
    → Review submission
    → Complete
    → Confirmation
```

---

## 32.2 Review Deliverable

```text
Home, Project, or email
  → Deliverable Version
    → Review instructions
    → Inspect asset
    → Add or reply to Comments
```

For Client Approver:

```text
Review Version
  → Approve or Request Revision
    → Review decision summary
    → Confirm
    → Decision recorded
```

For Client Contributor:

```text
Review Version
  → Add feedback
  → Return to Project or Home
```

---

## 32.3 Respond to Clarification

```text
Home or email
  → Revision Request
    → Review agency question
    → Submit response
    → Confirmation
```

---

## 32.4 Decide Change Request

```text
Home or email
  → Change Request
    → Review requested change
    → Review scope, timeline, and cost impact
    → Accept or Reject
    → Add optional note
    → Confirm
    → Decision recorded
```

Only the Client Approver sees decision controls.

---

## 32.5 Acknowledge Handoff

```text
Home, Project, or email
  → Handoff
    → Review required Items
    → Confirm access
    → Acknowledge
    → Project completion confirmation
```

---

## 33. Lifecycle-Aware Information Architecture

## 33.1 Draft Project

### Agency

Visible areas:

- Overview
- Delivery Plan
- Deliverables
- Project Settings

Changes, Activity, and Handoff may show empty or unavailable states when not yet relevant.

### Client

No access.

### Primary Agency Action

> Complete project setup

---

## 33.2 Onboarding Project

### Agency

Standard Project navigation is available.

Priority:

- Onboarding Client Actions
- Client invitations
- First Active Milestone
- Move Project to Active

### Client

Home emphasizes assigned onboarding Actions.

Project Overview emphasizes:

- Welcome context
- Current Milestone
- Required inputs
- What happens after onboarding

---

## 33.3 Active Project

### Agency

All delivery sections are available.

Priority depends on:

- Current Milestone
- Client-blocked work
- Deliverable decisions
- Revision classification
- Change Requests

### Client

Home emphasizes current obligations.

Project Overview emphasizes:

- Current Milestone
- Progress
- Current Deliverables
- Next step

---

## 33.4 Handoff Project

### Agency

Handoff receives prominent contextual priority.

Project Overview emphasizes:

- Handoff state
- Required Items
- Acknowledgment deadline
- Client-blocked duration

### Client

Home emphasizes Handoff acknowledgment when pending.

Project Overview emphasizes:

- Website or delivery completion
- Handoff package
- Support window
- Final acknowledgment

---

## 33.5 Completed Project

### Agency and Client

The Project becomes read-only.

Visible:

- Overview
- Delivery Plan
- Deliverables
- Decisions
- Changes
- Activity
- Handoff

Creation and mutation controls are removed.

The Project header must clearly identify:

- Completed state
- Completion date
- Client acknowledgment status

---

## 33.6 Cancelled Project

The Project becomes read-only.

The interface displays:

- Cancelled state
- Cancellation reason according to visibility
- Historical records
- No active action controls

### Client Access Policy

A Cancelled Project that was previously published remains available to its existing Client Members in read-only form by default.

Cancellation does not silently revoke historical access.

The agency may revoke a specific Client Member’s Project access through Project Settings when required.

A Project cancelled before publication remains invisible to Client users.

In the Client Projects area, an accessible Cancelled Project appears under `Past` and is clearly labeled `Cancelled`.

---

## 33.7 Archived Project

Agency users may reach Archived Projects through Projects filtering or search.

Archived Projects are:

- Read-only
- Removed from active delivery views
- Preserved for history

Client users do not see “Archived” as a separate administrative concept.

Their historical Project access follows membership and lifecycle rules.

---

## 34. Search and Filtering Architecture

## 34.1 Agency Global Search

Agency global search supports:

- Projects by title
- Client Organizations by name
- Client Members by name or email

Search results must respect:

- Workspace boundaries
- Project assignments
- Role permissions

### Result Grouping

- Projects
- Clients
- People

## 34.2 Project-Scoped Discovery

Project sections use filtering rather than global search.

Examples:

- Client Actions by status and assignee
- Deliverables by state and Milestone
- Changes by state
- Activity by category

## 34.3 Client Portal

Global search is not part of the Client Portal MVP.

The Client Portal relies on:

- Action Center
- Project list
- Project hierarchy
- Direct links
- Activity links

This is an intentional product decision, not a missing capability.

---

## 35. Breadcrumb Model

## 35.1 Agency Breadcrumbs

Examples:

```text
Projects
  / Kestrelon Website Rebuild
```

```text
Projects
  / Kestrelon Website Rebuild
  / Deliverables
  / Homepage Visual Direction
  / Version 1
```

```text
Clients
  / Kestrelon
  / Kestrelon Website Rebuild
```

Breadcrumbs should preserve hierarchy without duplicating local navigation.

## 35.2 Client Breadcrumbs

Client breadcrumbs are shorter.

Examples:

```text
Kestrelon Website Rebuild
  / Homepage Visual Direction
  / Version 1
```

```text
Kestrelon Website Rebuild
  / Final Handoff
```

The Client Portal does not expose the Client Organization as a management layer.

## 35.3 Modal and Confirmation Context

Focused confirmation interactions do not require breadcrumbs.

They must clearly name:

- Project
- Object
- Version or decision subject

---

## 36. Cross-Role Visibility Matrix

| Information                            | Agency Owner | Delivery Manager |    Agency Member | Client Approver | Client Contributor |
| -------------------------------------- | -----------: | ---------------: | ---------------: | --------------: | -----------------: |
| Workspace Delivery Overview            |          All |         Assigned |               No |              No |                 No |
| Project operational health             |          Yes |              Yes |          Limited |              No |                 No |
| Client-facing Project status           |          Yes |              Yes |              Yes |             Yes |                Yes |
| Agency-only risk note                  |          Yes |              Yes | Assigned Project |              No |                 No |
| Draft Milestones                       |          Yes |              Yes |              Yes |              No |                 No |
| Published Milestones                   |          Yes |              Yes |              Yes |             Yes |                Yes |
| Draft Client Actions                   |          Yes |              Yes |              Yes |              No |                 No |
| Published assigned Actions             |          Yes |              Yes |              Yes |             Yes |                Yes |
| Draft Deliverable Versions             |          Yes |              Yes |              Yes |              No |                 No |
| Published Versions                     |          Yes |              Yes |              Yes |             Yes |                Yes |
| Shared Comments                        |          Yes |              Yes |              Yes |             Yes |                Yes |
| Agency-only notes                      |          Yes |              Yes |              Yes |              No |                 No |
| Review Decision controls               |           No |               No |               No |             Yes |                 No |
| Review Decision history                |          Yes |              Yes |              Yes |             Yes |                Yes |
| Internal Revision classification note  |          Yes |              Yes |  Limited by role |              No |                 No |
| Client-visible Revision classification |          Yes |              Yes |              Yes |             Yes |                Yes |
| Change Request decision controls       |           No |               No |               No |             Yes |                 No |
| Change Request record                  |          Yes |              Yes | Assigned Project |             Yes |                Yes |
| Handoff acknowledgment control         |           No |               No |               No |             Yes |                 No |
| Handoff Items                          |          Yes |              Yes | Assigned Project |             Yes |                Yes |
| Agency-only Activity                   |          Yes |              Yes | Assigned Project |              No |                 No |
| Client-visible Activity                |          Yes |              Yes |              Yes |             Yes |                Yes |
| Workspace Settings                     |          Yes |               No |               No |              No |                 No |

---

## 37. Empty States

## 37.1 Agency Delivery — No Projects

**Purpose:**

Help the Agency Owner or Delivery Manager begin.

**Primary Action:**

> Create your first project

**Supporting Path:**

Create or select a Client Organization.

---

## 37.2 Agency Delivery — No Attention Items

**Message:**

> Delivery is clear.

**Supporting Content:**

- Active Projects
- Upcoming Milestone dates
- Recent client activity

The product should not manufacture warning states.

---

## 37.3 Agency Projects — No Assigned Projects

For Agency Members:

> You have not been assigned to a project yet.

No create control is shown.

---

## 37.4 Client Home — All Caught Up

**Message:**

> You are all caught up.

**Supporting Content:**

- Current Project progress
- Recently completed actions
- Recent decisions

---

## 37.5 Project — No Deliverables

Agency:

> No deliverables have been created for this project.

Authorized users may create the first Deliverable.

Client:

The Deliverables navigation remains visible for every published Project, including during Onboarding before the first Version is published.

The empty state should explain:

> Deliverables will appear here when the agency publishes work for review.

This preserves stable navigation and prepares the client for the review workflow without creating false urgency.

---

## 37.6 Project — No Changes

Agency:

> No change requests have been created.

Client:

No Changes navigation exists.

A Project Overview does not need to advertise the absence of Change Requests.

---

## 37.7 Handoff — Not Started

Agency:

> Handoff has not been prepared.

Client:

Handoff is not shown as an available destination.

---

## 38. Error and Recovery States

## 38.1 Access Denied

Explain that the user does not have access.

Do not reveal object details.

Provide:

- Return to Home
- Switch account when applicable

## 38.2 Expired Invitation

Provide:

- Invitation status
- Workspace or agency identity when safe
- Request-new-invitation path

## 38.3 Stale Version

Show:

- Historical Version
- Historical state
- Current Version link
- Disabled invalid decision controls

## 38.4 Withdrawn Change Request

Show:

- Withdrawn state
- Withdrawal time
- No decision controls
- Related replacement when available

## 38.5 Archived During Session

The current page becomes read-only.

Explain that the Project state changed.

Provide a route back to Project Overview.

## 38.6 Unavailable External Resource

Preserve:

- Deliverable Version identity
- Review Decision
- Comments
- Publication history

Explain that the external resource is unavailable.

## 38.7 Missing Decision Authority

When a Project temporarily lacks a valid Client Approver during a recovery scenario:

- Client Contributors may view content.
- Formal-decision controls are unavailable.
- Agency users see a blocking administrative warning.
- The Project requires approver reassignment.

---

## 39. Responsive Navigation Principles

Final responsive behavior belongs to Screen Inventory and Visual Direction, but the IA establishes these rules.

### 39.1 Agency Workspace

- Desktop may use persistent primary navigation.
- Project-local navigation may collapse on smaller viewports.
- Operational density may reduce progressively.
- Critical create and attention actions must remain reachable.
- No critical action may depend on hover.

### 39.2 Client Portal

- Mobile is a primary client use case.
- Home and Projects must remain immediately reachable.
- Project-local navigation should remain minimal.
- Action completion and formal decisions must be usable on mobile.
- Review context must remain understandable without exposing dense agency structure.

### 39.3 Deep-Link Mobile Behavior

Email deep links must open directly to the intended mobile-usable action.

The user must not be forced through desktop-only navigation.

---

## 40. Conceptual Route Model

These paths are conceptual IA references.

They do not prescribe the final framework implementation.

## 40.1 Agency Routes

```text
/agency
/agency/projects
/agency/projects/:projectId
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
/agency/clients
/agency/clients/:clientOrganizationId
/agency/settings
/agency/settings/branding
/agency/settings/members
```

## 40.2 Client Routes

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

## 40.3 Route Principles

- Agency and Client paths are separate.
- Project access is validated for every route.
- Historical routes remain stable.
- Object identifiers must not reveal cross-tenant information.
- Deep links preserve intended destinations.
- Route shape may change during Engineering Architecture, but hierarchy must remain equivalent.

---

## 41. Page Family Model

The Screen Inventory should derive individual screens from these page families.

### 41.1 Collection Pages

- Delivery Overview
- Project List
- Client Organization List
- Client Action Center
- Client Project List

### 41.2 Hub Pages

- Agency Project Overview
- Client Project Overview
- Client Organization Detail
- Deliverable Detail
- Milestone Detail

### 41.3 Workspaces

- Image Review Workspace
- Handoff Workspace
- Project Setup
- Workspace Branding

### 41.4 Detail Pages

- Client Action Detail
- Deliverable Version Detail
- Revision Request Detail
- Change Request Detail
- Activity
- Project Settings

### 41.5 Focused Decision Interactions

- Approve Version
- Request Revision
- Accept Change Request
- Reject Change Request
- Acknowledge Handoff
- Complete with Override
- Reassign Approver
- Publish Project
- Publish Version

Focused decision interactions may be dialogs, drawers, or dedicated steps.

The final surface choice belongs to Screen Inventory and interaction design.

---

## 42. Information Architecture Decisions

| Decision                                                                                     | Status                   |
| -------------------------------------------------------------------------------------------- | ------------------------ |
| Agency and Client use separate product shells                                                | Approved                 |
| Project is the central shared context                                                        | Approved                 |
| Agency global navigation: Delivery, Projects, Clients                                        | Approved                 |
| Workspace Settings in primary navigation                                                     | Rejected                 |
| Client global navigation: Home, Projects                                                     | Approved                 |
| Global Client Activity navigation                                                            | Rejected                 |
| Agency Project navigation: Overview, Delivery Plan, Deliverables, Changes, Activity, Handoff | Approved                 |
| Milestones and Client Actions share the Delivery Plan navigation area                        | Approved                 |
| Milestones and Client Actions remain separate Product Objects                                | Approved                 |
| Client Project navigation: Overview, Deliverables, Activity                                  | Approved                 |
| Client Milestones use timeline and contextual detail rather than permanent tab               | Approved                 |
| Client Actions use Action Center and contextual detail rather than Project tab               | Approved                 |
| Client Deliverables navigation remains visible before first publication                      | Approved                 |
| Client Deliverables use one status-grouped list                                              | Approved                 |
| Change Requests receive Agency Project section                                               | Approved                 |
| Change Requests receive permanent Client Project tab                                         | Rejected                 |
| Handoff receives Agency Project section                                                      | Approved                 |
| Handoff receives permanent Client global navigation                                          | Rejected                 |
| Revision Requests receive standalone Project navigation                                      | Rejected                 |
| Revision Requests live in Deliverable review context                                         | Approved                 |
| Review Decisions stay attached to exact Versions                                             | Approved                 |
| Project Settings remain in Project utility access                                            | Approved                 |
| Client Organization Detail is limited to identity, members, and Projects                     | Approved                 |
| Organization-level Activity area                                                             | Rejected for MVP         |
| Global Deliverables area across all Projects                                                 | Rejected                 |
| Global Change Request area across all Projects                                               | Rejected                 |
| Agency Delivery may aggregate exceptions across Projects                                     | Approved                 |
| Client Portal global search                                                                  | Rejected for MVP         |
| Agency global search covers Projects, Client Organizations, and Client Members               | Approved                 |
| Agency navigation and command actions are capability-projected                               | Approved                 |
| Hidden navigation never replaces route authorization                                         | Approved                 |
| Deliverables in Agency global search                                                         | Deferred                 |
| Agency Member sees Delivery Overview                                                         | Rejected                 |
| Deep links preserve exact object intent                                                      | Approved                 |
| Completed Projects remain historically accessible                                            | Approved                 |
| Previously published Cancelled Projects remain client-accessible by default                  | Approved                 |
| Cancellation automatically revokes client access                                             | Rejected                 |
| Navigation reorganizes by Project lifecycle                                                  | Rejected                 |
| Primary actions change by lifecycle and responsibility                                       | Approved                 |
| Version switching occurs inside the Review Workspace                                         | Approved                 |
| Conceptual Agency and Client route namespaces remain separate                                | Approved as IA direction |

---

## 43. Resolved Review Decisions

### 43.1 Agency Project Navigation

The final Agency Project navigation contains six items:

```text
Overview
Delivery Plan
Deliverables
Changes
Activity
Handoff
```

`Delivery Plan` contains two internal views:

- Milestones
- Client Actions

This reduces navigation density without merging the underlying Product Objects or weakening their individual workflows.

### 43.2 Client Deliverables Before Publication

The Client Deliverables navigation remains visible for every published Project.

Before the first Version is published, it shows a calm explanatory empty state.

This preserves stable navigation and avoids a section appearing unexpectedly later in the engagement.

Approved Deliverables and active reviews share one list grouped by status.

### 43.3 Project Settings and Members

Project Settings remain in a Project utility menu rather than permanent delivery navigation.

On smaller viewports, the same destination is available through an accessible Project overflow menu.

Member management remains inside Project Settings.

### 43.4 Cancelled Project Access

A previously published Cancelled Project remains visible to existing Client Members in read-only form by default.

The agency may revoke individual Project memberships when necessary.

A Project cancelled before publication remains invisible to Client users.

Accessible Completed and Cancelled Projects appear under `Past` in the Client Projects area.

### 43.5 Client Organization Detail

Client Organization Detail remains deliberately narrow:

- Organization identity
- Client members
- Open Projects
- Past Projects

A separate organization-level Activity area is excluded from the MVP because meaningful delivery Activity remains Project-scoped.

### 43.6 Agency Search

Agency global search includes:

- Projects
- Client Organizations
- Client Members

Deliverable search is deferred.

Project-level filtering and navigation are sufficient for Deliverable discovery in the MVP.

### 43.7 Client Action Center Priority

Attention items are ordered by:

1. Overdue state
2. Nearest due date
3. Binding decision authority
4. Blocking effect
5. Most recent publication

This means an overdue Deliverable decision outranks a non-overdue Handoff acknowledgment.

When urgency and due date are equal, binding decisions outrank routine Client Actions.

### 43.8 Review Workspace Navigation

Version switching occurs inside the Review Workspace.

The current Version opens by default.

A compact Version history remains visible or immediately reachable.

Historical Versions are clearly read-only and provide a direct route back to the current Version.

No unresolved IA question blocks Screen Inventory.

---

## 44. Approval Decision

**Decision:** Approved

The Information Architecture is approved because:

- Agency and Client shells are clearly distinct.
- Every approved Product Object has one primary information location.
- Project navigation is compact without losing workflow context.
- Client navigation remains materially simpler than Agency navigation.
- Role-based landing pages match the Permission Model.
- Formal decisions are reached through Object-specific paths.
- Deep links preserve the intended action.
- Lifecycle changes do not destabilize navigation.
- Historical Versions, Decisions, Cancelled Projects, and Handoff records remain reachable according to access rules.
- Internal information cannot enter Client pathways.
- Empty, error, and read-only states have valid destinations.
- The architecture can be translated directly into Screen Inventory.
- No implementation framework has been selected prematurely.

---

## 45. Next Document

After approval, the next document is:

- `docs/product/06-screen-inventory.md`

The Screen Inventory must translate this Information Architecture into:

- Required screens
- Role availability
- Entry points
- Primary purpose
- Core content
- Primary actions
- Secondary actions
- Key states
- Responsive importance
- Demo priority
- Dependencies between screens

The Screen Inventory must not redesign the product hierarchy approved in this document.
