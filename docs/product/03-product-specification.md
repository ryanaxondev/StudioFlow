# StudioFlow

# Product Specification

## Document Information

**Document Type:** Product Specification

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`

**Includes:**

- Product Definition
- Product Promise
- Product Goals
- Product Non-Goals
- User Model
- Roles and Permissions
- Core Product Objects
- Product Surfaces
- Core Workflows
- MVP Scope
- Functional Requirements
- Business Rules
- State Models
- Email Notifications and Reminders
- Search and Filtering
- Data and Access Boundaries
- Error and Recovery Scenarios
- Edge Cases
- Product Analytics
- Definition of Done
- Deferred Capabilities
- Strategic Decisions
- Open Questions

**Produces:**

- Demo Narrative
- Information Architecture
- Screen Inventory
- Visual Direction
- Engineering Architecture
- Implementation Scope

---

## 1. Executive Summary

StudioFlow is a premium client delivery platform for boutique web design and development agencies managing custom, multi-stage projects.

It provides a dedicated layer between the agency’s internal production tools and the client.

The product does not replace project-management, design, development, accounting, or source-control software.

It translates project delivery into a clear client-facing experience built around:

- Project progress
- Client responsibilities
- Milestones
- Deliverable versions
- Contextual feedback
- Formal approvals
- Revision classification
- Scope-change decisions
- Final handoff

The primary product outcome is:

> Reduce the time projects remain blocked while waiting for client action or decision.

The primary product promise is:

> Move every project from kickoff to final approval with clarity.

StudioFlow must provide two related but intentionally different product experiences.

### Agency Experience

The agency needs operational visibility and control.

It must be able to:

- Create and configure client projects
- Publish a clear delivery roadmap
- Request client actions
- Present deliverables
- Track feedback and decisions
- Classify revision requests
- Formalize scope changes
- Identify projects waiting on clients
- Complete structured handoff

### Client Experience

The client needs confidence and simplicity.

It must be able to:

- Understand where the project stands
- See what requires attention
- Access the current deliverable version
- Provide contextual feedback
- Approve or request revision
- Accept or reject scope changes
- Access final project assets

The MVP must prove the complete delivery loop rather than present disconnected screens.

The minimum credible loop is:

```text
Agency creates project
        ↓
Client completes onboarding actions
        ↓
Agency publishes milestone and deliverable
        ↓
Client reviews and comments
        ↓
Client approves or requests revision
        ↓
Agency classifies revision impact
        ↓
Scope change is accepted when required
        ↓
Project advances
        ↓
Agency publishes final handoff
        ↓
Client acknowledges completion
```

---

## 2. Product Specification Objective

This document defines the first buildable version of StudioFlow.

It translates the approved market and business context into:

- Product behavior
- User capabilities
- Object definitions
- Workflow rules
- Scope boundaries
- State transitions
- Success conditions

The document must make the following decisions explicit:

1. Who may use StudioFlow
2. What each role may see and do
3. Which product objects exist
4. Which workflows are required
5. Which capabilities belong in the MVP
6. Which capabilities are deliberately excluded
7. Which rules protect workflow clarity
8. Which states and transitions are valid
9. How client-blocked work is identified
10. What constitutes a complete and production-ready implementation

This document does not define:

- Database tables
- Frameworks
- Libraries
- Hosting providers
- Authentication vendors
- Storage providers
- API implementation
- Folder structure
- Component architecture
- Final interface layout

Those decisions belong to later stages.

---

## 3. Product Definition

### 3.1 Product Category

**Client Delivery Platform**

### 3.2 Primary Customer

Boutique web design and development agencies managing custom, multi-stage client projects.

### 3.3 Paying Customer

The agency.

### 3.4 Primary Users

- Delivery Manager
- Client Approver
- Client Contributor

### 3.5 Supporting Users

- Agency Owner
- Agency Member

### 3.6 Product Definition

> StudioFlow is a client delivery platform that helps boutique web agencies coordinate client actions, present project progress, review versioned deliverables, record formal decisions, manage scope changes, and complete final handoff in one branded experience.

### 3.7 Product Boundary

StudioFlow owns the client-facing delivery workflow.

It does not own the agency’s internal production workflow.

The agency may continue to manage detailed internal tasks through other systems.

StudioFlow stores and presents only the information required to coordinate delivery with the client.

---

## 4. Product Promise

### 4.1 Core Promise

> Move every project from kickoff to final approval with clarity.

### 4.2 Functional Promise

> Keep client actions, feedback, approvals, scope decisions, and final handoff connected to the project context they belong to.

### 4.3 Client Promise

> Always know where the project stands, what requires attention, and what happens next.

### 4.4 Agency Promise

> Keep client projects moving without reconstructing decisions or chasing every response through email.

---

## 5. Product Goals

### 5.1 Reduce Client-Blocked Project Time

StudioFlow must make client responsibilities visible, assigned, time-bound, and easy to complete.

### 5.2 Create a Single Client Delivery Narrative

The project must appear as a coherent progression rather than a collection of files, messages, and links.

### 5.3 Preserve Context Across Review Cycles

Feedback, versions, approvals, and revision decisions must remain connected.

### 5.4 Formalize Important Decisions

Approval, revision, change-request acceptance, and final acknowledgment must be explicit actions with recorded identity and time.

### 5.5 Protect Project Scope

StudioFlow must help the agency distinguish an ordinary revision from work that may affect scope, cost, or timeline.

### 5.6 Improve Delivery Consistency

The product must provide a recommended workflow that can be repeated across projects without requiring a custom system for every engagement.

### 5.7 Provide a Premium Client Experience

The client portal must communicate competence, progress, and control.

Visual quality is a product requirement.

### 5.8 Remain Compatible With Existing Tools

StudioFlow must be useful without replacing the agency’s internal task manager, design software, source-control platform, accounting tool, or communication stack.

---

## 6. Product Non-Goals

The MVP will not attempt to provide:

- Lead management
- Sales CRM
- Proposal generation
- Contract generation
- Electronic signatures
- Full invoicing
- Payment processing
- Subscription billing
- Time tracking
- Resource planning
- Utilization reporting
- Profitability reporting
- Internal sprint planning
- General-purpose task management
- Team chat
- Video conferencing
- Source-control integration
- Design-tool replacement
- Digital asset management
- Enterprise proofing
- Custom workflow builders
- No-code automation builders
- Advanced reporting suites
- Multiple approval chains
- Enterprise SSO
- Complex custom permission builders
- AI-generated feedback or summaries
- AI capabilities added only for portfolio appeal

These exclusions protect the product from becoming a generic agency operating system.

---

## 7. User Model

StudioFlow separates workspace authority from project access.

A workspace role defines what an agency user may generally do.

Project assignment defines which projects that user may access and which project they are responsible for.

### 7.1 Agency Workspace Roles

#### Agency Owner

The Agency Owner has workspace-level authority.

An Agency Owner may:

- Manage agency identity and branding
- Manage agency members and workspace roles
- View all Client Organizations and Projects
- Create and archive Projects
- Perform exceptional administrative actions
- Serve as the assigned Delivery Manager for a Project

The MVP may support more than one Agency Owner.

#### Delivery Manager

The Delivery Manager is the primary operational agency role.

A Delivery Manager may:

- Create Client Organizations
- Create Projects
- Access Projects to which they are assigned
- Coordinate the client-facing delivery workflow
- Publish client-facing project content
- Manage review, revision, scope-change, and handoff workflows

Each published Project must have exactly one assigned Delivery Manager.

A Delivery Manager creating a Project is assigned to it by default unless another eligible Delivery Manager or Agency Owner is selected.

#### Agency Member

An Agency Member contributes work to assigned Projects.

The role may represent a:

- Designer
- Developer
- Strategist
- Copywriter
- Quality-assurance specialist

An Agency Member may prepare Draft content and respond to feedback but cannot publish restricted client-facing content or make commercial decisions.

### 7.2 Client Project Roles

#### Client Approver

The Client Approver is the binding client-side decision authority for one Project.

Each published Project must have exactly one Client Approver in the MVP.

The Client Approver may:

- View the assigned Project
- Complete assigned Client Actions
- Comment on Deliverables
- Approve a Deliverable Version
- Request revision
- Accept or reject a Change Request
- Acknowledge final Handoff

The Client Approver may be changed only through an authorized agency action.

The change must preserve previous decisions and create an Activity Event.

#### Client Contributor

A Client Contributor participates without binding decision authority.

The role may:

- View the assigned Project
- Complete assigned Client Actions
- Upload requested files
- Comment on Deliverables
- Reply to shared discussions

The role may not:

- Approve Deliverables
- Request a binding revision decision
- Accept or reject Change Requests
- Acknowledge final completion
- Manage Project membership

### 7.3 Deferred Role

#### External Reviewer

External Reviewer access is not part of the MVP.

A future version may allow limited review access to one Deliverable without full Project membership.

## 8. Roles and Permissions

### 8.1 Permission Principles

1. Workspace role defines agency capability.
2. Project assignment defines project access and responsibility.
3. Agency Owners may access every Project in their workspace.
4. Delivery Managers and Agency Members may access only Projects to which they are assigned.
5. Client users may access only Projects to which they are explicitly assigned.
6. Client Contributors may participate but cannot make binding decisions.
7. Only the Client Approver may make formal client decisions.
8. Only an Agency Owner or assigned Delivery Manager may publish client-facing content.
9. Internal agency content must never be exposed to client users.
10. Exceptional overrides must require a reason and create an Activity Event.
11. Removal of an assigned Delivery Manager or Client Approver must be completed as an atomic reassignment, so a published Project never remains without either role.

### 8.2 Permission Matrix

| Capability                                 | Agency Owner |              Delivery Manager |    Agency Member |  Client Approver | Client Contributor |
| ------------------------------------------ | -----------: | ----------------------------: | ---------------: | ---------------: | -----------------: |
| View delivery overview                     | All Projects |             Assigned Projects |               No |               No |                 No |
| Manage agency branding                     |          Yes |                            No |               No |               No |                 No |
| Manage agency members and workspace roles  |          Yes |                            No |               No |               No |                 No |
| Create Client Organization                 |          Yes |                           Yes |               No |               No |                 No |
| Manage client members                      |          Yes |       Assigned client/project |               No |               No |                 No |
| Create Project                             |          Yes |                           Yes |               No |               No |                 No |
| Edit Project settings                      |          Yes |              Assigned Project |               No |               No |                 No |
| Assign Project members                     |          Yes |              Assigned Project |               No |               No |                 No |
| View Project                               | All Projects |              Assigned Project | Assigned Project | Assigned Project |   Assigned Project |
| Create Milestone Draft                     |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Publish Milestone                          |          Yes |              Assigned Project |               No |               No |                 No |
| Create Client Action Draft                 |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Publish, reassign, or reopen Client Action |          Yes |              Assigned Project |               No |               No |                 No |
| Complete assigned Client Action            |           No |                            No |               No |    Assigned only |      Assigned only |
| Send manual reminder                       |          Yes |              Assigned Project |               No |               No |                 No |
| Create Deliverable Draft                   |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Upload Deliverable Version                 |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Publish Deliverable Version                |          Yes |              Assigned Project |               No |               No |                 No |
| Add shared comment                         |          Yes |              Assigned Project | Assigned Project | Assigned Project |   Assigned Project |
| Add agency-only internal note              |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Resolve shared comment                     |          Yes |              Assigned Project | Assigned Project |               No |                 No |
| Reopen own resolved shared comment         |          Yes |                           Yes |              Yes |              Yes |                Yes |
| Approve Deliverable                        |           No |                            No |               No |              Yes |                 No |
| Request revision                           |           No |                            No |               No |              Yes |                 No |
| Classify Revision Request                  |          Yes |              Assigned Project |               No |               No |                 No |
| Create or send Change Request              |          Yes |              Assigned Project |               No |               No |                 No |
| Accept or reject Change Request            |           No |                            No |               No |              Yes |                 No |
| Publish Handoff Item                       |          Yes |              Assigned Project |               No |               No |                 No |
| Request Handoff acknowledgment             |          Yes |              Assigned Project |               No |               No |                 No |
| Acknowledge Handoff                        |           No |                            No |               No |              Yes |                 No |
| Complete Project without acknowledgment    |          Yes | Assigned Project, with reason |               No |               No |                 No |
| Archive Project                            |          Yes |              Assigned Project |               No |               No |                 No |
| Delete eligible Draft Project              |          Yes |              Assigned Project |               No |               No |                 No |

### 8.3 Comment Resolution

Only agency-side Project members may resolve a shared Comment.

The author of a resolved shared Comment may reopen it while:

- The related Deliverable Version remains current
- The Deliverable is not Approved
- The Project is not read-only

Resolution never deletes the Comment or its history.

## 9. Core Product Objects

The following objects define product behavior.

They are conceptual product objects, not database models.

### 9.1 Agency Workspace

The tenant-level environment belonging to one agency.

It contains:

- Agency identity
- Branding
- Default display currency
- Agency members
- Client Organizations
- Projects
- Workspace activity
- Product configuration

### 9.2 Agency Member

A user who belongs to the Agency Workspace.

An Agency Member has one workspace role and may receive project assignments.

### 9.3 Client Organization

A customer organization served by the agency.

A Client Organization may contain:

- Organization identity
- Client Members
- Multiple projects
- Shared context

Membership in a Client Organization does not automatically grant access to all of its projects.

### 9.4 Client Member

A user associated with one Client Organization.

A Client Member may participate in one or more projects belonging to that organization.

### 9.5 Project

The primary delivery container.

A Project connects:

- Client Organization
- Delivery Manager
- Agency Members
- Client Members
- Primary Client Approver
- Milestones
- Client Actions
- Deliverables
- Revision Requests
- Change Requests
- Activity
- Handoff

### 9.6 Project Membership

A project-scoped assignment connecting a user to a Project.

Project Membership determines project access and project role.

### 9.7 Milestone

A client-facing phase or meaningful delivery checkpoint.

A Milestone contains:

- Title
- Purpose
- Planned date range
- Client-facing description
- Position in the project sequence
- Related Client Actions
- Related Deliverables
- Lifecycle state

The MVP allows only one Active Milestone at a time.

### 9.8 Client Action

A specific action the agency requires from one Client Member.

Supported MVP action types:

- Text response
- File upload
- Confirmation

A Client Action contains:

- Title
- Instructions
- Responsible Client Member
- Due date
- Related Milestone
- Blocking or non-blocking designation
- Completion record

Every Client Action in the MVP is required for Milestone completion.

A non-blocking Client Action does not contribute to Client-Blocked Time until explicitly designated as blocking.

### 9.9 Deliverable

A reviewable body of work associated with one Milestone.

A Deliverable contains:

- Title
- Description
- Milestone
- Review context
- Versions
- Current review status
- Final decision history

Every Deliverable in the MVP requires a formal Review Decision before its Milestone may be completed.

### 9.10 Deliverable Version

An immutable review record belonging to one Deliverable.

Supported MVP version types:

- Image
- External link
- Downloadable file

An image version supports pin-based contextual comments.

A link or file version supports general comments but not visual coordinate annotations.

Each published version records:

- Version number
- Published by
- Published time
- Review instructions
- Review due date
- Asset or link metadata
- Review Decision
- Comment history

Stored image and file assets represent immutable snapshots.

For an external link, StudioFlow preserves the published URL, version label, and decision record but cannot guarantee that external content remains unchanged.

### 9.11 Comment

A contextual discussion item attached to one Deliverable Version.

A Comment may be:

- Shared with agency and client project members
- Agency-only internal

An image comment may include normalized coordinates.

A Comment may contain:

- Body
- Author
- Visibility
- Replies
- Status
- Creation time
- Resolution history

### 9.12 Review Decision

A binding client decision attached to one Deliverable Version.

Supported MVP decision types:

- Approved
- Revision Requested

A standalone Reject decision is not part of the MVP.

A Review Decision records:

- Decision type
- Client Approver
- Decision time
- Optional approval note
- Required revision summary when revision is requested
- Deliverable Version
- Number of unresolved shared comments at decision time

### 9.13 Revision Request

A structured workflow created when the Client Approver requests revision.

A Revision Request contains:

- Source Deliverable Version
- Client revision summary
- Related comments
- Agency classification
- Agency-only classification note
- Client-visible clarification question when required
- Client clarification response when required
- Lifecycle state
- Related Change Request when applicable

Supported classifications:

- Unclassified
- In Scope
- Needs Clarification
- Potential Scope Change

### 9.14 Change Request

A formal proposal describing work that may affect agreed scope, timeline, or cost.

A Change Request contains:

- Title
- Reason
- Scope impact
- Timeline impact
- Optional cost impact in the workspace display currency
- Decision deadline
- Related Project
- Related Milestone or Revision Request
- Client decision
- Application status

A Sent Change Request is treated as blocking project progression until it is accepted, rejected, or withdrawn.

### 9.15 Activity Event

An immutable record of a meaningful project event.

Examples:

- Project created
- Client invited
- Client Action published
- Client Action completed
- Deliverable Version published
- Comment resolved
- Approval recorded
- Revision requested
- Revision classified
- Change Request accepted
- Approver changed
- Handoff acknowledged
- Project completed

### 9.16 Handoff

The final delivery container for one Project.

A Handoff contains:

- Final instructions
- Handoff Items
- Acknowledgment due date
- Acknowledgment status
- Acknowledged by
- Acknowledged time
- Completion override record when applicable

### 9.17 Handoff Item

A final project asset, document, or link.

Supported MVP item types:

- Downloadable file
- External link
- Documentation

A Handoff Item may be required or optional.

### 9.18 Email Notification

A communication generated from a product event.

Email delivery is not the source of truth.

The underlying project event and product state remain authoritative.

## 10. Product Surfaces

This section defines product areas, not final navigation or screen layout.

### 10.1 Agency Workspace

The Agency Workspace includes:

- Delivery overview
- Client organizations
- Projects
- Project workspace
- Workspace branding
- Agency members

### 10.2 Agency Delivery Overview

The overview must help authorized agency users identify:

- Projects currently waiting on clients
- Overdue client actions
- Deliverables awaiting decision
- Revision requests awaiting classification
- Change requests awaiting client decision
- Projects approaching handoff
- Recent client activity

The overview is exception-focused.

It is not a general business analytics dashboard.

### 10.3 Agency Project Workspace

The project workspace must allow the agency to manage:

- Project summary
- Project members
- Milestones
- Client actions
- Deliverables
- Review cycles
- Revision requests
- Change requests
- Activity
- Handoff

### 10.4 Client Portal

The Client Portal includes:

- Client Action Center
- Project overview
- Milestone progress
- Deliverable review
- Change-request decisions
- Activity relevant to the client
- Final handoff

### 10.5 Client Action Center

The first client-facing priority is not navigation.

It is attention.

The Client Action Center must show:

- Actions assigned to the current client user
- Deliverables awaiting the user’s decision
- Change requests awaiting decision
- Upcoming due dates
- Recently completed actions
- Clear next step

### 10.6 Deliverable Review Experience

The review experience must emphasize:

- Current version
- Version identity
- Review instructions
- Contextual feedback
- Decision authority
- Formal approval or revision request
- What happens next

### 10.7 Handoff Experience

The handoff experience must present:

- Final assets
- Documentation
- Final links
- Required acknowledgments
- Project completion state

---

## 11. Core Workflows

### 11.1 Agency Workspace Onboarding

```text
Agency Owner creates workspace
        ↓
Agency identity and branding configured
        ↓
Agency members invited
        ↓
First client organization created
        ↓
First project created
```

#### Completion Condition

The agency can create and configure a client project without engineering or support intervention.

---

### 11.2 Project Creation

```text
Agency creates project
        ↓
Client organization selected
        ↓
Delivery Manager assigned
        ↓
Primary Client Approver assigned
        ↓
Agency and client members assigned
        ↓
Project dates and summary defined
        ↓
Milestones created
        ↓
Project remains Draft until published
```

#### Required Before Publication

- Client organization
- Delivery Manager
- Primary Client Approver
- Project title
- Project summary
- Target completion date
- At least one Milestone

---

### 11.3 Client Invitation and Access

```text
Agency adds client member
        ↓
Client is assigned to project
        ↓
Secure invitation is sent
        ↓
Client confirms identity
        ↓
Client enters assigned project
```

#### Product Requirements

- Client access must be low friction.
- Invitations must expire.
- Expired invitations must be recoverable.
- A removed client must immediately lose access.
- Formal decisions require an authenticated identity.
- Public anonymous project access is not part of the MVP.

The exact authentication technology is deferred.

---

### 11.4 Client Onboarding

```text
Project enters Onboarding
        ↓
First Milestone becomes Active
        ↓
Agency publishes onboarding Client Actions
        ↓
Actions appear in Client Action Center
        ↓
Client submits responses or files
        ↓
Required onboarding actions complete
        ↓
Delivery Manager moves Project to Active
```

#### Product Rule

If no required onboarding actions exist, the Delivery Manager may move the Project to Active immediately.

The agency may move the Project forward with incomplete required onboarding actions only through an explicit override with a recorded reason.

---

### 11.5 Milestone Progression

```text
Milestone Planned
        ↓
Milestone activated
        ↓
Agency publishes actions or deliverables
        ↓
Client completes required work
        ↓
Required decisions recorded
        ↓
Milestone completed
        ↓
Next Planned Milestone may be activated
```

#### Product Rules

- Only one Milestone may be Active at a time in the MVP.
- The Active Milestone is the current client-facing Milestone.
- A completed Milestone remains visible.
- Standard completion requires all Client Actions to be Completed and all Deliverables to have a final Review Decision.
- Internal agency work remains outside StudioFlow and is confirmed manually by the Delivery Manager.
- An Agency Owner or Delivery Manager may override completion criteria with a recorded reason.

---

### 11.6 Client Action Completion

```text
Agency creates action draft
        ↓
Action assigned to one client member
        ↓
Action published
        ↓
Client notified
        ↓
Client submits required response
        ↓
Action marked completed
        ↓
Agency may reopen when submission is insufficient
```

#### Product Rules

- Only one Client Member is responsible for an action in the MVP.
- Every Client Action must have a due date.
- Reassignment must preserve history.
- Only Open Client Actions explicitly designated as blocking contribute to Client-Blocked Time.
- Optional actions do not block milestone completion unless manually configured as required.

---

### 11.7 Deliverable Publication

```text
Agency creates deliverable
        ↓
Agency uploads or links Draft Version
        ↓
Review instructions and due date added
        ↓
Authorized agency user publishes Version
        ↓
Version becomes Awaiting Decision
        ↓
Client notified
```

#### Product Rules

- A draft version is not visible to client users.
- Only one Version may be Awaiting Decision for a Deliverable.
- Publishing a replacement before decision Supersedes the previous Version.
- Superseded versions remain visible in history.
- Publishing a new Version after a Revision Request starts a new review cycle.
- Publishing a new Version after approval requires reopening the Deliverable with a reason.

---

### 11.8 Deliverable Review

```text
Client opens current version
        ↓
Client reads review instructions
        ↓
Client contributors and approver comment
        ↓
Agency responds and resolves comments
        ↓
Client Approver makes formal decision
```

#### Decision Paths

```text
Approve
   ↓
Version becomes Approved
   ↓
Deliverable becomes Approved
   ↓
Related milestone may advance
```

```text
Request Revision
   ↓
Version becomes Revision Requested
   ↓
Revision Request created
   ↓
Agency classifies request
```

#### Product Rules

- Only the current Version awaiting decision may receive a formal decision.
- A superseded version cannot be approved.
- A decision confirmation must clearly name the deliverable and version.
- A revision request requires a summary.
- Approval does not delete unresolved comments.
- The interface must warn when approval occurs with unresolved shared comments.
- Approval history is immutable.

---

### 11.9 Revision Classification

```text
Client requests revision
        ↓
Revision Request created as Unclassified
        ↓
Delivery Manager reviews summary and related comments
        ↓
Revision Request classified
```

#### In-Scope Path

```text
Classified In Scope
        ↓
Agency prepares new Version
        ↓
New Version published
        ↓
Revision Request becomes Resolved
        ↓
New review cycle begins
```

#### Clarification Path

```text
Classified Needs Clarification
        ↓
Agency publishes one focused clarification question
        ↓
Client Approver responds
        ↓
Revision Request returns to Open
        ↓
Classification resets to Unclassified
        ↓
Agency reclassifies request
```

#### Potential Scope-Change Path

```text
Classified Potential Scope Change
        ↓
Agency sends Change Request
        ↓
Revision Request awaits Change Request decision
```

If the Change Request is accepted and applied, the Revision Request becomes Resolved.

If the Change Request is rejected or withdrawn, the Revision Request becomes Closed and no additional work is authorized by that request.

### 11.10 Change Request

```text
Agency creates Change Request draft
        ↓
Scope, timeline, and cost impact documented
        ↓
Authorized agency user sends request
        ↓
Client Approver reviews
        ↓
Client accepts or rejects
```

#### Accepted Path

```text
Accepted
   ↓
Agency applies decision to project
   ↓
Relevant milestone or dates updated
   ↓
Change Request marked Applied
```

#### Rejected Path

```text
Rejected
   ↓
Original project scope remains authoritative
   ↓
Change Request closed
```

#### Product Rules

- Client Contributors may view but not decide.
- Cost impact may be zero.
- Timeline impact may be none.
- The product records acceptance but does not collect payment.
- Client acceptance becomes the authoritative decision immediately.
- Acceptance does not automatically alter project dates or Milestones.
- The Delivery Manager applies the accepted change explicitly so the updated plan becomes visible.
- A sent Change Request cannot be edited silently.
- Material changes require withdrawal and replacement.

---

### 11.11 Final Handoff

```text
Required milestones completed
        ↓
Project enters Handoff
        ↓
Agency publishes final Handoff Items
        ↓
Agency requests acknowledgment with due date
        ↓
Client reviews final assets and information
        ↓
Client Approver acknowledges the Handoff
        ↓
Project becomes Completed
```

#### Alternative Closure

```text
Client does not acknowledge
        ↓
Authorized agency user completes project with reason
        ↓
Completion recorded without client acknowledgment
```

#### Product Rules

- All required active Handoff Items must be Published before acknowledgment may be requested.
- Sensitive credentials must not be stored as plain text in the MVP.
- Credentials may be represented through secure external instructions or links.
- Handoff acknowledgment is a project event, not a legal signature.
- Completed projects become read-only except for authorized administrative actions.

---

### 11.12 Project Archival

```text
Project completed or cancelled
        ↓
Authorized agency user archives project
        ↓
Project removed from active views
        ↓
Historical access remains according to permissions
```

Archived projects are read-only.

Restoration from archive is deferred.

---

## 12. MVP Scope

### 12.1 Workspace Foundation

Included:

- Agency workspace
- Agency identity
- Logo
- Brand color configuration
- Workspace display currency
- Agency member invitation
- Workspace roles
- Client organizations
- Client member invitation
- Project-scoped membership

Not included:

- Custom domain
- Multiple brands per workspace
- Advanced theme builder
- Billing management
- Subscription management

### 12.2 Agency Delivery Overview

Included:

- Active projects
- Client-blocked projects
- Overdue client actions
- Deliverables awaiting decision
- Revision requests awaiting classification
- Change requests awaiting client decision
- Recent client activity

Not included:

- Financial analytics
- Resource utilization
- Time reports
- Profitability reports
- Custom dashboard builder

### 12.3 Project Management for Delivery

Included:

- Project creation
- Client organization assignment
- Delivery Manager assignment
- Client Approver assignment
- Project members
- Project summary
- Planned dates
- Lifecycle status
- Project health
- Milestones
- Current milestone
- Client-facing project overview
- Project activity

Not included:

- Internal task lists
- Sprint planning
- Dependencies between internal tasks
- Gantt charts
- Resource allocation
- Time tracking

### 12.4 Client Actions

Included:

- Text-response action
- File-upload action
- Confirmation action
- One responsible client member
- Due date
- Blocking designation
- Completion
- Reopening
- Reassignment
- Overdue state
- Notifications

Not included:

- Advanced form builder
- Conditional forms
- Multi-step questionnaires
- Electronic signatures
- Recurring actions
- Multiple responsible users

### 12.5 Deliverables and Versions

Included:

- Deliverable creation
- Version creation
- Draft and published versions
- Image version
- External-link version
- Downloadable-file version
- Version history
- Review instructions
- Current Version awaiting decision
- Superseded versions
- Approval history

Not included:

- Video review
- Audio review
- Live website annotation
- Figma synchronization
- Automatic screenshots
- Side-by-side visual version comparison
- Digital asset management

### 12.6 Feedback

Included:

- Shared comments
- Agency-only internal notes
- Replies
- Open and resolved states
- Image pin annotations
- General comments for links and files
- Comment history

Not included:

- Drawing tools
- Shape annotations
- Video timecode comments
- PDF coordinate annotations
- Comment export
- AI summaries

### 12.7 Review and Approval

Included:

- Client Approver decision
- Approve
- Request Revision
- Mandatory revision summary
- Decision confirmation
- Immutable decision history
- Warning for unresolved comments
- Reopen approved deliverable with reason

Not included:

- Multiple approval stages
- Sequential approvers
- Quorum approval
- Majority approval
- Legal signature
- Approval delegation

### 12.8 Revision Management

Included:

- Revision Request generated from client decision
- In Scope classification
- Needs Clarification classification
- Potential Scope Change classification
- Classification note
- Related comments
- Resolution history

Not included:

- Automatic scope classification
- Revision allowance accounting
- Automatic fee calculation
- AI classification
- Revision analytics beyond basic counts

### 12.9 Change Requests

Included:

- Change Request draft
- Scope impact
- Timeline impact
- Cost impact
- Decision deadline
- Send
- Accept
- Reject
- Withdraw
- Apply
- Decision history

Not included:

- Payment collection
- Contract amendment generation
- Digital signature
- Invoice creation
- Automatic schedule calculation
- Currency conversion

### 12.10 Final Handoff

Included:

- Handoff phase
- Handoff checklist
- Downloadable files
- External links
- Documentation
- Required and optional items
- Client acknowledgment
- Completion without acknowledgment with reason

Not included:

- Credential vault
- Password sharing
- Automated domain transfer
- Automated hosting transfer
- Long-term asset library
- Post-launch support ticketing

### 12.11 Email Notifications

Included:

- Email invitations
- Email for assigned Client Action
- Email for Client Action due reminder
- Email for Deliverable ready for decision
- Email for new shared comment or reply to thread participants
- Email for approval or Revision Request
- Email for clarification request
- Email for Change Request sent or decided
- Email for Handoff ready
- Email confirmation for project completion

Not included:

- Standalone in-app notification center
- SMS
- Push notifications
- Slack integration
- Microsoft Teams integration
- Custom notification workflows
- User-defined reminder schedules
- Per-event notification preference management

## 13. Functional Requirements

### 13.1 Workspace and Branding

The product must allow an Agency Owner to:

- Create one agency workspace
- Define the agency display name
- Upload an agency logo
- Select a primary brand color
- Select a workspace display currency
- Preview client-facing branding
- Invite agency members
- Assign agency roles

Brand configuration must not reduce accessibility.

The system must preserve readable contrast and usable focus states.

### 13.2 Client Organizations

Authorized agency users must be able to:

- Create a Client Organization
- Edit its display name
- Add client members
- Remove client members
- View its projects
- Archive the organization when it has no active projects

A Client Organization with active or historical project activity must not be hard-deleted through the standard interface.

### 13.3 Project Creation and Configuration

Authorized agency users must be able to:

- Create a project in Draft state
- Select one Client Organization
- Assign one Delivery Manager
- Assign one primary Client Approver
- Assign Agency Members
- Assign Client Contributors
- Define project title
- Define client-facing summary
- Define a planned start date and required target completion date
- Create and order Milestones
- Designate the first Milestone to become Active on publication
- Preview the Client Portal before publication
- Publish the project into Onboarding

### 13.4 Project Delivery Health

The system must calculate Project Health independently from Project Lifecycle.

Health is calculated only for Projects in Onboarding, Active, or Handoff.

Supported health states:

- On Track
- Waiting on Client
- At Risk
- Overdue

The MVP uses deterministic rules with the following precedence:

```text
Overdue
   ↓
Waiting on Client
   ↓
At Risk
   ↓
On Track
```

#### Overdue

A Project is Overdue when its target completion date has passed.

#### Waiting on Client

A Project is Waiting on Client when at least one blocking client obligation is outstanding.

Blocking obligations are:

- A Client Action in Open state with `Blocks Progress` enabled
- A Deliverable Version in Awaiting Decision state
- A Revision Request in Awaiting Clarification
- A Sent Change Request awaiting decision
- A requested Handoff acknowledgment awaiting response

#### At Risk

A Project is At Risk when it is not Overdue or Waiting on Client and either:

- The Project target completion date is within three calendar days, or
- The Active Milestone target end date is within three calendar days and its standard completion criteria are not satisfied

#### On Track

A Project is On Track when none of the higher-priority conditions apply.

Project Health must not use AI and must not be manually overwritten in the MVP.

### 13.5 Milestones

Authorized agency users must be able to:

- Create milestone drafts
- Reorder planned milestones
- Define title and client-facing description
- Define planned dates
- Activate a Planned Milestone when no other Milestone is Active
- Complete a milestone
- Cancel a milestone
- Record completion override reason

Client users must be able to:

- View published milestones
- Understand completed, current, and upcoming milestones
- See related actions and deliverables

### 13.6 Client Actions

Authorized agency users must be able to:

- Create a Client Action draft
- Select action type
- Define instructions
- Assign one client member
- Designate whether the Action blocks progression
- Assign a due date
- Relate it to one milestone
- Publish the action
- Reassign the action
- Reopen a completed action
- Cancel the action

Client users must be able to:

- View assigned Actions
- Submit a response
- Upload requested files
- Confirm a statement
- See submission time
- See whether the action was reopened
- Review the agency’s reopening note

The Client Approver may view all Client Actions in the assigned Project, including assignee and status, but may complete only Actions assigned to them.

A Client Contributor may view and complete only Actions assigned to them.

### 13.7 Deliverables

Authorized agency users must be able to:

- Create a Deliverable
- Relate it to one milestone
- Define title and review context
- Add a Version
- Choose supported version type
- Save version as draft
- Preview Version
- Set a required review due date
- Publish Version
- Withdraw a published version before decision
- Reopen an approved Deliverable with reason

Client users must be able to:

- View the current version
- View previous published versions
- Understand which version is current
- Review instructions
- See decision status
- Access comments appropriate to their role

### 13.8 Image Review

For an image version, authorized users must be able to:

- View the image at usable scale
- Zoom
- Place a comment pin
- Open a comment thread from a pin
- Navigate between pins
- See resolved and open states
- Add a general comment without a pin

Pin locations must remain correctly positioned across responsive display sizes.

### 13.9 Link and File Review

For an external-link version, client users must be able to:

- Open the link safely
- Return to StudioFlow
- Add general comments
- Make a formal decision inside StudioFlow

For a downloadable-file version, client users must be able to:

- See file identity
- See file type and size
- Download the file
- Add general comments
- Make a formal decision inside StudioFlow

### 13.10 Comments

All project participants with comment permission must be able to:

- Create a comment
- Reply to a comment
- View comment author and time
- View comment visibility
- Resolve or reopen when authorized

The system must:

- Preserve deleted-user identity as a historical label
- Prevent client access to agency-only comments
- Preserve comment history after version supersession
- Prevent comments from moving silently between versions

### 13.11 Approval and Revision Decision

The Client Approver must be able to:

- Approve the current Version
- Request revision
- Add an optional approval note
- Add a required revision summary
- Confirm the decision

Before confirmation, the product must show:

- Deliverable title
- Version number
- Decision effect
- Unresolved shared-comment warning when applicable

After confirmation:

- The decision becomes immutable
- The agency is notified
- The event appears in activity
- The Version state updates
- Duplicate decisions are prevented

### 13.12 Revision Classification

Authorized agency users must be able to:

- Open the Revision Request
- Review source decision and related comments
- Classify it
- Add a classification note
- Publish a client-visible clarification question
- Review the Client Approver’s clarification response
- Link a Change Request
- Resolve or close the Revision Request only through a valid workflow transition

The Client Approver and relevant Client Contributors must be able to:

- View the classification visible to the client
- Respond when clarification is requested
- View the linked Change Request when created

Internal commercial notes must remain agency-only.

### 13.13 Change Requests

Authorized agency users must be able to:

- Create a Change Request
- Relate it to a project
- Optionally relate it to a milestone or Revision Request
- Describe requested change
- Describe scope impact
- Describe timeline impact
- Enter optional cost impact in the workspace display currency
- Set decision deadline
- Save as draft
- Send to Client Approver
- Withdraw before decision
- Apply after acceptance

The Client Approver must be able to:

- View original project context
- View impact summary
- Accept
- Reject
- Add an optional decision note
- Confirm the decision

The system must not present acceptance as payment or legal signature.

### 13.14 Project Activity

The project must provide a chronological activity history for meaningful events.

Client users must see only client-visible events.

Agency users may see:

- Client-visible events
- Agency-only operational events

Activity must support filtering by event category.

### 13.15 Handoff

Authorized agency users must be able to:

- Move an eligible Project into Handoff
- Create Handoff Items
- Mark items required or optional
- Publish items
- Withdraw a Published item before Project completion
- Publish a replacement item
- Reorder active items
- Add final instructions
- Set an acknowledgment due date
- Request client acknowledgment
- Complete without acknowledgment with reason

The Client Approver must be able to:

- View all published handoff items
- Download or open items
- Confirm the published Handoff was received
- Acknowledge completion

### 13.16 Archive and Read-Only Behavior

Completed, Cancelled, and Archived projects must preserve historical records.

Archived projects must be read-only for standard users.

Agency Owners may retain limited administrative actions.

---

## 14. Business Rules

### 14.1 Workspace and Project Roles

A published Project must always have:

- Exactly one Delivery Manager
- Exactly one Client Approver

Either role may be reassigned, but reassignment and removal must occur atomically.

A Project may never remain published without either role.

### 14.2 Active Milestone

Only one Milestone may be Active at a time in the MVP.

The Active Milestone is the current client-facing Milestone.

### 14.3 Blocking Obligations

The following items block progression while outstanding:

- Blocking Client Action
- Deliverable awaiting Review Decision
- Revision Request in Awaiting Clarification
- Sent Change Request awaiting client decision
- Requested Handoff acknowledgment

Optional items do not contribute to blocking state.

### 14.4 Client-Blocked Time

Client-blocked time begins when a blocking obligation becomes actionable.

It ends when:

- The blocking Client Action is Completed, Cancelled, or changed to non-blocking through a recorded agency action
- The Review Decision is recorded or the Version is Withdrawn
- The clarification response is submitted or the Revision Request leaves Awaiting Clarification
- The Change Request is accepted, rejected, or withdrawn
- The Handoff is acknowledged
- The agency completes the Project through an override
- The Project is Cancelled or Completed

Periods before publication or sending are excluded.

When blocking obligations overlap, elapsed time is counted once at Project level rather than summed across obligations.

### 14.5 Published Content Is Historical

Published Versions, Client Actions, Handoff Items, formal decisions, Change Requests, and Activity Events must not be silently altered.

Corrections require a new Version, withdrawal, replacement, or explicit administrative event.

### 14.6 Approval Is Version-Specific

Approval applies only to the exact Deliverable Version identified in the Review Decision.

Approval does not apply to future Versions.

A standalone Reject decision is represented as Revision Requested in the MVP.

### 14.7 Approved Deliverables May Be Reopened

An Approved Deliverable may be reopened only when:

- An Agency Owner or assigned Delivery Manager performs the action
- A reason is provided
- The original approval remains in history
- The event is visible to the client

### 14.8 Revision Is Not Automatically a Scope Change

A Revision Request must be classified by the agency.

It does not become a Change Request automatically.

### 14.9 Change Requests Are Explicit

A potential scope change becomes an authoritative client decision when:

- The agency sends a formal Change Request
- The Client Approver accepts or rejects it

An accepted Change Request remains `Accepted` until the Delivery Manager applies its impact to the visible Project plan.

`Applied` describes operational follow-through, not the validity of the acceptance.

### 14.10 Accepted Change Requests Do Not Process Payment

StudioFlow records the scope decision.

External contract, invoice, and payment systems remain authoritative for legal and payment execution.

### 14.11 Client Actions Have One Responsible User

Each Client Action has one responsible Client Member in the MVP.

Every Client Action must have a due date.

Changes to assignee, due date, or blocking status after publication must:

- Be performed by an Agency Owner or assigned Delivery Manager
- Create an Activity Event
- Notify the affected Client Member when responsibility or due date changes

Reassignment must preserve history.

### 14.12 Deliverable Decisions

Each published Deliverable Version must have a review due date.

Every Deliverable blocks Milestone completion until the current review cycle receives a Review Decision.

### 14.13 Milestone Completion

Standard Milestone completion requires:

- All Client Actions in the Milestone to be Completed or Cancelled
- All Deliverables in the Milestone to have a final Review Decision
- No Sent Change Request linked to the Milestone awaiting decision
- No Accepted Change Request linked to the Milestone awaiting application

The Delivery Manager confirms that internal agency work is complete.

An Agency Owner or Delivery Manager may override standard criteria with a recorded reason.

### 14.14 Project Completion

Standard Project completion requires:

- Project Lifecycle is Handoff
- All required active Handoff Items are Published
- Handoff acknowledgment is recorded
- No blocking obligation remains

An Agency Owner or Delivery Manager may complete without acknowledgment through an explicit override with a reason.

### 14.15 Internal Content Remains Internal

Agency-only comments, classification notes, and internal Activity Events must never appear in the Client Portal.

### 14.16 Hard Deletion Is Restricted

A Project may be hard-deleted only when:

- It is Draft
- No client invitation has been accepted
- No client activity exists
- No formal decision exists

Otherwise, the Project must be Cancelled or Archived.

### 14.17 Read-Only States

Completed, Cancelled, and Archived Projects are read-only for standard product workflows.

Historical content and formal decisions remain visible according to access permissions.

## 15. State Models

### 15.1 Project Lifecycle

```text
Draft
  ↓
Onboarding
  ↓
Active
  ↓
Handoff
  ↓
Completed
  ↓
Archived
```

Alternative terminal path:

```text
Draft / Onboarding / Active / Handoff
                    ↓
                 Cancelled
                    ↓
                 Archived
```

#### Draft

- Agency-only
- Configurable
- No client access

#### Onboarding

- Client access enabled
- First Milestone Active
- Onboarding Client Actions may be active

#### Active

- Main project delivery in progress
- Milestones, Client Actions, Deliverables, and decisions active

#### Handoff

- Final assets and completion requirements active

#### Completed

- Delivery finished
- Historical access retained
- Read-only

#### Cancelled

- Project terminated before completion
- Reason required
- Read-only

#### Archived

- Removed from active views
- Historical record retained
- Read-only

### 15.2 Project Health

Project Health is computed independently from lifecycle.

```text
On Track
Waiting on Client
At Risk
Overdue
```

Terminal and Draft Projects do not receive active delivery health.

### 15.3 Milestone Lifecycle

```text
Planned
   ↓
Active
   ↓
Completed
```

Alternative path:

```text
Planned / Active
       ↓
    Cancelled
```

Only one Milestone may be Active at a time.

### 15.4 Client Action Lifecycle

```text
Draft
  ↓
Open
  ↓
Completed
```

Alternative paths:

```text
Open
 ↓
Cancelled
```

```text
Completed
   ↓
Reopened
   ↓
Open
```

`Overdue` is a computed condition, not a lifecycle state.

### 15.5 Deliverable Lifecycle

The Deliverable state is derived from its latest relevant Version and Revision Request.

```text
Draft
  ↓
Awaiting Decision
  ↓
Approved
```

Revision path:

```text
Awaiting Decision
        ↓
Revision Requested
        ↓
Revision In Progress
        ↓
Awaiting Decision
```

Reopen path:

```text
Approved
   ↓
Reopened
   ↓
Revision In Progress
```

### 15.6 Deliverable Version Lifecycle

```text
Draft
  ↓
Awaiting Decision
```

Decision paths:

```text
Awaiting Decision
        ↓
     Approved
```

```text
Awaiting Decision
        ↓
Revision Requested
```

Replacement path:

```text
Awaiting Decision
        ↓
    Superseded
```

Withdrawal path:

```text
Awaiting Decision
        ↓
     Withdrawn
```

### 15.7 Comment Lifecycle

```text
Open
  ↓
Resolved
  ↓
Reopened
  ↓
Open
```

### 15.8 Revision Request Lifecycle

```text
Open
  ↓
Awaiting Clarification
  ↓
Open
```

In-scope path:

```text
Open
  ↓
In Scope
  ↓
Resolved
```

The transition to Resolved occurs when a replacement Version is published.

Potential scope-change path:

```text
Open
  ↓
Awaiting Change Decision
```

Decision outcomes:

```text
Awaiting Change Decision
        ↓
Accepted Change Applied
        ↓
Resolved
```

```text
Awaiting Change Decision
        ↓
Change Rejected or Withdrawn
        ↓
Closed
```

### 15.9 Change Request Lifecycle

```text
Draft
  ↓
Sent
  ↓
Accepted
  ↓
Applied
```

Alternative terminal paths:

```text
Sent
 ↓
Rejected
```

```text
Sent
 ↓
Withdrawn
```

### 15.10 Handoff Item Lifecycle

```text
Draft
  ↓
Published
```

Withdrawal path:

```text
Published
   ↓
Withdrawn
```

A replacement is created as a new Handoff Item and may reference the Withdrawn item.

Handoff acknowledgment is recorded once at Project Handoff level, not per item.

### 15.11 Invitation Lifecycle

```text
Pending
  ↓
Accepted
```

Alternative paths:

```text
Pending
 ↓
Expired
```

```text
Pending
 ↓
Revoked
```

## 16. Email Notifications and Reminders

### 16.1 Notification Principles

1. Email directs a user to a specific product action.
2. Email never replaces authoritative product state.
3. Formal decisions require confirmation inside StudioFlow.
4. Reminder volume must remain controlled.
5. Users must understand why they received a message.
6. Agency-only events must never generate client-visible email.
7. Email delivery failure must not roll back the underlying event.

### 16.2 Required Email Events

- Client invitation
- Agency Member invitation
- Client Action assigned
- Client Action reminder
- Deliverable ready for decision
- New shared comment or thread reply for relevant participants
- Deliverable approved
- Revision requested
- Clarification requested or answered
- Change Request sent
- Change Request accepted or rejected
- Handoff ready
- Handoff acknowledged
- Project completion recorded

### 16.3 Default Reminder Rules

The MVP uses fixed reminder behavior:

- Send one reminder 24 hours before a Client Action or decision due date
- Send one overdue reminder 24 hours after the due date
- Do not send repeated automated reminders after the overdue reminder
- Allow the Delivery Manager to trigger one manual reminder for an outstanding obligation

### 16.4 Excluded Notification Capabilities

The MVP does not include:

- Standalone in-app notification center
- Per-event notification preferences
- Custom reminder schedules
- SMS
- Push notifications
- Slack or Microsoft Teams delivery

## 17. Search, Filtering, and Sorting

### 17.1 Agency Search

Authorized agency users must be able to search:

- Projects by title
- Client Organizations by name
- Client members by name or email

### 17.2 Project Filters

The delivery overview must support filters for:

- Project lifecycle
- Project health
- Delivery Manager
- Client Organization
- Active Milestone

### 17.3 Action Filters

Project actions must support filters for:

- Open
- Completed
- Overdue
- Required
- Assignee
- Milestone

### 17.4 Deliverable Filters

Deliverables must support filters for:

- Awaiting decision
- Revision requested
- Revision in progress
- Approved
- Milestone
- Asset type

### 17.5 Activity Filters

Activity must support filters for:

- Client action
- Deliverable
- Comment
- Approval
- Revision
- Change Request
- Handoff
- Membership
- Project state

### 17.6 Client Portal Search

Global search is not required in the Client Portal MVP.

The Client Portal should prioritize current actions and project structure over discovery through search.

---

## 18. Data and Access Boundaries

### 18.1 Tenant Isolation

One agency workspace must never access data belonging to another agency workspace.

Tenant isolation is a product requirement.

### 18.2 Client Organization Boundary

A Client Member may access only projects to which they are explicitly assigned.

Membership in a Client Organization does not automatically grant access to every project.

### 18.3 Project Boundary

Project content is visible only to assigned project members.

### 18.4 Internal Visibility

Agency-only content includes:

- Internal notes
- Internal classification details
- Operational override reasons when marked internal
- Internal activity events
- Draft content

### 18.5 Client Visibility

Client-visible content includes:

- Published project information
- Published milestones
- Assigned Client Actions
- Published Deliverable Versions
- Shared comments
- Formal decisions
- Client-visible Change Requests
- Published Handoff Items
- Client-visible activity

### 18.6 Draft Visibility

Draft milestones, actions, versions, Change Requests, and Handoff Items are agency-only.

### 18.7 File Access

Files must require authorization.

A file URL must not create permanent unauthenticated access.

### 18.8 Decision Identity

A formal decision must be attached to an authenticated user identity.

### 18.9 Historical Identity

When a user is removed, historical events must preserve:

- Display name at the time of event
- Role at the time of event when relevant
- Event history

### 18.10 Sensitive Credentials

The MVP must not store plaintext passwords, API keys, or production credentials as Handoff Item content.

---

## 19. Error and Recovery Scenarios

### 19.1 Expired Invitation

The user must see:

- That the invitation expired
- Which workspace or project issued it
- A way to request a new invitation

### 19.2 Revoked Access

A revoked user must lose access immediately.

The product must display a clear access-denied state without exposing project details.

### 19.3 Stale Deliverable Version

When a user attempts to comment on or decide a superseded version:

- The action must be blocked.
- The product must identify the current version.
- The user must be able to navigate to the current version.

### 19.4 Duplicate Decision

When a formal decision already exists:

- A second decision must be rejected.
- The existing decision must be shown.
- The interface must refresh to authoritative state.

### 19.5 Concurrent Publication

When two agency users attempt to publish different versions:

- Only one may become current.
- The conflict must be visible.
- No version may be silently discarded.

### 19.6 Failed File Upload

The user must receive:

- Clear failure reason when known
- Retry option
- Preservation of other draft metadata
- No partial published state

### 19.7 Interrupted Comment Submission

The product should preserve unsent comment text locally when possible.

A failed comment must not appear as successfully submitted.

### 19.8 Invalid Action Submission

When an action requires a file or text response:

- Missing required input must be identified.
- The action must remain open.
- Existing draft input should be preserved when possible.

### 19.9 Required Role Reassignment

When an Agency Owner attempts to remove or deactivate the current Delivery Manager or Client Approver:

- The action must be blocked until a replacement is selected.
- Reassignment and removal must be applied atomically.
- Existing decision and activity history must remain attributed.
- The new role holder must receive access before the previous holder loses it.

### 19.10 Project Archived During Session

The next write action must fail safely.

The user must be informed that the project became read-only.

### 19.11 Notification Delivery Failure

Notification failure must not roll back the underlying product event.

The event remains authoritative.

Authorized agency users should be able to see that delivery failed when operationally relevant.

### 19.12 Change Request Decision After Withdrawal

The decision must be blocked.

The user must see that the Change Request is no longer active.

### 19.13 Project Completion With Pending Work

Standard completion must be blocked when required work remains incomplete.

Authorized agency users may complete through an override with a reason.

---

## 20. Edge Cases

### 20.1 Client Approver Changes Mid-Review

The existing comments remain.

The new Client Approver receives decision authority.

The previous approver loses decision authority but may remain a Contributor when assigned.

### 20.2 Client Approver Changes After Approval

The original decision remains valid and historically attributed.

### 20.3 New Version Published While Client Is Reviewing

The previous version becomes Superseded.

Open review users must be informed before submitting comments or decisions.

### 20.4 Approval With Open Comments

Approval is allowed after explicit warning.

The decision record includes the number of unresolved shared comments at approval time.

### 20.5 Revision Requested Without Comments

The Client Approver must provide a revision summary.

### 20.6 Contributor Provides Conflicting Feedback

The Client Approver remains responsible for the formal decision.

StudioFlow records all comments but does not automatically consolidate opinions.

### 20.7 Client Action Assignee Leaves Organization

The action remains open.

The agency must reassign it.

### 20.8 Change Request Accepted After Deadline

The product may allow the decision unless the agency withdrew or replaced the request.

The decision is marked late.

### 20.9 Change Request Has No Cost Impact

A Change Request may explicitly state `No cost impact`.

The workspace display currency is used only when a monetary amount is provided.

### 20.10 Attempt to Activate a Second Milestone

The action must be blocked while another Milestone is Active.

The user must complete or cancel the current Active Milestone before activating another.

### 20.11 Client Does Not Acknowledge Handoff

The agency may complete the Project with a recorded reason.

Activity history must distinguish:

- Client-acknowledged completion
- Agency completion without acknowledgment

### 20.12 Approved Work Changes Due to Accepted Scope Change

The approved version remains in history.

The Deliverable is reopened or a new Deliverable is created according to the change.

### 20.13 External Link Changes or Becomes Unavailable

StudioFlow must display that the external resource is unavailable or may have changed outside StudioFlow.

The historical URL, version label, and Review Decision remain, but StudioFlow does not claim to preserve an immutable copy of external content.

### 20.14 Agency Member Is Removed

If the Agency Member is the assigned Delivery Manager, removal is blocked until reassignment is completed.

After valid removal:

- Historical Comments and Activity Events remain attributed.
- Access is revoked immediately.

### 20.15 Workspace Branding Creates Poor Contrast

The product must adjust or reject inaccessible combinations.

---

## 21. Product Analytics

### 21.1 Analytics Principles

Product analytics must measure the delivery workflow without exposing client content unnecessarily.

Analytics must not capture:

- Comment bodies
- Uploaded file contents
- Sensitive project content
- Credential information

### 21.2 Core Outcome Metrics

The product should support calculation of:

- Median Client-Blocked Time per Project, calculated from the union of overlapping blocked intervals
- Client Action Completion Time
- On-Time Client Response Rate across blocking obligations
- Approval Turnaround Time
- Percentage of Active Projects Waiting on Client
- Client Actions Completed On Time
- Revision Rounds per Deliverable
- Change Request Decision Time
- Final Handoff Acknowledgment Time

### 21.3 Adoption Events

Track:

- Workspace created
- Branding configured
- Agency member invited
- Client Organization created
- Project created
- Project published
- Client invited
- Client invitation accepted
- Client Action published
- Client Action completed
- Deliverable version published
- Comment created
- Formal decision recorded
- Revision classified
- Change Request sent
- Change Request decided
- Handoff published
- Handoff acknowledged
- Project completed

### 21.4 Funnel Candidates

#### First-Project Activation Funnel

```text
Workspace created
        ↓
First project created
        ↓
First client invited
        ↓
First client action completed
        ↓
First deliverable published
        ↓
First formal decision recorded
```

#### Complete Delivery Funnel

```text
Project published
        ↓
Onboarding completed
        ↓
Deliverable approved
        ↓
Project enters Handoff
        ↓
Handoff acknowledged
        ↓
Project completed
```

### 21.5 Portfolio Analytics Requirement

The portfolio implementation may use seeded data to demonstrate analytics.

Seeded metrics must be internally consistent with the Demo Narrative.

No dashboard number may exist without a traceable underlying event or state.

---

## 22. Definition of Done

The StudioFlow MVP is complete only when all required conditions below are satisfied.

### 22.1 Product Completeness

- The complete core delivery loop works end to end.
- Agency and client experiences are both functional.
- Core objects have real behavior and state.
- No primary workflow is represented only by static mock data.
- The Demo Narrative can be completed through the product.

### 22.2 Role and Permission Integrity

- Every role has enforced access boundaries.
- Client Contributors cannot make formal decisions.
- Client Approvers can make formal decisions only on assigned projects.
- Agency Members cannot publish restricted client-facing content.
- Internal content never appears to client users.
- Cross-workspace access is prevented.

### 22.3 Workflow Integrity

- Project lifecycle transitions are valid.
- Client-blocked time can be calculated.
- Deliverable versions remain traceable.
- Formal decisions are immutable.
- Revision requests are classified.
- Change Requests have explicit decisions.
- Handoff has explicit completion behavior.

### 22.4 Experience Quality

- The Agency Workspace is efficient and operational.
- The Client Portal is calm, clear, and premium.
- Every client-facing page has an obvious primary purpose.
- The Client Action Center clearly prioritizes attention.
- Current versions and required decisions are unmistakable.
- Loading, empty, success, error, and read-only states are designed.

### 22.5 Visual Quality

- The product does not resemble a generic admin template.
- Agency and client surfaces share a coherent design language.
- The Client Portal supports agency branding without losing accessibility.
- The core signature screens are portfolio-ready.
- Demo content is realistic and visually intentional.

### 22.6 Responsive Quality

- Client actions are usable on mobile.
- Deliverable review is usable across supported viewport sizes.
- Agency workflows are usable on tablet and desktop.
- No critical workflow depends on hover-only behavior.

### 22.7 Accessibility

- Core workflows are keyboard accessible.
- Focus states are visible.
- Form controls have accessible labels.
- Status is not communicated through color alone.
- Brand customization preserves readable contrast.
- Dialogs and decision confirmations are accessible.
- Error messages identify the affected field or action.

### 22.8 Reliability

- Write operations provide clear success or failure feedback.
- Duplicate decisions are prevented.
- Stale-version writes are prevented.
- File upload failure is recoverable.
- Archived and completed projects enforce read-only behavior.
- Notifications do not determine source-of-truth state.

### 22.9 Security and Privacy

- Tenant boundaries are enforced.
- Project membership boundaries are enforced.
- Files require authorization.
- Sensitive credentials are not stored as plain text.
- Formal decisions require authenticated identity.
- Removed users lose access immediately.

### 22.10 Performance

- Primary project views load without unnecessary blocking.
- Large images use appropriate delivery and preview behavior.
- Client actions and decisions respond promptly.
- Loading states communicate progress.
- The product avoids unnecessary client-side work.

Exact performance budgets belong to Engineering Architecture.

### 22.11 Testing

Critical behavior must be covered by automated tests, including:

- Role permissions
- Project access
- Client Action completion
- Deliverable publication
- Version supersession
- Approval
- Revision request
- Change Request decision
- Project completion
- Tenant isolation

Test strategy and tools belong to Engineering Architecture.

### 22.12 Documentation

The repository must document:

- Product problem
- Product workflow
- Role model
- Core architecture
- Setup
- Environment requirements
- Trade-offs
- Known limitations
- Future roadmap

The final README is written after implementation and visual completion.

### 22.13 Portfolio Readiness

- The live demo is stable.
- Demo credentials or access are clear.
- Screenshots show real product states.
- The repository history reflects deliberate delivery.
- The product can be explained to a non-technical buyer.
- The architecture can be defended to a technical reviewer.

---

## 23. Deferred Capabilities

The following capabilities are intentionally deferred.

### 23.1 Near-Term Candidates

- Project templates
- Custom domain
- Advanced white-labeling
- Additional image annotation tools
- PDF review
- External reviewer access
- Calendar view
- Basic integrations
- Project duplication
- Project archive restoration
- Custom reminder timing
- Simple payment-status display

### 23.2 Later Candidates

- Multiple client approvers
- Sequential approvals
- Approval groups
- Advanced PDF proofing
- Live website annotation
- Figma integration
- Slack integration
- Microsoft Teams integration
- Advanced audit exports
- Client satisfaction surveys
- Delivery analytics trends
- Storage upgrades
- Advanced permission controls
- Enterprise authentication

### 23.3 Explicitly Rejected for Current Product Direction

- Full CRM
- Full accounting
- Payroll
- Resource planning
- Internal sprint management
- Marketplace
- Advertising
- AI-first positioning
- General-purpose no-code workflow builder

---

## 24. Strategic Decisions

| Decision                                                                | Status   |
| ----------------------------------------------------------------------- | -------- |
| Product category: Client Delivery Platform                              | Approved |
| Primary customer: boutique web design and development agency            | Approved |
| Paying customer: agency                                                 | Approved |
| Workspace role defines capability and Project assignment defines access | Approved |
| Primary operational user: Delivery Manager                              | Approved |
| Delivery Manager is a workspace role and required Project assignment    | Approved |
| One Client Approver per published Project                               | Approved |
| Client Contributors may comment but not decide                          | Approved |
| External Reviewer in MVP                                                | Rejected |
| Project is the central product surface                                  | Approved |
| Client Action Center is the primary client attention surface            | Approved |
| Waiting on Client is a computed Project Health state                    | Approved |
| Waiting on Client as Project Lifecycle state                            | Rejected |
| One Active Milestone at a time                                          | Approved |
| Overlapping Active Milestones in MVP                                    | Rejected |
| Every Client Action is required for Milestone completion                | Approved |
| Client Action completion and blocking status are separate concerns      | Approved |
| Only Actions marked `Blocks Progress` contribute to Client-Blocked Time | Approved |
| Every Deliverable requires a Review Decision                            | Approved |
| Deliverable approval is Version-specific                                | Approved |
| Standalone Reject decision                                              | Rejected |
| Rejection represented as Revision Requested                             | Approved |
| Approval history is immutable                                           | Approved |
| Approved Deliverable may be reopened with reason                        | Approved |
| Image pin annotation in MVP                                             | Approved |
| PDF coordinate annotation in MVP                                        | Rejected |
| Video review in MVP                                                     | Rejected |
| External-link content treated as immutable snapshot                     | Rejected |
| External-link URL and decision metadata preserved                       | Approved |
| Revision Request automatically becomes Change Request                   | Rejected |
| Agency classifies Revision Request                                      | Approved |
| Accepted Change Request is authoritative before application             | Approved |
| Change Request processes payment                                        | Rejected |
| Final Handoff is part of MVP                                            | Approved |
| Handoff acknowledgment occurs at Project level                          | Approved |
| Plaintext credential storage                                            | Rejected |
| Standalone in-app notification center                                   | Rejected |
| Fixed email reminders and manual reminder action                        | Approved |
| Client participation requires paid seat                                 | Rejected |
| Product replaces internal agency tools                                  | Rejected |
| AI capability in MVP                                                    | Rejected |
| Technology selection in Product Specification                           | Rejected |

## 25. Open Questions

The following questions do not block Product Specification approval.

### 25.1 Authentication Experience

- Which authentication method best supports low-friction client access?
- Should Agency Members and Client Members use different sign-in methods?
- How long should invitation and sign-in links remain valid?
- Do sensitive administrative actions require recent reauthentication?

These questions must be resolved during Engineering Architecture without weakening the identity requirements defined here.

### 25.2 File Constraints

- Which file types are accepted for Client Action uploads?
- Which file types are accepted as Deliverable Versions?
- What size limits are commercially and operationally reasonable?
- Which image formats support annotation?

### 25.3 Cost Representation

- Which ISO currencies are enabled in the portfolio MVP?
- May a Change Request state `No cost impact`?
- Should a future version support structured cost breakdowns?

The MVP uses one workspace display currency and does not perform currency conversion.

### 25.4 Branding

- Which preset color adjustments best preserve contrast?
- Should the agency configure a secondary accent color in a later version?
- Which areas may be branded without weakening interface consistency?

The MVP remains limited to logo, agency identity, and one primary brand color.

### 25.5 Demo Scope

- Which image Deliverable becomes the signature review workflow?
- Which project phase demonstrates an In-Scope Revision Request?
- Which project phase demonstrates a Change Request?
- Which blocking obligation appears in the default Agency Delivery Overview?

These questions must be resolved in the Demo Narrative.

## 26. Approval Decision

**Decision:** Approved

The specification is approved because:

- The MVP is defined without relying on deferred capabilities.
- Workspace roles and project assignments are distinct.
- Binding decisions have one clear authority.
- Permission boundaries are project-scoped and internally consistent.
- Project Lifecycle and Project Health are separate.
- Only one Milestone is Active at a time.
- Blocking obligations and Client-Blocked Time are measurable.
- Deliverable and Version states are unambiguous.
- Revision Requests and Change Requests have separate responsibilities.
- Handoff acknowledgment occurs at Project level.
- The MVP excludes a standalone notification center and other low-value expansion.
- No implementation technology has been selected prematurely.
- The specification can produce a coherent Demo Narrative.

## 27. Next Document

After approval, the next document is:

- `docs/product/04-demo-narrative.md`

The Demo Narrative must define:

- The fictional agency
- The client organization
- The project
- Agency and client members
- Project phases and milestones
- Client Actions
- Deliverables and versions
- Feedback threads
- Approval history
- Revision request
- Change Request
- Activity timeline
- Handoff assets
- Dashboard metrics
- Default demo states

The narrative must make every visible number, status, comment, decision, and timeline in the product believable.
