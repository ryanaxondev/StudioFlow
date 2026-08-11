# StudioFlow

StudioFlow is a premium client-delivery platform for boutique web design and development agencies, providing an Agency Workspace for operational control and a Client Portal for attention, decisions, and confidence.

## Documentation

- Product: `docs/product/`
- Engineering: `docs/engineering/`
- Local development: `docs/engineering/02-local-development.md`
- Testing and CI: `docs/engineering/03-testing-and-ci.md`
- Database and async foundation: `docs/engineering/04-database-and-async-foundation.md`
- Authentication foundation: `docs/engineering/05-authentication-foundation.md`
- Invitations and membership bootstrap: `docs/engineering/06-invitations-and-membership-bootstrap.md`

## Roadmap

Implementation follows `M00 → M01 → ... → M24` as defined in `docs/engineering/01-implementation-roadmap.md`.

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

## Authentication and membership foundation

M05 provides existing-user passwordless Email Magic Link authentication. M06 adds authoritative Workspace and Client Organization membership, controlled invitations, invitation acceptance, and the initial Agency membership/client management surfaces.

Create a local identity and controlled Agency Workspace for the M06 smoke flow with:

```bash
pnpm auth:local-user --email developer@example.com --name "Developer"
pnpm db:migrate
pnpm workspace:local-setup --owner developer@example.com --name "StudioFlow Local"
```

Run both the Web application and Worker when manually testing invitation delivery:

```bash
pnpm dev
pnpm dev:worker
```
