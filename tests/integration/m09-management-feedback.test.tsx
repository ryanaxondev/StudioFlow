// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ClientMemberManagement } from "../../src/modules/agency/components/client-member-management";
import { WorkspaceMemberManagement } from "../../src/modules/agency/components/workspace-member-management";
import type { ClientOrganizationDetail } from "../../src/modules/memberships/queries";

const actions = vi.hoisted(() => ({
  createInvitationAction: vi.fn(),
  updateInvitationAction: vi.fn(),
  updateWorkspaceMemberAction: vi.fn(),
  revokeClientMemberAction: vi.fn(),
}));

const router = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("../../src/modules/agency/actions", () => actions);

const workspaceId = "09000000-0000-4000-8000-000000000001";
const clientOrganizationId = "09000000-0000-4000-8000-000000000101";
const mayaId = "09000000-0000-4000-8000-000000001001";
const danielId = "09000000-0000-4000-8000-000000001002";
const elenaId = "09000000-0000-4000-8000-000000001005";

const requiredAuthorityMessage =
  "Reassign required Project authority before changing this membership.";

describe("M09 management feedback placement", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test("Workspace authority failures stay with Active members and reset the rejected role", async () => {
    actions.updateWorkspaceMemberAction.mockResolvedValue({
      ok: false,
      status: "required-project-authority",
    });

    render(
      <WorkspaceMemberManagement
        workspaceId={workspaceId}
        currentUserId={mayaId}
        members={[
          {
            userId: mayaId,
            name: "Maya Chen",
            email: "maya.chen@sableframe.studioflow.local",
            role: "AGENCY_OWNER",
            joinedAt: new Date("2026-03-02T08:10:00.000Z"),
          },
          {
            userId: danielId,
            name: "Daniel Ortiz",
            email: "daniel.ortiz@sableframe.studioflow.local",
            role: "DELIVERY_MANAGER",
            joinedAt: new Date("2026-03-02T08:10:00.000Z"),
          },
        ]}
        invitations={[]}
      />,
    );

    const roleSelect = screen.getByLabelText("Workspace role for Daniel Ortiz");
    fireEvent.change(roleSelect, { target: { value: "AGENCY_MEMBER" } });
    fireEvent.submit(roleSelect.closest("form")!);

    await waitFor(() =>
      expect(actions.updateWorkspaceMemberAction).toHaveBeenCalledTimes(1),
    );

    const membersSection = screen
      .getByRole("heading", { name: "Active members" })
      .closest("section")!;
    const inviteSection = screen
      .getByRole("heading", { name: "Add someone to the workspace" })
      .closest("section")!;

    const warning = within(membersSection).getByText(requiredAuthorityMessage);
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveAttribute("data-tone", "warning");
    expect(
      within(inviteSection).queryByText(requiredAuthorityMessage),
    ).not.toBeInTheDocument();
    expect(roleSelect).toHaveValue("DELIVERY_MANAGER");
  });

  test("Client authority failures stay with Active client team", async () => {
    actions.revokeClientMemberAction.mockResolvedValue({
      ok: false,
      status: "required-project-authority",
    });

    const detail: ClientOrganizationDetail = {
      clientOrganizationId,
      workspaceId,
      name: "Kestrelon",
      status: "ACTIVE",
      members: [
        {
          userId: elenaId,
          name: "Elena Rossi",
          email: "elena.rossi@kestrelon.studioflow.local",
          joinedAt: new Date("2026-03-02T08:10:00.000Z"),
        },
      ],
      invitations: [],
    };

    render(
      <ClientMemberManagement
        workspaceId={workspaceId}
        clientOrganizationId={clientOrganizationId}
        detail={detail}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove access" }));

    await waitFor(() =>
      expect(actions.revokeClientMemberAction).toHaveBeenCalledTimes(1),
    );

    const membersSection = screen
      .getByRole("heading", { name: "Active client team" })
      .closest("section")!;
    const inviteSection = screen
      .getByRole("heading", { name: "Invite a client member" })
      .closest("section")!;

    const warning = within(membersSection).getByText(requiredAuthorityMessage);
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveAttribute("data-tone", "warning");
    expect(
      within(inviteSection).queryByText(requiredAuthorityMessage),
    ).not.toBeInTheDocument();
  });

  test("member feedback clears after the transient status window", async () => {
    vi.useFakeTimers();
    actions.updateWorkspaceMemberAction.mockResolvedValue({
      ok: false,
      status: "required-project-authority",
    });

    render(
      <WorkspaceMemberManagement
        workspaceId={workspaceId}
        currentUserId={mayaId}
        members={[
          {
            userId: mayaId,
            name: "Maya Chen",
            email: "maya.chen@sableframe.studioflow.local",
            role: "AGENCY_OWNER",
            joinedAt: new Date("2026-03-02T08:10:00.000Z"),
          },
          {
            userId: danielId,
            name: "Daniel Ortiz",
            email: "daniel.ortiz@sableframe.studioflow.local",
            role: "DELIVERY_MANAGER",
            joinedAt: new Date("2026-03-02T08:10:00.000Z"),
          },
        ]}
        invitations={[]}
      />,
    );

    const roleSelect = screen.getByLabelText("Workspace role for Daniel Ortiz");

    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: "AGENCY_MEMBER" } });
      fireEvent.submit(roleSelect.closest("form")!);
      await Promise.resolve();
    });

    expect(screen.getByText(requiredAuthorityMessage)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(
      screen.queryByText(requiredAuthorityMessage),
    ).not.toBeInTheDocument();
  });
});
