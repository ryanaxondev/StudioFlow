import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

async function collectPageFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return collectPageFiles(path);
      }
      return entry.isFile() && entry.name === "page.tsx" ? [path] : [];
    }),
  );

  return files.flat();
}

describe("server-only boundary", () => {
  it("marks server environment access as server-only", async () => {
    const source = await readFile(
      resolve(process.cwd(), "src/server/env.ts"),
      "utf8",
    );

    expect(source).toMatch(/import "server-only";/);
  });

  it("keeps Phosphor client context out of Server Component pages", async () => {
    const pages = await collectPageFiles(resolve(process.cwd(), "src/app"));

    for (const page of pages) {
      const source = await readFile(page, "utf8");
      const isClientComponent = /^\s*["']use client["'];?/m.test(source);

      if (!isClientComponent) {
        expect(source, page).not.toMatch(/from ["']@phosphor-icons\/react["']/);
      }
    }
  });

  it("keeps controlled Workspace setup importable by Node CLI tooling", async () => {
    const scriptSource = await readFile(
      resolve(process.cwd(), "scripts/memberships/create-local-workspace.ts"),
      "utf8",
    );
    const setupSource = await readFile(
      resolve(process.cwd(), "src/modules/memberships/setup.ts"),
      "utf8",
    );

    expect(scriptSource).toContain(
      'from "../../src/modules/memberships/setup"',
    );
    expect(setupSource).not.toContain("authorization/server/authorization");
    expect(setupSource).not.toContain('import "server-only"');
  });
});
