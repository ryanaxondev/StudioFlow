import Link from "next/link";

import type { ProjectLifecycle } from "../../../db/schema";

export function AgencyProjectNavigation({
  projectId,
  workspaceId,
  lifecycle,
  current,
  canManageSettings,
}: Readonly<{
  projectId: string;
  workspaceId: string;
  lifecycle: ProjectLifecycle;
  current: "overview" | "setup" | "delivery" | "settings";
  canManageSettings: boolean;
}>) {
  const suffix = `?workspaceId=${encodeURIComponent(workspaceId)}`;
  const links: {
    key: "overview" | "setup" | "delivery" | "settings";
    label: string;
    href: string;
  }[] = [];

  if (lifecycle === "DRAFT" && canManageSettings) {
    links.push({
      key: "setup",
      label: "Setup",
      href: `/agency/projects/${projectId}/setup${suffix}`,
    });
  } else {
    links.push({
      key: "overview",
      label: "Overview",
      href: `/agency/projects/${projectId}${suffix}`,
    });
  }

  links.push({
    key: "delivery",
    label: "Delivery Plan",
    href: `/agency/projects/${projectId}/delivery${suffix}`,
  });

  if (canManageSettings) {
    links.push({
      key: "settings",
      label: "Settings",
      href: `/agency/projects/${projectId}/settings${suffix}`,
    });
  }

  return (
    <nav className="ops-project-settings-nav" aria-label="Project navigation">
      {links.map((link) => (
        <Link
          aria-current={current === link.key ? "page" : undefined}
          href={link.href}
          key={link.key}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
