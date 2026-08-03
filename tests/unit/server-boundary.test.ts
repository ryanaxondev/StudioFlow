import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, it } from "node:test";

describe("server-only boundary", () => {
  it("marks server environment access as server-only", async () => {
    const source = await readFile(
      resolve(process.cwd(), "src/server/env.ts"),
      "utf8",
    );

    assert.match(source, /import "server-only";/);
  });
});
