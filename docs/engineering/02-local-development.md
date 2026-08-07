# StudioFlow Local Development

## Local infrastructure

Start the production-like local dependencies with one command:

```bash
pnpm infra:up
```

This starts PostgreSQL, MinIO, Mailpit, and ClamAV, waits for their health checks, and creates the private MinIO bucket.

The services bind only to `127.0.0.1` on the host:

| Service | Default endpoint |
|---|---|
| PostgreSQL | `127.0.0.1:5432` |
| MinIO API | `http://127.0.0.1:9000` |
| MinIO Console | `http://127.0.0.1:9001` |
| Mailpit SMTP | `127.0.0.1:1025` |
| Mailpit UI | `http://127.0.0.1:8025` |
| ClamAV | `127.0.0.1:3310` |

Compose has safe local defaults. Copy `.env.example` to `.env` only when an override is needed.

## Commands

```bash
pnpm infra:up
pnpm infra:status
pnpm infra:smoke
pnpm infra:test:persistence
pnpm infra:logs
pnpm infra:down
```

`pnpm infra:reset` deletes all local infrastructure volumes and data. Use it only when a clean local environment is intentional.

## Optional database UI

Adminer is disabled by default. Start it explicitly with:

```bash
pnpm infra:admin
```

Then open `http://127.0.0.1:8080` and use `postgres` as the server name from inside the Compose network.

## Mailpit

Local application email should target `127.0.0.1:1025`. Open `http://127.0.0.1:8025` to inspect captured messages. Local development does not require Resend.

## M02 validation

Run:

```bash
pnpm infra:smoke
pnpm infra:test:persistence
```

The smoke suite checks PostgreSQL connectivity, MinIO PUT/GET, Mailpit SMTP capture, a clean ClamAV scan, and rejection of the EICAR test signature. The persistence suite recreates the service containers without deleting named volumes and verifies that PostgreSQL, MinIO, Mailpit, and the ClamAV signature volume retain state.
