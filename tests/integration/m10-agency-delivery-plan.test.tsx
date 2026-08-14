// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { MilestoneDetailControls } from "../../src/modules/milestones/components/milestone-detail-controls";
import { MilestonePlanEditor } from "../../src/modules/milestones/components/milestone-plan-editor";
import { AgencyProjectNavigation } from "../../src/modules/projects/components/agency-project-navigation";
import { ProjectGeneralSettings } from "../../src/modules/projects/components/project-general-settings";
import { ProjectPublicationPanel } from "../../src/modules/projects/components/project-publication-panel";
import type { AgencyMilestoneListItem } from "../../src/modules/milestones/queries";
import type {
  AgencyProjectDetail,
  ProjectSettingsCandidates,
} from "../../src/modules/projects/queries";

const milestoneActions = vi.hoisted(() => ({
  createMilestoneDraftAction: vi.fn(),
  reorderMilestonesAction: vi.fn(),
  publishMilestoneAction: vi.fn(),
  publishProjectAction: vi.fn(),
  updateMilestoneDraftAction: vi.fn(),
}));

const projectActions = vi.hoisted(() => ({
  updateDraftProjectIdentityAction: vi.fn(),
  reassignDeliveryManagerAction: vi.fn(),
  reassignClientApproverAction: vi.fn(),
}));

const router = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("../../src/modules/milestones/actions", () => ({
  ...milestoneActions,
  activateMilestoneAction: vi.fn(),
  cancelMilestoneAction: vi.fn(),
  completeMilestoneAction: vi.fn(),
  completeMilestoneWithOverrideAction: vi.fn(),
  moveProjectToActiveAction: vi.fn(),
}));

vi.mock("../../src/modules/projects/actions", () => ({
  ...projectActions,
  assignProjectMemberAction: vi.fn(),
  createDraftProjectAction: vi.fn(),
  deleteDraftProjectAction: vi.fn(),
  removeProjectMemberAction: vi.fn(),
}));

const workspaceId = "09000000-0000-4000-8000-000000000001";
const projectId = "09000000-0000-4000-8000-000000000201";
const clientOrganizationId = "09000000-0000-4000-8000-000000000101";
const danielId = "09000000-0000-4000-8000-000000001002";
const mayaId = "09000000-0000-4000-8000-000000001001";
const elenaId = "09000000-0000-4000-8000-000000001005";

const milestones: readonly AgencyMilestoneListItem[] = [
  {
    milestoneId: "0a000000-0000-4000-8000-000000000001",
    title: "Kickoff & Discovery",
    purpose: "Align the delivery foundation.",
    clientDescription: "Kickoff and discovery.",
    position: 1,
    plannedStartDate: "2026-03-09",
    plannedEndDate: "2026-03-13",
    state: "PLANNED",
    publishedAt: null,
    activatedAt: null,
    completedAt: null,
    cancelledAt: null,
    completionOverrideReason: null,
    rowVersion: 1,
  },
  {
    milestoneId: "0a000000-0000-4000-8000-000000000002",
    title: "Visual Design",
    purpose: "Approve the visual system.",
    clientDescription: "Visual design.",
    position: 2,
    plannedStartDate: "2026-03-16",
    plannedEndDate: "2026-03-27",
    state: "PLANNED",
    publishedAt: null,
    activatedAt: null,
    completedAt: null,
    cancelledAt: null,
    completionOverrideReason: null,
    rowVersion: 1,
  },
];

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
  rowVersion: 4,
  updatedAt: new Date("2026-08-14T10:00:00.000Z"),
  members: [],
};

const candidates: ProjectSettingsCandidates = {
  agency: [
    { userId: mayaId, name: "Maya Chen", workspaceRole: "AGENCY_OWNER" },
    {
      userId: danielId,
      name: "Daniel Ortiz",
      workspaceRole: "DELIVERY_MANAGER",
    },
  ],
  client: [{ userId: elenaId, name: "Elena Rossi" }],
};

describe("M10 Agency delivery plan surfaces", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("Draft Agency contributors get Overview and Delivery Plan without manager-only setup links", () => {
    render(
      <AgencyProjectNavigation
        projectId={projectId}
        workspaceId={workspaceId}
        lifecycle="DRAFT"
        current="overview"
        canManageSettings={false}
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Delivery Plan" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Setup" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Settings" }),
    ).not.toBeInTheDocument();
  });

  test("Project publication requires in-product confirmation", async () => {
    milestoneActions.publishProjectAction.mockResolvedValue({
      ok: true,
      status: "project-published",
      projectId,
      projectRowVersion: 5,
    });

    render(
      <ProjectPublicationPanel
        projectId={projectId}
        workspaceId={workspaceId}
        rowVersion={4}
        checks={[
          { label: "Client-facing summary", complete: true },
          { label: "Target completion", complete: true },
          { label: "Client Approver", complete: true },
          { label: "Milestone plan", complete: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publish Project" }));
    expect(milestoneActions.publishProjectAction).not.toHaveBeenCalled();
    expect(
      screen.getByText("Publish this Project into Onboarding?"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm publication" }),
    );
    await waitFor(() =>
      expect(milestoneActions.publishProjectAction).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId,
          expectedProjectRowVersion: 4,
        }),
      ),
    );
    expect(router.push).toHaveBeenCalledWith(
      `/agency/projects/${projectId}?workspaceId=${encodeURIComponent(workspaceId)}`,
    );
  });

  test("assigned Agency contributors can reorder the Draft sequence", async () => {
    milestoneActions.reorderMilestonesAction.mockResolvedValue({
      ok: true,
      status: "milestones-reordered",
      projectId,
      projectRowVersion: 5,
    });

    render(
      <MilestonePlanEditor
        projectId={projectId}
        workspaceId={workspaceId}
        projectRowVersion={4}
        projectLifecycle="DRAFT"
        milestones={milestones}
        permissions={{
          canEditDraft: true,
          canEditProjectSettings: false,
          canPublishProject: false,
          canPublishMilestone: false,
          canManageLifecycle: false,
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Move Kickoff & Discovery down" }),
    );

    await waitFor(() =>
      expect(milestoneActions.reorderMilestonesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedProjectRowVersion: 4,
          orderedMilestoneIds: [
            milestones[1]!.milestoneId,
            milestones[0]!.milestoneId,
          ],
        }),
      ),
    );
  });

  test("Milestone detail adopts newer aggregate versions without erasing an unsaved Draft edit", async () => {
    milestoneActions.updateMilestoneDraftAction.mockResolvedValue({
      ok: true,
      status: "milestone-saved",
      projectId,
      projectRowVersion: 6,
      milestoneId: milestones[0]!.milestoneId,
      milestoneRowVersion: 3,
    });

    const permissions = {
      canEditDraft: true,
      canEditProjectSettings: true,
      canPublishProject: true,
      canPublishMilestone: false,
      canManageLifecycle: false,
    } as const;
    const { rerender } = render(
      <MilestoneDetailControls
        projectId={projectId}
        projectRowVersion={4}
        projectLifecycle="DRAFT"
        milestone={milestones[0]!}
        permissions={permissions}
      />,
    );

    fireEvent.change(screen.getByLabelText("Milestone title"), {
      target: { value: "Unsaved milestone title" },
    });

    rerender(
      <MilestoneDetailControls
        projectId={projectId}
        projectRowVersion={5}
        projectLifecycle="DRAFT"
        milestone={{ ...milestones[0]!, rowVersion: 2 }}
        permissions={permissions}
      />,
    );

    expect(screen.getByLabelText("Milestone title")).toHaveValue(
      "Unsaved milestone title",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save Milestone Draft" }),
    );

    await waitFor(() =>
      expect(milestoneActions.updateMilestoneDraftAction).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedProjectRowVersion: 5,
          expectedMilestoneRowVersion: 2,
          title: "Unsaved milestone title",
        }),
      ),
    );
  });

  test("external Project row-version refresh does not erase unsaved identity fields", async () => {
    projectActions.updateDraftProjectIdentityAction.mockResolvedValue({
      ok: true,
      status: "saved",
      projectId,
      rowVersion: 6,
    });

    const { rerender } = render(
      <ProjectGeneralSettings detail={detail} candidates={candidates} />,
    );

    fireEvent.change(screen.getByLabelText("Client-facing summary"), {
      target: { value: "Unsaved after Milestone change" },
    });

    rerender(
      <ProjectGeneralSettings
        detail={{ ...detail, rowVersion: 5 }}
        candidates={candidates}
      />,
    );

    expect(screen.getByLabelText("Client-facing summary")).toHaveValue(
      "Unsaved after Milestone change",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save project details" }),
    );

    await waitFor(() =>
      expect(
        projectActions.updateDraftProjectIdentityAction,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ expectedRowVersion: 5 }),
      ),
    );
  });
});
