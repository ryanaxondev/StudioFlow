CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE studioflow_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL UNIQUE,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT studioflow_migrations_version_positive_check CHECK (version > 0),
  CONSTRAINT studioflow_migrations_checksum_format_check CHECK (checksum ~ '^[0-9a-f]{64}$')
);
