import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16),
  ) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const values = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0]! + 0.7152 * values[1]! + 0.0722 * values[2]!;
}

function contrast(a: string, b: string): number {
  const left = luminance(hexToRgb(a));
  const right = luminance(hexToRgb(b));
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

describe("M08 visual tokens", () => {
  test("approved action and text combinations meet WCAG AA contrast", () => {
    expect(contrast("#171C2A", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#4F596A", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", "#4F46C9")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", "#176A5B")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#F7F8FF", "#11172A")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#AEB7CB", "#11172A")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#B42318", "#FEF3F2")).toBeGreaterThanOrEqual(4.5);
  });

  test("Obsidian Operations prototype combinations meet WCAG AA contrast", () => {
    expect(contrast("#F4F6FA", "#0F1219")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#9AA3B2", "#0F1219")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#7C8594", "#0F1219")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", "#6C5CE7")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#F4F6FA", "#080A0E")).toBeGreaterThanOrEqual(4.5);
  });

  test("focus, motion, and responsive shell tokens are explicit", () => {
    const tokens = readFileSync(
      resolve(process.cwd(), "src/styles/tokens.css"),
      "utf8",
    );
    const shells = readFileSync(
      resolve(process.cwd(), "src/styles/shells.css"),
      "utf8",
    );
    const primitives = readFileSync(
      resolve(process.cwd(), "src/styles/primitives.css"),
      "utf8",
    );

    expect(tokens).toContain("--border-focus: var(--studio-500)");
    expect(tokens).toContain("prefers-reduced-motion: reduce");
    expect(shells).toContain("@media (max-width: 47.999rem)");
    expect(primitives).toContain("outline: 2px solid var(--border-focus)");
  });

  test("approved foundation establishes the Obsidian Operations visual architecture", () => {
    const tokens = readFileSync(
      resolve(process.cwd(), "src/styles/tokens.css"),
      "utf8",
    );
    const shells = readFileSync(
      resolve(process.cwd(), "src/styles/shells.css"),
      "utf8",
    );
    const screens = readFileSync(
      resolve(process.cwd(), "src/styles/screens.css"),
      "utf8",
    );

    expect(tokens).toContain("--ops-black: #080a0e");
    expect(tokens).toContain("--ops-canvas: #0f1219");
    expect(tokens).toContain("--ops-violet: #6c5ce7");
    expect(tokens).toContain("--ops-rail-width: 3.5rem");
    expect(tokens).toContain("--ops-sidebar-width: 13.5rem");
    expect(tokens).toContain("--ops-mobile-nav-height: 4.25rem");
    expect(tokens).toContain("--ops-icon-mobile: 1.25rem");
    expect(shells).toContain(".agency-brand-rail");
    expect(shells).toContain(".agency-context-sidebar");
    expect(shells).toContain(".agency-mobile-bottom-nav");
    expect(shells).toContain(".ops-command-dialog");
    expect(shells).toContain(".studioflow-mark-track");
    expect(shells).toContain("env(safe-area-inset-bottom)");
    expect(shells).toContain(".command-action-type");
    expect(screens).toContain(".ops-delivery-page");
    expect(screens).toContain(".access-experience");
    expect(screens).toContain(".workflow-motif");
  });
});

describe("M08 Agency propagation surfaces", () => {
  test("Agency collection, detail, people, and account surfaces use the frozen Obsidian architecture", () => {
    const screens = readFileSync(
      resolve(process.cwd(), "src/styles/screens.css"),
      "utf8",
    );
    const projects = readFileSync(
      resolve(process.cwd(), "src/app/agency/projects/page.tsx"),
      "utf8",
    );
    const clients = readFileSync(
      resolve(process.cwd(), "src/app/agency/clients/page.tsx"),
      "utf8",
    );
    const clientDetail = readFileSync(
      resolve(
        process.cwd(),
        "src/app/agency/clients/[clientOrganizationId]/page.tsx",
      ),
      "utf8",
    );
    const members = readFileSync(
      resolve(process.cwd(), "src/app/agency/settings/members/page.tsx"),
      "utf8",
    );
    const account = readFileSync(
      resolve(process.cwd(), "src/app/account/page.tsx"),
      "utf8",
    );

    expect(projects).toContain("ops-data-table ops-projects-table");
    expect(clients).toContain("ops-create-disclosure");
    expect(clients).toContain("ops-clients-table");
    expect(clientDetail).toContain("ops-detail-tabs");
    expect(clientDetail).toContain("ops-detail-metrics");
    expect(members).toContain("ops-people-pulse");
    expect(account).toContain("account-experience");
    expect(account).toContain("account-context-list-obsidian");

    expect(projects).not.toContain("Project collection structure is ready");
    expect(clients).not.toContain("Project relationships are added in M09");
    expect(clientDetail).not.toContain(
      "Project delivery relationships begin in M09",
    );

    expect(screens).toContain(".ops-data-table");
    expect(screens).toContain(".ops-people-table");
    expect(screens).toContain(".ops-detail-tabs");
    expect(screens).toContain(".account-experience");
  });

  test("defines an opaque Obsidian rail token for persistent mobile chrome", () => {
    const tokens = readFileSync(
      resolve(process.cwd(), "src/styles/tokens.css"),
      "utf8",
    );

    expect(tokens).toContain("--ops-rail: #080a0e;");
  });
});
