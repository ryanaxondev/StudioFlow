# StudioFlow

StudioFlow is a premium client-delivery platform for boutique web design and development agencies, providing an Agency Workspace for operational control and a Client Portal for attention, decisions, and confidence.

## Documentation

- Product: `docs/product/`
- Engineering: `docs/engineering/`
- Local development: `docs/engineering/02-local-development.md`

## Roadmap

Implementation follows `M00 → M01 → ... → M24` as defined in `docs/engineering/01-implementation-roadmap.md`.

Current milestone: **M02 — Local Infrastructure**

## Application

```bash
pnpm dev
pnpm dev:worker
```

## Local infrastructure

Start all required local services with:

```bash
pnpm infra:up
```

Validate them with:

```bash
pnpm infra:smoke
pnpm infra:test:persistence
```
