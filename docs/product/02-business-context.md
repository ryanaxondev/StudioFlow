# StudioFlow

# Business Context

## Document Information

**Document Type:** Business Context

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`

**Includes:**

- Business Scenario
- Ideal Customer Profile
- Buyer Definition
- User and Stakeholder Model
- Current-State Workflow
- Business Problem
- Business Outcomes
- Value Proposition
- Revenue Model Hypothesis
- Success Metrics
- Commercial Constraints
- Business Scope Decisions
- Open Questions

**Produces:**

- Product Specification
- Persona Definition
- Workflow Requirements
- MVP Priorities
- Commercial Scope
- Product Success Criteria

---

## 1. Executive Summary

StudioFlow is a business-to-business SaaS product for boutique web design and development agencies managing custom, multi-stage client projects.

The product is purchased by the agency and used by both the agency team and its clients.

Its purpose is to reduce delivery friction at the boundary between agency production and client decision-making.

The central business problem is not a lack of project-management software.

Most agencies already use internal tools for planning, design, development, communication, and file storage. The problem is that the client-facing delivery process remains fragmented across those tools.

Clients receive project updates through email, review designs in separate links, upload files to shared drives, provide feedback during meetings, approve work in messages, and request changes through multiple channels.

This fragmentation creates operational and commercial consequences:

- Client decisions take longer.
- Important feedback loses context.
- Approval history becomes ambiguous.
- Projects remain blocked without clear ownership.
- Revision rounds become difficult to control.
- Scope changes are handled inconsistently.
- Teams spend time manually following up.
- The quality of the client experience depends heavily on individual project managers.
- Final handoff is often less structured than the project itself.

StudioFlow will provide a dedicated client delivery layer that sits between the agency’s internal production environment and the client.

The business promise is:

> Help agencies keep client projects moving by making every required action, review, approval, and scope decision clear.

The primary business outcome is:

> Less project time lost while the agency is waiting for required client action or decision.

The product must also make client decisions more reliable while strengthening scope protection, operational visibility, delivery consistency, and client confidence.

---

## 2. Business Context Objective

The objective of this document is to define the commercial and operational context in which StudioFlow creates value.

This document must establish:

1. Which type of agency StudioFlow serves
2. Who purchases the product
3. Who uses the product
4. Which workflow currently creates friction
5. Which business problem has the highest priority
6. Which outcomes justify paying for the product
7. How product value should be measured
8. Which revenue model is commercially credible
9. Which constraints must shape the product
10. Which decisions must be passed into Product Specification

This document does not define the final feature set.

It defines the business conditions that future product decisions must serve.

---

## 3. Business Scenario

StudioFlow is designed around a representative operating scenario.

This scenario is a product-planning model, not a claim about the average agency.

### 3.1 Reference Agency

The reference business is a boutique web design and development agency with:

- Approximately 3–20 team members
- Several active client projects at the same time
- A mixture of design, development, and project-management roles
- Custom project-based engagements
- Projects lasting several weeks or months
- Multiple client review and approval points
- Existing internal production tools
- No large dedicated operations department
- A strong dependency on referrals, reputation, and client experience

### 3.2 Reference Engagement

The primary reference engagement is a custom website design and development project with phases such as:

```text
Kickoff
   ↓
Discovery
   ↓
Content and asset collection
   ↓
Information architecture
   ↓
Wireframes
   ↓
Visual design
   ↓
Development
   ↓
Quality assurance
   ↓
Launch
   ↓
Final handoff
```

The project requires the client to:

- Provide information and assets
- Review intermediate deliverables
- Consolidate stakeholder feedback
- Approve key directions
- Respond to questions
- Confirm scope changes
- Accept final delivery

The agency cannot progress reliably without these client actions.

### 3.3 Existing Tool Environment

The reference agency may already use:

- ClickUp, Asana, Linear, or Monday for internal work
- Figma for design
- GitHub for development
- Slack or Microsoft Teams for internal communication
- Email for client communication
- Google Drive or Dropbox for files
- Google Docs or Notion for content
- Zoom or Google Meet for review meetings
- Stripe, QuickBooks, Xero, or another external billing system

StudioFlow is not intended to replace this entire environment.

It provides the missing client-facing delivery layer that connects project progress, client actions, deliverables, decisions, and handoff.

---

## 4. Ideal Customer Profile

### 4.1 Primary Customer Segment

The primary customer is a boutique web design and development agency delivering custom projects to external clients.

The agency has progressed beyond informal founder-led delivery but has not adopted or does not need a large professional-services automation platform.

### 4.2 Organizational Characteristics

The strongest-fit agency is likely to have:

- A small or medium delivery team
- Multiple active client projects
- Repeated project phases across engagements
- A project manager, account manager, or delivery owner
- External client stakeholders who must review and approve work
- A need to present work professionally
- A need to protect project scope and timelines
- Existing internal tools that the agency does not want to replace

### 4.3 Operational Characteristics

The agency experiences some of the following:

- Project status is manually summarized for clients.
- Client actions are tracked in notes, spreadsheets, or project-manager memory.
- Approvals are recorded in email, Slack, meeting notes, or design comments.
- Feedback arrives through multiple channels.
- Clients comment on outdated versions.
- Several stakeholders provide conflicting feedback.
- Project managers repeatedly send reminders.
- Scope changes are discussed informally before being documented.
- Final files and documentation are assembled manually at the end.
- Delivery quality varies according to the project manager.

### 4.4 Commercial Characteristics

The product is most relevant when:

- A delayed approval can affect the project schedule.
- Additional revisions can reduce project margin.
- Poor communication can damage client trust.
- The agency’s reputation depends on a premium experience.
- The value of one successful project is significantly greater than the monthly cost of StudioFlow.
- Repeatability and professionalism matter more than unlimited configuration.

### 4.5 Exclusion Criteria

StudioFlow is not initially designed for:

- Solo freelancers managing only one simple project at a time
- Large enterprise agencies requiring advanced resource planning
- Agencies whose primary model is unlimited recurring requests
- Teams primarily managing internal product work
- Businesses without meaningful client review or approval cycles
- Agencies seeking a complete finance, CRM, or professional-services automation platform
- Businesses unwilling to introduce any client-facing software

---

## 5. Buyer Definition

### 5.1 Primary Buyer

The primary economic buyer is the:

> Agency Founder or Studio Owner

This person is responsible for:

- Client satisfaction
- Project profitability
- Delivery quality
- Team efficiency
- Agency reputation
- Operational consistency
- Growth without proportional coordination overhead

The buyer may not use every part of StudioFlow daily, but they experience the business consequences of poor delivery coordination.

### 5.2 Secondary Buyer or Internal Champion

The likely internal champion is the:

- Head of Operations
- Delivery Lead
- Project Director
- Senior Project Manager
- Senior Account Manager

This person experiences the workflow pain directly and may recommend or implement the product.

### 5.3 Buying Triggers

An agency is most likely to seek a product like StudioFlow when one or more of the following occurs:

- The agency begins managing more projects simultaneously.
- Founders can no longer personally coordinate every client.
- Project managers spend too much time following up.
- Clients repeatedly ask for project status.
- Feedback and approvals are spread across tools.
- A project is delayed because client responsibility was unclear.
- A scope dispute occurs.
- A client approves one version and later refers to another.
- The agency wants to improve its premium positioning.
- The agency standardizes its delivery process.
- A new operations lead is hired.
- The existing client portal feels generic or operationally disconnected.

### 5.4 Buyer Anxieties

The buyer may worry that:

- Clients will refuse to use another tool.
- Setup will require too much time.
- The product will duplicate existing software.
- The team will need to maintain the portal manually.
- The software will become another source of fragmented information.
- White-labeling will be too limited.
- The product will be too complex for smaller clients.
- Sensitive client information will not be adequately protected.
- The subscription will not create measurable value.

### 5.5 Purchase Decision Criteria

The buyer is likely to evaluate StudioFlow based on:

1. Client simplicity
2. Agency setup effort
3. Quality of the client-facing experience
4. Ability to reduce manual follow-up
5. Review and approval clarity
6. Scope-change visibility
7. Compatibility with existing internal tools
8. Security and access control
9. Branding and white-label capability
10. Pricing relative to project value

---

## 6. Users and Stakeholders

StudioFlow serves several users with different responsibilities and information needs.

The roles below are not equally important to the initial product. The delivery manager, client approver, and client contributor form the core operating workflow. The agency owner is primarily an oversight user. Agency specialists are supporting users, and external reviewers remain optional until Product Specification determines whether they are required for the MVP.

### 6.1 Agency Owner — Oversight User

**Primary Job**

Understand whether client projects are moving reliably and whether delivery risks require attention.

**Needs**

- Portfolio-level project health
- Projects waiting on clients
- Overdue approvals
- Scope-change activity
- Client delivery consistency
- Visibility without reading every project conversation

**Must Not Be Forced To**

- Manage every task
- Review every comment
- Configure every workflow manually

---

### 6.2 Project or Delivery Manager — Primary Agency User

**Primary Job**

Coordinate the client-facing delivery process and keep the project moving.

**Needs**

- Publish project updates
- Request client actions
- Prepare deliverables for review
- Track pending decisions
- Resolve or classify feedback
- Manage revision states
- Identify client blockers
- Formalize change requests
- Prepare final handoff

**Must Not Be Forced To**

- Copy the same status across several systems
- Manually reconstruct approval history
- Chase every client action through email
- Expose internal team complexity to the client

---

### 6.3 Agency Specialist — Supporting User

This user may be a designer, developer, strategist, copywriter, or quality-assurance specialist.

**Primary Job**

Contribute work and respond to feedback relevant to their discipline.

**Needs**

- Access to assigned deliverables
- Relevant client feedback
- Version context
- Internal discussion where appropriate
- Clear indication of what is approved
- Clear indication of what changed

**Must Not Automatically See**

- Sensitive commercial decisions
- All client organizations
- Unrelated projects
- Financial details unless authorized

---

### 6.4 Client Approver — Primary Client User

This user is the person authorized to make a final decision for the client organization.

**Primary Job**

Understand the current deliverable and approve, reject, or request a revision with confidence.

**Needs**

- Clear project context
- Current review version
- Relevant deadline
- Consolidated feedback
- Decision history
- Consequence of the decision
- Simple approval controls

**Must Not Be Forced To**

- Learn the agency’s internal tools
- Interpret production tasks
- Search email history
- Decide which version is current
- Understand technical implementation details

---

### 6.5 Client Contributor — Primary Client User

This user provides information, expertise, or feedback but may not have approval authority.

**Primary Job**

Complete assigned actions and contribute feedback within a controlled context.

**Needs**

- Clear assigned actions
- Access only to relevant projects or deliverables
- Commenting capability
- Visibility into whether feedback has been resolved
- Awareness of the primary approver

**Must Not Automatically Be Able To**

- Approve final work
- Change project scope
- Access commercial details
- Invite additional users
- View unrelated client projects

---

### 6.6 External Reviewer — Optional User

An external reviewer may be invited to review one deliverable without becoming a full client-portal user.

Examples include:

- Legal reviewer
- Brand consultant
- Executive stakeholder
- Accessibility specialist
- Technical advisor

**Primary Job**

Review a limited item and provide a specific response.

**Needs**

- Low-friction access
- Narrow permissions
- Clear review context
- A defined deadline
- No access to unrelated project information

The necessity of this role in the MVP remains open for Product Specification.

---

## 7. Current-State Workflow

### 7.1 Project Kickoff

The agency creates the internal project and sends kickoff information through email or a document.

The client may receive:

- A welcome email
- A questionnaire
- A file-upload link
- A meeting invitation
- A project schedule
- Several separate access links

#### Friction

- No single starting point
- Unclear client responsibilities
- Repeated requests for missing assets
- Onboarding status tracked manually

---

### 7.2 Project Progress

The agency manages work internally and periodically communicates progress through:

- Email updates
- Meetings
- Shared documents
- Screenshots
- Project-management guest access

#### Friction

- Clients ask for status between updates.
- Internal task status does not translate cleanly into client language.
- Project managers manually summarize progress.
- The client sees either too little context or too much operational detail.

---

### 7.3 Deliverable Review

The agency shares:

- Figma links
- PDF files
- Staging URLs
- Screenshots
- Loom videos
- Shared-drive links

Feedback may arrive through:

- Figma comments
- Email
- Video calls
- Slack
- Documents
- Screenshots
- Messaging applications

#### Friction

- Feedback becomes fragmented.
- Comments may refer to different versions.
- Important feedback is difficult to consolidate.
- Client contributors may not know who makes the final decision.
- The agency spends time converting discussion into actionable work.

---

### 7.4 Approval

Approval may occur through:

- An email reply
- A comment
- A meeting statement
- A messaging application
- A project-management status

#### Friction

- The approved version may be unclear.
- Approval authority may be ambiguous.
- Later disagreement is difficult to resolve.
- The agency may progress without a durable decision record.

---

### 7.5 Revision and Scope Change

The client requests changes.

The agency must decide whether the request is:

- A clarification
- An included revision
- A direction change
- A new deliverable
- Out-of-scope work

#### Friction

- Decisions happen informally.
- Commercial impact is not immediately visible.
- The client may not understand the difference between revision and new scope.
- Project managers become responsible for negotiation without consistent support.

---

### 7.6 Final Handoff

The agency assembles:

- Final files
- Source files
- Documentation
- Credentials
- Training materials
- Support information
- Launch details

#### Friction

- Assets are spread across locations.
- Required handoff items may be forgotten.
- Clients do not know which files are final.
- Completion is not formally acknowledged.
- Post-launch responsibilities are unclear.

---

## 8. Business Problem

### 8.1 Core Business Problem

> Boutique web agencies lose delivery speed, operational control, and client confidence because client actions and project decisions are fragmented across disconnected tools.

### 8.2 Root Causes

The problem is caused by:

- Internal tools being designed for production teams rather than clients
- Client communication occurring outside the project system
- Deliverables being shared independently from project milestones
- Feedback not remaining attached to versions
- Approval being treated as conversation rather than a formal event
- Scope decisions being handled inconsistently
- Client responsibilities lacking a visible action model
- Project status depending on manual communication
- Handoff being treated as a final file transfer rather than a workflow

### 8.3 Operational Consequences

- Projects wait on clients without clear escalation.
- Project managers perform repeated manual follow-up.
- Teams work from incomplete or conflicting feedback.
- Delivery status is difficult to assess across projects.
- Client communication quality varies between team members.
- Important decisions must be reconstructed later.

### 8.4 Commercial Consequences

- Delays reduce delivery capacity.
- Uncontrolled revisions reduce project margin.
- Scope disputes weaken client relationships.
- Poor handoff reduces perceived quality.
- Inconsistent delivery makes growth harder.
- A weak client experience reduces referral and repeat-business potential.

### 8.5 Experience Consequences

- Clients feel uncertain about progress.
- Clients do not know what requires their attention.
- Review feels more complex than necessary.
- The agency appears less organized than its work quality suggests.
- Stakeholders lose confidence when decisions and versions are unclear.

---

## 9. Business Jobs to Be Done

### 9.1 Buyer Job

> When my agency is managing several custom client projects, I want a repeatable client delivery system so the team can maintain quality and control without depending on me to coordinate every decision.

### 9.2 Delivery Manager Job

> When a project requires client input or approval, I want the client to see exactly what they need to do and why, so I can keep the project moving without repeated manual follow-up.

### 9.3 Agency Team Job

> When I receive client feedback, I want it connected to the correct deliverable and version so I can act on it without reconstructing context.

### 9.4 Client Approver Job

> When the agency asks me to review work, I want to understand the current version, the decision required, and what happens next so I can respond confidently.

### 9.5 Client Contributor Job

> When I am asked to provide information or feedback, I want a simple and specific place to respond so I do not need to understand the agency’s internal process.

---

## 10. Business Outcomes

### 10.1 Primary Outcome

> Less project time lost while the agency is waiting for required client action or decision.

This outcome includes:

- Faster completion of requested client actions
- Faster review turnaround
- Clearer approval
- Reduced ambiguity
- Fewer blocked milestones

### 10.2 Secondary Outcomes

#### Reduced Coordination Overhead

- Fewer manual reminders
- Fewer status-update emails
- Less time consolidating feedback
- Less time reconstructing decisions

#### Better Scope Protection

- Revision requests become visible.
- Out-of-scope changes are identified earlier.
- Cost and timeline impact can be communicated clearly.
- Client acceptance becomes traceable.

#### Greater Delivery Consistency

- Every project follows a recognizable client-facing structure.
- Delivery quality depends less on individual project-manager habits.
- Onboarding, review, approval, and handoff become repeatable.

#### Stronger Client Confidence

- Clients understand progress.
- Clients know what requires attention.
- Clients see professional presentation.
- Clients can find decisions and final assets.

#### Improved Management Visibility

- Agency leaders can identify projects waiting on clients.
- Delivery risks can be surfaced without inspecting every task.
- Project health can be understood through client-facing blockers and decisions.

---

## 11. Value Proposition

### 11.1 Buyer Value

StudioFlow helps the agency owner:

- Scale client delivery without proportionally increasing coordination
- Standardize the client experience
- Protect project margin
- Reduce founder dependence
- Strengthen premium positioning
- Improve visibility across active engagements

### 11.2 Delivery Team Value

StudioFlow helps project and account managers:

- Coordinate client actions
- Reduce follow-up
- Keep decisions traceable
- Separate feedback from scope changes
- Maintain a consistent delivery process
- Prepare a structured final handoff

### 11.3 Specialist Value

StudioFlow helps delivery specialists:

- Receive contextual feedback
- Understand version status
- Avoid acting on obsolete comments
- See approved decisions
- Focus on relevant work

### 11.4 Client Value

StudioFlow helps clients:

- Understand project progress
- Know what requires attention
- Review work without specialist tools
- Make decisions confidently
- Find the current version
- Access final project assets in one place

### 11.5 Value Exchange

The agency pays for StudioFlow because it expects the product to reduce coordination cost, protect project economics, improve delivery quality, and strengthen the client experience.

Client users do not pay because their participation creates value for the paying agency.

---

## 12. Revenue Model Hypothesis

### 12.1 Primary Revenue Model

StudioFlow will use a recurring SaaS subscription paid by the agency.

The approved commercial direction is:

> A recurring subscription billed to one agency workspace.

The agency is the customer. The workspace is the billing and tenancy unit.

### 12.2 Packaging Hypothesis

Exact packaging is not approved at this stage.

Potential packaging variables include:

- Number of active client projects
- Number of internal agency users
- Storage and file-processing allowance
- White-label and custom-domain capabilities
- Advanced review, reporting, permission, or integration capabilities

Active projects are a credible value-related variable, but they should not be treated as the confirmed primary pricing unit without direct validation. Pricing based only on agency seats is also undesirable because it may discourage appropriate internal collaboration.

### 12.3 Client Pricing

Client users, client approvers, contributors, and invited reviewers should not require paid seats.

Charging for client participation would create adoption friction and work against the product’s core value.

### 12.4 Packaging Principles

Future packaging should:

- Keep client participation free
- Align expansion cost with increasing agency value
- Avoid penalizing ordinary collaboration
- Preserve a useful entry plan for boutique agencies
- Use premium capabilities only where they create real commercial value
- Remain understandable without complex metering

### 12.5 Rejected Revenue Models

The initial model should not rely on:

- Per-client seat fees
- Per-comment fees
- Transaction fees on agency revenue
- Advertising
- Marketplace commissions
- Mandatory payment processing
- Pricing based on every invited reviewer

### 12.6 Revenue Assumption Status

The revenue model is commercially plausible but unvalidated.

Pricing, willingness to pay, packaging, and expansion revenue require validation before a commercial launch.

---

## 13. Success Metrics

### 13.1 North-Star Outcome

The primary product outcome is:

> Less project time is lost while required client actions and decisions are outstanding.

The primary success metric candidate is:

### Median Client-Blocked Time per Project

The median total elapsed time during which a project cannot advance because a required client response is outstanding.

```text
A milestone becomes blocked by a required client response
        ↓
The required response is completed by an authorized client user
```

The response may be:

- Information or assets submitted
- Deliverable approved
- Revision requested
- Clarification provided
- Change request accepted or rejected

This metric is directly connected to the primary business outcome. It should count only periods in which the outstanding response is preventing planned project progress, not every open client request.

### 13.2 Supporting Product Metrics

#### Median Required Client Response Time

Median elapsed time between publishing an actionable client request and receiving the required response.

#### On-Time Client Response Rate

Percentage of required client actions and decisions completed by their agreed due date.

#### Approval Turnaround Time

Time between publication of a deliverable for review and the final approval or revision decision.

#### Projects Waiting on Client

Number and percentage of active projects currently blocked by a required client response.

#### Milestones Completed on Time

Percentage of milestones completed by the planned date.

#### Revision Rounds per Deliverable

Number of review cycles before approval.

#### Formalized Change Requests

Number and percentage of potential scope changes converted into explicit decisions.

#### Final Handoff Completion

Percentage of required handoff items completed and acknowledged.

### 13.3 Operational Validation Metrics

Some important outcomes occur outside StudioFlow and may require agency reporting, surveys, or future integrations.

#### Manual Follow-Ups per Project

Number of reminders or follow-up messages manually initiated outside automated product workflows.

#### Status Inquiry Frequency

Number of client messages asking for project status outside the structured delivery experience.

#### Coordination Time per Project

Agency-reported time spent collecting, consolidating, and clarifying client responses.

These metrics should not be presented as automatically measurable until the required data source exists.

### 13.4 Adoption Metrics

- Agency workspace activation
- First project created
- First client invited
- First client action completed
- First deliverable reviewed
- First formal approval recorded
- Weekly active agency users
- Active client participation
- Projects using the complete delivery workflow

### 13.5 Retention Indicators

- Agencies creating additional projects
- Percentage of active projects managed through StudioFlow
- Repeat client participation
- Continued use after the first completed project
- Use of project templates
- Use of formal approvals and handoff

### 13.6 Guardrail Metrics

StudioFlow must not reduce client-blocked time by creating a poor or coercive client experience.

Guardrails include:

- Client action abandonment
- Review-link failure rate
- Access-support requests
- Notification unsubscribe or mute rate
- Approval reversal frequency
- Accidental access or permission incidents
- Agency setup time
- Client satisfaction after project completion

### 13.7 Portfolio Success Criteria

For the portfolio project, success also requires:

- The business problem is understandable without technical explanation.
- The product appears commercially credible.
- The client and agency experiences are visibly distinct.
- The demo data tells a coherent project story.
- Core workflows are functional rather than static.
- The interface is visually differentiated from generic admin templates.
- The codebase demonstrates reliable product engineering.

---

## 14. Commercial Constraints

### 14.1 Client Participation Must Be Free

The paying agency must be able to invite the necessary client stakeholders without purchasing additional client seats.

### 14.2 Client Access Must Be Low Friction

The value of StudioFlow depends on client participation.

Access must not require unnecessary setup or product training.

### 14.3 StudioFlow Must Coexist With Internal Tools

The agency should not need to replace its task manager, design software, source-control platform, or accounting system to adopt StudioFlow.

### 14.4 Setup Must Be Proportionate

A boutique agency should be able to configure its workspace and launch a project without an enterprise implementation process.

### 14.5 White-Label Quality Matters

The portal represents the agency in front of its client.

Brand customization must be strong enough to support a premium experience while preserving product usability.

### 14.6 Security Is Part of Commercial Trust

The product handles client files, decisions, project information, and potentially sensitive assets.

Access control, tenant isolation, and secure sharing are commercial requirements, not only engineering concerns.

### 14.7 Value Must Be Visible During the First Project

The product cannot depend on months of historical data before becoming useful.

The agency should experience value through onboarding, review, approval, and handoff within its first active project.

### 14.8 Product Configuration Must Remain Controlled

The system should provide useful defaults and templates.

It should not require agencies to build their own workflow system from an empty canvas.

### 14.9 The Product Must Support Professional Presentation

Visual quality, responsive behavior, loading states, error states, and client-facing communication are part of the paid product experience.

### 14.10 The Product Must Not Depend on Built-In Billing

StudioFlow may display milestone or payment status later, but the initial business value must not depend on becoming an invoicing or payment-processing platform.

---

## 15. Business Scope Decisions

| Decision                                                                              | Status      |
| ------------------------------------------------------------------------------------- | ----------- |
| Business model: B2B SaaS                                                              | Approved    |
| Paying customer: agency                                                               | Approved    |
| Billing and tenancy unit: agency workspace                                            | Approved    |
| Primary economic buyer: agency founder or studio owner                                | Approved    |
| Primary internal champion: delivery or operations lead                                | Approved    |
| Primary segment: boutique web design and development agencies                         | Approved    |
| Primary work model: custom, multi-stage client projects                               | Approved    |
| Primary reference engagement: website design and development                          | Approved    |
| Primary business problem: fragmented client actions and decisions                     | Approved    |
| Primary business outcome: less project time lost waiting for clients                  | Approved    |
| Supporting outcome: clearer and more reliable client decisions                        | Approved    |
| Secondary outcome: reduced coordination overhead                                      | Approved    |
| Secondary outcome: better scope protection                                            | Approved    |
| Secondary outcome: stronger client confidence                                         | Approved    |
| Client users pay for seats                                                            | Rejected    |
| Revenue model: recurring agency subscription                                          | Approved    |
| Packaging variables: active projects, agency users, storage, and premium capabilities | Unvalidated |
| Confirmed primary packaging unit                                                      | Deferred    |
| White-labeling contributes to commercial value                                        | Approved    |
| StudioFlow replaces internal project-management tools                                 | Rejected    |
| StudioFlow includes complete CRM and accounting                                       | Rejected    |
| Exact pricing                                                                         | Deferred    |
| Enterprise market                                                                     | Deferred    |
| Direct commercial product-market fit                                                  | Unvalidated |

---

## 16. Open Questions

### 16.1 Buyer and Adoption

- Does the founder or operations lead feel the pain more strongly?
- Which buying trigger is most urgent?
- How much setup will the buyer tolerate?
- Which existing tool is perceived as the closest substitute?

### 16.2 Project Economics

- Should active-project limits be the primary packaging mechanism?
- Does project value influence willingness to pay?
- Which capability creates the strongest upgrade incentive?
- Is annual billing credible for smaller agencies?

### 16.3 Client Experience

- Should client accounts be required?
- Which workflows should support magic links?
- How much branding control is commercially necessary?
- Does every client need a full project portal?

### 16.4 Workflow Value

- Which problem matters most to buyers:
  - Slow approvals
  - Manual follow-up
  - Scope creep
  - Status visibility
  - Premium client experience
- Which workflow produces the fastest first-project value?
- Which events should trigger automatic reminders?

### 16.5 Success Measurement

- Can manual follow-ups be measured reliably?
- How should client-blocked time be calculated?
- What is an acceptable approval turnaround time?
- Which metrics are meaningful to agency owners versus project managers?

### 16.6 Commercial Scope

- Is payment-status visibility necessary?
- Is an external billing integration enough?
- Should custom domains be included or premium?
- Which integrations are required for adoption?
- What storage model is commercially sustainable?

These questions must be addressed only when they become necessary for Product Specification, pricing validation, or Engineering Architecture.

---

## 17. Business Conclusion

StudioFlow has a coherent business context.

The paying customer is a boutique web design and development agency.

The primary buyer is the agency founder or studio owner, supported by a delivery or operations lead.

The product serves both the agency team and external client stakeholders, but the agency captures and pays for the business value.

The core business problem is:

> Client actions, feedback, approvals, and scope decisions are fragmented across disconnected tools, slowing delivery and weakening operational control.

The primary business outcome is:

> Less project time lost while required client actions and decisions are outstanding.

A supporting outcome is:

> Clearer and more reliable client decisions that keep project milestones moving.

The strongest value combination is:

- Reduced coordination overhead
- Better scope protection
- More consistent delivery
- Stronger client confidence
- Clearer management visibility

The approved revenue direction is:

> A recurring subscription billed to the agency workspace while client participation remains free.

Exact packaging remains deferred. Active projects, internal users, storage, and premium capabilities are candidate packaging variables rather than approved pricing units.

The product must remain focused on client delivery.

It must not become a complete CRM, accounting platform, internal project-management suite, or enterprise professional-services system.

StudioFlow is ready to proceed to Product Specification.

---

## 18. Approval Decision

**Decision:** Approved

The business context is sufficiently specific to guide Product Specification while preserving unvalidated pricing and product-detail decisions as open hypotheses.

---

## 19. Next Document

The next document is:

- `docs/product/03-product-specification.md`

The Product Specification must translate this business context into:

- Product promise
- Personas
- Jobs to Be Done
- Core workflows
- MVP scope
- Non-goals
- Roles and permissions
- State transitions
- Business rules
- Edge cases
- Definition of Done
