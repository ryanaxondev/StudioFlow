"use client";

import {
  BuildingsIcon,
  DotsThreeIcon,
  FileTextIcon,
  GearSixIcon,
  SquaresFourIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { StudioFlowMark } from "../brand/studioflow-mark";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { SearchOverlay } from "./search-overlay";

type WorkspaceShellOption = Readonly<{
  workspaceId: string;
  workspaceName: string;
  role: "AGENCY_OWNER" | "DELIVERY_MANAGER" | "AGENCY_MEMBER";
  canViewDelivery: boolean;
  canViewProjects: boolean;
  canViewClients: boolean;
  canManageMembers: boolean;
  defaultPath:
    | "/agency"
    | "/agency/projects"
    | "/agency/clients"
    | "/agency/settings/members";
}>;

function roleLabel(role: WorkspaceShellOption["role"]): string {
  if (role === "AGENCY_OWNER") return "Agency Owner";
  if (role === "DELIVERY_MANAGER") return "Delivery Manager";
  return "Agency Member";
}

function href(path: string, workspaceId: string): string {
  return `${path}?workspaceId=${encodeURIComponent(workspaceId)}`;
}

function current(pathname: string, target: string): "page" | undefined {
  if (target === "/agency") return pathname === target ? "page" : undefined;
  return pathname.startsWith(target) ? "page" : undefined;
}

const primaryLinks = [
  {
    label: "Delivery",
    path: "/agency",
    icon: SquaresFourIcon,
    capability: "canViewDelivery",
  },
  {
    label: "Projects",
    path: "/agency/projects",
    icon: FileTextIcon,
    capability: "canViewProjects",
  },
  {
    label: "Clients",
    path: "/agency/clients",
    icon: BuildingsIcon,
    capability: "canViewClients",
  },
] as const;

function visiblePrimaryLinks(selected: WorkspaceShellOption) {
  return primaryLinks.filter((item) => selected[item.capability]);
}

function SearchForWorkspace({
  compact = false,
  selected,
}: Readonly<{
  compact?: boolean;
  selected: WorkspaceShellOption;
}>) {
  return (
    <SearchOverlay
      compact={compact}
      workspaceId={selected.workspaceId}
      canViewDelivery={selected.canViewDelivery}
      canViewProjects={selected.canViewProjects}
      canViewClients={selected.canViewClients}
      canManageMembers={selected.canManageMembers}
    />
  );
}

function PrimaryNavigation({
  pathname,
  selected,
}: Readonly<{
  pathname: string;
  selected: WorkspaceShellOption;
}>) {
  const visibleLinks = visiblePrimaryLinks(selected);

  return (
    <nav className="agency-context-nav" aria-label="Primary">
      <p className="agency-nav-label">
        {selected.canViewDelivery ? "Delivery" : "Work"}
      </p>
      <div className="agency-nav-group">
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          const active = current(pathname, item.path) === "page";
          return (
            <Link
              className="agency-nav-link"
              aria-current={active ? "page" : undefined}
              href={href(item.path, selected.workspaceId)}
              key={item.path}
            >
              <span className="agency-nav-indicator" aria-hidden="true" />
              <Icon aria-hidden="true" weight={active ? "bold" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {selected.canManageMembers ? (
        <>
          <p className="agency-nav-label agency-nav-label-manage">Manage</p>
          <div className="agency-nav-group">
            <Link
              className="agency-nav-link"
              aria-current={current(pathname, "/agency/settings/members")}
              href={href("/agency/settings/members", selected.workspaceId)}
            >
              <span className="agency-nav-indicator" aria-hidden="true" />
              <GearSixIcon
                aria-hidden="true"
                weight={
                  current(pathname, "/agency/settings/members")
                    ? "bold"
                    : "regular"
                }
              />
              <span>Agency members</span>
            </Link>
          </div>
        </>
      ) : null}
    </nav>
  );
}

function MobilePrimaryNavigation({
  pathname,
  selected,
}: Readonly<{
  pathname: string;
  selected: WorkspaceShellOption;
}>) {
  const visibleLinks = visiblePrimaryLinks(selected);

  return (
    <nav className="agency-mobile-bottom-nav" aria-label="Primary mobile">
      {visibleLinks.map((item) => {
        const Icon = item.icon;
        const active = current(pathname, item.path) === "page";
        return (
          <Link
            className="agency-mobile-bottom-link"
            aria-current={active ? "page" : undefined}
            href={href(item.path, selected.workspaceId)}
            key={item.path}
          >
            <Icon aria-hidden="true" weight={active ? "bold" : "regular"} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="agency-mobile-bottom-link"
            type="button"
            aria-label="Open navigation"
          >
            <DotsThreeIcon aria-hidden="true" weight="bold" />
            <span>More</span>
          </button>
        </SheetTrigger>
        <SheetContent
          className="agency-mobile-more-sheet"
          side="right"
          title="StudioFlow navigation"
          description={`${selected.workspaceName} · ${roleLabel(selected.role)}`}
        >
          <div className="agency-mobile-more-context">
            <StudioFlowMark />
            <div>
              <strong>{selected.workspaceName}</strong>
              <span>{roleLabel(selected.role)}</span>
            </div>
          </div>
          <nav
            className="agency-mobile-more-links"
            aria-label="More navigation"
          >
            {selected.canManageMembers ? (
              <Link
                href={href("/agency/settings/members", selected.workspaceId)}
              >
                <GearSixIcon aria-hidden="true" />
                <span>Agency members</span>
              </Link>
            ) : null}
            <Link href="/account">
              <UserCircleIcon aria-hidden="true" />
              <span>Account</span>
            </Link>
          </nav>
          <div className="agency-mobile-more-search">
            <SearchForWorkspace selected={selected} />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

export function AgencyShell({
  workspaces,
  children,
}: Readonly<{
  workspaces: readonly WorkspaceShellOption[];
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedWorkspaceId = searchParams.get("workspaceId");
  const selected =
    workspaces.find(
      (workspace) => workspace.workspaceId === requestedWorkspaceId,
    ) ?? workspaces[0];

  if (!selected) return children;

  const currentLabel = pathname.startsWith("/agency/settings/members")
    ? "Agency members"
    : (primaryLinks.find((link) => current(pathname, link.path))?.label ??
      "Workspace");

  return (
    <div className="agency-shell agency-shell-obsidian">
      <aside
        className="agency-brand-rail"
        aria-label="StudioFlow workspace rail"
      >
        <Link
          className="agency-rail-brand"
          href={href(selected.defaultPath, selected.workspaceId)}
          aria-label="StudioFlow"
        >
          <StudioFlowMark />
        </Link>
        <div className="agency-rail-workspaces" aria-label="Workspaces">
          <span
            className="agency-rail-workspace"
            data-active="true"
            title={selected.workspaceName}
          >
            {selected.workspaceName.slice(0, 1).toUpperCase()}
          </span>
        </div>
        <div className="agency-rail-spacer" />
        <Link
          className="agency-rail-account"
          href="/account"
          aria-label="Account"
        >
          <UserCircleIcon aria-hidden="true" />
        </Link>
      </aside>

      <aside className="agency-context-sidebar" aria-label="Agency navigation">
        <div className="agency-context-head">
          <span className="agency-context-kicker">Workspace</span>
          <strong>{selected.workspaceName}</strong>
          <span>{roleLabel(selected.role)}</span>
        </div>
        <PrimaryNavigation pathname={pathname} selected={selected} />
        <div className="agency-context-spacer" />
        <div className="agency-context-footer">
          <span className="agency-context-status-dot" aria-hidden="true" />
          <span>Operational workspace</span>
        </div>
      </aside>

      <header className="agency-context-bar">
        <div className="agency-context-crumbs" aria-label="Current context">
          <span>{selected.workspaceName}</span>
          <span aria-hidden="true">/</span>
          <strong>{currentLabel}</strong>
        </div>
        <div className="agency-context-actions">
          <SearchForWorkspace compact selected={selected} />
        </div>
      </header>

      <header className="agency-mobile-topbar">
        <div className="agency-mobile-brand">
          <StudioFlowMark />
          <div>
            <strong>{selected.workspaceName}</strong>
            <span>{currentLabel}</span>
          </div>
        </div>
        <SearchForWorkspace compact selected={selected} />
      </header>

      <div className="agency-main">{children}</div>
      <MobilePrimaryNavigation pathname={pathname} selected={selected} />
    </div>
  );
}
