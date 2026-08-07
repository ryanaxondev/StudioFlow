# Mailpit local email

Mailpit captures all local SMTP traffic. No external email provider is required during local development.

Default endpoints:

- SMTP: `127.0.0.1:1025`
- Web UI: `http://127.0.0.1:8025`

The Mailpit SQLite database is persisted in a named Docker volume. The M02 smoke test sends a real SMTP message and confirms that Mailpit captured it through the HTTP API.
