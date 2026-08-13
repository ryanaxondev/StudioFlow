"use client";

import {
  PaperPlaneTiltIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createInvitationAction,
  updateInvitationAction,
  updateWorkspaceMemberAction,
} from "../actions";
import type {
  ManageableInvitationListItem,
  WorkspaceMemberListItem,
} from "../../memberships/queries";

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function WorkspaceMemberManagement({
  workspaceId,
  currentUserId,
  members,
  invitations,
}: Readonly<{
  workspaceId: string;
  currentUserId: string;
  members: readonly WorkspaceMemberListItem[];
  invitations: readonly ManageableInvitationListItem[];
}>) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setStatus("");

    try {
      const result = await createInvitationAction({
        membershipType: "WORKSPACE_MEMBER",
        workspaceId,
        email: String(form.get("email") ?? ""),
        role: String(form.get("role") ?? "AGENCY_MEMBER"),
      });
      if (!result.ok) {
        setStatus(result.status ?? "Invite failed");
        return;
      }
      formElement.reset();
      setStatus("Invitation sent");
      router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  async function updateInvitation(
    invitationId: string,
    action: "resend" | "revoke",
  ) {
    setPending(true);
    setStatus("");
    try {
      const result = await updateInvitationAction({ invitationId, action });
      setStatus(
        result.ok
          ? action === "resend"
            ? "Invitation resent"
            : "Invitation revoked"
          : (result.status ?? "Update failed"),
      );
      if (result.ok) router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  async function changeRole(
    event: React.FormEvent<HTMLFormElement>,
    userId: string,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("");

    try {
      const result = await updateWorkspaceMemberAction({
        workspaceId,
        targetUserId: userId,
        action: "change-role",
        role: String(form.get("role") ?? ""),
      });
      setStatus(
        result.ok
          ? "Workspace role updated"
          : (result.status ?? "Role update failed"),
      );
      if (result.ok) router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  async function removeMember(userId: string) {
    setPending(true);
    setStatus("");
    try {
      const result = await updateWorkspaceMemberAction({
        workspaceId,
        targetUserId: userId,
        action: "revoke",
      });
      setStatus(
        result.ok ? "Access removed" : (result.status ?? "Removal failed"),
      );
      if (result.ok) router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ops-member-management">
      <section
        className="ops-management-compose"
        aria-labelledby="invite-agency-member-heading"
      >
        <div className="ops-management-compose-copy">
          <span className="ops-management-icon" aria-hidden="true">
            <UserPlusIcon weight="regular" />
          </span>
          <div>
            <p className="ops-section-label">Invite</p>
            <h2 id="invite-agency-member-heading">
              Add someone to the workspace
            </h2>
            <p>
              Invite an existing teammate and assign the right operational role.
            </p>
          </div>
        </div>
        <form
          className="ops-management-form ops-management-form-invite"
          onSubmit={invite}
        >
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="name@agency.com"
              required
              disabled={pending}
            />
          </label>
          <label>
            <span>Role</span>
            <select name="role" defaultValue="AGENCY_MEMBER" disabled={pending}>
              <option value="AGENCY_MEMBER">Agency Member</option>
              <option value="DELIVERY_MANAGER">Delivery Manager</option>
              <option value="AGENCY_OWNER">Agency Owner</option>
            </select>
          </label>
          <button
            className="ops-primary-action"
            type="submit"
            disabled={pending}
          >
            Invite member
          </button>
        </form>
        <p className="ops-management-status" aria-live="polite">
          {status}
        </p>
      </section>

      <section
        className="ops-management-section"
        aria-labelledby="agency-members-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div className="ops-management-heading-copy">
            <UsersThreeIcon aria-hidden="true" />
            <div>
              <p className="ops-section-label">People</p>
              <h2 id="agency-members-heading">Active members</h2>
            </div>
          </div>
          <span className="ops-section-meta">{members.length} active</span>
        </div>

        <div className="ops-people-table" aria-label="Agency members">
          <div className="ops-people-row ops-people-header">
            <span>Member</span>
            <span>Role</span>
            <span>Access</span>
          </div>
          {members.map((member) => (
            <article className="ops-people-row" key={member.userId}>
              <div className="ops-person-identity">
                <span className="ops-person-avatar" aria-hidden="true">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
              </div>

              <div className="ops-person-role">
                {member.userId === currentUserId ? (
                  <span className="ops-role-chip">
                    {roleLabel(member.role)}
                  </span>
                ) : (
                  <form
                    className="ops-role-form"
                    onSubmit={(event) => changeRole(event, member.userId)}
                  >
                    <select
                      aria-label={`Workspace role for ${member.name}`}
                      name="role"
                      defaultValue={member.role}
                      disabled={pending}
                    >
                      <option value="AGENCY_MEMBER">Agency Member</option>
                      <option value="DELIVERY_MANAGER">Delivery Manager</option>
                      <option value="AGENCY_OWNER">Agency Owner</option>
                    </select>
                    <button
                      className="ops-quiet-action"
                      type="submit"
                      disabled={pending}
                    >
                      Save
                    </button>
                  </form>
                )}
              </div>

              <div className="ops-person-access">
                {member.userId === currentUserId ? (
                  <span className="ops-current-account">
                    <ShieldCheckIcon aria-hidden="true" weight="fill" />
                    Current account
                  </span>
                ) : (
                  <button
                    className="ops-danger-quiet-action"
                    type="button"
                    disabled={pending}
                    onClick={() => removeMember(member.userId)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="ops-management-section"
        aria-labelledby="agency-invitations-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div className="ops-management-heading-copy">
            <PaperPlaneTiltIcon aria-hidden="true" />
            <div>
              <p className="ops-section-label">Access queue</p>
              <h2 id="agency-invitations-heading">Pending invitations</h2>
            </div>
          </div>
          <span className="ops-section-meta">
            {invitations.length} in queue
          </span>
        </div>

        {invitations.length === 0 ? (
          <div className="ops-inline-empty">
            <span className="ops-inline-empty-dot" aria-hidden="true" />
            <div>
              <strong>No invitations need attention</strong>
              <span>
                New workspace invitations will appear here until they are
                accepted or revoked.
              </span>
            </div>
          </div>
        ) : (
          <div className="ops-invitation-list">
            {invitations.map((invitation) => (
              <article
                className="ops-invitation-row"
                key={invitation.invitationId}
              >
                <div>
                  <strong>{invitation.email}</strong>
                  <span>
                    {roleLabel(invitation.intendedRole ?? "AGENCY_MEMBER")}
                  </span>
                </div>
                <span
                  className="ops-status-chip"
                  data-tone={
                    invitation.status === "PENDING" ? "waiting" : "neutral"
                  }
                >
                  {invitation.status === "PENDING" ? "Pending" : "Expired"}
                </span>
                <div className="ops-invitation-actions">
                  <button
                    className="ops-quiet-action"
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      updateInvitation(invitation.invitationId, "resend")
                    }
                  >
                    Resend
                  </button>
                  {invitation.status === "PENDING" ? (
                    <button
                      className="ops-danger-quiet-action"
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        updateInvitation(invitation.invitationId, "revoke")
                      }
                    >
                      Revoke
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
