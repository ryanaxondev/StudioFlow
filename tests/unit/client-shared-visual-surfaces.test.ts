import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("M08 Batch 3 client and shared visual surfaces", () => {
  test("Client Portal uses the calmer Obsidian client architecture without milestone placeholder copy", () => {
    const shell = read("src/components/shell/client-shell.tsx");
    const home = read("src/app/portal/page.tsx");
    const projects = read("src/app/portal/projects/page.tsx");
    const shellsCss = read("src/styles/shells.css");
    const screensCss = read("src/styles/screens.css");

    expect(shell).toContain("client-shell-obsidian");
    expect(shell).toContain("client-context-strip");
    expect(shell).toContain("client-footer-attribution");
    expect(home).toContain("client-attention-grid");
    expect(home).toContain("client-project-preview");
    expect(projects).toContain("client-project-collection");
    expect(shellsCss).toContain(".client-shell-obsidian");
    expect(screensCss).toContain(".client-context-overview");
    expect(screensCss).toContain(".client-project-table");

    expect(home).not.toContain("M09");
    expect(projects).not.toContain("M09");
    expect(projects).not.toContain("Projects will appear here");
  });

  test("Invitation, recovery, denied, and not-found surfaces use product-owned Obsidian frames", () => {
    const invitation = read("src/app/invite/[token]/page.tsx");
    const recovery = read("src/app/recover-access/page.tsx");
    const denied = read("src/app/access-denied/page.tsx");
    const notFound = read("src/app/not-found.tsx");
    const screensCss = read("src/styles/screens.css");

    expect(invitation).toContain("SharedAccessFrame");
    expect(recovery).toContain("SharedAccessFrame");
    expect(denied).toContain("UtilityStateFrame");
    expect(notFound).toContain("UtilityStateFrame");
    expect(screensCss).toContain(".shared-access-experience");
    expect(screensCss).toContain(".utility-state-experience");

    expect(screensCss).not.toContain(".auth-card,");
    expect(screensCss).not.toContain(".utility-card");
    expect(screensCss).not.toContain(".recovery-surface");
  });
});
