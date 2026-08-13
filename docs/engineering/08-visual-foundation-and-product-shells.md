# StudioFlow

# Visual Foundation and Product Shells

**Document Type:** Engineering Milestone Brief

**Status:** Approved

**Owner:** Architecture Room

**Depends On:**

- `docs/product/06-screen-inventory.md`
- `docs/product/07-visual-direction.md`
- `docs/product/08-engineering-architecture.md`
- `docs/engineering/01-implementation-roadmap.md`
- `docs/engineering/07-tenant-isolation-and-authorization.md`

## Goal

Complete and propagate the Human Owner–approved Obsidian Operations visual architecture across M08 while preserving the existing authorization, routing, accessibility, and interaction foundation.

## Implemented Foundation

- Approved neutral, StudioFlow indigo, Sableframe evergreen, and semantic tokens
- Inter Variable through a versioned self-hosted package
- 4 px spacing system, radius, border, elevation, focus, and motion tokens
- Shared Button, Link, Input, Textarea, Select, Checkbox, Dialog, Drawer, Sheet, Tabs, Badge, Status, Avatar, Table, Empty State, Error State, Skeleton, Breadcrumb, Page Header, Section Header, Toast, and live-announcement primitives
- Radix-backed focus and keyboard primitives through local wrappers
- Phosphor product-facing iconography with Radix retained only where existing primitives still depend on it
- StudioFlow Flow Mark as the product-owned handoff → review → delivery brand motif
- Agency desktop rail/context sidebar plus capability-aware mobile bottom navigation and More sheet
- Agency search overlay shell without domain data
- Client agency-first top navigation and responsive header
- Client `Powered by StudioFlow` footer attribution
- Project horizontal tab shell and Agency mobile section switcher
- Tokenized Account, Access Denied, and Not Found utility surfaces
- Earlier light-first refinement is retained only in document and Git history; active product CSS uses the approved Obsidian Operations architecture

## Security Boundary

Product shells are presentation only.

Workspace and Client selection rendered in the browser never becomes authorization authority. M07 server policies, ActorContext, scoped queries, and not-found semantics remain authoritative.

## Validation

M08 requires:

- Token contrast tests
- Focus and keyboard behavior for Dialog and Sheet
- Agency sidebar structure
- Client top navigation structure
- Mobile shell behavior
- Reduced-motion CSS
- Visual smoke
- Existing authorization, database, invitation, and accessibility regression gates

## Non-Goals

- No Project persistence
- No Project dashboard truth
- No P0 screenshot polish
- No broad component catalogue route
- No decorative illustration system
- No new migration
## Obsidian Operations Prototype Batch

The prototype batch is intentionally narrow. It changes presentation only for:

- Agency Delivery desktop workspace
- Agency Delivery mobile workspace
- StudioFlow command palette
- Access / Authentication

Prototype architecture:

- 56 px product rail
- 216 px contextual Agency navigation on large desktop
- 48 px workspace context bar
- Dark operational canvas with tonal surface hierarchy
- Compact navigation and data-table density
- Delivery pulse, attention, upcoming, and active-delivery structures that are ready for M09 read models without inventing Project truth
- Mobile top context bar plus bottom primary navigation
- Asymmetric product-led authentication with a StudioFlow review → approval → delivery workflow motif
- The first visual gate passed without image assets; Foundation Freeze adds Phosphor product-facing iconography and a product-owned StudioFlow Flow Mark instead of decorative stock imagery

### Prototype Exit Gate — Passed

The Human Owner approved the rendered Agency Delivery desktop/mobile, Command Palette, and Access surfaces at the required visual-quality threshold. Obsidian Operations is frozen for propagation. Automated tests continue to protect behavior, while visual approval remains the primary M08 product-quality gate.

### Foundation Freeze and Prototype Polish

Before full propagation, the approved prototype is normalized as the M08 foundation:

- Remove duplicate Workspace context from the Delivery page header
- Keep empty Delivery Pulse metrics concise and explain the empty state once
- Hide unavailable table controls until real M09 read-model data exists
- Make the mobile shell own the bottom-navigation row and device safe area so page content never needs route-specific clearance hacks
- Reduce mobile selected-state saturation and use a compact indicator
- Add clearer Command Palette focus/selection treatment and result-type metadata
- Move product-facing navigation/search/auth icons to Phosphor
- Replace the prototype three-dot mark with the StudioFlow Flow Mark
- Defer broad legacy CSS deletion until all M08 surfaces have been propagated, so untouched screens are not destabilized mid-milestone

### Propagation Plan — Completed

The approved propagation sequence was completed in three batches:

1. Agency: Projects, Clients, Client detail, Agency members, Account
2. Client: Home, Projects, Account
3. Shared: Invitation, Recovery, Access Denied, Not Found
4. Consolidate obsolete light-first and prototype override CSS after every migrated surface has an Obsidian replacement
5. Run full static, authorization, integration, database, build, E2E, accessibility, bundle, diff, and final visual QA gates


### Agency Full Propagation — Batch 2

The frozen Obsidian Operations foundation now propagates across the remaining Agency-owned M08 surfaces without changing M07 authorization or M06 membership behavior:

- Projects becomes a dense collection surface with durable table anatomy and a purposeful empty state instead of milestone copy.
- Clients becomes an organization-centric collection with real member counts, semantic status treatment, and an in-context create-client disclosure using the existing server action.
- Client Organization detail becomes a true detail surface with overview metrics, anchor-based section navigation, delivery collection anatomy, client membership, and invitation/access management.
- Agency Members becomes a people-and-access workspace with membership summary, compact invitation composition, role management, current-account treatment, and actionable invitation queue.
- Account becomes a dedicated Obsidian settings surface for identity, Agency contexts, Client contexts, and session sign-out rather than a centered authentication-style card.
- Existing authorization checks, cross-tenant not-found behavior, invitation semantics, member revocation, and role updates remain authoritative and unchanged.
- No Project truth is invented before M09; empty collection structures are real product surfaces ready for domain data injection.

Batch 2 intentionally does not perform broad legacy CSS deletion. Client and shared surfaces still depend on older M08 selectors and are migrated in Batch 3 before final consolidation.

### Batch 2 Final Polish

Before Client/shared propagation, the Agency batch receives a narrow stabilization pass:

- Secondary Agency routes expose their real context label in desktop breadcrumbs and the mobile top bar instead of the generic `Workspace` fallback.
- Mobile Agency content scrolls in the shell-owned middle viewport between the top context bar and bottom-navigation row, so people-management and other long surfaces never render beneath navigation chrome.
- The Account return-to-product action is promoted from low-contrast utility text to a compact product-navigation control.
- Client collection row hover/focus behavior and the Client Organization detail composition were reviewed against the frozen Obsidian language and require no structural redesign.

### Client + Shared Propagation — Batch 3

The final M08 propagation batch extends the frozen Obsidian Operations DNA without turning the Client Portal into a reduced Agency Workspace:

- Client Home becomes a calmer agency-first workspace with real access context, review/upcoming structures, a client-safe project collection, and no invented Project truth.
- Client Projects becomes a durable client-safe collection surface ready for M09 data injection without milestone placeholder copy.
- Client global navigation remains top-based on desktop and mobile; persistent bottom navigation is intentionally reserved for the denser Agency mobile workspace.
- Invitation and Recovery move from legacy centered cards into a product-led secure-access frame that explains scoped invitation → verification → continuation without revealing protected context.
- Access Denied and Not Found become minimal product-boundary states using the StudioFlow Flow Mark and Obsidian geometry instead of generic utility cards.
- The existing Account surface remains the shared identity/session destination and already presents both Agency and Client membership contexts in the frozen Obsidian language.
- Obsolete light-first utility-card, recovery-surface, earlier identity-refinement, and superseded Client shell CSS are removed after the replacement surfaces exist.
- Radix icon dependency audit confirms it remains intentionally required by Checkbox, Dialog, Drawer, Select, and Sheet primitives; product-facing chrome continues to use Phosphor.
- Authorization, invitation semantics, session behavior, membership queries, and M09 domain ownership remain unchanged.

After Batch 3, M08 entered final full regression and visual QA only.

### Final Stabilization Pass

Before M08 approval, the propagated surfaces receive a narrow final stabilization pass:

- Client Projects uses a mobile-native collection layout without horizontal desktop-table overflow.
- Invitation and Recovery keep the approved desktop split composition while collapsing to a compact, action-first mobile access frame with a single StudioFlow brand treatment.
- Invitation presentation exposes an accessible live loading state while the invitation scope is resolved.
- Access is a true single-viewport desktop composition at representative laptop heights without hiding overflow or clipping content.
- Agency navigation is projected from M07 authorization capabilities: unauthorized destinations are absent from sidebar, mobile navigation, product-rail landing, and command actions while direct unauthorized URLs remain fail-closed.
- Superseded light-first Agency shell/search selectors and the unused Client tabs accent override are removed after final propagation.

### Final Regression — Passed

The complete M08 gate is green:

- Static/unit suite: 46 tests passed
- Authorization policy suite: 9 tests passed
- Integration suite: 9 tests passed
- PostgreSQL/database suite: 58 tests passed
- Production build: passed
- Bundle budget: `/` initial JavaScript `145.96 KB gzip` against the `170 KB` budget
- Full E2E suite: 10 tests passed
- Accessibility suite: passed after the final source cleanup
- `git diff --check`: passed
- Human Owner visual/manual QA: passed across Agency, Client, shared access/recovery, utility, responsive, and permission-aware navigation surfaces

The accessibility gate keeps the `color-contrast` rule enabled. The oversized `403`/`404` numerals are decorative `aria-hidden` watermark texture and are narrowly excluded from Axe contrast analysis; semantic headings, copy, actions, focus, and the rest of each boundary surface remain scanned.

The final manual authorization/navigation check confirms that an Agency Member sees only authorized Agency destinations while direct `/agency` and `/agency/clients` requests remain denied. This proves that navigation hiding is presentation only and the server policy remains authoritative.

### M09 Handoff

M09 starts from this approved foundation:

- Preserve Obsidian Operations tokens, shell geometry, product-facing Phosphor iconography, and responsive contracts.
- Populate the existing Agency Delivery and Projects anatomy with authoritative Project read models; do not rebuild the shell or introduce parallel light-first variants.
- Preserve capability-aware navigation. Agency Member continues to land on Projects and remains excluded from Delivery Overview.
- Extend M07 `canViewProject`/Project authorization with authoritative M09 Project assignments rather than weakening workspace-level policies.
- Preserve the M08 Client Home/Projects shell as presentation infrastructure. M09 does not yet own Client Project detail/domain population.
- Preserve Access single-viewport behavior, compact mobile Invitation/Recovery composition, accessible invitation loading, generic Access Denied/Not Found boundaries, and Account context behavior.
- M08 introduces no migration. M09 begins the next schema step with `0006_projects_memberships_and_activity.sql`.

### Final Approval

M08 is Approved. The visual foundation, Agency and Client product shells, shared access/recovery surfaces, responsive architecture, accessibility protections, and capability-aware navigation are frozen as the baseline for M09 domain population. Any later change that materially alters this foundation requires an explicit owner-approved decision and corresponding documentation update rather than incidental domain-work redesign.
