# StudioFlow Test Conventions

## Test layers

- `unit/`: pure logic and boundary tests; no network or database.
- `integration/`: component and in-process integration tests; no shared external state.
- `database/`: tests against a disposable PostgreSQL database created per suite.
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
