import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("server-only boundary", () => {
  it("marks server environment access as server-only", async () => {
    const source = await readFile(
      resolve(process.cwd(), "src/server/env.ts"),
      "utf8",
    );

    expect(source).toMatch(/import "server-only";/);
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
