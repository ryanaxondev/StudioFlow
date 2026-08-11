"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createInvitationAction,
  revokeClientMemberAction,
  updateInvitationAction,
} from "../actions";
import type { ClientOrganizationDetail } from "../../memberships/queries";

export function ClientMemberManagement({
  workspaceId,
  clientOrganizationId,
  detail,
}: Readonly<{
  workspaceId: string;
  clientOrganizationId: string;
  detail: ClientOrganizationDetail;
}>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setStatus("");
    try {
      const result = await createInvitationAction({
        membershipType: "CLIENT_MEMBER",
        workspaceId,
        clientOrganizationId,
        email: String(form.get("email") ?? ""),
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

  async function invitationAction(
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

  async function removeMember(userId: string) {
    setPending(true);
    setStatus("");
    try {
      const result = await revokeClientMemberAction({
        workspaceId,
        clientOrganizationId,
        targetUserId: userId,
      });
      setStatus(
        result.ok
          ? "Client access removed"
          : (result.status ?? "Removal failed"),
      );
      if (result.ok) router.refresh();
    } catch {
      setStatus("Service error");
    } finally {
      setPending(false);
    }
  }

  const archived = detail.status === "ARCHIVED";

  return (
    <div className="management-stack">
      <section
        className="management-panel"
        aria-labelledby="invite-client-member-heading"
      >
        <h2 id="invite-client-member-heading">Add Client Member</h2>
        {archived ? (
          <p className="management-muted">
            Archived Client Organizations are read-only.
          </p>
        ) : (
          <form
            className="management-form management-inline-form"
            onSubmit={invite}
          >
            <label>
              <span>Email</span>
              <input type="email" name="email" required disabled={pending} />
            </label>
            <button
              className="management-primary"
              type="submit"
              disabled={pending}
            >
              Send invitation
            </button>
          </form>
        )}
        <p className="management-status" aria-live="polite">
          {status}
        </p>
      </section>

      <section
        className="management-panel"
        aria-labelledby="client-members-heading"
      >
        <h2 id="client-members-heading">Client members</h2>
        {detail.members.length === 0 ? (
          <p className="management-muted">No active client members.</p>
        ) : null}
        <div className="management-list">
          {detail.members.map((member) => (
            <article className="management-row" key={member.userId}>
              <div>
                <strong>{member.name}</strong>
                <span>{member.email}</span>
              </div>
              {archived ? null : (
                <button
                  className="management-secondary"
                  type="button"
                  disabled={pending}
                  onClick={() => removeMember(member.userId)}
                >
                  Remove access
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        className="management-panel"
        aria-labelledby="client-invitations-heading"
      >
        <h2 id="client-invitations-heading">Invitations</h2>
        {detail.invitations.length === 0 ? (
          <p className="management-muted">No invitations require action.</p>
        ) : null}
        <div className="management-list">
          {detail.invitations.map((invitation) => (
            <article className="management-row" key={invitation.invitationId}>
              <div>
                <strong>{invitation.email}</strong>
                <span>{invitation.status}</span>
              </div>
              {archived ? null : (
                <div className="management-row-actions">
                  <button
                    className="management-secondary"
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      invitationAction(invitation.invitationId, "resend")
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
                        invitationAction(invitation.invitationId, "revoke")
                      }
                    >
                      Revoke
                    </button>
                  ) : null}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
