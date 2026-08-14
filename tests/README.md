# StudioFlow Test Conventions

## Test layers

- `unit/`: pure logic and boundary tests; no network or database.
- `authorization/`: pure role/capability matrix tests for the server-side authorization model.
- `integration/`: component and in-process integration tests; no shared external state.
- `database/`: tests against disposable PostgreSQL databases; suites apply the real release migrations before exercising persistence behavior.
- `e2e/`: narrow browser smoke tests.
- `accessibility/`: Playwright + Axe smoke tests.
- `visual/`: screenshot conventions and, after real P0 Screens exist, approved baselines.
- `helpers/`: reusable test infrastructure.
- `fixtures/`: stable named scenario inputs.
- `factories/`: deterministic object builders with explicit overrides.
- `stubs/`: adapters replacing external or framework-only boundaries in tests.

## Factory convention

Factories are deterministic, return valid defaults, accept explicit overrides, and do not hide persistence or network I/O. Scenario-specific meaning belongs in fixtures, not factories.

## Screenshot convention

Automatic failure screenshots, traces, and videos belong in ignored `test-results/`. Approved visual baselines will live under `tests/visual/baselines/<project>/<test-file>/` when real P0 Screens exist. M03 intentionally adds no visual baseline.

## Migrated database convention

Use `createMigratedTestDatabase()` for suites that exercise real StudioFlow persistence. It creates a uniquely named disposable database, applies the committed release migrations, exposes a pooled Drizzle client, and drops the database at teardown. `resetPublicSchemaData()` preserves `studioflow_migrations` while truncating application tables between tests.

## M05 authentication coverage

`tests/database/authentication.integration.test.ts` exercises the passwordless authentication foundation against disposable PostgreSQL, including hashed/single-use Magic Links, protected Outbox delivery, session lifecycle, account disable, redirect preservation, and the database-backed request limiter.

Authentication UI smoke and accessibility coverage live beside the existing browser gates.

## M06 membership and invitation coverage

`tests/database/membership-invitations.integration.test.ts` covers authoritative Workspace/Client membership, invitation lifecycle, concurrency, revocation, cross-Workspace integrity, and protected invitation delivery while preserving M04/M05 regression coverage.

### M06 invitation access bridge

The database suite verifies the invitation-only identity bridge for existing and newly invited identities, including display-name gating, expired-link rejection, Magic Link return to the original invitation, and accepted-state presentation. Browser smoke tests cover the invitation screen states with a stubbed HTTP boundary so browser CI remains independent from PostgreSQL.

## M07 authorization coverage

`tests/authorization/policy-matrix.test.ts` exercises the Workspace/Project policy interface for Agency Owner, Delivery Manager, Agency Member, Client, cross-Workspace, and removed-user scenarios. `tests/database/authorization-boundary.integration.test.ts` proves ActorContext is derived from authoritative active membership, cross-tenant requests fail closed, insufficient known-role access resolves to Access Denied semantics, stale ActorContext cannot authorize a write after revocation, and disabled identities lose membership authority. Unauthenticated behavior remains the authentication layer and is exercised by the existing access/browser boundary rather than by fabricating an ActorContext.

## M08 Visual Foundation

M08 adds token contrast checks, product-shell integration tests, Radix focus checks, responsive/reduced-motion assertions, and a lightweight browser visual smoke. These tests verify the shared visual and navigation foundation without introducing Project data or a component-catalogue route.

## M09 Project and Activity Core

`tests/database/project-core.integration.test.ts` covers the authoritative Draft Project aggregate, persisted Project assignments, Owner/assigned-role access, Client Draft exclusion, optimistic row versioning, atomic required-role reassignment, cross-tenant member rejection, immediate revocation, archived Client Organization authority loss, Draft hard-delete eligibility, exact-Project Activity delete scoping, immutable Activity, Client-safe DTO and Activity visibility, shared state/Activity/Outbox/idempotency rollback, and deterministic development-seed replay/version validation.

`tests/authorization/policy-matrix.test.ts` extends the M07 policy surface with persisted-M09-compatible Project lifecycle and assignment semantics while preserving the M08 capability-aware navigation contract.

### M09 product population coverage

`tests/database/m09-product-population.integration.test.ts` closes the M07-to-M09 Client Organization authorization handoff for assigned Delivery Managers, including Client invitation/member management, and proves required Delivery Manager / Client Approver upstream memberships cannot be orphaned. `tests/integration/m09-project-surfaces.test.tsx` covers Client-to-Project creation context, explicit authority reassignment confirmation, and in-product Draft deletion confirmation.

- M09 Product population tests also lock capability-aware Draft links: a Workspace Delivery Manager assigned to a Project only as `AGENCY_MEMBER` may see the Project but must not receive Project-management affordances.

## M10 Milestone and Publication Foundation

`tests/database/m10-milestones.integration.test.ts` covers Milestone Draft authority, optimistic Project/Milestone versions, semantic no-op protection, ordered-plan mutation, Project publication requirements, atomic Project/Milestone/Activity/Outbox publication, later Milestone Draft publication, first-Milestone activation, one-Active-Milestone enforcement, standard and override completion, cancellation, Onboarding-to-Active transition, Client Project access after publication, Agency-only Milestone projection isolation from Client actors, reduced Agency-contributor controls, and deterministic development seed v2.

`tests/database/worker-runtime.integration.test.ts` additionally proves that Product Outbox intents without a registered processor remain pending and consume no delivery attempt until a later milestone such as M19 registers the matching processor, after which the historical row becomes claimable through the same Worker path.

### M10 Agency Delivery Plan integration

`tests/integration/m10-agency-delivery-plan.test.tsx` covers the Batch 2 interaction contracts that are easy to regress outside PostgreSQL:

- Project publication requires an in-product confirmation before the Server Action runs.
- assigned Agency contributors can reorder the Draft Milestone sequence without publication authority.
- a newer Project `row_version` received from a sibling Server refresh is used for the next Project write without remounting or erasing unsaved identity fields.
- Milestone Detail adopts newer Project and Milestone row versions without erasing an unsaved Draft edit.

The authoritative publication, ordering, lifecycle, concurrency, Activity, Outbox, and authorization rules remain database integration tests.

### M10 Client Published Slice integration

`tests/database/m10-milestones.integration.test.ts` also proves Client Project/Milestone projections expose only published Milestones, derive client ordinals from the published subset, keep agency-only Draft churn out of Client recency, return not-found for unpublished Milestone detail, and exclude completion-override detail from Client Milestone and Activity DTOs.

`tests/integration/m10-client-published-slice.test.tsx` covers the Client Project local-navigation handoff and contextual Milestone timeline. Later-owned Deliverables and Activity destinations remain non-interactive until their owning milestones create real screens.
