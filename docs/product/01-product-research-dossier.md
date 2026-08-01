# StudioFlow

# Product Research Dossier

## Document Information

**Document Type:** Product Research Dossier

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- Product Engineering Strategy

**Includes:**

- Research Objective
- Market Landscape
- Competitor Analysis
- Common Market Patterns
- User Pain Evidence
- Market Gap Hypothesis
- Target Segment Hypothesis
- Positioning
- Product Boundaries
- Product Risks
- Strategic Decisions
- Open Questions

**Produces:**

- Business Context
- Product Specification
- Product Positioning
- Scope Boundaries
- Demo Narrative
- Visual Research Direction

---

## 1. Executive Summary

StudioFlow is a proposed client delivery platform for boutique web design and development agencies managing custom, multi-stage client projects.

The product focuses on the part of agency work that happens between the internal production team and the client:

- Collecting required information
- Communicating project progress
- Presenting deliverables
- Gathering contextual feedback
- Recording formal approvals
- Evaluating revision and scope impact
- Completing final handoff

The surrounding market is commercially established but fragmented across several product categories.

General client portals centralize files, messages, forms, payments, and customer communication. Productized-service platforms organize recurring requests and subscriptions. Agency operations platforms focus on internal project management, resources, budgets, and profitability. Creative proofing tools provide deep review, annotation, versioning, and approval workflows.

Each category solves part of the delivery problem. The working market-gap hypothesis is that boutique agencies still lack a sufficiently focused product that connects the complete client-facing lifecycle of a custom web project without becoming a full agency operating system or an enterprise proofing suite.

The opportunity is therefore not to build another generic client portal.

StudioFlow should connect:

- Project milestones
- Client responsibilities
- Deliverable versions
- Contextual feedback
- Formal approvals
- Revision decisions
- Scope changes
- Final handoff

The product thesis is:

> StudioFlow helps boutique web design and development agencies move custom projects from kickoff to final approval through one clear, branded, and client-friendly delivery experience.

StudioFlow will create two related but intentionally different experiences:

> The agency sees operations.  
> The client sees confidence.

The agency workspace should help teams identify blockers, delayed inputs, pending decisions, revision risk, and projects waiting on clients.

The client portal should make the project feel organized, understandable, and professionally managed without exposing the complexity of the agency’s internal production process.

---

## 2. Research Objective

The objective of this research is to determine whether StudioFlow represents a commercially credible portfolio product and whether its proposed position is sufficiently focused to justify product design and implementation.

The primary research question is:

> Where do boutique web design and development agencies lose time, control, and client confidence during project delivery, and can a focused client-facing product reduce those problems more effectively than a collection of general-purpose tools?

The research must answer:

1. Which product categories currently support agencies and their clients?
2. Which parts of the client delivery lifecycle are already well served?
3. Which problems repeatedly appear during custom creative and web projects?
4. Which product patterns have become expected in this market?
5. Where do existing products become too broad, too operational, or too specialized?
6. Which initial agency segment provides the clearest product focus?
7. What must StudioFlow deliberately avoid becoming?
8. Which positioning can be defended by the available evidence?
9. Does the product offer sufficient commercial, visual, and engineering depth?
10. Which assumptions must remain open for later validation?

---

## 3. Research Scope and Method

This dossier is based on desk research across three evidence types.

### 3.1 Product Evidence

Official product websites, feature pages, help centers, and product documentation were reviewed to understand:

- Product positioning
- Target customers
- Primary workflows
- Client-facing capabilities
- Review and approval models
- Project and service models
- Access and collaboration patterns
- Product breadth and complexity

### 3.2 Market Evidence

Products were grouped by their primary job:

- General client portals
- Productized-service platforms
- Client onboarding and action platforms
- Agency operations platforms
- Creative review and proofing tools

This classification separates direct alternatives from adjacent products.

### 3.3 Qualitative User Evidence

Public discussions from agency owners, designers, developers, freelancers, and project managers were reviewed to identify recurring pain patterns.

These discussions are illustrative evidence only. They are not statistically representative and do not prove market size, product-market fit, or willingness to pay.

### 3.4 Research Confidence

| Finding                                                   | Confidence  |
| --------------------------------------------------------- | ----------- |
| Existing product categories and competitor capabilities   | High        |
| Recurring approval, feedback, version, and scope problems | Medium      |
| Initial segment choice                                    | Medium      |
| Exact agency-size range                                   | Low         |
| Willingness to pay for StudioFlow specifically            | Unvalidated |
| Commercial viability beyond a portfolio product           | Unvalidated |

This dossier is sufficient to guide product design for the portfolio project. Direct customer interviews would still be required before treating StudioFlow as a validated commercial venture.

---

## 4. Product Hypothesis

### 4.1 Product Definition

StudioFlow is a premium client delivery platform for boutique web design and development agencies managing custom, multi-stage projects.

It gives agencies and their clients one shared environment to:

- Understand project progress
- Complete required client actions
- Review deliverables
- Provide contextual feedback
- Record formal approvals
- Evaluate revision and scope impact
- Access final project assets

### 4.2 Problem Statement

Boutique agencies commonly manage internal production through project management, design, development, and communication tools while client collaboration happens across email, shared drives, meetings, documents, messaging applications, and review links.

This fragmentation can create the following problems:

- Clients do not have one reliable view of project status.
- Feedback becomes separated from the relevant deliverable or version.
- Approval decisions are difficult to verify later.
- Client delays are discovered too late.
- Revision requests are not consistently classified.
- Work outside the original scope is not formally evaluated.
- Final deliverables and project knowledge are handed over inconsistently.
- Teams spend time manually answering status questions and coordinating follow-ups.

### 4.3 Solution Hypothesis

StudioFlow will provide a structured delivery layer between the agency’s internal production environment and the client.

It will not attempt to replace every internal agency tool.

Instead, it will translate internal progress into a controlled client-facing experience built around:

- Current project phase
- Next client action
- Upcoming milestone
- Deliverables awaiting review
- Recorded decisions
- Approved versions
- Scope impact
- Final handoff

### 4.4 Initial Value Proposition

> Move every client project from kickoff to final approval without chasing feedback through email.

### 4.5 Client Clarity Principle

Every client-facing screen should help answer at least one of these questions:

1. Where is the project now?
2. What requires my attention?
3. What has already been decided?
4. What happens after my action?

---

## 5. Market Landscape

### 5.1 General Client Portals

General client portals create a secure, branded environment where a service business can communicate with clients, exchange files, collect information, request payments, and provide access to shared resources.

Assembly represents this category clearly. It combines a modern CRM and client portal with file sharing, communication, payments, and related client-management capabilities.

Other products in this category include:

- SuiteDash
- Moxo
- FuseBase
- Zendo
- Plutio

#### Strengths

- Centralized client access
- Branded customer experience
- File sharing
- Messages and notifications
- Forms and information collection
- Payment and invoice access
- Broad applicability across service businesses

#### Limitation Relative to StudioFlow

General client portals are intentionally broad.

Their breadth can produce a collection of modules without deeply representing the progression of a custom web project. Files, messages, invoices, forms, and tasks may exist in one portal while still remaining weakly connected to project phases, deliverable versions, formal decisions, and scope impact.

#### Research Implication

StudioFlow should borrow the expectation of a polished, branded, centralized client experience.

It should avoid becoming a generic collection of client-management modules.

---

### 5.2 Productized-Service Platforms

Productized-service platforms are designed for agencies and service businesses selling repeatable packages, subscriptions, retainers, or recurring requests.

ManyRequests combines a branded client portal with onboarding, requests, time tracking, subscriptions, invoicing, CRM, and reporting. Its core model is strongly aligned with agencies and productized services.

The typical workflow is:

```text
Client purchases a service
        ↓
Client submits a request
        ↓
Request enters a queue
        ↓
Agency completes the work
        ↓
Client reviews the delivery
        ↓
Request is approved or revised
```

#### Strengths

- Structured request intake
- Repeatable workflows
- Request queues
- Service catalogs
- Subscription management
- Billing integration
- Communication connected to requests

#### Limitation Relative to StudioFlow

A request queue is effective for recurring deliverables such as content production, video editing, unlimited design, and small development requests.

It is less expressive for projects where each phase changes the context of the next phase, such as:

- Website strategy
- Information architecture
- UX and wireframes
- Visual design
- Development
- Quality assurance
- Launch
- Handoff

#### Research Implication

StudioFlow should borrow structured intake and context-bound communication.

It should organize work around project milestones, deliverables, decisions, and dependencies rather than a flat request queue.

---

### 5.3 Client Onboarding and Action Platforms

Products such as LaunchBay focus on reducing friction in customer onboarding and delivery coordination.

LaunchBay provides white-labeled client portals where customers can complete tasks, upload files, sign documents, approve deliverables, and track progress. It supports loginless access through magic links and emphasizes automated reminders and reusable workflows.

The primary model is:

```text
Business requests an action
        ↓
Client completes the action
        ↓
Project progress advances
        ↓
Business receives the required input
```

#### Strengths

- Low-friction client access
- Guided client tasks
- File collection
- Forms and documents
- Automated reminders
- Progress tracking
- Structured onboarding

#### Limitation Relative to StudioFlow

The central unit is usually a client task or onboarding step.

This model is effective for collecting information and keeping an implementation process moving, but it does not necessarily provide a rich visual project narrative or a deep creative review experience.

#### Research Implication

StudioFlow should treat client responsibilities as explicit, actionable objects rather than informal messages.

Every client action should also remain connected to a project phase, deliverable, or decision.

---

### 5.4 Agency Operations Platforms

Agency operations platforms manage the internal business of delivering professional services.

Productive combines project management, time tracking, resource planning, budgeting, profitability, reporting, CRM, and financial visibility. Its client portal can expose selected project information while preserving permission boundaries.

#### Strengths

- Operational visibility
- Resource planning
- Project management
- Budget tracking
- Profitability analysis
- Time tracking
- Internal reporting
- Controlled client access

#### Limitation Relative to StudioFlow

These products are primarily designed around agency operations.

The client portal is an extension of the internal project system rather than the central product experience.

Internal concepts such as utilization, budgets, timesheets, resource allocation, and profitability do not define a premium client delivery experience.

#### Research Implication

StudioFlow should maintain a strict boundary between internal operational information and client-facing project information.

The client should see a curated representation of the project rather than a restricted copy of an internal project-management tool.

---

### 5.5 Creative Review and Proofing Tools

Creative review and proofing tools specialize in collecting precise feedback and formal approvals on visual assets.

Frame.io provides review links, comments, annotations, version-aware collaboration, and approval workflows across creative media.

Filestage centralizes files, feedback, reviewer groups, version history, review decisions, and approval records.

MarkUp.io focuses on accessible contextual feedback across websites, images, PDFs, videos, and other content types.

#### Strengths

- Contextual comments
- Precise annotations
- Deliverable versioning
- Reviewer access
- Formal approval states
- Review history
- Reduced ambiguity
- Strong visual review experience

#### Limitation Relative to StudioFlow

Proofing tools are optimized around assets and review cycles.

They do not necessarily treat the complete commercial project lifecycle as their primary model.

An asset may be reviewed successfully without representing:

- Why the deliverable exists
- Which milestone it belongs to
- What decision it unlocks
- Whether the requested change affects scope
- What the next project phase is
- How final handoff should occur

#### Research Implication

StudioFlow should borrow contextual feedback, version-aware review, and formal approval.

It should connect those capabilities to project milestones, client responsibilities, scope decisions, and final delivery.

---

## 6. Competitor Selection

| Product      | Category              | Primary Research Value                                     |
| ------------ | --------------------- | ---------------------------------------------------------- |
| Assembly     | General Client Portal | Branded client experience and broad client management      |
| ManyRequests | Productized Services  | Structured requests, service delivery, and billing         |
| LaunchBay    | Client Onboarding     | Client actions, progress tracking, and low-friction access |
| Productive   | Agency Operations     | Internal operations and controlled client visibility       |
| Frame.io     | Creative Review       | Premium review, commenting, sharing, and approvals         |
| Filestage    | Online Proofing       | Versioning, reviewer groups, and formal review decisions   |
| MarkUp.io    | Visual Feedback       | Accessible contextual annotation across content types      |

These products are not all direct competitors.

Together, they define the existing expectations and adjacent workflows that StudioFlow must understand.

---

## 7. Competitor Teardown Matrix

| Product      | Primary Orientation           | Strongest Capability                                                  | Limitation Relative to StudioFlow                                                   | Borrow                                                    | Avoid                                                      | StudioFlow Opportunity                                          |
| ------------ | ----------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| Assembly     | General client portal         | Centralized, branded client environment                               | Broad module collection without a specialized web-project delivery lifecycle        | Premium presentation and centralized client access        | Generic all-in-one scope                                   | Make the project journey the center of the experience           |
| ManyRequests | Productized service delivery  | Structured requests connected to communication and billing            | Queue model is better suited to recurring services than custom multi-stage projects | Structured intake and context-bound communication         | Reducing complex projects to independent requests          | Build around milestones, deliverables, and dependencies         |
| LaunchBay    | Client onboarding and actions | Guided tasks, reminders, progress visibility, and low-friction access | Stronger on action completion than visual creative delivery                         | Clear next actions and magic-link access patterns         | Treating the project as a checklist alone                  | Combine client actions with a visual project narrative          |
| Productive   | Agency operations             | Internal operational and financial visibility                         | Client experience remains secondary to internal management                          | Strict separation of internal and external information    | Exposing internal project-management complexity            | Design the client experience as a first-class product surface   |
| Frame.io     | Creative collaboration        | Immersive review, contextual comments, and approvals                  | Optimized around media review rather than the full client project                   | Focused review, review links, and approval states         | Production-level complexity unnecessary for agency clients | Place review inside the broader milestone and decision workflow |
| Filestage    | Proofing and approval         | Multi-stage reviews, versions, and stakeholder decisions              | Workflow centers on content approval rather than complete service delivery          | Version history, review status, and decision traceability | Enterprise approval complexity in the initial product      | Simplify proofing while preserving formal decision history      |
| MarkUp.io    | Visual feedback               | Accessible annotation across many content formats                     | Feedback is not inherently connected to commercial scope or project progression     | Simple visual commenting and guest-friendly access        | Building annotation breadth before workflow depth          | Turn contextual feedback into structured project decisions      |

---

## 8. Common Market Patterns

### 8.1 Branded Client Experience

The client-facing environment is commonly expected to reflect the service provider’s identity through:

- Logo
- Brand colors
- Custom domain
- Personalized project presentation
- Branded communication

For a creative agency, the quality of the portal can influence the perceived quality of the service itself.

### 8.2 Centralized Project Context

Clients need one reliable place to access:

- Current status
- Required actions
- Deliverables
- Shared files
- Recent decisions
- Project updates

### 8.3 Explicit Client Actions

Successful coordination products convert vague requests into clear actions such as:

- Complete a questionnaire
- Upload brand assets
- Review a wireframe
- Approve a visual direction
- Confirm content readiness
- Respond to a clarification
- Accept a scope change

### 8.4 Contextual Communication

Feedback is more actionable when attached to:

- A project
- A milestone
- A deliverable
- A version
- A visual location
- A decision

A general project chat should not become the primary location for important feedback.

### 8.5 Formal Approval

Approval should be represented as an explicit state rather than inferred from conversation.

A reliable approval record should identify:

- What was approved
- Which version was approved
- Who approved it
- When the decision occurred
- Whether the approval included a note

### 8.6 Version History

Creative and web delivery requires a visible distinction between:

- Previous version
- Current review version
- Approved version
- Final deliverable

Feedback should remain connected to the version that originally received it.

### 8.7 Progress Visibility

Client-facing progress should communicate:

- Current phase
- Completed milestones
- Upcoming work
- Project blockers
- Required client actions
- Expected next step

### 8.8 Low-Friction Access

Clients are less likely to use a portal if access requires unnecessary setup or unfamiliar workflows.

Magic links, guest review links, and limited-access reviewer experiences are established responses to this friction.

### 8.9 Internal and External Boundaries

Agency teams and clients should not receive identical project views.

Internal information may include:

- Production tasks
- Internal comments
- Delivery risk
- Team assignments
- Commercial evaluation
- Scope assessment

Client information should emphasize:

- Progress
- Responsibilities
- Deliverables
- Decisions
- Dates
- Outcomes

### 8.10 Automated Follow-Up

Reminders and notifications can reduce manual chasing for client inputs and approvals.

Automation should support the product workflow without turning StudioFlow into an automation builder.

---

## 9. User Pain Evidence

### 9.1 Approval Requests Become Lost or Ambiguous

Public agency discussions repeatedly describe approvals being communicated across email, chat, and meetings without a durable record of the approved version or decision authority.

#### Product Implication

Approval must be modeled as a formal event attached to a specific deliverable version.

### 9.2 Feedback Becomes Scattered or Attached to the Wrong Version

Designers and agencies describe receiving comments through disconnected channels or against outdated versions of the work.

#### Product Implication

Feedback must remain attached to the relevant deliverable and version.

The active review version must be unmistakable.

### 9.3 Clients Resist Complex Production Tools

Specialist design and project-management tools can create friction for clients who only need to review work and make decisions.

#### Product Implication

The client review experience must not assume design, development, or project-management expertise.

### 9.4 Client Delays Slow Delivery

Delayed feedback and approvals can become project bottlenecks, particularly when several stakeholders are involved.

#### Product Implication

The system should distinguish:

- Waiting on agency
- Waiting on client
- Waiting on a specific reviewer
- Waiting on a consolidated decision

### 9.5 Files and Inputs Are Difficult to Collect

Shared drives and generic folders can create access friction and uncertainty about where required assets should be uploaded.

#### Product Implication

Client uploads should be attached to a clear request and should not require clients to understand the agency’s internal folder structure.

### 9.6 Scope Creep Appears During Revisions

Late-stage changes, additional formats, new deliverables, and repeated revision requests can affect project timelines and margins.

#### Product Implication

StudioFlow must distinguish between:

- Comment
- Clarification
- Minor revision
- Direction change
- New deliverable
- Change request

The system should support the decision. It should not automatically determine whether work is in scope.

### 9.7 Multiple Stakeholders Create Conflicting Feedback

Projects can slow down when contributors provide contradictory opinions or when decision authority is unclear.

#### Product Implication

The product should eventually support:

- A designated primary approver
- Multiple contributors
- Consolidated feedback
- Clear decision authority

The initial MVP should avoid a complex approval hierarchy while still defining who may comment and who may approve.

### 9.8 Agencies Use Fragmented Systems

Small agencies commonly combine project-management tools, shared drives, email, documents, spreadsheets, and review links.

#### Product Implication

StudioFlow must provide meaningful structure without requiring enterprise-level setup.

Its advantage should be a strong recommended workflow rather than unlimited configuration.

---

## 10. Market Gap Hypothesis

### 10.1 Observed Market Structure

The market already contains capable products for:

- General client portals
- Client onboarding
- Productized service requests
- Internal agency operations
- Visual proofing
- File approval

The opportunity is not an absence of software.

The opportunity is a more focused connection between these capabilities for custom web projects.

### 10.2 White-Space Hypothesis

> Boutique web design and development agencies may benefit from a client-facing delivery system that combines project narrative, client actions, milestone delivery, contextual feedback, formal approval, scope decisions, and final handoff without becoming a full agency operations suite.

StudioFlow should occupy the space between a general client portal and a specialized creative proofing tool.

```text
General Client Portal
        │
        │
        ├── StudioFlow
        │   ├── Guided project journey
        │   ├── Client Action Center
        │   ├── Milestone delivery
        │   ├── Contextual review
        │   ├── Formal approval
        │   ├── Scope decisions
        │   └── Final handoff
        │
        │
Creative Proofing Tool
```

### 10.3 Differentiation Hypothesis

StudioFlow will not attempt to provide the greatest number of features.

Its differentiation should come from the connection between:

- Project phase
- Client action
- Deliverable
- Version
- Feedback
- Approval
- Scope decision
- Next milestone

A deliverable in StudioFlow should not be an isolated file.

It should belong to a project narrative and unlock a visible next step.

### 10.4 Value Hypothesis

StudioFlow may create three forms of value.

#### Operational Value

- Fewer manual follow-ups
- Clearer blockers
- Faster client decisions
- Better project visibility
- More controlled revisions

#### Commercial Value

- Better scope protection
- Recorded approval history
- Clear change-request decisions
- More professional final handoff

#### Experience Value

- Stronger client confidence
- Premium branded delivery
- Less confusion
- Clear expectations
- Visible progress

These remain hypotheses until tested with direct users.

---

## 11. Target Segment Hypothesis

### 11.1 Primary Buyer

- Agency founder
- Studio owner
- Head of operations
- Project director
- Senior account manager

### 11.2 Primary Agency Segment

The initial product will be designed for boutique web design and development agencies with:

- Approximately 3–20 team members
- Multiple active client projects
- Custom project-based engagements
- Repeated client feedback and approval cycles
- Existing internal production tools
- A strong emphasis on presentation and client experience
- No large dedicated operations department

The team-size range is a working hypothesis, not a validated market boundary.

### 11.3 Primary Project Types

- SaaS marketing website design and development
- Corporate website redesign
- Product website design
- Custom web application design and delivery
- Combined brand and website engagement

### 11.4 Shared Project Characteristics

These projects usually have:

- A defined beginning and end
- Multiple phases
- Several deliverables
- Client dependencies
- Review cycles
- Formal approval points
- Potential scope changes
- A launch or final handoff

### 11.5 Adjacent Segments

The following are adjacent but not primary:

- Product design studios
- Branding studios
- Creative digital agencies

They may become relevant after the primary workflow is defined.

### 11.6 Excluded Initial Segments

StudioFlow will not initially optimize for:

- Unlimited design subscriptions
- High-volume social media production
- Generic consulting engagements
- Accounting firms
- Legal practices
- Enterprise creative compliance teams
- Internal product-development teams
- Agencies requiring deep resource planning
- Agencies primarily selling small, independent requests

---

## 12. Positioning

### 12.1 Category

**Client Delivery Platform**

### 12.2 Positioning Statement

> StudioFlow is a premium client delivery platform for boutique web design and development agencies managing custom, multi-stage projects.

> It brings milestones, client actions, deliverable review, approvals, scope changes, and final handoff into one clear and branded experience.

### 12.3 Core Promise

> Move every project from kickoff to final approval with clarity.

### 12.4 Functional Value Proposition

> Keep project progress, client responsibilities, feedback, approvals, and handoff connected to the work they belong to.

### 12.5 Emotional Value Proposition

> Give every client confidence that the project is organized, moving forward, and under control.

### 12.6 Portfolio Claim

> I build polished client-facing platforms that turn complex service workflows into clear, reliable product experiences.

### 12.7 What StudioFlow Is

- A client delivery system
- A structured project journey
- A review and approval environment
- A scope-decision workflow
- A premium client experience
- A multi-tenant business application

### 12.8 What StudioFlow Is Not

- A generic client portal
- A complete CRM
- A full project-management platform
- An accounting system
- A resource-planning platform
- A team chat application
- A digital asset management platform
- A productized-service request queue
- An enterprise proofing suite
- A SaaS starter kit

---

## 13. Product Principles

### 13.1 The Project Is the Product Surface

Clients should experience the project as a coherent journey, not as a collection of disconnected modules.

### 13.2 Every Screen Must Create Clarity

The interface should reduce uncertainty about progress, responsibility, decisions, or next steps.

### 13.3 Client Simplicity Must Not Remove Agency Control

The client experience should remain simple while the agency retains control over publishing, review states, approvals, and scope decisions.

### 13.4 Important Decisions Must Be Explicit

Approval, revision, rejection, and scope changes should not be inferred from general conversation.

### 13.5 Context Must Travel With the Work

Comments, files, versions, approvals, and decisions should remain connected.

### 13.6 Internal Complexity Must Stay Internal

The client should not be exposed to production tasks, internal discussions, profitability data, or operational noise.

### 13.7 The Product Should Guide, Not Merely Store

StudioFlow should recommend a clear delivery workflow rather than behaving like an empty workspace.

### 13.8 Visual Quality Is Functional

For a web design and development agency, presentation quality contributes directly to client trust.

The visual experience is part of the product’s functional value, not a decorative layer added after implementation.

### 13.9 Configuration Must Remain Controlled

StudioFlow should support meaningful branding and workflow adaptation without becoming a no-code platform.

### 13.10 Scope Must Remain Intentionally Narrow

The product should solve client delivery deeply before expanding into adjacent agency operations.

---

## 14. Product Boundaries

### Included Direction

- Multi-tenant agency workspaces
- Agency team and client roles
- Client onboarding actions
- Project milestones
- Client-facing project progress
- Deliverable publication
- Version-aware review
- Contextual feedback
- Formal approvals
- Revision classification
- Change-request decisions
- Activity history
- Final handoff

### Excluded Direction

- Lead CRM
- Proposal builder
- Contract editor
- Full invoicing
- Accounting
- Resource planning
- Payroll
- Time tracking
- Generic task management
- Team chat
- Subscription-service queues
- Enterprise compliance workflows
- Digital asset management
- Automation builder
- AI features added only for portfolio appeal

These boundaries define product direction, not the final MVP. Exact MVP scope will be established in Product Specification.

---

## 15. Product Risks

### 15.1 Crowded Market

Client portals, project-management tools, onboarding platforms, and proofing products are widely available.

#### Mitigation

Compete through workflow focus and experience quality rather than feature quantity.

### 15.2 Weak Differentiation

Milestones, comments, files, and approvals already exist elsewhere.

#### Mitigation

Differentiation must come from the connection between:

- Project phase
- Client action
- Deliverable
- Version
- Feedback
- Approval
- Scope decision
- Next milestone

### 15.3 All-in-One Expansion

There will be pressure to add CRM, proposals, contracts, billing, time tracking, resource planning, team chat, and advanced analytics.

#### Mitigation

Every proposed capability must pass this filter:

> Does this directly improve the clarity, speed, or reliability of client project delivery?

### 15.4 Client Adoption Friction

Clients may return to email if the portal creates additional work.

#### Mitigation

- Clear notification links
- Low-friction access
- Minimal client navigation
- Mobile-responsive client actions
- One dominant action per screen
- No requirement to learn project-management concepts

### 15.5 Excessive Proofing Complexity

Supporting every content type could consume the project.

#### Mitigation

The initial product should deeply support a limited set of reviewable deliverables selected during Product Specification.

### 15.6 Artificial Portfolio Workflow

The interface could appear visually impressive while lacking believable states and data.

#### Mitigation

A complete Demo Narrative must be approved before interface design.

Every status, activity, deliverable, comment, approval, and project metric must originate from that narrative.

### 15.7 Two-Experience Design Challenge

The agency workspace and client portal have different goals.

#### Mitigation

Create two related interface systems:

**Agency Workspace**

- Operational
- Efficient
- Status-driven
- Moderately dense
- Exception-focused

**Client Portal**

- Calm
- Spacious
- Branded
- Presentation-focused
- Action-oriented

### 15.8 Multi-Tenant and Permission Complexity

A real client-facing SaaS requires strict separation between agencies, projects, team members, and clients.

#### Mitigation

Permission boundaries must be defined in Product Specification before engineering decisions are made.

### 15.9 Unvalidated Commercial Demand

Existing paid competitors validate spending in adjacent categories, but they do not prove willingness to pay for StudioFlow’s exact combination.

#### Mitigation

Treat StudioFlow as a research-backed portfolio product, not a proven startup.

### 15.10 Working-Name Collision

The name `StudioFlow` is already used by multiple unrelated software products, creative concepts, and service businesses.

This research does not establish trademark availability or commercial naming safety.

#### Mitigation

- Keep `StudioFlow` as the approved working title for the repository and portfolio project.
- Do not treat the name as commercially cleared.
- Reassess naming before public commercial launch, domain acquisition, or trademark work.

---

## 16. Strategic Decisions

| Decision                                                      | Status      |
| ------------------------------------------------------------- | ----------- |
| Product category: Client Delivery Platform                    | Approved    |
| Primary segment: boutique web design and development agencies | Approved    |
| Adjacent segments: product design and branding studios        | Deferred    |
| Work model: custom, multi-stage projects                      | Approved    |
| Central product surface: project journey                      | Approved    |
| Client portal as a first-class experience                     | Approved    |
| Replace all internal agency tools                             | Rejected    |
| Feedback attached to deliverable versions                     | Approved    |
| Approval represented as an explicit event                     | Approved    |
| Revision and scope change treated differently                 | Approved    |
| Premium visual quality as a product requirement               | Approved    |
| Technology selection during product research                  | Rejected    |
| `StudioFlow` as permanent commercial brand                    | Unvalidated |
| `StudioFlow` as working repository title                      | Approved    |

### 16.1 Core Workflow

```text
Kickoff
   ↓
Client onboarding
   ↓
Milestone progression
   ↓
Deliverable publication
   ↓
Contextual review
   ↓
Revision or approval
   ↓
Scope decision
   ↓
Next milestone
   ↓
Final handoff
```

### 16.2 Internal Tool Boundary

StudioFlow will not attempt to replace every internal production tool used by an agency.

### 16.3 Visual Standard

StudioFlow must have a distinct, premium, portfolio-level visual identity.

It must not resemble a generic admin template.

### 16.4 Engineering Timing

Frameworks, libraries, database tools, authentication providers, storage systems, and deployment services will not be selected until the product, demo narrative, information architecture, screen inventory, and visual direction are sufficiently defined.

---

## 17. Open Questions

### Business Context

- What exact operational event makes the buyer seek a product like StudioFlow?
- Which business outcome matters most: faster approvals, fewer status requests, scope protection, or stronger client experience?
- Which pricing and revenue model would be credible?
- Which success metrics should define value?

### Project Model

- Can one client organization have multiple active projects?
- Can one project contain multiple client stakeholder groups?
- Should project templates exist in the initial scope?
- How flexible should milestone structures be?

### Client Access

- Should clients use accounts, magic links, or both?
- Which actions require stronger authentication?
- Can an external reviewer access only one deliverable?

### Roles and Permissions

- Which agency roles are required?
- Which client roles are required?
- Who can submit feedback?
- Who can approve?
- Is one primary approver required?

### Deliverable Review

- Which deliverable formats are supported initially?
- Should image annotation be included?
- Should PDF review be included?
- Should live website review be included?
- How are versions compared?
- Can feedback be carried between versions?

### Revision Management

- How are revision rounds represented?
- Can an agency define an included revision allowance?
- Who decides whether feedback is in scope?
- Can comments be converted into structured revision requests?

### Change Requests

- Does a change request include cost impact?
- Does it include timeline impact?
- Can a client formally accept or reject it?
- Does acceptance create a new milestone or deliverable?

### Financial Visibility

- Should milestone payment status appear?
- Should StudioFlow include only external payment links?
- Should invoices remain outside the initial product?
- Is financial status necessary for the core delivery workflow?

### Notifications

- Which events require email?
- Which events appear only inside the product?
- How are overdue client actions escalated?
- How can notification fatigue be avoided?

### Final Handoff

- Which assets belong in the handoff center?
- Should handoff include credentials?
- How should sensitive credentials be handled?
- Should downloads be tracked?
- Should the client formally accept project completion?

### White-Labeling

- Which branding controls are required?
- Can every project have its own visual identity?
- Is a custom domain part of the product story?
- How much customization can be supported without weakening consistency?

---

## 18. Research Conclusion

The research supports continuing StudioFlow into Business Context.

The concept represents a credible commercial system rather than a collection of technical demonstrations.

It addresses recognizable problems within custom agency delivery:

- Fragmented feedback
- Unclear project status
- Ambiguous approvals
- Delayed client actions
- Version confusion
- Scope creep
- Inconsistent final handoff

The market already validates paid demand for client portals, agency delivery software, onboarding platforms, and creative review tools.

That evidence does not prove product-market fit for StudioFlow.

It does establish that StudioFlow operates inside a real software category with recognizable buyers, workflows, and business consequences.

StudioFlow should not compete through the complete breadth of existing products.

Its opportunity is to provide a focused and premium connection between the most important client-delivery events.

The approved direction is:

> A premium client delivery platform for boutique web design and development agencies, built around milestones, client actions, contextual feedback, formal approvals, scope decisions, and final handoff.

The strategic distinction is:

> StudioFlow does not expose the client to the agency’s internal project-management system. It translates the project into a clear, controlled, and confidence-building client experience.

The product provides sufficient depth across all three portfolio dimensions.

### Commercial Depth

- Clear buyer hypothesis
- Recognizable business pain
- Real operational consequences
- Credible service workflow
- Established adjacent software spending

### Visual Depth

- Agency command center
- Premium project home
- Client Action Center
- Milestone timeline
- Deliverable review canvas
- Approval experience
- Scope-change presentation
- Final handoff center

### Engineering Depth

- Multi-tenancy
- Authentication
- Authorization
- Agency and client roles
- Project-scoped access
- File storage
- Deliverable versioning
- Contextual annotations
- Workflow state transitions
- Formal approvals
- Activity history
- Notifications
- Auditability

---

## 19. Approval Decision

**Decision:** Approved

**Next Document:**

- `docs/product/02-business-context.md`

The next stage must define:

- Buyer
- Primary users
- Business problem
- Business outcomes
- Revenue model hypothesis
- Success metrics
- Commercial constraints

Product features and technical choices must remain subordinate to those decisions.

---

## 20. Research Sources

### Primary Product Sources

- [Assembly — Client Portal](https://assembly.com/)
- [Assembly — Client Portal Features](https://assembly.com/blog/client-portal-features)
- [ManyRequests — Agency Client Portal](https://manyrequests.com/)
- [ManyRequests — White-Label Client Portal](https://www.manyrequests.com/white-label-client-portal)
- [LaunchBay — Client Intake and Onboarding](https://launchbay.com/client-intake-and-onboarding-software)
- [LaunchBay — Client Portal](https://launchbay.com/client-portal)
- [LaunchBay — Client Portal Links](https://help.launchbay.com/article/107-client-login-pages)
- [Productive — Agency Operations](https://productive.io/)
- [Productive — Client Portal](https://productive.io/client-portal/)
- [Frame.io — Review and Collaboration](https://frame.io/)
- [Frame.io — Review Links for Clients](https://help.frame.io/en/articles/1161479-review-links-explained-for-clients-legacy)
- [Filestage — Online Proofing](https://filestage.io/)
- [Filestage — Review Decisions](https://help.filestage.io/en/articles/2562896-submit-your-review-decision)
- [Filestage — Project and File Progress](https://help.filestage.io/en/articles/9112719-how-to-track-the-progress-of-your-projects-and-files)
- [Filestage — Version History and Review Reports](https://help.filestage.io/en/articles/9113215-how-to-verify-that-everyone-s-feedback-has-been-met)
- [MarkUp.io — Product and Pricing](https://www.markup.io/pricing/)
- [MarkUp.io — Developer Platform](https://developer.markup.io/)

### Qualitative Evidence

- [Agency discussion: client approvals](https://www.reddit.com/r/agency/comments/1k9iiz9/how_are_you_all_managing_client_approvals/)
- [Agency discussion: slow client feedback](https://www.reddit.com/r/agency/comments/1rko6rg/anyone_else_deal_with_slow_client_feedback_and/)
- [Agency discussion: client feedback workflows](https://www.reddit.com/r/Design/comments/1mmeq3c/how_do_you_handle_client_feedback_approvals/)
- [Agency discussion: scope creep](https://www.reddit.com/r/marketingagency/comments/1rbpdqi/scope_creep_how_do_you_deal_with_it_when_clients/)

### Naming Risk References

- [Existing StudioFlow business software](https://studioflow.business/)
- [Existing StudioFlow client-portal case study](https://www.uncodeworld.com/case-studies/studioflow-client-portal)

---

# Final Status

**Approved for Business Context.**
