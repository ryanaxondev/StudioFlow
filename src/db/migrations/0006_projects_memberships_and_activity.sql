CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  client_organization_id uuid NOT NULL,
  title text NOT NULL,
  client_summary text,
  lifecycle text NOT NULL DEFAULT 'DRAFT',
  planned_start_date date,
  target_completion_date date,
  delivery_manager_user_id uuid NOT NULL REFERENCES users(id),
  client_approver_user_id uuid REFERENCES users(id),
  cancelled_reason_client text,
  cancelled_reason_internal text,
  completed_at timestamptz,
  archived_at timestamptz,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT projects_workspace_id_id_unique UNIQUE (workspace_id, id),
  CONSTRAINT projects_client_workspace_fk
    FOREIGN KEY (workspace_id, client_organization_id)
    REFERENCES client_organizations(workspace_id, id),
  CONSTRAINT projects_title_nonempty_check CHECK (length(trim(title)) > 0),
  CONSTRAINT projects_lifecycle_check CHECK (
    lifecycle IN ('DRAFT', 'ONBOARDING', 'ACTIVE', 'HANDOFF', 'COMPLETED', 'CANCELLED', 'ARCHIVED')
  ),
  CONSTRAINT projects_date_order_check CHECK (
    planned_start_date IS NULL
    OR target_completion_date IS NULL
    OR target_completion_date >= planned_start_date
  ),
  CONSTRAINT projects_row_version_positive_check CHECK (row_version > 0)
);

CREATE INDEX projects_workspace_lifecycle_updated_idx
  ON projects (workspace_id, lifecycle, updated_at DESC);

CREATE INDEX projects_client_organization_idx
  ON projects (workspace_id, client_organization_id, updated_at DESC);

CREATE INDEX projects_delivery_manager_idx
  ON projects (workspace_id, delivery_manager_user_id, updated_at DESC);

CREATE TABLE project_members (
  workspace_id uuid NOT NULL,
  project_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  side text NOT NULL,
  project_role text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at timestamptz,
  CONSTRAINT project_members_pkey PRIMARY KEY (workspace_id, project_id, user_id),
  CONSTRAINT project_members_project_workspace_fk
    FOREIGN KEY (workspace_id, project_id)
    REFERENCES projects(workspace_id, id)
    ON DELETE CASCADE,
  CONSTRAINT project_members_side_check CHECK (side IN ('AGENCY', 'CLIENT')),
  CONSTRAINT project_members_role_check CHECK (
    project_role IN ('DELIVERY_MANAGER', 'AGENCY_MEMBER', 'CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR')
  ),
  CONSTRAINT project_members_side_role_check CHECK (
    (side = 'AGENCY' AND project_role IN ('DELIVERY_MANAGER', 'AGENCY_MEMBER'))
    OR
    (side = 'CLIENT' AND project_role IN ('CLIENT_APPROVER', 'CLIENT_CONTRIBUTOR'))
  ),
  CONSTRAINT project_members_status_check CHECK (status IN ('ACTIVE', 'REVOKED')),
  CONSTRAINT project_members_revocation_state_check CHECK (
    (status = 'ACTIVE' AND revoked_at IS NULL)
    OR (status = 'REVOKED' AND revoked_at IS NOT NULL)
  )
);

CREATE INDEX project_members_active_user_idx
  ON project_members (user_id, workspace_id, project_id)
  WHERE status = 'ACTIVE';

CREATE INDEX project_members_active_project_idx
  ON project_members (workspace_id, project_id, side, project_role)
  WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX project_members_one_delivery_manager_idx
  ON project_members (workspace_id, project_id)
  WHERE status = 'ACTIVE' AND project_role = 'DELIVERY_MANAGER';

CREATE UNIQUE INDEX project_members_one_client_approver_idx
  ON project_members (workspace_id, project_id)
  WHERE status = 'ACTIVE' AND project_role = 'CLIENT_APPROVER';

ALTER TABLE projects
  ADD CONSTRAINT projects_delivery_manager_project_member_fk
  FOREIGN KEY (workspace_id, id, delivery_manager_user_id)
  REFERENCES project_members(workspace_id, project_id, user_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE projects
  ADD CONSTRAINT projects_client_approver_project_member_fk
  FOREIGN KEY (workspace_id, id, client_approver_user_id)
  REFERENCES project_members(workspace_id, project_id, user_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE OR REPLACE FUNCTION studioflow_assert_project_required_memberships()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_workspace_id uuid;
  target_project_id uuid;
  project_row projects%ROWTYPE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_workspace_id := OLD.workspace_id;
    IF TG_TABLE_NAME = 'projects' THEN
      target_project_id := OLD.id;
    ELSE
      target_project_id := OLD.project_id;
    END IF;
  ELSE
    target_workspace_id := NEW.workspace_id;
    IF TG_TABLE_NAME = 'projects' THEN
      target_project_id := NEW.id;
    ELSE
      target_project_id := NEW.project_id;
    END IF;
  END IF;

  SELECT *
    INTO project_row
    FROM projects
   WHERE workspace_id = target_workspace_id
     AND id = target_project_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM project_members member
     WHERE member.workspace_id = project_row.workspace_id
       AND member.project_id = project_row.id
       AND member.user_id = project_row.delivery_manager_user_id
       AND member.side = 'AGENCY'
       AND member.project_role = 'DELIVERY_MANAGER'
       AND member.status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'project delivery manager must be an active DELIVERY_MANAGER project member'
      USING ERRCODE = '23514';
  END IF;

  IF project_row.client_approver_user_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
         FROM project_members member
        WHERE member.workspace_id = project_row.workspace_id
          AND member.project_id = project_row.id
          AND member.user_id = project_row.client_approver_user_id
          AND member.side = 'CLIENT'
          AND member.project_role = 'CLIENT_APPROVER'
          AND member.status = 'ACTIVE'
     ) THEN
    RAISE EXCEPTION 'project client approver must be an active CLIENT_APPROVER project member'
      USING ERRCODE = '23514';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER projects_required_authority_memberships_constraint
AFTER INSERT OR UPDATE ON projects
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION studioflow_assert_project_required_memberships();

CREATE CONSTRAINT TRIGGER project_members_required_authority_memberships_constraint
AFTER INSERT OR UPDATE OR DELETE ON project_members
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION studioflow_assert_project_required_memberships();

CREATE TABLE activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  project_id uuid NOT NULL,
  event_type text NOT NULL,
  visibility text NOT NULL,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_name_snapshot text NOT NULL,
  actor_role_snapshot text,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  summary_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT activity_events_project_workspace_fk
    FOREIGN KEY (workspace_id, project_id)
    REFERENCES projects(workspace_id, id)
    ON DELETE CASCADE,
  CONSTRAINT activity_events_event_type_nonempty_check CHECK (length(trim(event_type)) > 0),
  CONSTRAINT activity_events_visibility_check CHECK (visibility IN ('CLIENT_VISIBLE', 'AGENCY_ONLY')),
  CONSTRAINT activity_events_actor_name_nonempty_check CHECK (length(trim(actor_name_snapshot)) > 0),
  CONSTRAINT activity_events_subject_type_nonempty_check CHECK (length(trim(subject_type)) > 0),
  CONSTRAINT activity_events_summary_key_nonempty_check CHECK (length(trim(summary_key)) > 0),
  CONSTRAINT activity_events_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX activity_events_project_timeline_idx
  ON activity_events (workspace_id, project_id, occurred_at DESC, id DESC);

CREATE INDEX activity_events_client_visible_timeline_idx
  ON activity_events (workspace_id, project_id, occurred_at DESC, id DESC)
  WHERE visibility = 'CLIENT_VISIBLE';

CREATE OR REPLACE FUNCTION studioflow_reject_activity_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE'
     AND current_setting('studioflow.activity_hard_delete_project_id', true) = OLD.project_id::text THEN
    RETURN OLD;
  END IF;

  RAISE EXCEPTION 'activity_events are immutable'
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER activity_events_immutable_trigger
BEFORE UPDATE OR DELETE ON activity_events
FOR EACH ROW
EXECUTE FUNCTION studioflow_reject_activity_event_mutation();
