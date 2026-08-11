import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const protectedRouteRoots = ["src/app/agency", "src/app/portal"] as const;
const roleLiteral =
  /\b(?:AGENCY_OWNER|DELIVERY_MANAGER|AGENCY_MEMBER|CLIENT_APPROVER|CLIENT_CONTRIBUTOR)\b/;

function routeSourceFiles(root: string): string[] {
  const files: string[] = [];

  function visit(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
        files.push(path);
      }
    }
  }

  visit(root);
  return files;
}

describe("M07 protected route policy boundary", () => {
  it("keeps role literals out of protected route modules", () => {
    for (const root of protectedRouteRoots) {
      for (const path of routeSourceFiles(root)) {
        const source = readFileSync(path, "utf8");
        expect(
          source,
          `${path} must authorize through policy modules`,
        ).not.toMatch(roleLiteral);
      }
    }
  });
});
