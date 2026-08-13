"use client";

import {
  PaperPlaneTiltIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
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
    <div className="ops-client-member-management" id="access">
      <section
        className="ops-management-compose"
        aria-labelledby="invite-client-member-heading"
      >
        <div className="ops-management-compose-copy">
          <span className="ops-management-icon" aria-hidden="true">
            <UserPlusIcon weight="regular" />
          </span>
          <div>
            <p className="ops-section-label">Client access</p>
            <h3 id="invite-client-member-heading">Invite a client member</h3>
            <p>Give a client secure access to this organization context.</p>
          </div>
        </div>

        {archived ? (
          <div className="ops-readonly-note">
            <strong>Archived organization</strong>
            <span>
              Client access is read-only while this organization is archived.
            </span>
          </div>
        ) : (
          <form
            className="ops-management-form ops-management-form-client"
            onSubmit={invite}
          >
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="client@company.com"
                required
                disabled={pending}
              />
            </label>
            <button
              className="ops-primary-action"
              type="submit"
              disabled={pending}
            >
              Send invitation
            </button>
          </form>
        )}

        <p className="ops-management-status" aria-live="polite">
          {status}
        </p>
      </section>

      <section
        className="ops-management-section"
        aria-labelledby="client-members-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div className="ops-management-heading-copy">
            <UsersThreeIcon aria-hidden="true" />
            <div>
              <p className="ops-section-label">Members</p>
              <h3 id="client-members-heading">Active client team</h3>
            </div>
          </div>
          <span className="ops-section-meta">
            {detail.members.length} active
          </span>
        </div>

        {detail.members.length === 0 ? (
          <div className="ops-inline-empty">
            <span className="ops-inline-empty-dot" aria-hidden="true" />
            <div>
              <strong>No active client members</strong>
              <span>
                Accepted invitations will become active client access here.
              </span>
            </div>
          </div>
        ) : (
          <div className="ops-client-member-list">
            {detail.members.map((member) => (
              <article className="ops-client-member-row" key={member.userId}>
                <div className="ops-person-identity">
                  <span className="ops-person-avatar" aria-hidden="true">
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                  </div>
                </div>
                {archived ? (
                  <span className="ops-status-chip" data-tone="neutral">
                    Read only
                  </span>
                ) : (
                  <button
                    className="ops-danger-quiet-action"
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
        )}
      </section>

      <section
        className="ops-management-section"
        aria-labelledby="client-invitations-heading"
      >
        <div className="ops-section-heading ops-collection-heading">
          <div className="ops-management-heading-copy">
            <PaperPlaneTiltIcon aria-hidden="true" />
            <div>
              <p className="ops-section-label">Invitations</p>
              <h3 id="client-invitations-heading">Access invitations</h3>
            </div>
          </div>
          <span className="ops-section-meta">
            {detail.invitations.length} in queue
          </span>
        </div>

        {detail.invitations.length === 0 ? (
          <div className="ops-inline-empty">
            <span className="ops-inline-empty-dot" aria-hidden="true" />
            <div>
              <strong>No invitations need attention</strong>
              <span>
                Pending client invitations will stay visible until they resolve.
              </span>
            </div>
          </div>
        ) : (
          <div className="ops-invitation-list">
            {detail.invitations.map((invitation) => (
              <article
                className="ops-invitation-row"
                key={invitation.invitationId}
              >
                <div>
                  <strong>{invitation.email}</strong>
                  <span>Client member</span>
                </div>
                <span
                  className="ops-status-chip"
                  data-tone={
                    invitation.status === "PENDING" ? "waiting" : "neutral"
                  }
                >
                  {invitation.status === "PENDING" ? "Pending" : "Expired"}
                </span>
                {archived ? null : (
                  <div className="ops-invitation-actions">
                    <button
                      className="ops-quiet-action"
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
                        className="ops-danger-quiet-action"
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
        )}
      </section>
    </div>
  );
}
