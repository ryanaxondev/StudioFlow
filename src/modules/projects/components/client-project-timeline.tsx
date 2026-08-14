import Link from "next/link";

import type { ClientMilestoneListItem } from "../../milestones/queries";

function stateLabel(state: ClientMilestoneListItem["state"]): string {
  return state
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "Dates to be confirmed";
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const render = (value: string) =>
    formatter.format(new Date(`${value}T12:00:00.000Z`));
  if (start && end) return `${render(start)} – ${render(end)}`;
  return render(start ?? end!);
}

export function ClientProjectTimeline({
  projectId,
  milestones,
}: Readonly<{
  projectId: string;
  milestones: readonly ClientMilestoneListItem[];
}>) {
  return (
    <ol className="client-milestone-timeline" aria-label="Milestone timeline">
      {milestones.map((milestone) => (
        <li
          key={milestone.milestoneId}
          data-state={milestone.state.toLowerCase()}
        >
          <span className="client-milestone-marker" aria-hidden="true">
            {milestone.ordinal}
          </span>
          <Link
            href={`/portal/projects/${projectId}/milestones/${milestone.milestoneId}`}
          >
            <span className="client-milestone-title-row">
              <strong>{milestone.title}</strong>
              <span>{stateLabel(milestone.state)}</span>
            </span>
            <span className="client-milestone-date-range">
              {formatDateRange(
                milestone.plannedStartDate,
                milestone.plannedEndDate,
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
