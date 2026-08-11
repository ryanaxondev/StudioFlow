# StudioFlow Authentication Foundation

## Purpose

M05 introduces the first real StudioFlow authentication flow: existing users can request a passwordless Email Magic Link, establish a database-backed session, view minimal account identity, and sign out locally.

This milestone does not create Workspace or Project access, accept invitations, create public accounts, or introduce Demo authentication bypasses.

## Authentication boundary

Better Auth owns authentication protocol mechanics and the core identity/session records already created in M04:

- `users`
- `sessions`
- `accounts`
- `verifications`

StudioFlow owns Product tenancy and authorization. Workspace membership, Client membership, invitations, Project access, and Client Approver authority remain outside Better Auth and are introduced by later milestones.

M05 deliberately disables Magic Link sign-up. An unknown or disabled email receives the same request-sent HTTP response as an eligible existing user, but StudioFlow does not create an account or enqueue an access link. New-user onboarding begins in M06 through authoritative invitation acceptance.

## Better Auth configuration

M05 pins Better Auth `1.6.25` and configures:

- Email Magic Link plugin
- 15-minute Magic Link expiry
- hashed token storage
- single-use verification
- database-backed opaque sessions
- 14-day rolling session expiry
- one-day refresh age
- 30-day absolute session lifetime enforced by StudioFlow
- `HttpOnly` cookies
- `SameSite=Lax`
- `Secure` cookies in Production
- StudioFlow cookie prefix
- UUID identity records
- no cookie session cache, so database revocation remains authoritative

Better Auth's public Magic Link request endpoint is not exposed as a Product request path. StudioFlow accepts requests through `/api/access/request`, validates the request origin, applies its own account eligibility and database-backed rate-limit policy, and then invokes Better Auth server-side.

The M05 Better Auth HTTP surface is allowlisted deliberately:

- `GET /api/auth/magic-link/verify`
- `POST /api/auth/sign-out`

All other Better Auth HTTP endpoints return 404 in M05. Server-rendered StudioFlow code reads sessions through the server-only Better Auth API and the StudioFlow session-policy wrapper rather than exposing `/api/auth/get-session` directly. Browser session renewal uses the StudioFlow-owned `POST /api/access/session/refresh` route, which validates the configured application origin and forwards only authentication cookies, never the raw Better Auth session payload.

Unknown and disabled accounts receive the same request-sent response as eligible accounts. Queue failures are also masked behind that generic public response so operational failures do not create an account-enumeration signal; logs contain no email, Magic Link, or token content.

## Environment

Local defaults keep `.env` optional:

```text
BETTER_AUTH_URL=http://127.0.0.1:3000
BETTER_AUTH_SECRET=studioflow-local-auth-secret-change-before-production
AUTH_MESSAGE_ENCRYPTION_SECRET=studioflow-local-auth-message-encryption-secret-change-before-production
MAILPIT_API_URL=http://127.0.0.1:8025
AUTH_EMAIL_FROM=access@studioflow.local
```

Production requires explicit `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `AUTH_MESSAGE_ENCRYPTION_SECRET`. Local development secrets must never be reused for a deployment.

`AUTH_MESSAGE_ENCRYPTION_SECRET` is separate from the Better Auth signing secret. It protects short-lived authentication delivery payloads while they are persisted in the Outbox.

The Resend production transport remains intentionally unavailable in M05. Production authentication email delivery is enabled only when the approved provider adapter is implemented in its later milestone.

## Async Magic Link delivery

Email delivery is not performed inside the Web request or Better Auth persistence operation. Better Auth hands the generated Magic Link to the StudioFlow authentication email adapter, which:

1. confirms the existing user is still eligible;
2. encrypts the recipient and generated Magic Link with AES-256-GCM using a key derived from `AUTH_MESSAGE_ENCRYPTION_SECRET`;
3. inserts an `authentication.magic-link.deliver` event into the existing M04 Outbox;
4. returns without contacting Mailpit or an external provider.

The durable `outbox_events.payload` therefore does not contain the email address, raw Magic Link, or raw Magic Link token in plaintext. Better Auth separately stores the Magic Link verification token as a hash.

The M04 Worker registers the M05 authentication email processor. The processor opens the protected payload only in memory and passes it to the runtime email transport. Development uses Mailpit's HTTP send API. Production transport remains disabled in M05.

The protected payload is authenticated as well as encrypted. A modified or incorrectly keyed payload fails closed and enters the existing Worker retry/failure path without exposing protected content in the error message.

No M05 migration is required: the existing Outbox, Worker runtime, and identity tables are reused.

## Existing-user local bootstrap

The public Product has no self-sign-up path in M05. To exercise the local Exit Gate, create an existing local identity with the development-only command:

```bash
pnpm auth:local-user --email developer@example.com --name "Developer"
```

The command refuses non-local database hosts.

Then:

1. Start local infrastructure.
2. Start the Web app and Worker.
3. Open `/access`.
4. Request a link for the local user.
5. Open the link captured in Mailpit.
6. Confirm redirect to `/account` or the preserved safe local destination.
7. Sign out and confirm the session is no longer accepted.

## Intended-destination policy

M05 preserves only same-origin relative paths. Invalid, protocol-relative, backslash-containing, and `/api/*` destinations fall back to `/account`.

The sanitized destination is passed to Better Auth as the Magic Link callback. Link failures route through `/recover-access` while preserving the same sanitized destination.

## Request rate limiting

M05 does not add a migration. The approved migration sequence reserves `0004` for M06, so authentication rate-limit attempts reuse the existing `verifications` table under an isolated namespace:

```text
studioflow:auth-rate-limit:*
```

Raw email and IP values are never stored in limiter identifiers; SHA-256 digests are used instead.

The limiter:

- is PostgreSQL-backed;
- serializes concurrent updates with transaction-scoped advisory locks;
- removes expired namespaced attempts;
- records bounded-window attempts in the same transaction;
- limits access-link requests by both normalized email and request IP;
- limits Magic Link verification attempts by request IP.

M05 defaults:

```text
Access-link request: 5 attempts / 60 seconds
Magic-link verify:   10 attempts / 60 seconds
```

The catch-all Better Auth in-memory limiter is disabled so authentication enforcement does not silently depend on per-process memory.

## Session lifecycle

Better Auth provides the 14-day rolling database session. Each successful Magic Link authentication rotates the session by retaining the newly authenticated session and deleting older sessions for that user.

Server-rendered reads use Better Auth's `disableRefresh` query so an RSC never extends the database session without also extending the browser cookie. The authenticated account surface mounts a non-visual refresh boundary that calls `POST /api/access/session/refresh`. That route first performs the StudioFlow absolute-lifetime and disabled-account check, then invokes Better Auth with response headers enabled and forwards any refreshed `Set-Cookie` header to the browser. This keeps rolling database expiry and browser-cookie expiry synchronized.

StudioFlow additionally treats a session as invalid when:

```text
now >= session.created_at + 30 days
```

The absolute lifetime is checked before protected StudioFlow account state is returned. An absolute-expired session is deleted.

Disabling an account is an atomic application operation that:

1. sets `users.disabled_at`;
2. deletes all sessions for the user in the same transaction.

Session creation also checks `disabled_at`, preventing a previously issued link from creating a new session after account disable.

## Screens

M05 implements only the identity portions approved for this milestone:

- `/access` — SH-01 Access Entry
- `/account` — SH-03 Account and Product Context, minimal identity state
- `/recover-access` — SH-05 link-failure foundation

`/account` intentionally shows only Name, Email, return, and sign-out behavior. Role, Workspace context, and Client context are not fabricated before M06 membership exists.

## Validation

With PostgreSQL running, M05 validation includes:

```bash
pnpm ci:static
pnpm ci:database
pnpm ci:integration
pnpm ci:build
pnpm ci:bundle
pnpm ci:e2e
pnpm ci:a11y
```

The M05 database suite covers Magic Link request/storage/expiry/single-use behavior, existing-user-only access, protected Outbox delivery, session creation and rotation, read-only server session resolution, rolling database-and-cookie refresh, absolute lifetime policy, account disable/revocation, redirect preservation, and PostgreSQL-backed rate limiting. Unit coverage verifies protected-payload integrity and the Worker authentication email processor. Browser smoke coverage also verifies that unapproved Better Auth request/session endpoints remain closed.

## Forward-fix policy

M05 does not modify M04 migrations and introduces no new release migration. Any future persistence change follows the approved sequential migration plan; already-applied migration files remain immutable.
