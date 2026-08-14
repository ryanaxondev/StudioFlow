// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import type { ClientMilestoneListItem } from "../../src/modules/milestones/queries";
import { ClientProjectNavigation } from "../../src/modules/projects/components/client-project-navigation";
import { ClientProjectTimeline } from "../../src/modules/projects/components/client-project-timeline";

const projectId = "09000000-0000-4000-8000-000000000201";
const publishedMilestones: readonly ClientMilestoneListItem[] = [
  {
    milestoneId: "0a000000-0000-4000-8000-000000000001",
    title: "Kickoff & Discovery",
    purpose: "Align the delivery foundation.",
    clientDescription: "Kickoff and discovery.",
    ordinal: 1,
    plannedStartDate: "2026-03-02",
    plannedEndDate: "2026-03-13",
    state: "ACTIVE",
    activatedAt: new Date("2026-03-02T09:15:00.000Z"),
    completedAt: null,
    cancelledAt: null,
  },
  {
    milestoneId: "0a000000-0000-4000-8000-000000000002",
    title: "Visual Design",
    purpose: "Approve the visual system.",
    clientDescription: "Visual design.",
    ordinal: 2,
    plannedStartDate: "2026-03-30",
    plannedEndDate: "2026-04-17",
    state: "PLANNED",
    activatedAt: null,
    completedAt: null,
    cancelledAt: null,
  },
];

describe("M10 Client published slice", () => {
  afterEach(cleanup);

  test("Client Project navigation keeps later-owned destinations non-interactive until their screens exist", () => {
    render(
      <ClientProjectNavigation projectId={projectId} current="overview" />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Project navigation",
    });
    expect(
      within(navigation).getByRole("link", { name: "Overview" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).queryByRole("link", { name: "Deliverables" }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).queryByRole("link", { name: "Activity" }),
    ).not.toBeInTheDocument();
    expect(within(navigation).getByText("Deliverables")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(within(navigation).getByText("Activity")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("published Milestone timeline uses client ordinals and contextual detail routes", () => {
    render(
      <ClientProjectTimeline
        projectId={projectId}
        milestones={publishedMilestones}
      />,
    );

    const timeline = screen.getByRole("list", { name: "Milestone timeline" });
    expect(within(timeline).getByText("1")).toBeInTheDocument();
    expect(within(timeline).getByText("2")).toBeInTheDocument();
    expect(
      within(timeline).getByRole("link", { name: /Kickoff & Discovery/ }),
    ).toHaveAttribute(
      "href",
      `/portal/projects/${projectId}/milestones/${publishedMilestones[0]!.milestoneId}`,
    );
    expect(within(timeline).getByText("Active")).toBeInTheDocument();
    expect(within(timeline).getByText("Planned")).toBeInTheDocument();
  });
});
