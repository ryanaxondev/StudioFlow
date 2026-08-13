// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ProjectCreateForm } from "../../src/modules/projects/components/project-create-form";
import { ProjectGeneralSettings } from "../../src/modules/projects/components/project-general-settings";
import { ProjectLifecyclePanel } from "../../src/modules/projects/components/project-lifecycle-panel";
import type {
  AgencyProjectDetail,
  ProjectCreationCandidates,
  ProjectSettingsCandidates,
} from "../../src/modules/projects/queries";

const actions = vi.hoisted(() => ({
  createDraftProjectAction: vi.fn(),
  updateDraftProjectIdentityAction: vi.fn(),
  reassignDeliveryManagerAction: vi.fn(),
  reassignClientApproverAction: vi.fn(),
  deleteDraftProjectAction: vi.fn(),
}));

const router = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("../../src/modules/projects/actions", () => ({
  ...actions,
  assignProjectMemberAction: vi.fn(),
  removeProjectMemberAction: vi.fn(),
}));

const workspaceId = "09000000-0000-4000-8000-000000000001";
const clientOrganizationId = "09000000-0000-4000-8000-000000000101";
const projectId = "09000000-0000-4000-8000-000000000201";
const danielId = "09000000-0000-4000-8000-000000000003";
const mayaId = "09000000-0000-4000-8000-000000000002";
const elenaId = "09000000-0000-4000-8000-000000000102";
const marcusId = "09000000-0000-4000-8000-000000000103";

const creationCandidates: ProjectCreationCandidates = {
  clients: [
    { clientOrganizationId, name: "Kestrelon" },
    {
      clientOrganizationId: "09000000-0000-4000-8000-000000000111",
      name: "Other Client",
    },
  ],
  deliveryManagers: [
    { userId: mayaId, name: "Maya Chen", workspaceRole: "AGENCY_OWNER" },
    {
      userId: danielId,
      name: "Daniel Ortiz",
      workspaceRole: "DELIVERY_MANAGER",
    },
  ],
};

const detail: AgencyProjectDetail = {
  projectId,
  workspaceId,
  clientOrganizationId,
  clientOrganizationName: "Kestrelon",
  title: "Kestrelon Website Rebuild",
  clientSummary: "A focused website rebuild.",
  lifecycle: "DRAFT",
  plannedStartDate: "2026-03-09",
  targetCompletionDate: "2026-05-29",
  deliveryManagerUserId: danielId,
  deliveryManagerName: "Daniel Ortiz",
  clientApproverUserId: elenaId,
  clientApproverName: "Elena Rossi",
  rowVersion: 1,
  updatedAt: new Date("2026-08-13T18:00:00.000Z"),
  members: [],
};

const settingsCandidates: ProjectSettingsCandidates = {
  agency: [
    { userId: mayaId, name: "Maya Chen", workspaceRole: "AGENCY_OWNER" },
    {
      userId: danielId,
      name: "Daniel Ortiz",
      workspaceRole: "DELIVERY_MANAGER",
    },
  ],
  client: [
    { userId: elenaId, name: "Elena Rossi" },
    { userId: marcusId, name: "Marcus Reed" },
  ],
};

describe("M09 Project product surfaces", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("New Project can arrive from Client Organization Detail with the client preselected", () => {
    render(
      <ProjectCreateForm
        workspaceId={workspaceId}
        candidates={creationCandidates}
        initialClientOrganizationId={clientOrganizationId}
      />,
    );

    expect(screen.getByLabelText("Client organization")).toHaveValue(
      clientOrganizationId,
    );
  });

  test("required authority reassignment waits for explicit confirmation", async () => {
    actions.reassignDeliveryManagerAction.mockResolvedValue({
      ok: true,
      status: "delivery-manager-updated",
      projectId,
      rowVersion: 2,
    });

    render(
      <ProjectGeneralSettings
        detail={detail}
        candidates={settingsCandidates}
      />,
    );

    fireEvent.change(screen.getByLabelText("Delivery manager"), {
      target: { value: mayaId },
    });
    expect(actions.reassignDeliveryManagerAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Confirm manager" }));
    await waitFor(() =>
      expect(actions.reassignDeliveryManagerAction).toHaveBeenCalledTimes(1),
    );
    expect(router.refresh).toHaveBeenCalled();
  });

  test("authority refresh preserves unsaved Project identity fields", async () => {
    actions.reassignClientApproverAction.mockResolvedValue({
      ok: true,
      status: "client-approver-updated",
      projectId,
      rowVersion: 2,
    });

    const { rerender } = render(
      <ProjectGeneralSettings
        detail={detail}
        candidates={settingsCandidates}
      />,
    );

    fireEvent.change(screen.getByLabelText("Client-facing summary"), {
      target: { value: "Unsaved M09 QA summary" },
    });
    fireEvent.change(screen.getByLabelText("Client approver"), {
      target: { value: marcusId },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm approver" }));

    await waitFor(() =>
      expect(actions.reassignClientApproverAction).toHaveBeenCalledTimes(1),
    );

    rerender(
      <ProjectGeneralSettings
        detail={{
          ...detail,
          clientApproverUserId: marcusId,
          clientApproverName: "Marcus Reed",
          rowVersion: 2,
        }}
        candidates={settingsCandidates}
      />,
    );

    expect(screen.getByLabelText("Client-facing summary")).toHaveValue(
      "Unsaved M09 QA summary",
    );
  });

  test("Draft deletion uses an in-product confirmation before the destructive command", async () => {
    actions.deleteDraftProjectAction.mockResolvedValue({
      ok: true,
      status: "deleted",
      projectId,
    });

    render(<ProjectLifecyclePanel detail={detail} workspaceId={workspaceId} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete Draft" }));
    expect(actions.deleteDraftProjectAction).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Delete “Kestrelon Website Rebuild” permanently/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() =>
      expect(actions.deleteDraftProjectAction).toHaveBeenCalledTimes(1),
    );
    expect(router.push).toHaveBeenCalledWith(
      `/agency/projects?workspaceId=${encodeURIComponent(workspaceId)}`,
    );
  });
});
