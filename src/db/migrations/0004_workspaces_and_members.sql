CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  timezone text NOT NULL,
  display_currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT workspaces_name_nonempty_check CHECK (length(trim(name)) > 0),
  CONSTRAINT workspaces_timezone_nonempty_check CHECK (length(trim(timezone)) > 0),
  CONSTRAINT workspaces_display_currency_format_check CHECK (display_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT workspaces_row_version_positive_check CHECK (row_version > 0)
);

CREATE TABLE workspace_branding (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  logo_asset_id uuid,
  requested_accent_hex text,
  applied_accent_hex text,
  accent_contrast_result text,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT workspace_branding_requested_accent_hex_check CHECK (
    requested_accent_hex IS NULL OR requested_accent_hex ~ '^#[0-9A-Fa-f]{6}$'
  ),
  CONSTRAINT workspace_branding_applied_accent_hex_check CHECK (
    applied_accent_hex IS NULL OR applied_accent_hex ~ '^#[0-9A-Fa-f]{6}$'
  )
);

CREATE TABLE workspace_members (
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at timestamptz,
  CONSTRAINT workspace_members_pkey PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT workspace_members_role_check CHECK (
    role IN ('AGENCY_OWNER', 'DELIVERY_MANAGER', 'AGENCY_MEMBER')
  ),
  CONSTRAINT workspace_members_status_check CHECK (
    status IN ('ACTIVE', 'REVOKED')
  ),
  CONSTRAINT workspace_members_revocation_state_check CHECK (
    (status = 'ACTIVE' AND revoked_at IS NULL)
    OR (status = 'REVOKED' AND revoked_at IS NOT NULL)
  )
);

CREATE INDEX workspace_members_user_id_idx
  ON workspace_members (user_id);

CREATE INDEX workspace_members_active_workspace_idx
  ON workspace_members (workspace_id, role)
  WHERE status = 'ACTIVE';

ALTER TABLE outbox_events
  ADD CONSTRAINT outbox_events_workspace_id_workspaces_id_fk
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id);
