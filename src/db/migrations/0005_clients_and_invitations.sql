CREATE TABLE client_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  row_version integer NOT NULL DEFAULT 1,
  CONSTRAINT client_organizations_workspace_id_id_unique UNIQUE (workspace_id, id),
  CONSTRAINT client_organizations_name_nonempty_check CHECK (length(trim(name)) > 0),
  CONSTRAINT client_organizations_status_check CHECK (
    status IN ('ACTIVE', 'ARCHIVED')
  ),
  CONSTRAINT client_organizations_row_version_positive_check CHECK (row_version > 0)
);

CREATE INDEX client_organizations_workspace_id_idx
  ON client_organizations (workspace_id);

CREATE TABLE client_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  client_organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'ACTIVE',
  joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at timestamptz,
  CONSTRAINT client_members_client_workspace_fk
    FOREIGN KEY (workspace_id, client_organization_id)
    REFERENCES client_organizations(workspace_id, id),
  CONSTRAINT client_members_client_user_unique UNIQUE (client_organization_id, user_id),
  CONSTRAINT client_members_status_check CHECK (
    status IN ('ACTIVE', 'REVOKED')
  ),
  CONSTRAINT client_members_revocation_state_check CHECK (
    (status = 'ACTIVE' AND revoked_at IS NULL)
    OR (status = 'REVOKED' AND revoked_at IS NOT NULL)
  )
);

CREATE INDEX client_members_user_id_idx
  ON client_members (user_id);

CREATE INDEX client_members_active_workspace_idx
  ON client_members (workspace_id, client_organization_id)
  WHERE status = 'ACTIVE';

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  client_organization_id uuid,
  email_normalized text NOT NULL,
  membership_type text NOT NULL,
  intended_role text,
  token_hash text NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  CONSTRAINT invitations_client_workspace_fk
    FOREIGN KEY (workspace_id, client_organization_id)
    REFERENCES client_organizations(workspace_id, id),
  CONSTRAINT invitations_email_normalized_check CHECK (
    email_normalized = lower(trim(email_normalized))
  ),
  CONSTRAINT invitations_membership_type_check CHECK (
    membership_type IN ('WORKSPACE_MEMBER', 'CLIENT_MEMBER')
  ),
  CONSTRAINT invitations_target_shape_check CHECK (
    (
      membership_type = 'WORKSPACE_MEMBER'
      AND client_organization_id IS NULL
      AND intended_role IS NOT NULL
      AND intended_role IN ('AGENCY_OWNER', 'DELIVERY_MANAGER', 'AGENCY_MEMBER')
    )
    OR
    (
      membership_type = 'CLIENT_MEMBER'
      AND client_organization_id IS NOT NULL
      AND intended_role IS NULL
    )
  ),
  CONSTRAINT invitations_token_hash_format_check CHECK (
    token_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT invitations_expires_after_created_check CHECK (expires_at > created_at),
  CONSTRAINT invitations_terminal_state_check CHECK (
    NOT (accepted_at IS NOT NULL AND revoked_at IS NOT NULL)
  ),
  CONSTRAINT invitations_accepted_after_created_check CHECK (
    accepted_at IS NULL OR accepted_at >= created_at
  ),
  CONSTRAINT invitations_revoked_after_created_check CHECK (
    revoked_at IS NULL OR revoked_at >= created_at
  )
);

CREATE UNIQUE INDEX invitations_token_hash_unique
  ON invitations (token_hash);

CREATE INDEX invitations_workspace_lookup_idx
  ON invitations (workspace_id, membership_type, email_normalized, created_at DESC);

CREATE INDEX invitations_client_lookup_idx
  ON invitations (client_organization_id, email_normalized, created_at DESC)
  WHERE client_organization_id IS NOT NULL;

CREATE INDEX invitations_pending_lookup_idx
  ON invitations (workspace_id, email_normalized, expires_at)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
