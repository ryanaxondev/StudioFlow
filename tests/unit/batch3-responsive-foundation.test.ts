import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const screens = readFileSync(
  new URL("../../src/styles/screens.css", import.meta.url),
  "utf8",
);
const sharedAccessFrame = readFileSync(
  new URL(
    "../../src/components/brand/shared-access-frame.tsx",
    import.meta.url,
  ),
  "utf8",
);

describe("M08 Batch 3 responsive foundation", () => {
  test("client project collections do not fall back to horizontal desktop tables on mobile", () => {
    expect(screens).not.toContain(
      ".client-project-table {\n    overflow-x: auto;",
    );
    expect(screens).not.toContain("min-width: 38rem;");
    expect(screens).toMatch(
      /\.client-project-row-header\s*\{\s*display:\s*none;/,
    );
  });

  test("shared access mobile composition keeps a single brand and compact context", () => {
    expect(sharedAccessFrame).not.toContain("shared-access-mobile-brand");
    expect(screens).toMatch(
      /\.shared-access-context-copy > span\s*\{[\s\S]*?display:\s*none;/,
    );
    expect(screens).toContain("font-size: 1.25rem;");
  });
});
