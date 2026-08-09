# StudioFlow Testing and CI

## Purpose

M03 establishes automated quality gates before domain implementation begins. It does not introduce full workflow E2E coverage or visual regression baselines.

## Local test commands

```bash
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:database
pnpm test:e2e
pnpm test:a11y
```

`pnpm test` intentionally runs the fast Vitest unit and in-process integration layers. Database and browser checks stay explicit because they require local services or a browser runtime.

## PostgreSQL test database

Database integration tests create a uniquely named disposable PostgreSQL database, run the suite against it, and drop it afterward. The local default uses the M02 migration role at `127.0.0.1:5432`. Override `TEST_DATABASE_ADMIN_URL` when needed.

Start local infrastructure before database tests:

```bash
systemctl --user start docker
pnpm infra:up
pnpm test:database
```

The reset helper truncates public-schema tables with `RESTART IDENTITY CASCADE`. Tests must never target a development or production database URL.

## Test conventions

- Fixtures are stable named scenario inputs.
- Factories return deterministic valid defaults and accept explicit overrides.
- Factories do not perform hidden database or network I/O.
- Application time comes through the `Clock` interface; tests use a fixed Clock.
- Authentication tests use the local test stub until the real authentication adapter arrives.
- Worker processors are exercised through the processor harness without starting the long-running Worker process.

See `tests/README.md` for directory conventions.

## Playwright

Install Chromium once per developer machine:

```bash
pnpm playwright:install
```

Run browser checks with:

```bash
pnpm test:e2e
pnpm test:a11y
```

Playwright starts the Next.js development server automatically when one is not already running. Failure screenshots, traces, and videos go to ignored `test-results/`.

M03 defines future visual baselines under `tests/visual/baselines/` but adds no baseline before real P0 Screens exist.

## Migration validation

```bash
pnpm db:migrations:validate
```

The validator enforces contiguous numeric migration prefixes and the Approved filenames for migrations `0001` through `0019`. M04 currently implements and permits `0001` through `0003`; later Milestones advance that ceiling only when their Approved migrations are introduced.

## Bundle budgets

Build and generate the deterministic bundle report with:

```bash
pnpm build:web
pnpm bundle:report
```

The report is written to ignored `artifacts/bundle-report.json`. CI fails when measured initial client JavaScript exceeds:

- Ordinary Screen: 170 KB gzip
- Image Review route: 300 KB gzip

For interactive Turbopack analysis:

```bash
pnpm bundle:analyze
```

## CI jobs

`.github/workflows/ci.yml` defines the required jobs:

```text
static
database
integration
build
e2e-smoke
accessibility-smoke
bundle-budget
```

The workflow uses Node from `.node-version`, pnpm from `packageManager`, a PostgreSQL service for database tests, Chromium for browser checks, and uploads the JSON bundle report.

## CI failure-path check

The workflow has a manual `force_static_failure` input. Run the CI workflow manually with that input enabled; the `static` job must fail. Run it again with the input disabled and require the normal jobs to pass. This validates that a deliberately failing check produces a failed CI run without committing broken source code.

### Bundle-budget production runtime

The bundle reporter starts a production Web process solely to measure initial browser JavaScript. When CI does not provide an application database URL, the reporter supplies a syntactically valid non-secret measurement URL. The measured `/` route and liveness endpoint do not establish a database connection. Production deployments still require the real Web `DATABASE_URL` through startup validation.
