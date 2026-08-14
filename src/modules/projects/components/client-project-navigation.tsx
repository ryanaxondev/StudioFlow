import Link from "next/link";

export function ClientProjectNavigation({
  projectId,
  current,
}: Readonly<{
  projectId: string;
  current: "overview" | "context";
}>) {
  return (
    <nav className="client-project-navigation" aria-label="Project navigation">
      <Link
        aria-current={current === "overview" ? "page" : undefined}
        href={`/portal/projects/${projectId}`}
      >
        Overview
      </Link>
      <span aria-disabled="true">Deliverables</span>
      <span aria-disabled="true">Activity</span>
    </nav>
  );
}
