"use client";

import {
  FolderOpenIcon,
  HouseIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { StudioFlowMark } from "../brand/studioflow-mark";

function blendHex(hex: string, target: number, ratio: number): string {
  const normalized = hex.slice(1);
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16),
  );
  return `#${channels
    .map((channel) =>
      Math.round(channel * (1 - ratio) + target * ratio)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientShell({
  agencyName,
  clientOrganizationName,
  accentHex,
  children,
}: Readonly<{
  agencyName: string;
  clientOrganizationName?: string;
  accentHex?: string | null;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const style = accentHex
    ? ({
        "--client-accent": accentHex,
        "--client-accent-soft": blendHex(accentHex, 15, 0.74),
        "--client-accent-bright": blendHex(accentHex, 255, 0.28),
      } as CSSProperties)
    : undefined;

  return (
    <div className="client-shell client-shell-obsidian" style={style}>
      <header className="client-header">
        <div className="client-header-inner">
          <Link className="client-brand" href="/portal">
            <span className="client-brand-mark" aria-hidden="true">
              {initials(agencyName) || "SF"}
            </span>
            <span className="client-brand-copy">
              <strong>{agencyName}</strong>
              <span>{clientOrganizationName ?? "Client workspace"}</span>
            </span>
          </Link>

          <nav className="client-global-nav" aria-label="Client Portal">
            <Link
              aria-current={pathname === "/portal" ? "page" : undefined}
              href="/portal"
            >
              <HouseIcon aria-hidden="true" weight="regular" />
              <span>Home</span>
            </Link>
            <Link
              aria-current={
                pathname.startsWith("/portal/projects") ? "page" : undefined
              }
              href="/portal/projects"
            >
              <FolderOpenIcon aria-hidden="true" weight="regular" />
              <span>Projects</span>
            </Link>
          </nav>

          <span className="client-header-spacer" />
          <Link className="client-account-link" href="/account">
            <UserCircleIcon aria-hidden="true" weight="regular" />
            <span>Account</span>
          </Link>
        </div>
      </header>

      <div
        className="client-context-strip"
        aria-label="Client workspace context"
      >
        <span className="client-context-dot" aria-hidden="true" />
        <span>
          Connected through <strong>{agencyName}</strong>
        </span>
      </div>

      <div className="client-content">{children}</div>

      <footer className="client-footer">
        <span>Client workspace</span>
        <span className="client-footer-attribution">
          <StudioFlowMark />
          Powered by <strong>StudioFlow</strong>
        </span>
      </footer>
    </div>
  );
}
