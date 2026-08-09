# StudioFlow

StudioFlow is a premium client-delivery platform for boutique web design and development agencies, providing an Agency Workspace for operational control and a Client Portal for attention, decisions, and confidence.

## Documentation

- Product: `docs/product/`
- Engineering: `docs/engineering/`
- Local development: `docs/engineering/02-local-development.md`
- Testing and CI: `docs/engineering/03-testing-and-ci.md`
- Database and async foundation: `docs/engineering/04-database-and-async-foundation.md`

## Roadmap

Implementation follows `M00 → M01 → ... → M24` as defined in `docs/engineering/01-implementation-roadmap.md`.

Current milestone: **M04 — Database and Async Foundation**

## Application

```bash
pnpm dev
pnpm dev:worker
```

## Local infrastructure

```bash
pnpm infra:up
pnpm infra:smoke
pnpm infra:test:persistence
```

## Database foundation

```bash
pnpm db:migrations:validate
pnpm db:migrate
pnpm test:database
```

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Database and browser gates are documented in `docs/engineering/03-testing-and-ci.md`.
