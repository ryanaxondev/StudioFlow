CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  project_id uuid NOT NULL,
  title text NOT NULL,
  purpose text,
  client_description text,
  position integer NOT NULL,
  planned_start_date date,
  planned_end_date date,
  state text NOT NULL DEFAULT 'PLANNED',
  published_at timestamptz,
  activated_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  completion_override_reason text,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT milestones_workspace_project_id_unique UNIQUE (workspace_id, project_id, id),
  CONSTRAINT milestones_project_workspace_fk
    FOREIGN KEY (workspace_id, project_id)
    REFERENCES projects(workspace_id, id)
    ON DELETE CASCADE,
  CONSTRAINT milestones_project_position_unique
    UNIQUE (workspace_id, project_id, position)
    DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT milestones_title_nonempty_check CHECK (length(trim(title)) > 0),
  CONSTRAINT milestones_position_positive_check CHECK (position > 0),
  CONSTRAINT milestones_state_check CHECK (
    state IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')
  ),
  CONSTRAINT milestones_date_order_check CHECK (
    planned_start_date IS NULL
    OR planned_end_date IS NULL
    OR planned_end_date >= planned_start_date
  ),
  CONSTRAINT milestones_row_version_positive_check CHECK (row_version > 0),
  CONSTRAINT milestones_lifecycle_timestamps_check CHECK (
    (state = 'PLANNED'
      AND activated_at IS NULL
      AND completed_at IS NULL
      AND cancelled_at IS NULL)
    OR
    (state = 'ACTIVE'
      AND activated_at IS NOT NULL
      AND completed_at IS NULL
      AND cancelled_at IS NULL)
    OR
    (state = 'COMPLETED'
      AND activated_at IS NOT NULL
      AND completed_at IS NOT NULL
      AND cancelled_at IS NULL)
    OR
    (state = 'CANCELLED'
      AND completed_at IS NULL
      AND cancelled_at IS NOT NULL)
  ),
  CONSTRAINT milestones_nonplanned_requires_publication_check CHECK (
    state = 'PLANNED' OR published_at IS NOT NULL
  ),
  CONSTRAINT milestones_override_reason_state_check CHECK (
    completion_override_reason IS NULL
    OR (state = 'COMPLETED' AND length(trim(completion_override_reason)) > 0)
  )
);

CREATE INDEX milestones_project_sequence_idx
  ON milestones (workspace_id, project_id, position);

CREATE INDEX milestones_project_state_idx
  ON milestones (workspace_id, project_id, state, position);

CREATE INDEX milestones_client_visible_idx
  ON milestones (workspace_id, project_id, position)
  WHERE published_at IS NOT NULL;

CREATE UNIQUE INDEX milestones_one_active_per_project_idx
  ON milestones (workspace_id, project_id)
  WHERE state = 'ACTIVE';

-- M10 introduces intentionally deferred Product Outbox intents. Keep registered
-- event-type claims selective even while older unregistered intents accumulate.
CREATE INDEX outbox_claim_event_type_ready_idx
  ON outbox_events (event_type, available_at, created_at)
  WHERE processed_at IS NULL AND failed_at IS NULL;
