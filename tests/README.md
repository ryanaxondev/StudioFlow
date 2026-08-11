# StudioFlow Test Conventions

## Test layers

- `unit/`: pure logic and boundary tests; no network or database.
- `integration/`: component and in-process integration tests; no shared external state.
- `database/`: tests against disposable PostgreSQL databases; M04 suites apply the real release migrations before exercising persistence behavior.
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
