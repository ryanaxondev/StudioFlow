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
});
