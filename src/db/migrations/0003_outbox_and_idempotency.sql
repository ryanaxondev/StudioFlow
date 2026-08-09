CREATE TABLE idempotency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  command_type text NOT NULL,
  idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL,
  result_reference jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamptz NOT NULL,
  CONSTRAINT idempotency_expires_after_created_check CHECK (expires_at > created_at)
);

CREATE UNIQUE INDEX idempotency_actor_command_key_unique
  ON idempotency_records (actor_id, command_type, idempotency_key);

CREATE INDEX idempotency_expires_at_idx
  ON idempotency_records (expires_at);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  available_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 7,
  locked_at timestamptz,
  locked_by text,
  lock_expires_at timestamptz,
  processed_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT outbox_attempt_count_nonnegative_check CHECK (attempt_count >= 0),
  CONSTRAINT outbox_max_attempts_positive_check CHECK (max_attempts > 0)
);

CREATE INDEX outbox_claim_ready_idx
  ON outbox_events (available_at, created_at)
  WHERE processed_at IS NULL AND failed_at IS NULL;

CREATE INDEX outbox_lock_expiry_idx
  ON outbox_events (lock_expires_at)
  WHERE lock_expires_at IS NOT NULL;
