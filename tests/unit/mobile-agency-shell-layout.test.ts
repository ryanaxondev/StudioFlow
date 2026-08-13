import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const shells = readFileSync(resolve("src/styles/shells.css"), "utf8");
const screens = readFileSync(resolve("src/styles/screens.css"), "utf8");

describe("M08 mobile Agency shell layout", () => {
  test("uses a structural three-row viewport instead of overlay navigation", () => {
    expect(shells).toContain("grid-template-rows: auto minmax(0, 1fr) auto;");
    expect(shells).toMatch(
      /\.agency-main\s*\{[\s\S]*?position:\s*static;[\s\S]*?min-height:\s*0;[\s\S]*?overflow-y:\s*auto;/,
    );
    expect(shells).toMatch(
      /\.agency-mobile-bottom-nav\s*\{[\s\S]*?position:\s*relative;[\s\S]*?background:\s*var\(--ops-rail\);/,
    );
  });

  test("does not reserve bottom-nav overlay clearance inside Agency pages", () => {
    expect(screens).not.toContain(
      "calc(var(--ops-mobile-nav-height) + env(safe-area-inset-bottom) + 2rem)",
    );
    expect(screens).toMatch(
      /@media \(max-width: 47\.999rem\)[\s\S]*?\.ops-workspace\s*\{[\s\S]*?padding:\s*1rem 0\.875rem 2rem;/,
    );
  });
});
