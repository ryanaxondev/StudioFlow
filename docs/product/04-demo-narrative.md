# StudioFlow

# Demo Narrative

## Document Information

**Document Type:** Demo Narrative

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`
- `docs/product/03-product-specification.md`

**Includes:**

- Demo Story
- Fictional Agency
- Fictional Client Organization
- User and Role Assignments
- Primary Project
- Project Timeline
- Milestones
- Client Actions
- Deliverables and Versions
- Feedback Threads
- Review Decisions
- Revision Requests
- Change Request
- Handoff
- Activity Timeline
- Dashboard Data
- Client Portal Data
- Supporting Projects
- Product-State Coverage
- Demo Consistency Rules

**Produces:**

- Information Architecture
- Screen Inventory
- Visual Direction
- Seed Data
- Product Copy
- Demo Accounts
- Screenshot Plan
- Portfolio Walkthrough

---

## 1. Executive Summary

This document defines the complete fictional story used to demonstrate StudioFlow.

The Demo Narrative is the source of truth for:

- People
- Organizations
- Projects
- Dates
- Milestones
- Statuses
- Actions
- Deliverables
- Versions
- Comments
- Decisions
- Scope changes
- Handoff items
- Dashboard metrics
- Activity history
- Client-facing copy

The purpose of the narrative is to ensure that StudioFlow feels like a real operating product rather than a collection of unrelated interface screens.

Every visible status, number, deadline, comment, decision, file, and activity event must originate from this narrative or a later approved extension of it.

The primary story follows a boutique web agency named **Sableframe Studio** as it completes a website redesign and development engagement for **Kestrelon**, a fictional B2B SaaS company.

At the default Demo Snapshot, the project has reached **Handoff**.

The website is live, the main deliverables have been approved, an accepted scope change has been completed, and the client must review the final handoff package and acknowledge receipt.

The project is therefore:

- In the `Handoff` lifecycle state
- In the `Waiting on Client` health state
- Commercially complete
- Operationally blocked by one final client obligation

The narrative demonstrates the full StudioFlow promise:

```text
Kickoff
   ↓
Client onboarding
   ↓
Milestone progression
   ↓
Versioned deliverable review
   ↓
Contextual feedback
   ↓
Revision request
   ↓
Agency classification
   ↓
Scope-change decision
   ↓
Approval
   ↓
Launch
   ↓
Final handoff
```

All names, organizations, services, files, and events in this document are fictional.

`Sableframe Studio` and `Kestrelon` are approved working Demo identities. They are not presented as commercially or legally cleared brands.

---

## 2. Narrative Objective

The Demo Narrative must prove that StudioFlow can support a believable client-delivery engagement from beginning to end.

It must provide enough structured data to design and implement:

- Agency Delivery Overview
- Client Action Center
- Project Overview
- Milestone Timeline
- Client Action Detail
- Deliverable Review
- Version History
- Contextual Commenting
- Formal Approval
- Revision Classification
- Change Request
- Activity History
- Handoff Center
- Completed and read-only states

The narrative must also demonstrate the business value established in earlier documents:

- Reduced client uncertainty
- Faster and clearer decisions
- Less manual follow-up
- Preserved review context
- Explicit approval history
- Better scope protection
- Consistent final handoff

The narrative does not define final layout, navigation, visual tokens, component structure, database schema, or implementation technology.

---

## 3. Demo Narrative Principles

### 3.1 One Primary Story

The Demo must have one dominant project story.

Supporting projects exist to make the agency dashboard believable, but they must not compete with the primary narrative.

### 3.2 Every Status Requires a Cause

A project may not be shown as `Waiting on Client`, `At Risk`, `Overdue`, or `On Track` without an underlying event, deadline, or obligation that justifies the state.

### 3.3 Every Metric Requires Source Data

Dashboard totals and analytics must be derivable from project records.

No number may be created only to make a dashboard look impressive.

### 3.4 Every Decision Requires Authority

Only the designated Client Approver may create binding client decisions.

Contributor comments may influence a decision but do not replace it.

### 3.5 Every Version Must Preserve History

Feedback and decisions must remain associated with the version that received them.

### 3.6 Internal and Client Narratives Must Differ

Agency users see operational context, risk, internal notes, and classification work.

Client users see progress, actions, deliverables, decisions, and next steps.

### 3.7 The Story Must Contain Friction

A perfect project would not demonstrate the product.

The primary narrative must include:

- One reopened Client Action
- One in-scope revision
- One potential scope change
- One accepted Change Request
- Two historical Deliverable Versions with Revision Requested decisions
- One client-blocked period
- One final Handoff obligation

### 3.8 The Story Must End With Confidence

Although the project contains friction, the client experience should communicate that the agency remains organized and in control.

---

## 4. Demo Reference Model

### 4.1 Fixed Demo Snapshot

The Demo uses a fixed fictional snapshot to preserve consistent dates and metrics.

**Demo Snapshot:**

- Thursday, May 28, 2026
- 10:30 AM
- Workspace timezone: Europe/Amsterdam
- Workspace display currency: EUR

The snapshot date belongs to fictional product data.

It is not document metadata.

### 4.2 Primary Demo Accounts

#### Agency Demo

**User:** Daniel Ortiz
**Role:** Delivery Manager
**Workspace:** Sableframe Studio

This account opens on the Agency Delivery Overview and sees all projects assigned to Daniel.

#### Client Demo

**User:** Elena Rossi
**Role:** Client Approver
**Client Organization:** Kestrelon
**Primary Project:** Kestrelon Website Rebuild

This account opens on the Client Action Center.

### 4.3 Secondary Role Accounts

The implementation may provide optional accounts for:

- Maya Chen — Agency Owner
- Priya Shah — Agency Member
- Marcus Reed — Client Contributor

These accounts are useful for permission demonstrations but are not required as primary portfolio entry points.

### 4.4 Demo Data Reset

The Demo should return to this narrative state after a reset.

Interactive actions may be allowed during a session, but the published portfolio environment must provide a reliable way to restore the canonical snapshot.

The reset mechanism belongs to Engineering Architecture.

---

## 5. Fictional Agency

### 5.1 Agency Identity

**Name:** Sableframe Studio

**Category:** Boutique web design and development agency

**Positioning:**

> Sableframe designs and builds high-conviction web experiences for ambitious B2B teams.

**Agency Size:** 9 people

**Demo-Represented Team:** 4 members

The remaining team members are outside the canonical Demo because they do not participate in the primary project or supporting dashboard states.

**Primary Services:**

- Website strategy
- Information architecture
- UX design
- Visual design
- Frontend development
- CMS implementation
- Launch support

**Typical Engagement:**

- Custom project
- 8–14 weeks
- Multiple client stakeholders
- Several review and approval points
- Fixed initial scope with controlled change requests

### 5.2 Agency Operating Model

Sableframe uses internal specialist tools for detailed production.

StudioFlow is the client-delivery layer.

Sableframe may use:

- An internal project-management tool for detailed tasks
- Figma for design production
- GitHub for source control
- Cloud storage for internal working files
- Email for notification delivery
- Video calls for workshops and presentations

StudioFlow contains only client-delivery information required to keep the engagement moving.

### 5.3 Agency Brand Personality

Sableframe should feel:

- Calm
- Precise
- Editorial
- Confident
- Modern
- Human

The agency should not feel:

- Loud
- Trend-dependent
- Corporate
- Overly technical
- Decorative without purpose

Final brand tokens belong to Visual Direction.

### 5.4 Workspace Copy

**Workspace Name:** Sableframe Studio

**Client Portal Label:**

> Delivered by Sableframe Studio

**Workspace Description:**

> Strategy, design, and development for B2B teams building their next stage of growth.

---

## 6. Agency Team

### 6.1 Maya Chen

**Role:** Agency Owner
**Workspace Access:** All projects
**Project Role on Kestrelon:** Agency Owner

**Responsibility:**

- Oversees delivery quality
- Manages agency membership
- Reviews project health
- Handles exceptional administrative actions

**Narrative Use:**

Maya appears in workspace-level activity and may review the project, but she is not responsible for daily coordination.

---

### 6.2 Daniel Ortiz

**Role:** Delivery Manager
**Workspace Access:** Assigned projects
**Project Role on Kestrelon:** Delivery Manager

**Responsibility:**

- Owns the client-delivery process
- Publishes milestones and Client Actions
- Coordinates review cycles
- Classifies revision requests
- Creates Change Requests
- Manages Handoff

**Default Agency Demo User:** Yes

**Profile Copy:**

> Delivery Manager focused on keeping every decision, dependency, and deadline visible.

---

### 6.3 Priya Shah

**Role:** Agency Member
**Discipline:** Senior Product Designer
**Project Access:** Kestrelon Website Rebuild

**Responsibility:**

- Prepares design deliverables
- Publishes draft versions for Daniel’s review
- Responds to visual feedback
- Adds agency-only notes
- Produces replacement versions

---

### 6.4 Theo Martin

**Role:** Agency Member
**Discipline:** Lead Developer
**Project Access:** Kestrelon Website Rebuild

**Responsibility:**

- Builds the production website
- Prepares staging deliverables
- Responds to implementation feedback
- Produces launch and handoff documentation

---

## 7. Fictional Client Organization

### 7.1 Client Identity

**Name:** Kestrelon

**Category:** B2B SaaS

**Product:**

Kestrelon helps SaaS teams identify and remove friction from customer onboarding.

The platform combines product usage signals, onboarding checkpoints, and account-level insights so customer teams can understand where new users lose momentum.

### 7.2 Business Situation

Kestrelon has outgrown its original marketing website.

The existing site:

- Describes the product too broadly
- Does not clearly communicate the onboarding use case
- Has inconsistent visual presentation
- Is difficult for the marketing team to update
- Does not support the upcoming sales campaign
- Lacks strong customer proof

Kestrelon hires Sableframe to reposition and rebuild the website before a major go-to-market campaign.

### 7.3 Client Objective

> Launch a clearer, more credible website that positions Kestrelon as the customer-onboarding intelligence platform for scaling SaaS teams.

### 7.4 Client Success Conditions

The website must:

- Communicate the onboarding problem clearly
- Support enterprise-oriented demo conversion
- Present credible customer proof
- Allow marketing to manage content
- Meet launch performance and accessibility expectations
- Be ready before the summer campaign

---

## 8. Client Team

### 8.1 Elena Rossi

**Title:** VP Marketing
**StudioFlow Role:** Client Approver
**Project Access:** Kestrelon Website Rebuild
**Formal Decision Authority:** Yes

**Responsibility:**

- Owns final messaging and marketing decisions
- Approves deliverable versions
- Accepts or rejects Change Requests
- Acknowledges final Handoff

**Default Client Demo User:** Yes

**Profile Copy:**

> Owns the website launch and final client-side decisions.

---

### 8.2 Marcus Reed

**Title:** Product Marketing Lead
**StudioFlow Role:** Client Contributor
**Project Access:** Kestrelon Website Rebuild
**Formal Decision Authority:** No

**Responsibility:**

- Provides product positioning input
- Supplies customer proof points
- Reviews messaging and page structure
- Comments on Deliverables

---

### 8.3 Nia Patel

**Title:** Content Lead
**StudioFlow Role:** Client Contributor
**Project Access:** Kestrelon Website Rebuild
**Formal Decision Authority:** No

**Responsibility:**

- Provides brand and content assets
- Reviews content implementation
- Supplies legal and editorial copy
- Comments on Deliverables

---

## 9. Primary Project

### 9.1 Project Identity

**Project Code:** `PRJ-KES-001`

**Project Name:** Kestrelon Website Rebuild

**Client Organization:** Kestrelon

**Delivery Manager:** Daniel Ortiz

**Client Approver:** Elena Rossi

**Agency Members:**

- Priya Shah
- Theo Martin

**Client Contributors:**

- Marcus Reed
- Nia Patel

### 9.2 Project Summary

> Sableframe is repositioning, redesigning, and rebuilding Kestrelon’s marketing website around a clearer customer-onboarding narrative. The engagement includes strategy, information architecture, visual design, frontend development, CMS implementation, launch support, and final handoff.

### 9.3 Project Outcome

> Launch a fast, accessible, and conversion-focused website that gives Kestrelon’s marketing team a stronger product story and an easier publishing workflow.

### 9.4 Project Schedule

**Original Start:** Monday, March 2, 2026

**Original Target Completion:** Friday, May 22, 2026

**Approved Schedule Extension:** One calendar week

**Current Target Completion:** Friday, May 29, 2026

### 9.5 Demo Snapshot State

**Lifecycle:** Handoff

**Health:** Waiting on Client

**Active Milestone:** Launch & Handoff

**Blocking Obligation:**

> Final Handoff acknowledgment by Elena Rossi

**Blocking Since:** Tuesday, May 26, 2026 at 4:15 PM

**Due:** Friday, May 29, 2026 at 5:00 PM

### 9.6 Client-Facing Project Status

**Status Heading:**

> The new Kestrelon website is live.

**Status Message:**

> Please review the final handoff package and confirm receipt by Friday. Sableframe’s launch-support window begins after acknowledgment.

**Next Step:**

> Review final assets and acknowledge Handoff.

### 9.7 Agency-Facing Project Status

**Operational Summary:**

> Launch completed. All required deliverables are approved. Final Handoff was published Tuesday and is awaiting Elena’s acknowledgment.

**Agency Risk Note:**

> No launch risk. Completion remains blocked until the client acknowledges receipt or Daniel completes the project with an override reason.

---

## 10. Project Timeline

| Phase                              | Planned Range | Actual or Current Status |
| ---------------------------------- | ------------- | ------------------------ |
| Kickoff & Discovery                | Mar 2–Mar 13  | Completed Mar 13         |
| Content & Information Architecture | Mar 16–Mar 27 | Completed Mar 27         |
| Visual Design                      | Mar 30–Apr 17 | Completed Apr 14         |
| Development & QA                   | Apr 15–May 20 | Completed May 21         |
| Launch & Handoff                   | May 21–May 29 | Active                   |

### 10.1 Original Timeline Change

The original target completion was May 22.

The accepted Change Request added:

- A new Customer Stories homepage section
- A reusable CMS content type
- A Customer Story detail template
- Additional QA

The approved impact moved the completion target from May 22 to May 29.

### 10.2 Current Progress

**Milestones Completed:** 4 of 5

**Project Progress Display:** 80%

Project progress is based on milestone completion, not arbitrary task percentage.

---

## 11. Milestones

## 11.1 Milestone 1 — Kickoff & Discovery

**Milestone Code:** `MS-001`

**Lifecycle:** Completed

**Planned Dates:** Mar 2–Mar 13

**Completed:** Mar 13

**Client-Facing Purpose:**

> Align the team on Kestrelon’s audience, positioning, launch objectives, and decision process.

**Key Outputs:**

- Discovery summary
- Audience priorities
- Website goals
- Stakeholder responsibilities
- Approved working direction

**Required Client Actions:**

- Complete product and audience questionnaire
- Upload current brand assets
- Confirm primary launch audience

**Completion Condition:**

All three required Client Actions completed and Discovery Summary approved.

---

## 11.2 Milestone 2 — Content & Information Architecture

**Milestone Code:** `MS-002`

**Lifecycle:** Completed

**Planned Dates:** Mar 16–Mar 27

**Completed:** Mar 27

**Client-Facing Purpose:**

> Turn the approved strategy into a clear page structure, content hierarchy, and conversion path.

**Key Outputs:**

- Sitemap
- Homepage information architecture
- Content responsibilities
- Customer-proof inventory

**Required Client Actions:**

- Provide approved customer proof points

**Key Deliverable:**

- Homepage Information Architecture

---

## 11.3 Milestone 3 — Visual Design

**Milestone Code:** `MS-003`

**Lifecycle:** Completed

**Planned Dates:** Mar 30–Apr 17

**Completed:** Apr 14

**Client-Facing Purpose:**

> Establish the visual system and approve the responsive homepage direction before development.

**Key Outputs:**

- Homepage Visual Direction
- Responsive layout principles
- Core component styling
- Approved design language

**Key Narrative Event:**

The first visual direction receives a formal Revision Requested decision.

The request is classified as `In Scope`.

A second version is published and approved.

---

## 11.4 Milestone 4 — Development & QA

**Milestone Code:** `MS-004`

**Lifecycle:** Completed

**Planned Dates:** Apr 15–May 20

**Completed:** May 21

**Client-Facing Purpose:**

> Build the approved website, connect the CMS, validate content, and prepare the release candidate.

**Key Outputs:**

- Responsive staging website
- CMS content model
- Performance pass
- Accessibility review
- Launch candidate

**Key Narrative Event:**

The client requests a new Customer Stories capability during the first staging review.

The request is classified as `Potential Scope Change`.

Sableframe creates `CR-001`.

Elena accepts it.

The updated staging build is later approved.

---

## 11.5 Milestone 5 — Launch & Handoff

**Milestone Code:** `MS-005`

**Lifecycle:** Active

**Planned Dates:** May 21–May 29

**Activated:** May 21 at 9:20 AM

**Client-Facing Purpose:**

> Launch the website, transfer final assets and documentation, and establish the post-launch support window.

**Current State:**

- Website launched
- Handoff package published
- Client acknowledgment pending

**Completion Condition:**

Client Approver acknowledges Handoff or Delivery Manager completes the project with an override reason.

---

## 12. Client Actions

## 12.1 Action Summary

| Code    | Action                                      | Type          | Assignee    | Due    | Blocks Progress | Status                 |
| ------- | ------------------------------------------- | ------------- | ----------- | ------ | --------------: | ---------------------- |
| ACT-001 | Complete product and audience questionnaire | Text Response | Marcus Reed | Mar 5  |             Yes | Completed              |
| ACT-002 | Upload current brand assets                 | File Upload   | Nia Patel   | Mar 6  |             Yes | Completed              |
| ACT-003 | Confirm primary launch audience             | Confirmation  | Elena Rossi | Mar 10 |             Yes | Completed              |
| ACT-004 | Provide approved customer proof points      | Text Response | Marcus Reed | Mar 24 |             Yes | Completed after Reopen |
| ACT-005 | Confirm production redirect list            | Confirmation  | Elena Rossi | May 18 |             Yes | Completed              |

All actions are required for their Milestone.

Actions `ACT-001` through `ACT-005` contribute to Client-Blocked Time only while they are Open.

---

## 12.2 ACT-001 — Product and Audience Questionnaire

**Milestone:** Kickoff & Discovery

**Assignee:** Marcus Reed

**Type:** Text Response

**Published:** Mar 2 at 2:20 PM

**Due:** Mar 5 at 5:00 PM

**Completed:** Mar 4 at 11:18 AM

**Instructions:**

> Summarize Kestrelon’s primary buyer, the onboarding problems they experience, and the language used most often in sales conversations.

**Submitted Response:**

> Our primary buyer is a VP of Customer Success or Head of Onboarding at a growing SaaS company. They know new customers are losing momentum, but their current product analytics do not explain which onboarding steps create the most friction. Sales conversations usually start with time-to-value, activation, and expansion risk.

---

## 12.3 ACT-002 — Upload Current Brand Assets

**Milestone:** Kickoff & Discovery

**Assignee:** Nia Patel

**Type:** File Upload

**Published:** Mar 2 at 2:24 PM

**Due:** Mar 6 at 5:00 PM

**Completed:** Mar 6 at 3:42 PM

**Instructions:**

> Upload the current logo files, type references, approved product screenshots, and any existing brand guidelines.

**Submitted Files:**

- `kestrelon-logo-suite.zip`
- `kestrelon-brand-notes.pdf`
- `approved-product-screens.zip`

---

## 12.4 ACT-003 — Confirm Primary Launch Audience

**Milestone:** Kickoff & Discovery

**Assignee:** Elena Rossi

**Type:** Confirmation

**Published:** Mar 6 at 4:05 PM

**Due:** Mar 10 at 12:00 PM

**Completed:** Mar 9 at 9:16 AM

**Confirmation Statement:**

> The primary website audience is senior Customer Success and Onboarding leaders at B2B SaaS companies with established onboarding programs.

**Elena’s Note:**

> Confirmed. Product leaders are an important secondary audience, but the homepage should lead with Customer Success.

---

## 12.5 ACT-004 — Provide Approved Customer Proof Points

**Milestone:** Content & Information Architecture

**Assignee:** Marcus Reed

**Type:** Text Response

**Published:** Mar 18 at 10:30 AM

**Due:** Mar 24 at 5:00 PM

**First Submission:** Mar 23 at 2:14 PM

**First Submission:**

> We can reference faster onboarding and lower early churn. I will confirm the exact numbers.

**Reopened By:** Daniel Ortiz

**Reopened:** Mar 24 at 9:12 AM

**Reopen Note:**

> Please confirm which metrics and customer names are approved for public use. The final response should distinguish verified claims from internal-only data.

**Completed:** Mar 25 at 4:48 PM

**Final Response:**

> Approved for public use:
>
> - 31% faster time-to-value at VelaWorks
> - 18% increase in onboarding completion at Northpeak
> - Customer logos: VelaWorks, Northpeak, and Kinetiq
>
> Do not use the internal churn-reduction figure.

**Narrative Purpose:**

This action demonstrates Reopened state and preserves the difference between an initial submission and an accepted final response.

---

## 12.6 ACT-005 — Confirm Production Redirect List

**Milestone:** Development & QA

**Assignee:** Elena Rossi

**Type:** Confirmation

**Published:** May 14 at 3:20 PM

**Due:** May 18 at 12:00 PM

**Completed:** May 17 at 5:06 PM

**Confirmation Statement:**

> Kestrelon has reviewed the production redirect list and confirmed that the listed legacy URLs may be redirected at launch.

**Elena’s Note:**

> Confirmed. The old `/platform` page should redirect to `/product`, not the homepage.

---

## 13. Deliverables and Versions

## 13.1 Deliverable Summary

| Code    | Deliverable                       | Type              | Milestone           | Latest Version | Status   |
| ------- | --------------------------------- | ----------------- | ------------------- | -------------- | -------- |
| DEL-001 | Discovery Summary                 | Downloadable File | Kickoff & Discovery | v1             | Approved |
| DEL-002 | Homepage Information Architecture | Downloadable File | Content & IA        | v1             | Approved |
| DEL-003 | Homepage Visual Direction         | Image             | Visual Design       | v2             | Approved |
| DEL-004 | Responsive Staging Build          | External Link     | Development & QA    | v2             | Approved |
| DEL-005 | Launch Readiness Report           | Downloadable File | Development & QA    | v1             | Approved |

---

## 13.2 DEL-001 — Discovery Summary

**Type:** Downloadable File

**Asset:** `kestrelon-discovery-summary-v1.pdf`

**Version:** v1

**Published:** Mar 11 at 3:30 PM

**Review Due:** Mar 12 at 5:00 PM

**Decision:** Approved

**Approved By:** Elena Rossi

**Approved:** Mar 12 at 10:04 AM

**Review Instructions:**

> Review the audience priorities, positioning direction, website objectives, and decision responsibilities. Approve the document if it accurately represents the kickoff agreement.

**Approval Note:**

> Approved. The audience hierarchy and onboarding focus are correct.

---

## 13.3 DEL-002 — Homepage Information Architecture

**Type:** Downloadable File

**Asset:** `kestrelon-homepage-ia-v1.pdf`

**Version:** v1

**Published:** Mar 20 at 1:45 PM

**Review Due:** Mar 24 at 5:00 PM

**Decision:** Approved

**Approved By:** Elena Rossi

**Approved:** Mar 23 at 11:36 AM

**Review Instructions:**

> Review the page narrative, section order, and primary conversion path. This approval confirms structure and content priority, not final visual design.

**Approval Note:**

> Approved. Keep the Customer Proof section before the platform detail so the page earns credibility early.

---

## 13.4 DEL-003 — Homepage Visual Direction

**Type:** Image

**Milestone:** Visual Design

**Current Status:** Approved

### Version 1

**Version Code:** `DEL-003-V1`

**Asset:** `kestrelon-homepage-direction-v1.webp`

**Published:** Apr 6 at 4:20 PM

**Review Due:** Apr 8 at 5:00 PM

**State:** Revision Requested

**Decision By:** Elena Rossi

**Decision:** Revision Requested

**Decision Time:** Apr 8 at 2:18 PM

**Review Instructions:**

> Review the full homepage direction with particular attention to positioning clarity, primary CTA, customer proof, and overall confidence. Comments should reference the visual area they relate to.

**Revision Summary:**

> Please sharpen the customer-onboarding positioning, change the primary CTA to “Book a demo,” and replace the placeholder customer marks with the approved logos.

### Version 2

**Version Code:** `DEL-003-V2`

**Asset:** `kestrelon-homepage-direction-v2.webp`

**Published:** Apr 13 at 3:05 PM

**Review Due:** Apr 15 at 5:00 PM

**State:** Approved

**Decision By:** Elena Rossi

**Decision:** Approved

**Decision Time:** Apr 14 at 10:27 AM

**Review Instructions:**

> Review the revised homepage direction. The update includes the approved onboarding message, “Book a demo” CTA, and verified customer proof.

**Approval Note:**

> Approved. This direction now feels specific to Kestrelon and is ready for development.

---

## 13.5 DEL-004 — Responsive Staging Build

**Type:** External Link

**Milestone:** Development & QA

**Current Status:** Approved

### Version 1

**Version Code:** `DEL-004-V1`

**URL Label:** `preview-v1.kestrelon-demo.test`

**Published:** May 4 at 4:40 PM

**Review Due:** May 6 at 5:00 PM

**State:** Revision Requested

**Decision By:** Elena Rossi

**Decision:** Revision Requested

**Decision Time:** May 6 at 11:22 AM

**Review Instructions:**

> Review the responsive homepage, platform page, and navigation behavior. Use shared comments for content or interaction issues. The primary decision is whether the build is ready to continue into launch preparation.

**Revision Summary:**

> The approved build is strong, but we want to add a Customer Stories section to the homepage and a reusable story page before launch. Please confirm the impact before proceeding.

### Version 2

**Version Code:** `DEL-004-V2`

**URL Label:** `preview-v2.kestrelon-demo.test`

**Published:** May 18 at 2:35 PM

**Review Due:** May 20 at 5:00 PM

**State:** Approved

**Decision By:** Elena Rossi

**Decision:** Approved

**Decision Time:** May 20 at 9:46 AM

**Review Instructions:**

> Review the release candidate, including the new Customer Stories section, story template, responsive behavior, final content, and production redirects.

**Approval Note:**

> Approved for launch. The new stories section fits naturally and the mobile hierarchy is clear.

**External-Link Rule:**

StudioFlow records the URL label, publication event, comments, and decision.

It does not claim that an external resource remains immutable after approval.

---

## 13.6 DEL-005 — Launch Readiness Report

**Type:** Downloadable File

**Asset:** `kestrelon-launch-readiness-v1.pdf`

**Version:** v1

**Published:** May 20 at 3:10 PM

**Review Due:** May 21 at 10:00 AM

**State:** Approved

**Decision By:** Elena Rossi

**Decision:** Approved

**Decision Time:** May 21 at 9:08 AM

**Review Instructions:**

> Review the launch checklist, known limitations, production redirect summary, analytics validation, and support responsibilities.

**Approval Note:**

> Approved. Proceed with the production launch Thursday morning.

---

## 14. Feedback Threads

## 14.1 Visual Direction v1 — Shared Pin Comment 1

**Comment Code:** `COM-001`

**Deliverable Version:** DEL-003-V1

**Author:** Marcus Reed

**Visibility:** Shared

**Location:** Hero supporting copy

**Created:** Apr 7 at 9:14 AM

**Comment:**

> The headline is clear, but the supporting line still sounds like a broad analytics platform. Can we bring the onboarding use case forward earlier?

**Reply — Priya Shah:**

> Yes. I’ll revise the supporting line around onboarding momentum and move the product-category language into the next section.

**Resolution:** Resolved by Priya Shah on Apr 13 at 2:42 PM

---

## 14.2 Visual Direction v1 — Shared Pin Comment 2

**Comment Code:** `COM-002`

**Deliverable Version:** DEL-003-V1

**Author:** Elena Rossi

**Visibility:** Shared

**Location:** Primary hero CTA

**Created:** Apr 7 at 10:03 AM

**Comment:**

> Please use “Book a demo” as the primary CTA. We are not ready for a self-serve trial message.

**Reply — Priya Shah:**

> Understood. I’ll update the CTA language and keep the secondary action focused on the product overview.

**Resolution:** Resolved by Priya Shah on Apr 13 at 2:45 PM

---

## 14.3 Visual Direction v1 — Shared Pin Comment 3

**Comment Code:** `COM-003`

**Deliverable Version:** DEL-003-V1

**Author:** Nia Patel

**Visibility:** Shared

**Location:** Customer-logo row

**Created:** Apr 7 at 11:20 AM

**Comment:**

> Can we replace the placeholders with VelaWorks, Northpeak, and Kinetiq? Those are the three marks cleared for public use.

**Reply — Daniel Ortiz:**

> Confirmed. We have the final logo files from the approved proof-point action.

**Resolution:** Resolved by Priya Shah on Apr 13 at 2:47 PM

---

## 14.4 Visual Direction v1 — Agency-Only Note

**Comment Code:** `COM-004`

**Deliverable Version:** DEL-003-V1

**Author:** Priya Shah

**Visibility:** Agency Only

**Location:** Customer-logo row

**Created:** Apr 7 at 11:42 AM

**Comment:**

> Keep the spacing system unchanged when replacing the marks. The approved logos have different proportions, so use the normalized logo container rather than resizing the row.

**Client Visibility:** Never visible

**Resolution:** Resolved by Priya Shah on Apr 13 at 2:48 PM

---

## 14.5 Staging Build v1 — Shared General Comment

**Comment Code:** `COM-005`

**Deliverable Version:** DEL-004-V1

**Author:** Elena Rossi

**Visibility:** Shared

**Created:** May 5 at 3:38 PM

**Comment:**

> The build reflects the approved design. Before launch, we would like a Customer Stories section on the homepage and a reusable detail page for each story. Please confirm whether that fits the current scope.

**Reply — Daniel Ortiz:**

> I’ll assess the design, CMS, development, and QA impact before we proceed. I’m treating this as a potential scope change rather than an included revision.

**Resolution:** Resolved after CR-001 was accepted and DEL-004-V2 was published

---

## 14.6 Staging Build v2 — Shared General Comment

**Comment Code:** `COM-006`

**Deliverable Version:** DEL-004-V2

**Author:** Marcus Reed

**Visibility:** Shared

**Created:** May 19 at 10:16 AM

**Comment:**

> The new story module works well. On mobile, can we keep the onboarding result visible before the quote expands?

**Reply — Theo Martin:**

> Updated. The result stays visible in the collapsed card and the quote expands below it.

**Resolution:** Resolved by Theo Martin on May 19 at 4:08 PM

---

## 14.7 Staging Build v2 — Shared General Comment

**Comment Code:** `COM-007`

**Deliverable Version:** DEL-004-V2

**Author:** Nia Patel

**Visibility:** Shared

**Created:** May 19 at 11:02 AM

**Comment:**

> The final legal footer copy is correct. No further content changes from my side.

**Resolution:** Resolved by Daniel Ortiz on May 19 at 4:15 PM

---

## 15. Formal Review Decisions

| Decision Code | Deliverable Version | Decision           | Decision Maker | Time          |
| ------------- | ------------------- | ------------------ | -------------- | ------------- |
| DEC-001       | DEL-001-V1          | Approved           | Elena Rossi    | Mar 12, 10:04 |
| DEC-002       | DEL-002-V1          | Approved           | Elena Rossi    | Mar 23, 11:36 |
| DEC-003       | DEL-003-V1          | Revision Requested | Elena Rossi    | Apr 8, 14:18  |
| DEC-004       | DEL-003-V2          | Approved           | Elena Rossi    | Apr 14, 10:27 |
| DEC-005       | DEL-004-V1          | Revision Requested | Elena Rossi    | May 6, 11:22  |
| DEC-006       | DEL-004-V2          | Approved           | Elena Rossi    | May 20, 09:46 |
| DEC-007       | DEL-005-V1          | Approved           | Elena Rossi    | May 21, 09:08 |

### 15.1 Decision Integrity

All decisions are:

- Attached to one exact Deliverable Version
- Attributed to Elena Rossi
- Immutable
- Visible in project activity
- Preserved after later versions are published

### 15.2 Unresolved Comment Warning Example

DEL-003-V1 had three unresolved shared comments when Elena selected `Request Revision`.

The interface may display:

> 3 shared comments remain open. They will remain attached to version 1 after you submit this decision.

The decision is allowed because Revision Requested does not require all comments to be resolved.

---

## 16. Revision Requests

## 16.1 RR-001 — Homepage Positioning and CTA

**Source:** DEL-003-V1

**Created By:** Review Decision DEC-003

**Created:** Apr 8 at 2:18 PM

**Initial State:** Open

**Client Summary:**

> Please sharpen the customer-onboarding positioning, change the primary CTA to “Book a demo,” and replace the placeholder customer marks with the approved logos.

**Agency Classification:** In Scope

**Classified By:** Daniel Ortiz

**Classification Time:** Apr 9 at 9:26 AM

**Client-Visible Classification Note:**

> These updates refine the approved direction and are included in the current design phase.

**Agency-Only Note:**

> No change to page structure or component inventory. Priya can complete the update within the planned Visual Design milestone.

**Resolution Condition:**

Replacement version published.

**Resolved:** Apr 13 at 3:05 PM when DEL-003-V2 was published

**Final State:** Resolved

---

## 16.2 RR-002 — Customer Stories Capability

**Source:** DEL-004-V1

**Created By:** Review Decision DEC-005

**Created:** May 6 at 11:22 AM

**Initial State:** Open

**Client Summary:**

> Add a Customer Stories section to the homepage and a reusable story detail page before launch.

**Agency Classification:** Potential Scope Change

**Classified By:** Daniel Ortiz

**Classification Time:** May 6 at 3:40 PM

**Client-Visible Classification Note:**

> This request adds a new page type, CMS structure, design work, development, and QA beyond the approved build. Sableframe will provide a formal impact proposal before work begins.

**Agency-Only Note:**

> Estimate includes one homepage module, one CMS collection, one story detail template, content entry for two stories, responsive QA, and regression testing.

**Linked Change Request:** CR-001

**Resolution Condition:**

Linked Change Request accepted and applied.

**Resolved:** May 8 at 9:42 AM when CR-001 was applied

**Final State:** Resolved

DEL-004 remained in Revision In Progress until DEL-004-V2 was published on May 18.

---

## 17. Change Request

## 17.1 CR-001 — Customer Stories Module and CMS Collection

**Change Request Code:** `CR-001`

**Project:** Kestrelon Website Rebuild

**Related Milestone:** Development & QA

**Related Revision Request:** RR-002

**Created By:** Daniel Ortiz

**Created:** May 7 at 10:12 AM

**Sent:** May 7 at 1:30 PM

**Decision Deadline:** May 8 at 5:00 PM

**Decision Maker:** Elena Rossi

### 17.2 Title

> Customer Stories module and CMS collection

### 17.3 Reason

> Kestrelon requested a new customer-proof capability after reviewing the first staging build. The approved scope included customer logos and proof points but did not include a reusable Customer Stories content model or detail-page template.

### 17.4 Scope Impact

The accepted change adds:

- One Customer Stories section on the homepage
- One reusable Customer Story detail-page template
- One CMS collection for Customer Stories
- Content entry for two launch stories
- Responsive design adaptation
- Development and CMS implementation
- Regression and accessibility QA

### 17.5 Timeline Impact

> Extend the project target by one calendar week.

**Original Target:** May 22

**Updated Target:** May 29

### 17.6 Cost Impact

**Amount:** €3,600

**Display:** `€3,600 additional`

The amount is informational.

StudioFlow does not process payment.

### 17.7 Client Decision

**Decision:** Accepted

**Accepted By:** Elena Rossi

**Accepted:** May 8 at 9:18 AM

**Client Decision Note:**

> Accepted. The additional stories capability is important for the launch campaign. Please proceed with the two approved customer stories.

### 17.8 Application

**Applied By:** Daniel Ortiz

**Applied:** May 8 at 9:42 AM

**Applied Effects:**

- Project target completion changed to May 29
- Scope summary updated
- Development & QA milestone dates updated
- New work linked to DEL-004 replacement version
- Activity Event created

### 17.9 Final State

**State:** Applied

### 17.10 Narrative Purpose

CR-001 demonstrates:

- Scope protection
- Commercial transparency
- Separation of revision from scope change
- Client decision authority
- Timeline and cost impact
- Accepted decision without payment processing
- Explicit application after acceptance

---

## 18. Handoff

## 18.1 Handoff Identity

**Handoff Code:** `HO-KES-001`

**Project:** Kestrelon Website Rebuild

**State:** Published

**Published By:** Daniel Ortiz

**Published:** Tuesday, May 26 at 4:15 PM

**Acknowledgment Due:** Friday, May 29 at 5:00 PM

**Client Approver:** Elena Rossi

**Acknowledgment State:** Pending

### 18.2 Handoff Introduction

> The new Kestrelon website is live. This package contains the final production links, design source, implementation documentation, CMS guidance, and launch-support information.

### 18.3 Handoff Instructions

> Review each required item and confirm that your team can access the final assets. Acknowledgment confirms receipt of the Handoff package; it is not a legal signature or acceptance of future support work.

### 18.4 Handoff Items

| Code   | Item                           | Type              | Required | State     |
| ------ | ------------------------------ | ----------------- | -------: | --------- |
| HO-001 | Production Website             | External Link     |      Yes | Published |
| HO-002 | Design Source                  | External Link     |      Yes | Published |
| HO-003 | Component Usage Guide          | Downloadable File |      Yes | Published |
| HO-004 | CMS Editorial Guide            | Downloadable File |      Yes | Published |
| HO-005 | Launch and Analytics Checklist | Downloadable File |      Yes | Published |
| HO-006 | Post-Launch Support Window     | Documentation     |      Yes | Published |

---

## 18.5 HO-001 — Production Website

**Type:** External Link

**Label:** `kestrelon.example`

**Description:**

> Production website released after redirect, analytics, accessibility, and performance verification.

---

## 18.6 HO-002 — Design Source

**Type:** External Link

**Label:** `Kestrelon Website — Final Design Source`

**Description:**

> Final approved design source containing page layouts, component states, and responsive references.

---

## 18.7 HO-003 — Component Usage Guide

**Type:** Downloadable File

**Asset:** `kestrelon-component-usage-guide.pdf`

**Description:**

> Reference for core website components, intended usage, content limits, and common layout patterns.

---

## 18.8 HO-004 — CMS Editorial Guide

**Type:** Downloadable File

**Asset:** `kestrelon-cms-editorial-guide.pdf`

**Description:**

> Instructions for editing pages, publishing Customer Stories, managing metadata, and preserving content quality.

---

## 18.9 HO-005 — Launch and Analytics Checklist

**Type:** Downloadable File

**Asset:** `kestrelon-launch-analytics-checklist.pdf`

**Description:**

> Final verification of redirects, metadata, analytics events, consent behavior, and campaign tracking.

---

## 18.10 HO-006 — Post-Launch Support Window

**Type:** Documentation

**Description:**

> Sableframe will provide launch support through Friday, June 12. Support covers defects in the delivered implementation and clarification related to the Handoff materials. New features require separate evaluation.

### 18.11 Pending Acknowledgment Copy

**Primary Action:**

> Acknowledge final Handoff

**Confirmation Copy:**

> I confirm that Kestrelon has access to the required final assets and documentation listed in this Handoff package.

**Supporting Note:**

> This acknowledgment records receipt. It does not create a legal signature or approve new work.

### 18.12 Current Blocking Condition

The Handoff acknowledgment is a blocking client obligation.

Client-blocked time began when the Handoff was published.

At the Demo Snapshot:

- Blocking duration: 1 day, 18 hours, 15 minutes
- Obligation is not overdue
- Project Health: Waiting on Client

---

## 19. Primary Project Activity Timeline

The project activity view should not show every low-level edit.

It should show meaningful delivery events.

| Date and Time | Visibility | Event                                                    |
| ------------- | ---------- | -------------------------------------------------------- |
| Mar 2, 09:10  | Agency     | Daniel created Kestrelon Website Rebuild                 |
| Mar 2, 09:18  | Agency     | Daniel assigned Priya and Theo                           |
| Mar 2, 09:24  | Agency     | Daniel assigned Elena as Client Approver                 |
| Mar 2, 14:20  | Client     | Product and audience questionnaire assigned to Marcus    |
| Mar 2, 14:24  | Client     | Brand asset upload assigned to Nia                       |
| Mar 4, 11:18  | Client     | Marcus completed product and audience questionnaire      |
| Mar 6, 15:42  | Client     | Nia uploaded brand assets                                |
| Mar 9, 09:16  | Client     | Elena confirmed primary launch audience                  |
| Mar 12, 10:04 | Client     | Elena approved Discovery Summary v1                      |
| Mar 13, 16:30 | Client     | Kickoff & Discovery completed                            |
| Mar 18, 10:30 | Client     | Customer proof-point action assigned to Marcus           |
| Mar 23, 11:36 | Client     | Elena approved Homepage Information Architecture v1      |
| Mar 24, 09:12 | Client     | Daniel reopened customer proof-point action              |
| Mar 25, 16:48 | Client     | Marcus completed customer proof-point action             |
| Mar 27, 17:10 | Client     | Content & Information Architecture completed             |
| Apr 6, 16:20  | Client     | Homepage Visual Direction v1 published                   |
| Apr 8, 14:18  | Client     | Elena requested revision on Homepage Visual Direction v1 |
| Apr 9, 09:26  | Client     | Daniel classified the revision as In Scope               |
| Apr 13, 15:05 | Client     | Homepage Visual Direction v2 published                   |
| Apr 14, 10:27 | Client     | Elena approved Homepage Visual Direction v2              |
| Apr 14, 10:32 | Client     | Visual Design completed                                  |
| May 4, 16:40  | Client     | Responsive Staging Build v1 published                    |
| May 6, 11:22  | Client     | Elena requested revision on Responsive Staging Build v1  |
| May 6, 15:40  | Client     | Daniel classified the request as Potential Scope Change  |
| May 7, 13:30  | Client     | Change Request CR-001 sent to Elena                      |
| May 8, 09:18  | Client     | Elena accepted CR-001                                    |
| May 8, 09:42  | Client     | Daniel applied CR-001 to project scope and schedule      |
| May 18, 14:35 | Client     | Responsive Staging Build v2 published                    |
| May 20, 09:46 | Client     | Elena approved Responsive Staging Build v2               |
| May 20, 15:10 | Client     | Launch Readiness Report v1 published                     |
| May 21, 09:08 | Client     | Elena approved Launch Readiness Report v1                |
| May 21, 09:12 | Client     | Development & QA completed                               |
| May 21, 09:20 | Client     | Launch & Handoff activated                               |
| May 21, 11:00 | Client     | Production website launched                              |
| May 26, 16:15 | Client     | Final Handoff published                                  |

### 19.1 Agency-Only Activity Examples

Agency users may additionally see:

- Priya added an internal note to Visual Direction v1
- Daniel added a private scope-estimation note to RR-002
- Theo marked launch QA complete
- Daniel updated the target completion date after CR-001
- Email reminder delivery status

These events must not appear to Client users.

---

## 20. Project Health and Metrics

## 20.1 Main Project Metrics

**Lifecycle:** Handoff

**Health:** Waiting on Client

**Completed Milestones:** 4

**Total Milestones:** 5

**Open Blocking Obligations:** 1

**Overdue Blocking Obligations:** 0

**Deliverables Approved:** 5

**Total Deliverables:** 5

**Revision Requests:** 2

**In-Scope Revisions:** 1

**Potential Scope Changes:** 1

**Accepted Change Requests:** 1

**Open Shared Comments:** 0

**Client Contributors:** 2

**Client Approvers:** 1

### 20.2 Review Metrics

**Approval Turnaround:**

- Discovery Summary v1: 18 hours, 34 minutes
- Homepage IA v1: 2 days, 21 hours, 51 minutes
- Visual Direction v2: 19 hours, 22 minutes
- Staging Build v2: 1 day, 19 hours, 11 minutes
- Launch Readiness v1: 17 hours, 58 minutes

**Revision Rounds:**

- Visual Direction: 1 revision round
- Staging Build: 1 revision round

### 20.3 Client-Blocked Intervals

The primary project contains several historical client-blocked intervals.

Examples:

- ACT-001 publication to completion
- ACT-002 publication to completion
- ACT-003 publication to completion
- ACT-004 publication to first completion, followed by a second interval from Reopen to final completion; the completed interval between those events is excluded
- DEL-003-V1 publication to decision
- DEL-003-V2 publication to decision
- DEL-004-V1 publication to decision
- CR-001 sent to decision
- DEL-004-V2 publication to decision
- Handoff publication to current Demo Snapshot

Overlapping obligations are counted once at the project level.

The exact derived total belongs to implementation seed calculations and must match these source events.

---

## 21. Supporting Agency Projects

Supporting projects exist to create a realistic Delivery Overview.

They should have enough information to justify their visible state but should not receive the same narrative depth as the primary project.

## 21.1 Orbit Health Marketing Site

**Project Code:** `PRJ-ORB-002`

**Client:** Orbit Health

**Lifecycle:** Onboarding

**Health:** Waiting on Client

**Delivery Manager:** Daniel Ortiz

**Client Approver:** Sofia Bennett

**Active Milestone:** Kickoff & Discovery

**Target Completion:** Jul 10, 2026

**Blocking Obligation:**

> Upload compliance-approved product screenshots

**Action Assignee:** Noah Williams

**Action Due:** May 25 at 5:00 PM

**Status at Snapshot:** Overdue by 2 days, 17 hours, 30 minutes

**Primary Dashboard Message:**

> Waiting on overdue client assets

**Traceable Seed Records:**

- `ACT-ORB-001` — Upload compliance-approved product screenshots
  - Type: File Upload
  - Assignee: Noah Williams
  - Published: May 22 at 9:00 AM
  - Due: May 25 at 5:00 PM
  - Blocks Progress: Yes
  - State: Open
- `ACT-ORB-002` — Confirm launch compliance owner
  - Type: Confirmation
  - Assignee: Sofia Bennett
  - Published: May 22 at 9:05 AM
  - Due: May 26 at 12:00 PM
  - Completed: May 26 at 11:32 AM

**Narrative Purpose:**

- Overdue Client Action
- Waiting on Client
- Onboarding lifecycle
- Clear risk requiring follow-up

---

## 21.2 Cedar & Finch Ecommerce Refresh

**Project Code:** `PRJ-CED-003`

**Client:** Cedar & Finch

**Lifecycle:** Active

**Health:** At Risk

**Delivery Manager:** Daniel Ortiz

**Client Approver:** Amelia Hart

**Active Milestone:** Visual Design

**Milestone Target:** May 30, 2026

**Project Target Completion:** Jun 26, 2026

**Current Condition:**

- No client obligation is open
- Visual Design milestone is due within three calendar days
- The agency has not yet published the review version

**Primary Dashboard Message:**

> Visual Design review must be published by Saturday

**Traceable Seed Record:**

- `DEL-CED-001` — Homepage Visual Direction
  - Type: Image
  - State: Draft
  - Milestone: Visual Design
  - Required publication target: May 30
  - Client visibility: None until published

**Narrative Purpose:**

- At Risk without Waiting on Client
- Agency-owned risk
- Current milestone deadline

---

## 21.3 MonoGrid Product Launch

**Project Code:** `PRJ-MON-004`

**Client:** MonoGrid

**Lifecycle:** Active

**Health:** On Track

**Delivery Manager:** Daniel Ortiz

**Client Approver:** Jonah Lee

**Active Milestone:** Content & Information Architecture

**Milestone Target:** Jun 12, 2026

**Project Target Completion:** Jul 24, 2026

**Current Condition:**

- Client obligations are complete
- One Revision Request awaits agency classification
- No deadline is within the At Risk threshold

**Primary Dashboard Message:**

> Review client revision request

**Revision Request Summary:**

> Clarify whether the new enterprise-security page replaces or supplements the approved platform page.

**Traceable Seed Records:**

- `DEL-MON-001` — Product Page Structure
  - Type: Downloadable File
  - Version: v1
  - Decision: Revision Requested
  - Decision maker: Jonah Lee
  - Decision time: May 26 at 4:04 PM
- `RR-MON-001`
  - Source: DEL-MON-001-V1
  - Classification: Unclassified
  - State: Open
  - Agency owner: Daniel Ortiz

**Narrative Purpose:**

- On Track project
- Agency-side pending work
- Revision awaiting classification
- Distinction between client blocker and agency responsibility

---

## 21.4 Fieldnote Brand Site

**Project Code:** `PRJ-FLD-005`

**Client:** Fieldnote

**Lifecycle:** Completed

**Health:** Not applicable

**Delivery Manager:** Daniel Ortiz

**Completed:** Apr 24, 2026

**State:** Read-only

**Narrative Purpose:**

- Completed-project access
- Historical decisions
- Read-only behavior
- Search result outside active-project overview

---

### 21.5 Seed Data Depth

The Demo uses three levels of data depth.

#### Primary Project — Full Fidelity

Kestrelon contains the complete object graph required for the end-to-end walkthrough:

- Members
- Milestones
- Client Actions
- Deliverables
- Versions
- Comments
- Decisions
- Revision Requests
- Change Request
- Activity
- Handoff

#### Supporting Open Projects — Traceable Minimum

Orbit Health, Cedar & Finch, and MonoGrid contain only the records required to justify:

- Lifecycle
- Health
- Priority
- Dashboard counts
- Recent activity
- Attention items

They must not be expanded into full project histories unless a later approved screen requires that depth.

#### Completed Project — Summary Depth

Fieldnote contains enough historical data to demonstrate:

- Completed lifecycle
- Read-only behavior
- Search and filtering
- Preserved decision history

This tiered approach keeps the Demo believable without turning Seed Data into a second product implementation.

---

## 22. Agency Delivery Overview Snapshot

The default Agency Demo opens as Daniel Ortiz.

Daniel sees projects assigned to him.

### 22.1 Summary Metrics

| Metric                                    | Value |
| ----------------------------------------- | ----: |
| Open Projects                             |     4 |
| Waiting on Client                         |     2 |
| At Risk                                   |     1 |
| On Track                                  |     1 |
| Overdue Client Actions                    |     1 |
| Deliverables Awaiting Client Decision     |     0 |
| Revision Requests Awaiting Classification |     1 |
| Change Requests Awaiting Decision         |     0 |
| Handoffs Awaiting Acknowledgment          |     1 |

### 22.2 Project Priority Order

1. Orbit Health Marketing Site
2. Kestrelon Website Rebuild
3. Cedar & Finch Ecommerce Refresh
4. MonoGrid Product Launch

### 22.3 Priority Logic

#### Orbit Health

Highest priority because a blocking Client Action is overdue.

#### Kestrelon

Second because the project is waiting on final acknowledgment, but the obligation is not overdue.

#### Cedar & Finch

Third because the current milestone is approaching its deadline and the agency has not published the review version.

#### MonoGrid

Fourth because the project remains On Track, although the agency has a Revision Request to classify.

### 22.4 Recent Client Activity

The activity panel may show:

1. Jonah Lee requested revision on MonoGrid’s Product Page Structure v1 — May 26, 16:04
2. Sofia Bennett completed Orbit Health’s compliance-owner confirmation — May 26, 11:32
3. Elena Rossi approved Kestrelon’s Launch Readiness Report v1 — May 21, 09:08
4. Elena Rossi approved Kestrelon’s Responsive Staging Build v2 — May 20, 09:46
5. Nia Patel commented on Kestrelon’s Responsive Staging Build v2 — May 19, 11:02

### 22.5 Agency Attention Items

**Overdue:**

> Orbit Health — Compliance-approved screenshots were due May 25.

**Waiting for Client:**

> Kestrelon — Final Handoff acknowledgment due May 29.

**Agency Risk:**

> Cedar & Finch — Visual Design review must be published within two days.

**Agency Work:**

> MonoGrid — Revision Request requires classification.

---

## 23. Client Action Center Snapshot

The default Client Demo opens as Elena Rossi.

### 23.1 Greeting

> Good morning, Elena.

### 23.2 Primary Attention Card

**Project:** Kestrelon Website Rebuild

**Label:** Final action

**Title:**

> Review and acknowledge the final Handoff

**Due:** Friday, May 29

**Description:**

> Confirm that Kestrelon can access the production website, final design source, CMS guide, launch checklist, and support information.

**Primary CTA:**

> Review Handoff

### 23.3 Project Progress

**Milestones:** 4 of 5 completed

**Current Milestone:** Launch & Handoff

**Status:**

> Website live — Handoff acknowledgment pending

### 23.4 Recent Decisions

- Responsive Staging Build v2 — Approved May 20
- Launch Readiness Report v1 — Approved May 21
- Change Request CR-001 — Accepted May 8

### 23.5 Recently Completed Actions

- Confirm production redirect list — Completed May 17
- Provide approved customer proof points — Completed Mar 25
- Confirm primary launch audience — Completed Mar 9

### 23.6 Client Portal Principle

The Client Action Center should not display internal agency risks, private notes, implementation tasks, or unrelated projects.

---

## 24. Primary Project Screen Snapshot

### 24.1 Project Header

**Title:** Kestrelon Website Rebuild

**Client-Facing Subtitle:**

> A clearer product story, a stronger conversion path, and a website your marketing team can manage.

**Status Badge:** Handoff

**Health Message:**

> Your action is required

**Primary CTA:**

> Review final Handoff

### 24.2 Current Milestone Card

**Milestone:** Launch & Handoff

**Progress:**

- Website launched
- Final assets published
- Handoff acknowledgment pending

### 24.3 Timeline Presentation

Completed milestones should remain visible but visually subordinate.

The active Milestone should be prominent.

Upcoming milestones do not exist because this is the final phase.

### 24.4 Decision History Summary

The project may summarize:

- 5 approved Deliverables
- 2 Revision Requests
- 1 accepted Change Request
- 0 unresolved shared comments

### 24.5 Agency Project Header

Agency users see additional operational information:

- Delivery Manager
- Project Health
- Blocking duration
- Target completion
- Active Client Approver
- Pending agency and client obligations

---

## 25. Signature Product Moments

The Demo must prioritize a small number of memorable product moments.

## 25.1 Agency Delivery Overview

The viewer should immediately understand:

- Which projects are moving
- Which are waiting on clients
- Which require agency attention
- Why each project has its current health state

## 25.2 Client Action Center

The client should not need to inspect the whole project to understand what to do.

The final Handoff acknowledgment should dominate the page.

## 25.3 Image Review

Homepage Visual Direction v1 should demonstrate:

- Large visual presentation
- Pin comments
- Shared and internal discussion
- Version identity
- Formal Revision Requested decision
- Preserved history after v2 is approved

## 25.4 Revision Classification

RR-002 should demonstrate the moment where an agency protects scope without creating friction.

The language should feel professional rather than defensive.

## 25.5 Change Request

CR-001 should clearly present:

- What changed
- Why it is outside current scope
- Cost impact
- Timeline impact
- Decision deadline
- Accepted decision
- Application history

## 25.6 Final Handoff

The Handoff should feel like a professional conclusion to the project rather than a folder of miscellaneous links.

---

## 26. Product-State Coverage

| Product State or Capability                   | Narrative Evidence                                      |
| --------------------------------------------- | ------------------------------------------------------- |
| Draft Project                                 | Available through create-project flow, not default data |
| Onboarding Project                            | Orbit Health                                            |
| Active Project                                | Cedar & Finch, MonoGrid                                 |
| Handoff Project                               | Kestrelon                                               |
| Completed Project                             | Fieldnote                                               |
| Waiting on Client                             | Kestrelon, Orbit Health                                 |
| At Risk                                       | Cedar & Finch                                           |
| On Track                                      | MonoGrid                                                |
| Overdue Client Action                         | Orbit Health                                            |
| Reopened Client Action                        | Kestrelon ACT-004                                       |
| Image Deliverable                             | Kestrelon DEL-003                                       |
| External-Link Deliverable                     | Kestrelon DEL-004                                       |
| Downloadable-File Deliverable                 | Kestrelon DEL-001, DEL-002, DEL-005                     |
| Shared Pin Comment                            | COM-001, COM-002, COM-003                               |
| Agency-Only Comment                           | COM-004                                                 |
| Approved Decision                             | Multiple                                                |
| Revision Requested                            | DEL-003-V1, DEL-004-V1                                  |
| In-Scope Revision                             | RR-001                                                  |
| Potential Scope Change                        | RR-002                                                  |
| Change Request Accepted                       | CR-001                                                  |
| Historical Revision-Requested Versions        | DEL-003-V1, DEL-004-V1                                  |
| Handoff Published                             | HO-KES-001                                              |
| Handoff Pending                               | Kestrelon                                               |
| Read-Only Project                             | Fieldnote                                               |
| Revision Awaiting Classification              | MonoGrid                                                |
| Role-Based Client Decision                    | Elena Rossi                                             |
| Client Contributor Without Decision Authority | Marcus Reed, Nia Patel                                  |

### 26.1 States Not Required in Canonical Snapshot

The canonical Demo does not need to show every edge case simultaneously.

The following may be available through controlled secondary states or tests:

- Expired invitation
- Revoked access
- Failed upload
- Concurrent publication conflict
- Withdrawn Change Request
- Cancelled project
- Completion without acknowledgment
- Archived project

These states must exist in product behavior but should not overload the primary narrative.

---

## 27. Demo Copy Inventory

### 27.1 Agency Dashboard Heading

> Delivery overview

### 27.2 Agency Dashboard Supporting Copy

> See what is moving, what is waiting on clients, and where your team needs to act next.

### 27.3 Client Action Center Heading

> Your next actions

### 27.4 Client Action Center Supporting Copy

> Everything Kestrelon needs to review, confirm, or complete across active projects.

### 27.5 Empty Action State

> You are all caught up.

> There are no actions waiting for you right now.

### 27.6 Waiting-on-Client Label

> Waiting on client

### 27.7 Agency-Owned Risk Label

> Agency action needed

### 27.8 Approval Confirmation Heading

> Approve Homepage Visual Direction v2?

### 27.9 Approval Confirmation Body

> This decision applies only to version 2 and will be recorded in the project history.

### 27.10 Revision Confirmation Heading

> Request revision on Responsive Staging Build v1?

### 27.11 Revision Confirmation Body

> Summarize the required changes. Sableframe will review whether the request is included in the current scope.

### 27.12 Change Request Decision Heading

> Accept Customer Stories module and CMS collection?

### 27.13 Change Request Decision Summary

> This change adds €3,600 and extends the target completion date to May 29.

### 27.14 Handoff Confirmation Heading

> Acknowledge final Handoff?

### 27.15 Handoff Confirmation Body

> Confirm that Kestrelon can access the required final assets and documentation.

---

## 28. Demo File Inventory

The following fictional files must exist as believable metadata and, where required for the visual Demo, as generated sample assets.

### 28.1 Client Uploads

- `kestrelon-logo-suite.zip`
- `kestrelon-brand-notes.pdf`
- `approved-product-screens.zip`

### 28.2 Deliverable Files

- `kestrelon-discovery-summary-v1.pdf`
- `kestrelon-homepage-ia-v1.pdf`
- `kestrelon-homepage-direction-v1.webp`
- `kestrelon-homepage-direction-v2.webp`
- `kestrelon-launch-readiness-v1.pdf`

### 28.3 Handoff Files

- `kestrelon-component-usage-guide.pdf`
- `kestrelon-cms-editorial-guide.pdf`
- `kestrelon-launch-analytics-checklist.pdf`

### 28.4 External Links

- Responsive Staging Build v1
- Responsive Staging Build v2
- Production Website
- Final Design Source

### 28.5 Asset Quality Rule

Files visible in screenshots must not be empty placeholders.

They should contain coherent, branded sample content consistent with this narrative.

Every downloadable file exposed by the canonical Demo must resolve to a real sample artifact.

### 28.6 External-Link Rule

Reserved labels such as `.test` and `.example` may appear in the interface.

The public portfolio Demo must route those links to controlled static preview destinations or internal Demo routes.

It must not send users to dead or unrelated external domains.

The exact artifact-generation and preview-hosting workflow belongs to Visual Direction and implementation planning.

---

## 29. Demo Consistency Rules

### 29.1 Dates

All displayed dates must be consistent with the fixed Demo Snapshot.

Relative labels such as `2 days ago` must derive from May 28, 2026 at 10:30 AM.

### 29.2 Timezone

All seeded project times use Europe/Amsterdam.

### 29.3 Names and Initials

User names, avatars, and initials must remain consistent across:

- Member lists
- Comments
- Decisions
- Activity
- Notifications
- Project headers

### 29.4 Roles

Only Elena may approve, request formal revision, decide CR-001, or acknowledge Handoff.

Marcus and Nia may comment and complete assigned actions but may not make binding decisions.

### 29.5 Version State

DEL-003-V1 and DEL-004-V1 must remain historical with `Revision Requested` decisions.

They may not appear as current review versions or be mislabeled as Superseded.

Every published Deliverable Version must retain the Review Due date defined in this narrative.

### 29.6 Comment State

All shared comments on the main project are resolved at the Demo Snapshot.

Historical comments remain visible on their original versions.

### 29.7 Project Health

Kestrelon is `Waiting on Client` because Handoff acknowledgment is pending.

Orbit Health is `Waiting on Client` because an overdue blocking action is open.

Cedar & Finch is `At Risk` because the active milestone is due within three calendar days and no client obligation is open.

MonoGrid is `On Track` because its deadlines are outside the risk threshold and the pending work belongs to the agency.

### 29.8 Metrics

Dashboard counts must always match the four open projects assigned to Daniel.

### 29.9 Change Request

CR-001 must display `Accepted` and `Applied`.

It must not display `Paid`.

### 29.10 Handoff

Handoff acknowledgment must remain pending in the canonical snapshot.

Completing it during a Demo session may transition the project to Completed, but reset must restore the pending state.

### 29.11 Internal Content

COM-004 and agency-only classification notes must never appear in Client Demo views.

### 29.12 Activity Integrity

The canonical Activity feed includes meaningful product events.

Passive page views are analytics events, not Project Activity Events, and must not appear in the default Activity timeline.

### 29.13 Sensitive Information

No real credentials, API keys, private customer information, or production access secrets may appear in Demo content.

---

## 30. Demo Walkthrough

The primary portfolio walkthrough should follow a coherent sequence.

### Step 1 — Agency Delivery Overview

Open as Daniel.

Show:

- Four open projects
- Two projects waiting on clients
- One overdue action
- One agency-owned At Risk project
- One Revision Request awaiting classification

### Step 2 — Open Kestrelon

Show:

- Handoff lifecycle
- Waiting on Client health
- Active Milestone
- Project progress
- Blocking obligation
- Recent activity

### Step 3 — Review Historical Visual Deliverable

Open Homepage Visual Direction.

Show:

- Version 1
- Pin comments
- Agency-only note for agency role
- Revision Requested decision
- Revision classification
- Version 2 approval

### Step 4 — Show Scope Control

Open RR-002 and CR-001.

Show:

- Client request
- Potential Scope Change classification
- Scope, timeline, and cost impact
- Elena’s acceptance
- Applied schedule change

### Step 5 — Switch to Client Portal

Open as Elena.

Show:

- One clear final action
- Calm project summary
- Recent decisions
- Current Milestone
- No internal agency detail

### Step 6 — Open Final Handoff

Show:

- Production link
- Design source
- Guides
- Launch checklist
- Support window
- Acknowledgment confirmation

### Step 7 — Explain Product Outcome

Conclude with:

> StudioFlow keeps the client experience simple while preserving the decisions, versions, and scope controls the agency needs to deliver reliably.

---

## 31. Narrative Boundaries

The Demo Narrative does not add the following capabilities:

- Multiple Client Approvers
- External Reviewers
- PDF coordinate annotation
- Video review
- Payment processing
- Contract signing
- Internal task management
- Advanced analytics
- Custom workflow automation
- Notification Center
- Multiple active Milestones
- AI-generated content

Any later request to add these capabilities must return to Product Specification.

---

## 32. Narrative Decisions

| Decision                                                            | Status                |
| ------------------------------------------------------------------- | --------------------- |
| Agency Demo identity: Sableframe Studio                             | Approved Working Name |
| Client Demo identity: Kestrelon                                     | Approved Working Name |
| Fictional client category: customer-onboarding intelligence SaaS    | Approved              |
| Canonical Project state: Handoff                                    | Approved              |
| Canonical Client action: final Handoff acknowledgment               | Approved              |
| Signature review asset: Homepage Visual Direction                   | Approved              |
| Main scope-control story: Customer Stories capability               | Approved              |
| Open supporting Projects: four                                      | Approved              |
| Completed supporting Project: one                                   | Approved              |
| Supporting projects use traceable minimum Seed Data                 | Approved              |
| Main project uses full-fidelity Seed Data                           | Approved              |
| Passive page views in Project Activity                              | Rejected              |
| DEL-003-V1 and DEL-004-V1 treated as Superseded                     | Rejected              |
| DEL-003-V1 and DEL-004-V1 retained as Revision Requested history    | Approved              |
| Downloadable Demo assets may be empty placeholders                  | Rejected              |
| Reserved external-link labels route to controlled Demo destinations | Approved              |

### 32.1 Canonical Snapshot Rationale

Handoff remains the canonical snapshot because it provides:

- A clear current Client obligation
- A complete project history
- Approved Deliverables
- A resolved In-Scope Revision
- An accepted and applied Change Request
- A premium final-delivery experience

The historical Homepage Visual Direction remains the signature Review workflow and is directly accessible from the primary project.

### 32.2 Naming Decision

Sableframe Studio and Kestrelon are working Demo identities only.

They may be replaced later if portfolio branding, domain strategy, or legal review requires it.

A name change must preserve the narrative structure and must be applied consistently across files, codes, copy, and assets.

### 32.3 Minimum Real Asset Set

The visual Demo must include real sample content for:

- `kestrelon-homepage-direction-v1.webp`
- `kestrelon-homepage-direction-v2.webp`
- `kestrelon-homepage-ia-v1.pdf`
- `kestrelon-launch-readiness-v1.pdf`
- `kestrelon-component-usage-guide.pdf`
- `kestrelon-cms-editorial-guide.pdf`
- `kestrelon-launch-analytics-checklist.pdf`

Other uploaded ZIP files may use small fictional sample contents but must not be empty or broken.

---

## 33. Approval Decision

**Decision:** Approved

The Demo Narrative is approved because:

- The fictional agency and client are commercially credible.
- The primary project tells one coherent end-to-end delivery story.
- Role behavior follows the approved Permission Model.
- Project, Milestone, Deliverable, Revision, Change Request, and Handoff states align with Product Specification.
- Every published Deliverable Version includes a Review Due date.
- Every dashboard metric has traceable source data.
- Supporting projects use limited Seed Data rather than unnecessary full histories.
- Client-blocked conditions are deterministic and explainable.
- Review Decisions remain Version-specific and immutable.
- Revision Requests and Change Requests remain separate.
- Activity contains meaningful product events rather than passive page views.
- The Handoff creates a clear Client Action while preserving access to the signature Review workflow.
- No unapproved product capability has entered the narrative.
- The story can directly produce Information Architecture, Screen Inventory, Visual Direction, and Seed Data.

---

## 34. Next Document

After approval, the next product-definition stage is:

- `docs/product/05-information-architecture.md`

The Information Architecture must translate this narrative into:

- Product areas
- Navigation model
- Agency hierarchy
- Client hierarchy
- Page relationships
- Entry points
- Action paths
- Decision paths
- Cross-role information boundaries

The following document will then define the screen-level implementation surface:

- `docs/product/06-screen-inventory.md`

Information Architecture and Screen Inventory remain separate approved artifacts.
