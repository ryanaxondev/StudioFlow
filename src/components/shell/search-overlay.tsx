"use client";

import {
  BuildingsIcon,
  ClockIcon,
  FileTextIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { KeyboardEvent } from "react";

import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

function workspaceHref(path: string, workspaceId?: string): string {
  return workspaceId
    ? `${path}?workspaceId=${encodeURIComponent(workspaceId)}`
    : path;
}

function focusFirstAction(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "ArrowDown") return;
  const dialog = event.currentTarget.closest(".ops-command-dialog");
  const firstAction = dialog?.querySelector<HTMLAnchorElement>(
    ".command-action-row",
  );
  if (!firstAction) return;
  event.preventDefault();
  firstAction.focus();
}

function moveActionFocus(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

  const dialog = event.currentTarget.closest(".ops-command-dialog");
  if (!dialog) return;

  const actions = Array.from(
    dialog.querySelectorAll<HTMLAnchorElement>(".command-action-row"),
  );
  const currentIndex = actions.indexOf(event.currentTarget);
  if (currentIndex < 0) return;

  event.preventDefault();

  if (event.key === "ArrowUp" && currentIndex === 0) {
    dialog
      .querySelector<HTMLInputElement>(".command-search-field input")
      ?.focus();
    return;
  }

  const nextIndex =
    event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
  actions[Math.max(0, Math.min(actions.length - 1, nextIndex))]?.focus();
}

export function SearchOverlay({
  compact = false,
  workspaceId,
  canViewDelivery = false,
  canViewProjects = false,
  canViewClients = false,
  canManageMembers = false,
}: Readonly<{
  compact?: boolean;
  workspaceId?: string;
  canViewDelivery?: boolean;
  canViewProjects?: boolean;
  canViewClients?: boolean;
  canManageMembers?: boolean;
}>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="agency-search-trigger"
          type="button"
          aria-label="Search StudioFlow"
        >
          <MagnifyingGlassIcon aria-hidden="true" weight="regular" />
          {compact ? (
            <>
              <span className="agency-search-trigger-label">Search</span>
              <kbd>⌘ K</kbd>
            </>
          ) : (
            <span>Search StudioFlow</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className="ops-command-dialog"
        title="Search StudioFlow"
        description="Search workspace actions and recently opened work."
      >
        <div className="command-search-field">
          <MagnifyingGlassIcon aria-hidden="true" weight="regular" />
          <Input
            autoFocus
            aria-label="Search StudioFlow"
            placeholder="Search workspace…"
            onKeyDown={focusFirstAction}
          />
          <kbd>⌘ K</kbd>
        </div>

        <div className="command-groups" aria-label="Search result groups">
          <section className="command-group">
            <div className="command-group-heading">
              <span>Recent</span>
            </div>
            <div className="command-empty-row">
              <ClockIcon aria-hidden="true" weight="regular" />
              <div>
                <strong>No recent items</strong>
                <span>Your recently opened work will appear here.</span>
              </div>
            </div>
          </section>

          <section className="command-group">
            <div className="command-group-heading">
              <span>Quick actions</span>
            </div>
            <div className="command-action-list">
              {canViewDelivery ? (
                <Link
                  className="command-action-row"
                  href={workspaceHref("/agency", workspaceId)}
                  onKeyDown={moveActionFocus}
                >
                  <span className="command-action-icon">
                    <SquaresFourIcon aria-hidden="true" weight="regular" />
                  </span>
                  <span className="command-action-copy">
                    <strong>Open delivery</strong>
                    <small>Operational health</small>
                  </span>
                  <span className="command-action-type">Delivery</span>
                </Link>
              ) : null}
              {canViewProjects ? (
                <Link
                  className="command-action-row"
                  href={workspaceHref("/agency/projects", workspaceId)}
                  onKeyDown={moveActionFocus}
                >
                  <span className="command-action-icon">
                    <FileTextIcon aria-hidden="true" weight="regular" />
                  </span>
                  <span className="command-action-copy">
                    <strong>Open projects</strong>
                    <small>Assigned delivery work</small>
                  </span>
                  <span className="command-action-type">Project</span>
                </Link>
              ) : null}
              {canViewClients ? (
                <Link
                  className="command-action-row"
                  href={workspaceHref("/agency/clients", workspaceId)}
                  onKeyDown={moveActionFocus}
                >
                  <span className="command-action-icon">
                    <BuildingsIcon aria-hidden="true" weight="regular" />
                  </span>
                  <span className="command-action-copy">
                    <strong>Open clients</strong>
                    <small>Client organizations</small>
                  </span>
                  <span className="command-action-type">Client</span>
                </Link>
              ) : null}
              {canManageMembers ? (
                <Link
                  className="command-action-row"
                  href={workspaceHref("/agency/settings/members", workspaceId)}
                  onKeyDown={moveActionFocus}
                >
                  <span className="command-action-icon">
                    <GearSixIcon aria-hidden="true" weight="regular" />
                  </span>
                  <span className="command-action-copy">
                    <strong>Manage agency members</strong>
                    <small>Roles and workspace access</small>
                  </span>
                  <span className="command-action-type">Admin</span>
                </Link>
              ) : null}
            </div>
          </section>
        </div>

        <div className="command-footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>esc</kbd> Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
