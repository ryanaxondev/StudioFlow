# StudioFlow Database and Async Foundation

## Purpose

M04 establishes the first persistent StudioFlow schema and the reusable transaction, idempotency, Outbox, and Worker foundations required before Product commands begin.

This milestone does not introduce Workspace or Project tables, Product email templates, file processors, reminder scheduling, seed narrative data, or PostgreSQL RLS.

## Runtime stack

- PostgreSQL 18 local service from M02
- `pg` connection pools
- Drizzle ORM for typed schema/query composition
- Drizzle Kit for review-candidate schema generation
- Reviewed, immutable SQL release migrations under `src/db/migrations/`
- PostgreSQL-backed transactional Outbox
- Separate Web and Worker database credentials

## Database URLs

Local defaults are built into the database environment parser, so a local `.env` file remains optional:

```text
DATABASE_URL=postgresql://studioflow_app:studioflow_app_dev@127.0.0.1:5432/studioflow
MIGRATION_DATABASE_URL=postgresql://studioflow_migrator:studioflow_migrator_dev@127.0.0.1:5432/studioflow
WORKER_DATABASE_URL=postgresql://studioflow_worker:studioflow_worker_dev@127.0.0.1:5432/studioflow
```

Production does not receive these defaults. All three URLs must be explicit in production.

## Migration workflow

Approved release migrations are flat, sequential SQL files:

```text
src/db/migrations/
├── 0001_extensions_and_system.sql
├── 0002_identity_foundation.sql
└── 0003_outbox_and_idempotency.sql
```

Validate filenames/order:

```bash
pnpm db:migrations:validate
```

Apply release migrations locally:

```bash
pnpm infra:up
pnpm db:migrate
```

`db:migrate`:

1. Acquires a PostgreSQL advisory migration lock.
2. Validates stored migration names and SHA-256 checksums.
3. Applies each unapplied SQL file in its own transaction.
4. Records the immutable migration in `studioflow_migrations`.
5. Applies the current Web/Worker runtime grants when those roles exist.

Running the command again is a safe replay and applies nothing when the database is current.

### Drizzle generation

```bash
pnpm db:generate
```

Drizzle Kit writes review candidates to ignored `.drizzle-review/`. Those files are diagnostic schema diffs, not release migrations. StudioFlow keeps the Approved Roadmap filenames and reviewed SQL files as the release source of truth.

## Migration forward-fix policy

Committed migration filenames and applied migration contents are immutable. M04 does not maintain destructive down migrations.

If a released migration needs correction:

- do not edit the applied file;
- create the next Approved sequential migration;
- use expand/contract for breaking changes;
- apply the forward fix to Staging before Production.

M04 migrations contain no seed data.

## M04 schema

### `0001_extensions_and_system.sql`

- Enables `pg_trgm`.
- Creates `studioflow_migrations` metadata.
- Creates no Product domain table.

### `0002_identity_foundation.sql`

Creates the Better Auth-compatible identity foundation:

- `users`
- `sessions`
- `accounts`
- `verifications`

StudioFlow uses UUID primary keys and `timestamptz` instants. Better Auth field properties map to StudioFlow snake-case columns; M05 owns the actual Better Auth adapter/configuration.

### `0003_outbox_and_idempotency.sql`

Creates:

- `idempotency_records`
- `outbox_events`
- claim-ready and lease-recovery indexes
- attempt, failure, and lease metadata

`workspace_id` is intentionally nullable and has no foreign key in M04 because Workspace persistence is not introduced until M06.

## Transaction boundary

Use `withTransaction()` from `src/db/transactions/` for atomic application commands. It provides both:

- a Drizzle transaction-scoped database;
- the underlying PostgreSQL client for explicit locking SQL when required.

A command that creates an Outbox Event must insert it through the same transaction context as its domain state.

## Row version convention

Mutable aggregate roots introduced by later milestones use:

```text
row_version INTEGER NOT NULL DEFAULT 1
```

Use the shared row-version helper when incrementing accepted mutations.

## Idempotency

Binding commands reserve a record scoped by:

```text
actor + command type + idempotency key
```

The request fingerprint is a canonical SHA-256 digest. Reusing the same key with the same fingerprint returns the stored result reference. Reusing it with another fingerprint returns conflict.

## Transactional Outbox

Outbox Events are created inside domain transactions. Workers claim available events in bounded batches with:

```sql
FOR UPDATE SKIP LOCKED
```

A claim records:

- worker id;
- claim time;
- lease expiry;
- incremented attempt count.

Expired leases become claimable again.

Reference retry delays are:

```text
1 minute
5 minutes
15 minutes
1 hour
6 hours
24 hours
```

The default is seven total processing attempts: the initial attempt plus the six approved retry delays above. After `max_attempts`, the event is retained and marked failed rather than deleted.

## Worker runtime

The M04 Worker has:

- PostgreSQL polling;
- explicit processor registry;
- claim/lease handling;
- retry metadata;
- failure visibility through persisted `last_error` and structured logs;
- graceful shutdown with a bounded processor completion window.

Product-specific processors remain intentionally absent in M04 and are registered by later milestones.

## M04 database gate

With local PostgreSQL running:

```bash
pnpm db:migrations:validate
pnpm test:database
```

The database suite covers:

- migration on an empty database;
- migration replay;
- migration from a previous schema state;
- transaction rollback;
- UUID creation;
- UTC instant persistence;
- database error normalization;
- Outbox commit/rollback atomicity;
- idempotency replay/conflict;
- `FOR UPDATE SKIP LOCKED` claim behavior;
- expired Worker lease recovery.

The M04 Exit Gate is G1 plus the foundational Worker portion of G5.

### Runtime database credentials

Database credentials are validated per runtime boundary:

- Web validates only `DATABASE_URL`.
- Worker validates only `WORKER_DATABASE_URL`.
- Release migrations validate `MIGRATION_DATABASE_URL` plus the Web and Worker URLs needed to apply runtime grants.

This preserves the approved separation between migration, Web, and Worker database roles. A process must not require credentials belonging exclusively to another runtime.
