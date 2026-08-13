# StudioFlow

# Visual Direction

## Document Information

**Document Type:** Visual Direction

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/01-product-research-dossier.md`
- `docs/product/02-business-context.md`
- `docs/product/03-product-specification.md`
- `docs/product/04-demo-narrative.md`
- `docs/product/05-information-architecture.md`
- `docs/product/06-screen-inventory.md`

**Includes:**

- Brand Architecture
- Visual Concept
- Visual Principles
- Agency and Client Differentiation
- Color System
- Agency Branding Rules
- Typography
- Spacing and Density
- Layout and Shells
- Surfaces, Borders, Radius, and Elevation
- Iconography
- Status Presentation
- Navigation
- Tables, Lists, and Cards
- Forms and Actions
- Milestone and Progress Presentation
- Comment and Review Presentation
- Decision Surfaces
- Change Request Direction
- Handoff Direction
- Empty, Loading, Error, and Read-Only States
- Responsive Visual Behavior
- Motion
- Accessibility
- Signature Screen Composition
- Demo Brand Application
- Visual QA Criteria
- Visual Direction Decisions
- Resolved Review Decisions
- Approval Decision

**Produces:**

- Design Tokens
- Signature Screen Designs
- Component Visual Requirements
- Responsive Design Requirements
- Prototype Direction
- Screenshot Direction
- Asset Requirements
- Engineering Architecture Inputs
- Visual QA Checklist

---

## 1. Executive Summary

StudioFlow should feel like a calm operating system for high-trust client delivery.

The product must communicate:

- Precision without sterility
- Professionalism without corporate heaviness
- Premium quality without decoration for its own sake
- Operational control without exposing unnecessary complexity
- Client confidence without hiding important decisions

The approved visual concept is:

> **Quiet Precision**

StudioFlow should look deliberate, composed, and structurally clear.

The interface must not rely on:

- Large decorative gradients
- Excessive glass effects
- Oversized dashboard charts
- Dense admin-template conventions
- Heavy shadows
- Saturated status colors
- Decorative illustrations
- Motion used only to appear modern
- Pill-shaped treatment for every piece of metadata

The visual hierarchy must make the product distinction immediately visible:

> Agency users see operations.
> Client users see confidence.

The Agency Workspace uses:

- Cooler neutral surfaces
- Higher information density
- Stronger structural dividers
- Compact operational rows
- Explicit health and responsibility signals
- A fixed StudioFlow product accent

The Client Portal uses:

- More white space
- Wider vertical rhythm
- Agency-first branding
- Fewer simultaneous status signals
- Larger action targets
- More narrative Project presentation
- A controlled agency accent

Both experiences share:

- Typography
- Semantic status colors
- Object identity
- Version and Decision language
- Spacing logic
- Interaction patterns
- Accessibility rules

The visual system must support 46 approved primary Screens and 26 focused interactions without creating a different design language for every Product Area.

---

## 1.1 M08 Owner Visual Freeze — Obsidian Operations

The Human Owner approved the rendered four-surface M08 prototype as the visual direction for StudioFlow. The earlier light-first interpretation is superseded.

The approved direction is **Obsidian Operations**:

- Dark-first Agency operations workspace
- Three-layer product silhouette: Product Rail → Context Navigation → Workspace
- Compact density and tool-like typography
- Data-first composition instead of card-first dashboard layouts
- Sparse violet/indigo interaction accent
- Semantic emerald, amber, blue, and risk colors only when meaning exists
- Border and tonal hierarchy before shadows
- Product-led asymmetric authentication instead of a centered generic sign-in card
- Command palette search with keyboard-first presentation
- Agency mobile bottom navigation for primary destinations instead of reducing desktop navigation to a drawer

The initial M08 prototype was intentionally limited to:

1. Agency Delivery — Desktop
2. Agency Delivery — Mobile
3. StudioFlow Command Palette
4. Access / Authentication

This direction became the **approved visual foundation** for M08 propagation. The remaining Agency, Client, and shared product surfaces must inherit its design DNA while preserving audience-specific density and presentation rules. Agency surfaces remain dense and operational; Client surfaces remain calmer, clearer, and agency-first.

The earlier Quiet Precision principles remain useful where they support restraint, hierarchy, and accessibility, but they no longer constrain the product to a light-first or low-character visual treatment.

## 1.2 M08 Final Visual Contract

The completed M08 implementation turns the owner freeze into the durable visual contract for later domain Milestones. Future Screens must extend this system rather than reintroduce the superseded light-first shell.

The active contract is:

- Agency product chrome is dark-first Obsidian Operations with a three-layer desktop silhouette: 56 px Product Rail → 216 px Context Navigation → Workspace.
- Agency mobile uses a compact top context bar plus capability-aware bottom primary navigation and a `More` sheet. The bottom navigation is a real layout row rather than a fixed overlay on page content.
- Agency navigation is projected from server capabilities. Destinations the actor cannot enter are absent from visible navigation and command actions, while direct URLs remain fail-closed at the authorization boundary.
- Client Portal uses the same Obsidian DNA at lower density, with a calmer agency-first header and top navigation on both desktop and mobile. It does not inherit the Agency bottom navigation.
- Access uses a product-led asymmetric composition and fits representative desktop/laptop viewports without document scroll when the content fits.
- Invitation and Recovery preserve the desktop split composition but collapse to a compact, action-first mobile frame with one StudioFlow brand treatment.
- Phosphor is the product-facing icon family; Radix remains an implementation detail inside existing interaction primitives where needed.
- `ops-*` tokens are the active surface, text, border, and operational-accent palette for Obsidian product shells. The earlier `neutral-*`, `studio-*`, and semantic families remain valid foundation/reference tokens and primitive compatibility tokens, but they do not imply a light product shell.

This final contract governs M09 and later Screen population unless a later owner-approved decision explicitly supersedes it and reconciles this document first.

## 2. Visual Direction Objective

This document defines how the approved product structure should look and feel.

It must answer:

1. What StudioFlow visually represents
2. How StudioFlow and agency branding coexist
3. How Agency and Client environments differ
4. Which colors are fixed
5. Which colors may be customized
6. How status is communicated
7. How typography establishes hierarchy
8. How density changes by audience
9. How Signature Screens are composed
10. How review, Decisions, and Handoff gain visual importance
11. How the design behaves on mobile
12. Which accessibility constraints are non-negotiable

This document defines visual and interaction direction. The M08 Obsidian Operations owner freeze takes precedence over earlier light-first examples in this document where the two conflict.

It does not define:

- Final component APIs
- CSS architecture
- Framework implementation
- Exact production breakpoints
- Database fields
- Animation libraries
- Icon libraries
- Final logo artwork
- Marketing-site design

---

## 3. Brand Architecture

StudioFlow contains three related identities.

### 3.1 StudioFlow Product Brand

StudioFlow is the software product.

It owns:

- Authentication
- Agency Workspace shell
- Product navigation
- System language
- Semantic status colors
- Decision and safety patterns
- Accessibility behavior
- Shared interaction design

StudioFlow should feel:

- Precise
- Trustworthy
- Modern
- Quiet
- Structured
- Product-led

StudioFlow should not feel:

- Playful
- Loud
- Experimental
- Trend-dependent
- Fintech-heavy
- Enterprise-bureaucratic

### 3.2 Agency Workspace Identity

The agency is the paying customer and Workspace owner.

Inside the Agency Workspace:

- StudioFlow remains the primary product identity.
- The agency name and logo identify the active Workspace.
- Agency branding does not recolor the entire operational interface.
- The StudioFlow accent remains the primary application accent.
- The agency accent may appear in Workspace preview and identity moments.

This protects usability and ensures that internal operational status remains stable across Workspaces.

### 3.3 Client Portal Identity

The agency becomes the dominant brand in the Client Portal.

The Client Portal header prioritizes:

- Agency logo or wordmark
- Agency name
- Project relationship
- Agency accent

StudioFlow remains the infrastructure.

Its visual presence must not compete with the agency during client delivery.

The MVP includes a small, low-emphasis `Powered by StudioFlow` attribution in the Client Portal footer.

The attribution:

- Uses text-only treatment
- Uses muted neutral color
- Does not remain sticky
- Does not appear in the main header
- Does not compete with Project actions or agency identity
- Cannot be removed through MVP branding settings

Future advanced white-labeling may make attribution configurable, but no packaging or tier behavior is introduced in the MVP.

### 3.4 Client Organization Identity

The client organization is Project context, not a third visual theme.

Client logos may appear in:

- Project identity
- Organization detail
- Deliverable content
- Handoff assets

Client colors must not become application colors.

---

## 4. Core Visual Concept — Quiet Precision

Quiet Precision is built from five qualities.

### 4.1 Calm Structure

The interface should feel organized before the user reads it.

Structure comes from:

- Alignment
- Spacing
- Typography
- Borders
- Grouping
- Consistent placement

It should not depend on excessive boxes or background colors.

### 4.2 Controlled Contrast

Contrast should identify:

- The current action
- The current Version
- The current Milestone
- A binding Decision
- A blocking condition
- A destructive action

Everything else should remain visually quieter.

### 4.3 Editorial Hierarchy

Important Screens should read like structured documents rather than collections of widgets.

This is especially important for:

- Project Overview
- Revision Request
- Change Request
- Handoff
- Decision history

Titles, summaries, evidence, impact, and actions should appear in a clear reading order.

### 4.4 Operational Honesty

The visual system must not make incomplete or risky work appear healthy.

Examples:

- Waiting on Client must name the obligation.
- At Risk must show the reason.
- Historical Versions must look historical.
- Accepted and Applied must remain distinct.
- Client Contributors must not appear to hold Decision authority.
- Unavailable external content must not be shown as approved and intact.

### 4.5 Premium Restraint

Premium quality should come from:

- Excellent typography
- High-quality spacing
- Strong empty states
- Consistent alignment
- Clear interaction feedback
- Carefully designed responsive behavior

Premium quality should not come from:

- Large gradients
- Metallic effects
- Excessive blur
- Decorative 3D objects
- Unnecessary animation
- Oversized branding

---

## 5. Visual Principles

### 5.1 One Screen, One Dominant Purpose

Every Screen should have one clear visual center.

Examples:

- Delivery Overview → operational attention
- Client Action Center → next client action
- Image Review → current asset and discussion
- Change Request → business impact and Decision
- Handoff → final package and acknowledgment

### 5.2 Border Before Shadow

Use borders and surface contrast before elevation.

Shadows are reserved for:

- Floating overlays
- Drawers
- Decision dialogs
- Menus
- Selected review pins
- Sticky mobile action regions when separation is needed

### 5.3 Color Supports Hierarchy

Color should confirm meaning already expressed through:

- Text
- Icons
- Labels
- Placement
- Shape

Color must not carry status alone.

### 5.4 Cards Are Not the Default Container

Use cards only when content has:

- A distinct action
- A distinct state
- A meaningful boundary
- A summary that links to deeper detail

Do not place every section inside an independent floating card.

### 5.5 Data Before Decoration

Operational Screens should prioritize:

- Responsible person
- Due date
- Project health
- Current state
- Required action

Decorative content must never push these below the first viewport without reason.

### 5.6 Historical Content Is Quiet, Not Hidden

Historical Versions, resolved Comments, completed Milestones, and past Decisions should use:

- Reduced contrast
- Neutral surfaces
- Clear historical labels
- Read-only treatment

They should remain fully legible.

### 5.7 Client Language Is Visually Primary

The Client Portal should prioritize client-readable phrases.

Examples:

- `Your action is required`
- `Review final Handoff`
- `Approved`
- `Revision requested`
- `Due Friday`

Internal product terminology should not dominate client-facing visual hierarchy.

---

## 6. Agency and Client Experience Differentiation

## 6.1 Shared Foundation

Both experiences share:

- Base neutral palette
- Type family
- Spacing scale
- Semantic colors
- Form behavior
- Focus treatment
- Decision confirmation patterns
- File and Version identity patterns

### 6.2 Agency Workspace

The Agency Workspace should feel:

- Operational
- Compact
- Cool
- Precise
- Tool-like
- Fast to scan

Visual characteristics:

- Deep graphite operational canvas
- Three-layer persistent desktop navigation
- Compact page headers
- Smaller card radius
- Denser list rows
- More visible metadata
- More simultaneous status signals
- Stronger dividers
- StudioFlow accent

### 6.3 Client Portal

The Client Portal should feel:

- Calm
- Welcoming
- Directed
- Trustworthy
- Branded
- Less technical

Visual characteristics:

- Deep graphite client canvas derived from Obsidian Operations rather than the denser Agency chrome
- Agency-branded header with a controlled agency accent
- Narrower content width and calmer section rhythm
- Larger vertical spacing and action targets than the Agency Workspace
- Fewer badges and less operational metadata
- More explanatory client-safe copy
- Larger section headings without marketing-scale typography
- Agency accent reserved for navigation, identity, focus, and client-facing actions
- No persistent bottom navigation; Home and Projects remain in the compact top navigation

### 6.4 Differentiation Boundary

The Client Portal must not become decorative or marketing-like.

It remains a working product.

The difference is not:

- Agency = functional
- Client = ornamental

The difference is:

- Agency = operational density
- Client = guided clarity

---

## 7. Color Architecture

The color system has four layers:

1. Foundation neutrals
2. StudioFlow product accent
3. Agency accent
4. Fixed semantic colors

### 7.1 Active Obsidian Operations Surface Tokens

These tokens define the active product-shell palette established and validated in M08:

| Token                  | Value                  | Primary Use                                      |
| ---------------------- | ---------------------- | ------------------------------------------------ |
| `ops-black`            | `#080A0E`              | Product rail and deepest product boundary        |
| `ops-sidebar`          | `#0D1016`              | Agency context navigation                        |
| `ops-canvas`           | `#0F1219`              | Primary product canvas                           |
| `ops-surface`          | `#131720`              | Structured surface                               |
| `ops-raised`           | `#171C26`              | Raised or emphasized surface                     |
| `ops-interactive`      | `#1B202C`              | Interactive neutral surface                      |
| `ops-hover`            | `#202632`              | Hover/selected neutral surface                   |
| `ops-text`             | `#F4F6FA`              | Primary text on Obsidian surfaces                |
| `ops-text-secondary`   | `#9AA3B2`              | Secondary text                                   |
| `ops-text-tertiary`    | `#7C8594`              | Tertiary metadata                                |
| `ops-violet`           | `#6C5CE7`              | StudioFlow operational accent and active control |
| `ops-emerald`          | `#3FB98E`              | Positive/healthy operational signal              |
| `ops-amber`            | `#E5A93D`              | Attention operational signal                     |
| `ops-risk`             | `#E46E68`              | Risk/negative operational signal                 |
| `ops-blue`             | `#5E9DF5`              | Informational operational signal                 |

Obsidian borders use restrained translucent white values rather than bright solid lines. Tonal hierarchy and borders remain preferred over heavy elevation.

### 7.2 Foundation Neutral Reference Tokens

The base neutral scale remains part of the shared token system for primitives, inverse/light contexts, review-canvas controls, and compatibility. It is **not** the default shell palette after the M08 owner freeze.

| Token         | Value     | Reference Use                        |
| ------------- | --------- | ------------------------------------ |
| `neutral-0`   | `#FFFFFF` | Light/inverse surfaces               |
| `neutral-25`  | `#F9FAFC` | Light contextual surface             |
| `neutral-50`  | `#F3F5F9` | Light contextual canvas              |
| `neutral-100` | `#ECEFF5` | Subtle grouped region                |
| `neutral-150` | `#E3E7EF` | Hovered light neutral surface        |
| `neutral-200` | `#D7DDE7` | Standard light border                |
| `neutral-300` | `#BEC7D5` | Strong light border                  |
| `neutral-400` | `#8D98AA` | Disabled icons and secondary markers |
| `neutral-500` | `#697487` | Muted text on light surfaces         |
| `neutral-600` | `#4F596A` | Secondary text on light surfaces     |
| `neutral-700` | `#374151` | Strong secondary text                |
| `neutral-800` | `#242B3A` | Primary supporting text              |
| `neutral-900` | `#171C2A` | Primary text on light surfaces       |
| `neutral-950` | `#0E1320` | Review canvas / deep inverse surface |

### 7.3 Text Tokens

| Token            | Value         |
| ---------------- | ------------- |
| `text-primary`   | `neutral-900` |
| `text-secondary` | `neutral-600` |
| `text-muted`     | `neutral-500` |
| `text-disabled`  | `neutral-400` |
| `text-inverse`   | `neutral-0`   |
| `text-link`      | `studio-600`  |
| `text-danger`    | `danger-700`  |

### 7.4 Border Tokens

| Token            | Value         |
| ---------------- | ------------- |
| `border-subtle`  | `neutral-150` |
| `border-default` | `neutral-200` |
| `border-strong`  | `neutral-300` |
| `border-focus`   | `studio-500`  |
| `border-danger`  | `danger-500`  |

---

## 8. StudioFlow Product Accent

StudioFlow retains the deep indigo `studio-*` family as a shared foundation accent. On active Obsidian product chrome, `ops-violet` is the approved visible StudioFlow operational accent. Future Screens should not mix the two families arbitrarily; use the Obsidian token when extending the M08 shell language and the base StudioFlow family where an existing primitive or light/inverse context explicitly requires it.

| Token        | Value     | Use                         |
| ------------ | --------- | --------------------------- |
| `studio-50`  | `#F1F1FF` | Soft selected backgrounds   |
| `studio-100` | `#E2E3FF` | Highlight borders           |
| `studio-200` | `#C7CAFF` | Selected borders            |
| `studio-400` | `#8588FF` | Secondary visual accents    |
| `studio-500` | `#6768EE` | Focus and active controls   |
| `studio-600` | `#4F46C9` | Primary Agency action       |
| `studio-700` | `#4038AD` | Hover                       |
| `studio-800` | `#322C88` | Pressed and accessible text |
| `studio-900` | `#24205F` | Strong product identity     |

### 8.1 Accent Usage

Use the StudioFlow accent for:

- Agency primary buttons
- Active Agency navigation
- Selected filters
- Focus states
- Current operational selection
- Links in Agency surfaces
- Product identity

Do not use it for:

- Success
- Error
- Overdue
- At Risk
- Waiting on Client
- Revision Requested
- Destructive actions

### 8.2 Gradient Rule

Application UI may use a restrained StudioFlow-to-agency tonal transition for brand framing only, such as a thin shell edge, auth surface accent, or search-dialog identity line.

Gradients must not carry status meaning, reduce contrast, become a large decorative background, or compete with product content. Primary actions and state semantics remain flat, accessible colors.

---

## 9. Agency Accent System

### 9.1 Customization Scope

An agency configures one primary accent color.

The selected color may control:

- Client Portal primary button
- Active Client navigation
- Project progress emphasis
- Selected client-facing tabs
- Links
- Small identity details
- Client Portal preview

It may not control:

- Error
- Warning
- Success
- Overdue
- Revision state
- Change Request state
- Internal Agency Workspace navigation
- Focus visibility when contrast would fail

### 9.2 Canonical Demo Agency Accent

Sableframe Studio uses:

| Token               | Value     |
| ------------------- | --------- |
| `agency-accent-50`  | `#EDF8F4` |
| `agency-accent-100` | `#D5EFE7` |
| `agency-accent-300` | `#82C9B6` |
| `agency-accent-500` | `#2F8C74` |
| `agency-accent-600` | `#176A5B` |
| `agency-accent-700` | `#125548` |
| `agency-accent-800` | `#0D4339` |

Canonical primary Client Portal action:

- Background: `agency-accent-600`
- Hover: `agency-accent-700`
- Text: white

Deep evergreen is the final canonical Sableframe accent.

It is intentionally distinct from the StudioFlow indigo while preserving the calm, editorial, and high-trust character required by the Demo.

`agency-accent-600` against white exceeds the required contrast target for primary button text.

### 9.3 Accessible Accent Derivation

The product must validate the selected agency color.

If the selected color is too light or insufficiently contrasted:

- Preserve it for limited decorative identity use.
- Derive a darker accessible action color.
- Show the adjusted result in Client Portal preview.
- Prevent inaccessible text and button combinations.

The product must not allow branding to reduce:

- Text contrast
- Focus visibility
- Button recognition
- Status meaning

### 9.4 Agency Logo Use

The Client Portal should support:

- Horizontal wordmark
- Compact symbol
- Text fallback using agency name

Recommended header logo height:

- Desktop: 28–32 px
- Mobile: 24–28 px

The logo must not dominate the Project title or current action.

---

## 10. Semantic Color System

Semantic colors remain fixed across all Workspaces.

## 10.1 Informational

| Token      | Value     |
| ---------- | --------- |
| `info-50`  | `#EFF6FF` |
| `info-200` | `#BFDBFE` |
| `info-600` | `#2563EB` |
| `info-700` | `#1D4ED8` |

Use for:

- Awaiting Decision
- Informational notices
- Current selection when not brand-specific
- Waiting on Client health

## 10.2 Success

| Token         | Value     |
| ------------- | --------- |
| `success-50`  | `#ECFDF3` |
| `success-200` | `#ABEFC6` |
| `success-600` | `#16803A` |
| `success-700` | `#087A33` |

Use for:

- Approved
- Completed
- Accepted
- Acknowledged
- On Track

## 10.3 Warning

| Token         | Value     |
| ------------- | --------- |
| `warning-50`  | `#FFF7E8` |
| `warning-200` | `#FEDF89` |
| `warning-600` | `#B54708` |
| `warning-700` | `#93370D` |

Use for:

- At Risk
- Due soon
- Reopened
- Clarification required
- Unresolved warning

## 10.4 Danger

| Token        | Value     |
| ------------ | --------- |
| `danger-50`  | `#FEF3F2` |
| `danger-200` | `#FECDCA` |
| `danger-600` | `#D92D20` |
| `danger-700` | `#B42318` |

Use for:

- Overdue
- Failed
- Access revoked
- Destructive confirmation
- Rejected when rejection requires strong attention

## 10.5 Revision / Scope

| Token          | Value     |
| -------------- | --------- |
| `revision-50`  | `#F4F3FF` |
| `revision-200` | `#D9D6FE` |
| `revision-600` | `#7A5AF8` |
| `revision-700` | `#6941C6` |

Use for:

- Revision Requested
- Revision In Progress
- Potential Scope Change
- Linked review-to-scope context

Purple must not become a general decorative accent.

---

## 11. Status Presentation

### 11.1 Status Anatomy

A status indicator may include:

- Icon or dot
- Human-readable label
- Optional supporting reason
- Optional due date
- Optional action

Status must never be represented only by color.

### 11.2 Status Badge Rules

Badges should be compact and restrained.

Recommended badge structure:

- Height: 24–28 px
- Horizontal padding: 8–10 px
- Radius: 6–8 px
- Text size: 12–13 px
- Weight: 600
- Optional icon: 12–14 px

Avoid:

- Large pill badges
- Fully saturated backgrounds
- Multiple badges on every row
- Uppercase status text

### 11.3 Status Hierarchy

Use a badge for the state.

Use a separate sentence for the reason.

Example:

```text
Waiting on client

Final Handoff acknowledgment is due Friday.
```

Do not compress both meaning and reason into a single badge.

---

## 12. Project Lifecycle Visual Mapping

| Lifecycle  | Visual Treatment                                        | Notes                                     |
| ---------- | ------------------------------------------------------- | ----------------------------------------- |
| Draft      | Neutral outline                                         | Agency-only and incomplete                |
| Onboarding | Studio soft accent                                      | Client input phase                        |
| Active     | Studio solid or neutral-strong                          | Main delivery phase                       |
| Handoff    | Agency accent in Client Portal; Studio accent in Agency | Final delivery phase                      |
| Completed  | Success outline / muted surface                         | Read-only                                 |
| Cancelled  | Neutral-danger outline                                  | Read-only without implying system failure |
| Archived   | Muted neutral                                           | Agency administrative state               |

Lifecycle color must remain subordinate to Project Health and current action.

---

## 13. Project Health Visual Mapping

| Health            | Color   | Icon Direction             | Presentation              |
| ----------------- | ------- | -------------------------- | ------------------------- |
| On Track          | Success | Check or steady path       | Positive but quiet        |
| Waiting on Client | Info    | Clock or user-action arrow | Dependency, not blame     |
| At Risk           | Warning | Alert triangle             | Agency attention required |
| Overdue           | Danger  | Clock-alert                | Highest urgency           |
| No Schedule       | Neutral | Calendar-off               | Missing planning context  |

### 13.1 Waiting on Client Language

Agency-facing:

> Waiting on client

Client-facing:

> Your action is required

Do not show accusatory language such as:

- Client is blocking
- Waiting on you
- Client delay

The operational truth remains visible without damaging the relationship.

---

## 14. Object State Mapping

### 14.1 Client Action

| State     | Treatment              |
| --------- | ---------------------- |
| Draft     | Neutral outline        |
| Open      | Info or neutral-strong |
| Overdue   | Danger                 |
| Completed | Success                |
| Reopened  | Warning                |
| Cancelled | Muted neutral          |

### 14.2 Deliverable

| State                | Treatment                        |
| -------------------- | -------------------------------- |
| Draft                | Neutral                          |
| Awaiting Decision    | Info                             |
| Revision Requested   | Revision                         |
| Revision In Progress | Revision with progress indicator |
| Approved             | Success                          |
| Reopened             | Warning or revision context      |

### 14.3 Change Request

| State     | Treatment                  |
| --------- | -------------------------- |
| Draft     | Neutral                    |
| Sent      | Info                       |
| Accepted  | Success                    |
| Rejected  | Danger outline             |
| Applied   | Success with applied label |
| Withdrawn | Muted neutral              |
| Closed    | Neutral historical         |

`Accepted` and `Applied` must be visually distinct.

Suggested display:

```text
Accepted by Elena Rossi
Applied to Project schedule
```

### 14.4 Handoff

| State                              | Treatment                |
| ---------------------------------- | ------------------------ |
| Not started                        | Neutral empty            |
| Draft                              | Neutral                  |
| Ready to publish                   | Studio accent            |
| Published — acknowledgment pending | Info                     |
| Acknowledged                       | Success                  |
| Completed                          | Success-muted historical |

---

## 15. Typography

### 15.1 Primary Typeface

The approved primary type family is:

> **Inter Variable**

Inter is selected because it supports:

- Dense operational interfaces
- Clear lowercase forms
- Strong tabular numerals
- Long-form client-facing text
- Broad browser and operating-system consistency
- A wide variable-weight range
- Reliable rendering in the target Fedora development environment

The implementation should use a resilient sans-serif fallback stack, but no visually competing alternate type family is part of the approved direction.

### 15.2 Typeface Rule

The MVP should not introduce a second display typeface.

Premium quality should come from hierarchy and spacing rather than a decorative serif pairing.

### 15.3 Type Scale

| Token        | Size / Line Height | Weight        | Use                                           |
| ------------ | ------------------ | ------------- | --------------------------------------------- |
| `display-lg` | 40 / 48            | 650           | Rare Client milestone or completion statement |
| `heading-xl` | 32 / 40            | 650           | Major page title                              |
| `heading-lg` | 24 / 32            | 650           | Section and important card title              |
| `heading-md` | 20 / 28            | 600           | Screen subsection                             |
| `heading-sm` | 18 / 26            | 600           | Card and panel title                          |
| `body-lg`    | 16 / 24            | 400–500       | Client explanatory copy                       |
| `body-md`    | 14 / 20            | 400–500       | Standard application body                     |
| `body-sm`    | 13 / 18            | 400–500       | Secondary metadata                            |
| `label-md`   | 14 / 20            | 600           | Buttons, tabs, field labels                   |
| `label-sm`   | 12 / 16            | 600           | Status and compact controls                   |
| `code-sm`    | 12 / 18            | 500 monospace | IDs or technical file metadata only           |

### 15.4 Heading Tracking

Recommended:

- 32 px and above: `-0.025em`
- 20–24 px: `-0.015em`
- Body and labels: normal tracking
- Uppercase labels: generally avoided

### 15.5 Numerals

Use tabular numerals for:

- Dates in tables
- Durations
- Currency
- Dashboard counts
- Version numbers
- Due-date columns

### 15.6 Copy Width

Client-facing narrative copy should generally remain within:

- 55–75 characters per line

Long Change Request, Handoff, and Revision content should use a readable document column.

---

## 16. Spacing System

Use a 4 px base grid.

| Token      | Value |
| ---------- | ----: |
| `space-1`  |  4 px |
| `space-2`  |  8 px |
| `space-3`  | 12 px |
| `space-4`  | 16 px |
| `space-5`  | 20 px |
| `space-6`  | 24 px |
| `space-8`  | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |
| `space-20` | 80 px |

### 16.1 Agency Rhythm

Typical Agency spacing:

- Page section gap: 24–32 px
- Card padding: 16–20 px
- Table cell horizontal padding: 12–16 px
- Form group gap: 16 px
- Page header to content: 24 px

### 16.2 Client Rhythm

Typical Client spacing:

- Page section gap: 32–48 px
- Card padding: 20–32 px
- Action-card padding: 24–32 px
- Project header to content: 32 px
- Narrative section gap: 32 px

### 16.3 Spacing Rule

Do not use spacing as decoration.

Larger spacing must reflect:

- A new information section
- A new Decision stage
- A change in responsibility
- A shift from summary to evidence

---

## 17. Density

### 17.1 Agency Density

Agency Workspace uses comfortable operational density.

Reference dimensions:

- Standard control height: 40 px
- Compact control height: 36 px
- Table row: 48–52 px
- Dense metadata row: minimum 44 px
- List card: 56–72 px depending on content

### 17.2 Client Density

Client Portal uses more relaxed density.

Reference dimensions:

- Standard control height: 44 px
- Mobile primary control: 48 px
- Client attention card: minimum 104 px
- Project list item: 72–88 px
- Decision action area: minimum 64 px

### 17.3 Touch Targets

All interactive targets must be at least:

- 44 × 44 px

Visual icons may be smaller, but the hit area may not be.

---

## 18. Radius System

| Token         |  Value | Use                                    |
| ------------- | -----: | -------------------------------------- |
| `radius-sm`   |   6 px | Badges, compact controls               |
| `radius-md`   |  10 px | Inputs, Agency cards, menus            |
| `radius-lg`   |  14 px | Client cards, dialogs                  |
| `radius-xl`   |  18 px | Dominant Client attention card         |
| `radius-full` | 999 px | Avatars, dots, rare segmented controls |

### 18.1 Radius Rule

Do not use fully rounded pills for:

- Standard buttons
- All cards
- Tables
- Large document surfaces

Rounded corners should communicate friendliness, not novelty.

---

## 19. Borders and Elevation

### 19.1 Border System

Use:

- 1 px subtle borders for grouping
- 1 px strong borders for selected or historical boundaries
- 2 px borders only for focus, selected review items, or important current context

### 19.2 Elevation Levels

#### Level 0

No shadow.

Use for:

- Most cards
- Tables
- Sections
- Project headers

#### Level 1

Very soft elevation.

Use for:

- Sticky client action card
- Selected floating panel
- Mobile bottom action region

#### Level 2

Clear floating elevation.

Use for:

- Menus
- Command search
- Drawers
- Bottom sheets

#### Level 3

Focused overlay elevation.

Use for:

- Binding Decision dialogs
- Destructive confirmation

### 19.3 Reference Shadows

Visual reference only:

```text
Level 1: 0 1px 2px rgba(16, 24, 40, 0.06)
Level 2: 0 8px 24px rgba(16, 24, 40, 0.10)
Level 3: 0 16px 40px rgba(16, 24, 40, 0.16)
```

Engineering may tune implementation while preserving restraint.

---

## 20. Surface System

### 20.1 Agency Surfaces

- Canvas: `neutral-50`
- Main surface: `neutral-0`
- Subtle group: `neutral-100`
- Selected surface: `studio-50`
- Review canvas: `neutral-950`

### 20.2 Client Surfaces

- Canvas: `neutral-25`
- Main content surface: `neutral-0`
- Agency-accent soft surface: derived `agency-accent-50`
- Historical surface: `neutral-50`
- Decision summary surface: white with strong border

### 20.3 Document Surface

Change Requests, Revision Requests, and Handoff should use a document-like content surface:

- White background
- Clear reading column
- Strong top summary
- Impact or item sections
- Fixed action region when required

The surface should feel formal without resembling a legal contract editor.

---

## 21. Iconography

### 21.1 Product Icon Family

Phosphor is the approved product-facing icon family for Obsidian Operations. Radix may remain inside existing interaction primitives where replacing it provides no visible product value, but navigation, search, authentication actions, and other visible product chrome should use Phosphor.

Use:

- Regular weight for default controls and navigation
- Bold weight for the selected primary navigation destination
- Clear shapes with limited internal detail
- Semantic icons only when they improve scanning or clarify an action
- The product-owned StudioFlow Flow Mark for brand identity; do not substitute a library icon for the product mark

### 21.2 Sizes

- Inline metadata: 14–16 px
- Desktop navigation and toolbar: 16 px
- Command Palette: 16 px
- Mobile primary navigation: 20–22 px
- Empty state: 24–28 px only when a meaningful symbol is useful
- Do not use oversized decorative icons

### 21.3 Status Icons

Suggested semantic directions:

- Approved / Completed → check
- Waiting → clock
- At Risk → alert triangle
- Overdue → clock alert
- Revision → rotate or edit path
- Change Request → split path or document change
- Handoff → package or transfer
- Historical → history
- Internal note → lock
- Shared Comment → message

### 21.4 Icon Rule

Do not create a custom icon for every object if an established concept exists.

Icons support labels and never replace them in important Decisions.

---

## 22. Avatar and Identity Presentation

### 22.1 Avatar Sizes

- Compact list: 24 px
- Standard row: 32 px
- Comment author: 32–36 px
- Person detail: 40–48 px

### 22.2 Fallback

Fallback avatars use:

- Initials
- Stable neutral or low-saturation background
- High-contrast text

Avoid assigning bright random colors to every user.

### 22.3 Authority Marker

Client Approver authority should be shown with:

- Role label
- Small authority icon when needed
- Clear copy

Do not use a crown or gamified treatment.

---

## 23. Navigation Direction

## 23.1 Agency Desktop Shell

The approved M08 composition is a three-layer product silhouette:

1. **Product Rail — 56 px**
   - StudioFlow Flow Mark / product entry
   - Sparse product-level utilities
   - Role-safe landing destination
2. **Context Navigation — approximately 216 px**
   - Workspace identity
   - Capability-projected global destinations
   - Search entry
   - Account/settings utilities when authorized
3. **Workspace**
   - 48 px context bar where applicable
   - Page header, operational collections, and Project-local navigation

Delivery, Projects, and Clients are conceptual Agency destinations, but only authorized destinations are rendered. Agency Members therefore receive Projects as their primary global destination and product landing; hidden links do not weaken direct-route authorization.

The rail and context navigation use tonal graphite separation, restrained borders, and selected-state backgrounds rather than a fully colored sidebar. Do not collapse the product back into the earlier single light sidebar model.

## 23.2 Agency Mobile Shell

The approved mobile shell uses:

- Compact top context bar
- Main content as the only scrolling middle row
- Capability-aware bottom primary navigation
- A `More` sheet for secondary utilities and account access
- Device safe-area handling owned by the shell
- Project context preserved in the top bar and Project-local switcher

The shell is a true three-row layout (`top bar → scrolling content → bottom navigation`), not a fixed bottom overlay with page-specific clearance padding.

Primary mobile destinations are projected from the same server capabilities as desktop navigation. An Agency Member therefore sees Projects plus `More`, not disabled links to Delivery or Clients. Direct unauthorized URLs remain protected by server policy.

Do not attempt to reproduce a miniature desktop sidebar.

## 23.3 Client Desktop Header

Use:

- Agency wordmark
- Home
- Projects
- User menu
- Optional Project context after entry

The header should be calm and low-height.

Reference height:

- 64–72 px

## 23.4 Client Mobile Navigation

The approved direction uses top navigation.

Mobile structure:

- Compact agency-branded top header
- `Home` and `Projects` presented directly beneath or within the header
- Project-local tabs below the Project identity when inside a Project
- User and account actions placed in a compact utility menu

Persistent bottom navigation is not used.

This avoids conflict with:

- Sticky Review Decision bars
- Handoff acknowledgment actions
- Full-screen sheets
- Mobile browser safe areas

Because the Client Portal has only two global destinations, both remain clearly reachable without reserving permanent bottom-screen space.

## 23.5 Project-Local Navigation

Agency:

- Use horizontal tabs below the Project header on desktop
- Keep the six approved sections in their approved order
- Allow horizontal scrolling without wrapping on constrained tablet widths
- Use a compact Project-section switcher on mobile
- Collapse the full tab row inside the Image Review Workspace and preserve context through breadcrumb, back action, and section menu

A secondary rail is rejected because it would create a third persistent navigation layer beside the global Agency sidebar and the main content.

Client:

- Overview
- Deliverables
- Activity
- Use horizontal tabs on desktop and mobile
- Keep the three items visible without an overflow menu when space allows

---

## 24. Buttons and Action Hierarchy

### 24.1 Button Types

#### Primary

Use for one dominant action.

Agency:

- StudioFlow accent

Client:

- Agency accent

#### Secondary

White or subtle surface with border.

Use for:

- Supporting action
- Preview
- Back
- Open related object

#### Tertiary

Text or low-emphasis button.

Use for:

- Filters
- Minor navigation
- Low-risk utilities

#### Destructive

Danger color.

Use only when the immediate action is destructive.

### 24.2 Button Rules

- One primary button per action region
- Do not show two filled buttons side by side unless a binding binary Decision requires it
- Accept and Reject should not have equal visual positivity
- Reject may be secondary-danger unless immediate urgency requires stronger treatment
- Cancel remains neutral

### 24.3 Decision Pairing

For Change Request:

- `Accept change` → primary
- `Reject` → secondary-danger

For Deliverable review:

- `Approve version` → primary
- `Request revision` → secondary with revision color cue

This does not imply that revision is destructive.

---

## 25. Forms

### 25.1 Field Structure

Each field includes:

- Visible label
- Input
- Optional helper text
- Inline validation
- Error text when needed

Placeholder text must not replace the label.

### 25.2 Input Styling

- White surface
- Default border
- 10 px radius
- Visible focus ring
- Minimum 40 px Agency height
- Minimum 44 px Client/mobile height

### 25.3 Long-Form Inputs

Change Request, Revision classification, and Handoff documentation require:

- Comfortable text area
- Character or content guidance when relevant
- Preview of client-facing presentation
- Clear separation of client-visible and agency-only content

### 25.4 Internal / Client-Visible Boundary

When both fields appear together:

- Client-visible field uses standard white surface
- Agency-only field uses subtle neutral surface
- Lock icon and explicit label
- Never rely on color alone

Example:

```text
Client-visible note

Agency-only note  🔒
```

---

## 26. Tables, Lists, and Cards

### 26.1 Operational Tables

Use tables for:

- Projects
- Client Actions
- Deliverables
- Change Requests
- Members

Tables should support:

- Strong row scanning
- Sticky headers when helpful
- Clear selected row
- Responsive reduction
- Status and due-date alignment

Avoid:

- Vertical grid lines
- Excessive cell borders
- More than two status badges per row

### 26.2 Responsive Tables

On smaller widths:

- Preserve object title
- Preserve status
- Preserve due date
- Preserve responsible person
- Move secondary metadata into expandable detail or secondary line

Do not simply shrink every column.

### 26.3 Attention Cards

Attention cards must include:

- Object or Project identity
- Why attention is required
- Due date
- Responsible person
- Primary action

Agency attention cards are compact.

Client attention cards are larger and more explanatory.

### 26.4 Summary Cards

Summary counts should not resemble financial KPI dashboards.

Use:

- Large number
- Short label
- Optional small context line
- No decorative chart unless it answers an actual question

---

## 27. Milestone and Progress Direction

### 27.1 Milestone Timeline

Use a structured stepper or timeline.

Each Milestone includes:

- Order
- Title
- Lifecycle
- Date range
- Completion context

Visual states:

- Completed → filled success marker
- Active → strong outlined or accent marker
- Planned → neutral marker
- Cancelled → muted marker

### 27.2 Progress Rule

Use Milestone completion.

Do not invent arbitrary Project percentages.

The Demo may show:

> 4 of 5 milestones completed

A progress bar may accompany the count, but the count remains visible.

### 27.3 Client Timeline

Client Portal timeline should prioritize:

- Completed
- Current
- Next

Detailed operational completion conditions remain hidden unless needed.

---

## 28. Comment System Direction

### 28.1 Shared Comment

Shared Comments use:

- Standard white thread surface
- Author identity
- Time
- Thread replies
- Open or Resolved state
- Pin number when applicable

### 28.2 Agency-Only Note

Agency-only notes use:

- Subtle neutral-tinted surface
- Lock icon
- `Agency only` label
- Same typography as shared Comments
- No alarming color

Internal notes should feel private, not dangerous.

### 28.3 Resolved Comment

Resolved Comments remain readable.

Use:

- Reduced contrast
- Resolved label
- Collapsed replies when appropriate
- Reopen control only when authorized

Do not strike through the body text.

### 28.4 Pin Markers

Pin markers should be:

- Numbered
- High contrast against light and dark assets
- Keyboard reachable
- Clearly selected
- Large enough for touch

Recommended states:

- Default
- Hover / focus
- Selected
- Resolved
- Historical read-only

---

## 29. Image Review Workspace

The Image Review Workspace is a Signature product surface.

## 29.1 Desktop and Tablet Structure

Use three stable regions:

1. Version and status context
2. Image canvas
3. Persistent Comment panel

Recommended arrangement:

```text
Version / Status / Review Context
────────────────────────────────────────────
Image Canvas                     Comment Panel
                                 360–400 px
```

The canvas should receive most horizontal space.

### 29.2 Review Canvas

Use a dark neutral canvas by default:

- Background: `neutral-950`
- Asset frame: white or transparent according to asset
- Subtle checker or edge treatment only when transparency requires it
- Zoom controls remain visible but quiet

The canvas includes an explicit background control:

- Dark — default
- Light — `neutral-100`
- Transparency checker — only when the asset requires it

The canvas does not change automatically based on image analysis.

Manual control is preferred because it:

- Produces predictable Review behavior
- Prevents sudden contrast changes
- Keeps screenshots consistent
- Lets users inspect very dark assets against a light surface
- Avoids adding fragile asset-detection logic

Pin markers must retain a dual-contrast outline so they remain visible on both light and dark image regions.

The dark canvas is a workspace treatment.

It does not introduce product dark mode.

### 29.3 Version Context

The context region must show:

- Deliverable title
- Version number
- Current or historical state
- Review due date
- Decision state
- Version switcher

Historical Versions use a visible neutral banner:

> You are viewing a historical version.

### 29.4 Comment Panel

Panel structure:

- Panel title and open count
- Shared / Agency-only control for agency roles
- Pin list
- Active thread
- General Comments
- Composer
- Resolved filter when useful

### 29.5 Client Approver Decision Zone

For current Versions Awaiting Decision:

- Decision controls remain visible
- They must not cover the asset
- The Version identity remains visible
- Unresolved Comment warning appears before confirmation

### 29.6 Mobile Modes

Use:

- Canvas
- Comments
- Details

Do not preserve a compressed split layout.

Canvas mode:

- Full-width asset
- Zoom and pin controls
- Compact Version state
- Sticky mode switcher

Selecting a pin:

- Opens the thread in a full-height bottom sheet
- Preserves zoom
- Preserves selected pin
- Returns to the same canvas position

Client Approver:

- Sticky bottom action bar on current Version
- `Approve`
- `Request revision`

Historical Version:

- Decision bar removed
- Read-only banner shown

---

## 30. File and External-Link Review Direction

### 30.1 File Review

Show:

- File name
- Type
- Size
- Version
- Publication time
- Review due date
- Download
- General Comments
- Decision history

The file card should feel like a controlled review object, not a generic attachment chip.

### 30.2 External Link Review

Show:

- Controlled preview or destination
- Link label
- Version label
- Publication event
- Availability state
- General Comments
- Formal Decision inside StudioFlow

When unavailable:

- Preserve historical Decision
- Preserve Comments
- State that the external resource cannot currently be reached
- Do not imply that approved content changed or remained intact

---

## 31. Binding Decision Surfaces

Binding Decisions require stronger visual ceremony than ordinary form submission.

### 31.1 Decision Surface Structure

1. Decision title
2. Exact object and Version
3. Consequence
4. Relevant warning
5. Acting authority
6. Primary Decision
7. Cancel or secondary Decision

### 31.2 Visual Treatment

Use:

- White focused surface
- Strong border or Level 3 elevation
- Clear object summary
- No decorative celebration
- No ambiguous icon-only controls

### 31.3 Approve Version

Must show:

- Deliverable
- Version
- Unresolved shared Comment count
- Immutable history statement

### 31.4 Request Revision

Must show:

- Deliverable
- Version
- Required summary field
- Statement that the agency will classify scope impact

### 31.5 Change Request Decision

Must show:

- Scope impact
- Timeline impact
- Cost impact
- Deadline
- No-payment clarification

### 31.6 Handoff Acknowledgment

Must show:

- Required Items
- Receipt statement
- No-legal-signature clarification
- Project completion consequence

---

## 32. Revision Request Visual Direction

Revision Request Detail should feel like a structured review analysis.

Recommended hierarchy:

1. Source Version and client summary
2. Related Comments
3. Classification state
4. Client-visible response
5. Agency-only reasoning
6. Linked next action

### 32.1 Classification Choices

Present as clear selectable options:

- In Scope
- Needs Clarification
- Potential Scope Change

Each option includes:

- Short description
- Workflow consequence
- Appropriate semantic cue

Avoid a simple unlabeled dropdown for this high-impact choice.

### 32.2 Scope Protection Tone

The visual language should remain calm.

Potential Scope Change should use revision purple and document structure.

It should not resemble an error or conflict alert.

---

## 33. Change Request Visual Direction

Change Request should feel like a concise business proposal.

### 33.1 Page Hierarchy

1. Decision state
2. Change title
3. Reason
4. Scope impact
5. Timeline impact
6. Cost impact
7. Decision deadline
8. Related Project context
9. Decision or application history

### 33.2 Impact Summary

Use three aligned impact blocks:

- Scope
- Timeline
- Cost

These may become stacked sections on mobile.

The blocks should use:

- Strong label
- Clear value
- Supporting explanation
- Minimal icon

### 33.3 Cost Presentation

Use tabular numerals.

Example:

> €3,600 additional

Do not display:

- Invoice language
- Paid badge
- Payment CTA

### 33.4 Accepted and Applied

Show a compact sequence:

```text
Accepted by Elena Rossi
May 8 at 09:18

Applied by Daniel Ortiz
May 8 at 09:42
```

Application history should not visually overwrite the original Decision.

---

## 34. Handoff Visual Direction

Handoff should feel like the professional conclusion of a Project.

### 34.1 Agency Handoff Workspace

Use:

- Package summary
- Item list
- Required markers
- Order controls
- Client preview
- Publication readiness
- Acknowledgment status

The Item list remains visible while editing an Item.

### 34.2 Handoff Item

Each Item shows:

- Type icon
- Title
- Description
- Required state
- Availability or validation
- Edit control
- Reorder handle for authorized agency users

### 34.3 Client Handoff

The Client Handoff should feel calmer and more spacious.

Recommended hierarchy:

1. Completion statement
2. Agency message
3. Required final Items
4. Supporting documentation
5. Support window
6. Acknowledgment

### 34.4 Final Action

The acknowledgment region should be visually distinct but not aggressive.

Use:

- Agency accent
- Clear receipt statement
- Due date
- Primary acknowledgment button

No confetti is required after acknowledgment.

A restrained success confirmation is sufficient.

---

## 35. Agency Delivery Overview Composition

The Delivery Overview is a Signature Agency Screen.

Recommended vertical hierarchy:

1. Page title and brief context
2. Summary status strip
3. Needs Attention
4. Active Projects
5. Recent Client Activity

### 35.1 Summary Strip

Show:

- Open Projects
- Waiting on Client
- At Risk
- On Track

Keep counts compact.

The summary is not the primary content.

### 35.2 Needs Attention

This is the visual center.

Each item should show:

- Urgency
- Project
- Required action
- Responsible party
- Due state
- Reason

Orbit Health must appear first because the blocking Action is overdue.

### 35.3 Active Projects

Prefer a structured list or table over a card grid.

The user must compare:

- Health
- Client
- Current Milestone
- Target date
- Next action

### 35.4 Recent Activity

Use a quieter panel.

Activity supports context but must not compete with attention.

---

## 36. Agency Project Overview Composition

Recommended hierarchy:

1. Project identity and lifecycle
2. Health and reason
3. Primary action
4. Current Milestone
5. Delivery progress
6. Attention items
7. People
8. Recent Activity

### 36.1 Kestrelon Canonical State

The Screen must make these immediately visible:

- Handoff
- Waiting on Client
- Final acknowledgment pending
- Target completion May 29
- 4 of 5 Milestones completed
- Elena Rossi is Client Approver

### 36.2 Health Presentation

Do not use a large red or amber banner.

Waiting on Client is informational.

Use:

- Info status
- Clear obligation sentence
- Duration
- Due date
- Link to Handoff

---

## 37. Client Action Center Composition

The Client Action Center is the most important Client landing Screen.

Recommended hierarchy:

1. Agency-branded header
2. Personal greeting
3. Dominant next-action card
4. Project progress
5. Recent Decisions
6. Recently completed Actions

### 37.1 Dominant Action Card

The Kestrelon Handoff card should include:

- `Final action`
- Project name
- Action title
- Short explanation
- Due date
- Primary CTA

Use the Sableframe agency accent.

### 37.2 Calm State

The page should contain no internal health language.

Do not show:

- Client-blocked duration
- Agency risk
- Internal responsibility
- Classification notes

### 37.3 All-Caught-Up State

Use:

- Calm success icon
- `You are all caught up`
- Current Project progress
- No manufactured urgency

---

## 38. Client Project Overview Composition

Recommended hierarchy:

1. Project title and agency identity
2. Client-facing status
3. Current action
4. Milestone progress
5. Active Milestone
6. Recent Decisions
7. Recent Activity

### 38.1 Project Narrative

The Client Project Overview should read as a coherent Project story.

It should not resemble an internal dashboard.

### 38.2 Kestrelon Canonical State

Use:

- `The new Kestrelon website is live.`
- `Review final Handoff`
- `4 of 5 milestones completed`
- `Launch & Handoff`
- Recent Approved Decisions

---

## 39. Empty States

### 39.1 Direction

Empty states should be:

- Brief
- Honest
- Contextual
- Actionable when the user has authority

Use a small icon.

Do not require decorative illustrations.

### 39.2 Examples

Agency no Projects:

> Create your first project

Client no Deliverables:

> Deliverables will appear here when the agency publishes work for review.

Client all caught up:

> You are all caught up.

### 39.3 Permission-Aware Empty State

Do not show a create action to a user who lacks permission.

Explain the state without suggesting unavailable work.

---

## 40. Loading States

### 40.1 Skeletons

Use skeletons that reflect final structure.

Avoid full-page shimmering blocks.

### 40.2 Priority

Load and reveal in this order:

1. Context and title
2. Authoritative status
3. Primary action
4. Main content
5. Supporting metadata

### 40.3 Action Loading

Binding actions must:

- Disable duplicate submission
- Preserve Decision text
- Show progress
- Confirm success from authoritative state

---

## 41. Error States

### 41.1 Tone

Errors should be direct and non-technical.

Structure:

- What failed
- What remains safe
- What the user can do next

### 41.2 Inline Errors

Use for:

- Validation
- Upload failure
- Missing required data
- Unavailable link

### 41.3 Page Errors

Use for:

- Access denied
- Missing object
- Revoked membership
- Unrecoverable load failure

### 41.4 Color

Danger color supports the message.

It must not fill the entire page unless there is immediate destructive risk.

---

## 42. Read-Only and Historical States

Read-only must be unmistakable.

Use:

- Persistent state label
- Removed mutation controls
- Historical or completion date
- Muted but fully legible content
- Clear route to current Version when applicable

Do not show disabled primary buttons as the main signal.

### 42.1 Completed Project

Show:

- Completed date
- Client acknowledgment state
- Full historical navigation
- No creation controls

### 42.2 Cancelled Project

Show:

- Cancelled label
- Appropriate reason visibility
- Historical content
- No active CTA

### 42.3 Historical Version

Show:

- Version number
- Historical state
- Original Decision
- Route to current Version

---

## 43. Search Overlay Direction

Agency global search uses a command-style overlay.

### 43.1 Visual Structure

- Centered or upper-centered floating panel
- Search field at top
- Grouped results
- Projects
- Clients
- People
- Keyboard hints
- No-results state

### 43.2 Selection

Selected result uses:

- `studio-50` background
- Strong text
- Object type label
- Context line

### 43.3 Scope

Search is a navigation accelerator.

It should not feel like an analytics or content-search product.

---

## 44. Responsive Visual System

Reference behavior may use three ranges:

- Mobile: below approximately 640 px
- Tablet: approximately 640–1023 px
- Desktop: 1024 px and above

Exact breakpoints may change in Engineering Architecture.

### 44.1 Mobile Principles

- One primary column
- Full-width focused interactions
- Sticky critical action where needed
- Secondary metadata collapses
- Touch targets remain 44 px minimum
- No horizontal page-level scrolling

### 44.2 Tablet Principles

- Preserve Project context
- Allow two-column detail layouts
- Review Workspace may retain a collapsible Comment panel
- Operational tables may reduce columns

### 44.3 Desktop Principles

- Use available width for comparison and context
- Do not stretch reading columns unnecessarily
- Preserve whitespace around document-like content
- Keep operational tables scannable

### 44.4 Agency Shell

Desktop:

- Persistent navigation
- Wide content
- Project-local tabs

Tablet:

- Narrow or collapsible global navigation
- Project context remains persistent

Mobile:

- Navigation sheet
- Compact top bar
- Urgent action remains visible

### 44.5 Client Shell

Desktop:

- Agency-branded top header
- Centered content
- Low-emphasis `Powered by StudioFlow` footer attribution

Mobile:

- Compact top agency header
- `Home` and `Projects` in the top navigation region
- Project tabs below Project identity
- Full-width action cards
- Low-emphasis non-sticky attribution at the end of page content

---

## 45. Motion

### 45.1 Motion Principle

Motion explains change.

It does not decorate stillness.

### 45.2 Timing

Reference durations:

- Hover / pressed feedback: 100–140 ms
- Small state transition: 140–180 ms
- Drawer / sheet: 180–240 ms
- Dialog appearance: 160–220 ms
- Page transition: minimal fade only when useful

### 45.3 Easing

Use simple ease-out for entering and ease-in for leaving.

Avoid spring motion in binding or professional Decision flows.

### 45.4 Appropriate Motion

- Drawer opening
- Bottom sheet
- Comment pin selection
- Status update
- Toast
- Milestone completion
- Expanded history

### 45.5 Inappropriate Motion

- Floating cards
- Continuous gradients
- Pulsing status badges
- Decorative parallax
- Confetti after routine completion
- Animated charts without analytical need

### 45.6 Reduced Motion

Respect reduced-motion preferences.

Replace movement with:

- Instant state change
- Opacity transition
- Clear focus relocation

---

## 46. Accessibility Guardrails

The visual system targets WCAG 2.2 AA.

### 46.1 Contrast

Minimum targets:

- Normal text: 4.5:1
- Large text: 3:1
- UI components and focus boundaries: 3:1
- Disabled content must remain understandable even when lower contrast is permitted

### 46.2 Focus

Use a visible focus ring:

- 2 px minimum
- Strong contrast
- 2 px offset when surrounding border would reduce visibility

Focus color may use StudioFlow accent or an accessible derived agency color.

### 46.3 Color Independence

Every status includes:

- Label
- Icon or structural cue
- Supporting reason where required

### 46.4 Keyboard

All critical workflows must support keyboard use:

- Navigation
- Search
- Tables and rows
- Comment pins
- Version switching
- Decision dialogs
- Drawers and sheets
- Handoff Items

### 46.5 Review Pins

Pins require:

- Keyboard order
- Visible focus
- Numeric label
- Thread association
- Screen-reader name
- Selected state

### 46.6 Modals and Sheets

Must include:

- Focus trap
- Logical initial focus
- Escape behavior when safe
- Return focus to source
- Clear title
- Decision consequence

### 46.7 Branding

Agency branding must never reduce accessibility.

The system may modify the applied action tone to meet contrast.

### 46.8 Mobile

Mobile Client workflows must preserve:

- Due date
- Version identity
- Decision consequence
- Responsible person
- Project context

---

## 47. Demo Brand Application

## 47.1 StudioFlow

Canonical product treatment:

- Wordmark: dark neutral
- Product accent: `studio-600`
- Canvas: `neutral-50`
- Typography: Inter-like variable sans
- No gradient required
- No oversized symbol

### 47.2 Sableframe Studio

Canonical Client Portal treatment:

- Agency accent: `#2F6D60`
- Agency soft accent: `#EAF5F1`
- Wordmark: dark neutral or evergreen
- Personality: calm, precise, editorial, confident

The Sableframe identity should not use:

- Script typography
- Luxury gold effects
- Black-only high-fashion styling
- Bright startup gradients

### 47.3 Kestrelon

Kestrelon identity appears in:

- Project title
- Client Organization context
- Deliverable content
- Approved sample assets

Kestrelon should not recolor StudioFlow or the Sableframe Client Portal shell.

### 47.4 Demo Asset Direction

Homepage Visual Direction assets should contain:

- Clear SaaS homepage structure
- Legible hero
- `Book a demo` CTA
- Approved customer logos
- Customer onboarding message
- Enough detail for meaningful pin Comments

The assets must remain visually credible at review scale.

---

## 48. Signature Screen Visual Requirements

| Screen                        | Signature Requirement                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| AG-01 Delivery Overview       | Exception-first hierarchy without dashboard clutter                    |
| AG-09 Agency Project Overview | Health, current Milestone, and blocking obligation visible immediately |
| AG-18 Agency Image Review     | Dark canvas, persistent Comments, internal/shared distinction          |
| AG-20 Revision Request        | Review context and classification consequence connected                |
| AG-23 Change Request          | Scope, timeline, cost, Decision, and application read as one record    |
| AG-25 Agency Handoff          | Package completeness and client preview visible together               |
| CL-01 Client Action Center    | One dominant action with calm supporting context                       |
| CL-03 Client Project Overview | Project narrative and next action before metadata                      |
| CL-08 Client Image Review     | Current Version and Decision authority unmistakable                    |
| CL-11 Client Change Request   | Business impact understandable on mobile                               |
| CL-13 Client Handoff          | Final package feels complete, ordered, and trustworthy                 |

---

## 49. Visual Anti-Patterns

Do not:

- Use a generic dark sidebar with neon accents
- Make every Screen a grid of equal cards
- Use charts where a prioritized list is more useful
- Place multiple primary buttons in every header
- Use bright red for all client delays
- Use green for every positive state regardless of context
- Hide Decision consequences in small helper text
- Use agency brand color for semantic status
- Use fully rounded pills for all controls
- Make historical Versions look current
- Show agency-only notes with vague styling
- Put dense internal metadata into Client Portal headers
- Use animation to distract from slow loading
- Use disabled controls to teach permissions
- Use empty illustration panels that push content below the fold

---

## 50. Visual QA Checklist

### 50.1 Brand

- StudioFlow remains visually consistent in Agency Workspace.
- Agency branding dominates Client Portal without harming accessibility.
- Client identity remains contextual.
- Semantic colors remain fixed.

### 50.2 Hierarchy

- Each Screen has one dominant purpose.
- Primary action is obvious.
- Status reason is visible.
- Due dates and authority are not hidden.
- Historical content is clearly historical.

### 50.3 Density

- Agency Screens are compact but readable.
- Client Screens use more space and fewer simultaneous signals.
- Mobile content does not become a compressed desktop layout.

### 50.4 Review

- Current Version is unmistakable.
- Pin selection is clear.
- Shared and agency-only content cannot be confused.
- Decision controls appear only for authorized current-state users.
- Historical Versions are read-only.

### 50.5 Decisions

- Object and Version are named.
- Consequence is stated.
- Authority is visible.
- Duplicate submission is prevented.
- Success and failure are clear.

### 50.6 Accessibility

- Contrast passes.
- Focus is visible.
- Color is not the only status cue.
- Touch targets are sufficient.
- Reduced motion is respected.
- Keyboard paths are complete.

### 50.7 Demo Integrity

- Sableframe accent is consistent.
- Kestrelon data matches the approved narrative.
- Dashboard counts are traceable.
- No client Screen exposes internal notes.
- No file is an empty placeholder.
- No controlled Demo link is dead.

---

## 51. Visual Direction Decisions

| Decision                                                                       | Status                                                      |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Core visual concept: Obsidian Operations                                       | Approved                                                    |
| Quiet Precision as supporting restraint/hierarchy principle                    | Retained; no longer the primary shell concept               |
| One shared foundation with distinct Agency and Client density                  | Approved                                                    |
| Agency Workspace uses StudioFlow accent                                        | Approved                                                    |
| Client Portal uses controlled agency accent                                    | Approved                                                    |
| Agency color may override semantic colors                                      | Rejected                                                    |
| Light-first product-shell foundation                                           | Superseded by M08 owner freeze                              |
| Dark-first Obsidian Operations product-shell foundation                        | Approved                                                    |
| Review canvas defaults to dark with explicit Light and checker controls        | Approved                                                    |
| StudioFlow primary accent is restrained indigo-blue                            | Approved                                                    |
| Sableframe canonical accent is deep evergreen                                  | Approved                                                    |
| Inter Variable is the primary UI type family                                   | Approved                                                    |
| Decorative display font in MVP                                                 | Rejected                                                    |
| Border-first surface hierarchy                                                 | Approved                                                    |
| Heavy elevation and glass effects                                              | Rejected                                                    |
| Agency interface is denser than Client Portal                                  | Approved                                                    |
| Client Portal mobile navigation uses top navigation for Home and Projects      | Approved                                                    |
| Agency navigation is capability-projected on desktop, mobile, and command UI   | Approved                                                    |
| Hidden navigation never replaces server-side authorization                    | Approved                                                    |
| Status always includes text and structural cue                                 | Approved                                                    |
| Waiting on Client uses informational rather than danger treatment              | Approved                                                    |
| Revision and scope context use fixed purple semantic family                    | Approved                                                    |
| Image review desktop uses dark canvas and persistent Comment panel             | Approved                                                    |
| Image review mobile uses Canvas, Comments, and Details modes                   | Approved                                                    |
| Binding Decisions receive focused visual ceremony                              | Approved                                                    |
| Cards are used only for meaningful boundaries                                  | Approved                                                    |
| Dashboard charts in MVP                                                        | Rejected unless a specific analytical question requires one |
| Empty states use small icons rather than large illustrations                   | Approved                                                    |
| Motion is functional and restrained                                            | Approved                                                    |
| WCAG 2.2 AA is the visual accessibility target                                 | Approved                                                    |
| Client Portal includes low-emphasis `Powered by StudioFlow` footer attribution | Approved                                                    |
| Attribution removal through MVP branding settings                              | Rejected                                                    |
| Sableframe canonical accent is `#2F6D60` deep evergreen                        | Approved                                                    |
| Automatic adaptive Review Canvas background                                    | Rejected                                                    |
| Agency Project navigation uses horizontal tabs on desktop                      | Approved                                                    |
| Agency Project navigation uses a persistent secondary rail                     | Rejected                                                    |

---

## 52. Resolved Review Decisions

### 52.1 Product Typeface

**Decision:** Inter Variable

Inter is the final primary type family.

It provides the strongest balance of:

- Dense UI legibility
- Numeric clarity
- Long-form readability
- Variable-weight control
- Cross-platform consistency
- Predictable rendering in the target development environment

Geist Sans is not part of the approved visual direction.

A standard sans-serif fallback stack remains an implementation safeguard.

### 52.2 Client Portal Attribution

**Decision:** Include a low-emphasis `Powered by StudioFlow` footer attribution.

The attribution is:

- Text-only
- Muted
- Non-sticky
- Outside the main action hierarchy
- Subordinate to the agency identity

The MVP does not provide a branding control to remove it.

This preserves agency-first presentation while keeping the underlying product identifiable.

Advanced white-label removal remains deferred and is not connected to any pricing tier in this document.

### 52.3 Sableframe Accent

**Decision:** Retain deep evergreen.

The final canonical value is:

```text
#2F6D60
```

Reasons:

- It is visually distinct from StudioFlow indigo.
- It supports the calm editorial character of Sableframe.
- It performs strongly with white button text.
- It avoids making the Client Portal feel like a recolored Agency Workspace.
- It remains restrained beside fixed semantic colors.

The cooler blue-green alternative is rejected for the canonical Demo.

### 52.4 Client Mobile Navigation

**Decision:** Use top navigation.

`Home` and `Projects` remain immediately available in the compact agency-branded header region.

Persistent bottom navigation is rejected because it would compete with:

- Review Decision bars
- Handoff acknowledgment actions
- Full-screen sheets
- Mobile safe-area spacing

The two-destination global navigation does not justify permanent bottom-screen occupation.

### 52.5 Review Canvas

**Decision:** Use a stable dark default with manual background controls.

The Review Canvas defaults to `neutral-950`.

Users may switch to:

- Light
- Transparency checker when relevant

Automatic adaptive background detection is rejected.

This provides predictable presentation while still supporting very dark assets.

### 52.6 Agency Project Local Navigation

**Decision:** Use horizontal tabs on desktop.

The six approved Project sections remain in one horizontal tab row below the Project header.

Behavior:

- Desktop: stable horizontal tabs
- Tablet: horizontally scrollable without wrapping
- Mobile: compact Project-section switcher
- Full-width Review Workspace: compact breadcrumb and section menu instead of the full row

A persistent secondary rail is rejected because it adds an unnecessary third navigation layer.

### 52.7 Review Outcome

All six visual questions are resolved.

No remaining visual decision requires reopening:

- Product Specification
- Demo Narrative
- Information Architecture
- Screen Inventory

---

## 53. Approval Criteria

This Visual Direction is ready for approval when:

- StudioFlow, agency, and client brand roles are unambiguous.
- Agency and Client experiences are visibly distinct without becoming separate products.
- Color tokens support all approved lifecycle and state models.
- Agency customization cannot weaken semantic meaning or accessibility.
- Typography supports both dense operational data and calm client narrative.
- Density is defined for Agency and Client surfaces.
- Signature Screens have clear composition direction.
- Review Workspace behavior is visually defined for desktop and mobile.
- Binding Decisions have a consistent visual hierarchy.
- Handoff feels like a structured final package.
- Empty, loading, error, historical, and read-only states are covered.
- Responsive rules preserve critical information.
- Motion remains functional and restrained.
- WCAG 2.2 AA guardrails are explicit.
- Demo identities and assets can be produced consistently.
- No visual decision changes approved Product scope or Information Architecture.

All criteria are satisfied.

---

## 54. Approval Decision

**Decision:** Approved

The Visual Direction is approved because:

- `Obsidian Operations` provides the approved product-shell concept across Agency, Client, and shared surfaces, while Quiet Precision remains a supporting restraint principle.
- StudioFlow, agency, and client identities have explicit visual roles.
- Inter Variable is fixed as the primary type family.
- StudioFlow indigo and Sableframe evergreen are clearly separated.
- Agency branding cannot override semantic meaning or accessibility.
- Client Portal attribution remains visible without competing with agency identity.
- Agency and Client density are intentionally different.
- Desktop and mobile Review Workspace behavior is fully defined.
- Binding Decisions have consistent visual ceremony.
- Agency Project navigation no longer has an unresolved structural choice.
- Client mobile navigation avoids conflict with sticky Decision actions.
- Agency desktop and mobile shells have a durable three-layer / three-row architecture and capability-aware navigation projection.
- Access, Invitation, Recovery, Access Denied, and Not Found share the approved Obsidian product-boundary language.
- Signature Screens have implementable composition requirements.
- No unresolved visual question blocks Engineering Architecture or the M09 Project Core.

---

## 55. Next Document

After approval, the next document is:

- `docs/product/08-engineering-architecture.md`

Engineering Architecture must translate approved product and visual requirements into:

- Application architecture
- Route structure
- Tenant and authorization boundaries
- Data model
- State transitions
- File and asset handling
- Annotation coordinate model
- Notification delivery
- Activity event model
- Background processing
- Optimistic and concurrent interaction behavior
- Testing strategy
- Performance budgets
- Accessibility implementation strategy
- Demo seed and reset architecture
- Deployment model

Engineering Architecture must implement the approved product without reopening Product Specification, Information Architecture, Screen Inventory, or Visual Direction.
