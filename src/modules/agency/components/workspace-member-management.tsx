"use client";

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
    <div className="management-stack">
      <section
        className="management-panel"
        aria-labelledby="invite-agency-member-heading"
      >
        <h2 id="invite-agency-member-heading">Invite an Agency Member</h2>
        <form className="management-form" onSubmit={invite}>
          <label>
            <span>Email</span>
            <input type="email" name="email" required disabled={pending} />
          </label>
          <label>
            <span>Workspace role</span>
            <select name="role" defaultValue="AGENCY_MEMBER" disabled={pending}>
              <option value="AGENCY_MEMBER">Agency Member</option>
              <option value="DELIVERY_MANAGER">Delivery Manager</option>
              <option value="AGENCY_OWNER">Agency Owner</option>
            </select>
          </label>
          <button
            className="management-primary"
            type="submit"
            disabled={pending}
          >
            Invite member
          </button>
        </form>
        <p className="management-status" aria-live="polite">
          {status}
        </p>
      </section>

      <section
        className="management-panel"
        aria-labelledby="agency-members-heading"
      >
        <h2 id="agency-members-heading">Active members</h2>
        <div className="management-list">
          {members.map((member) => (
            <article className="management-row" key={member.userId}>
              <div>
                <strong>{member.name}</strong>
                <span>{member.email}</span>
                <span>{member.role.replaceAll("_", " ")}</span>
              </div>
              {member.userId === currentUserId ? (
                <span className="management-muted">Current account</span>
              ) : (
                <div className="management-row-actions">
                  <form
                    className="management-role-form"
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
                      className="management-secondary"
                      type="submit"
                      disabled={pending}
                    >
                      Change role
                    </button>
                  </form>
                  <button
                    className="management-secondary"
                    type="button"
                    disabled={pending}
                    onClick={() => removeMember(member.userId)}
                  >
                    Remove access
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        className="management-panel"
        aria-labelledby="agency-invitations-heading"
      >
        <h2 id="agency-invitations-heading">Invitations</h2>
        {invitations.length === 0 ? (
          <p className="management-muted">No invitations require action.</p>
        ) : null}
        <div className="management-list">
          {invitations.map((invitation) => (
            <article className="management-row" key={invitation.invitationId}>
              <div>
                <strong>{invitation.email}</strong>
                <span>
                  {invitation.intendedRole?.replaceAll("_", " ")} ·{" "}
                  {invitation.status}
                </span>
              </div>
              <div className="management-row-actions">
                <button
                  className="management-secondary"
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
                    className="management-secondary"
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
      </section>
    </div>
  );
}
