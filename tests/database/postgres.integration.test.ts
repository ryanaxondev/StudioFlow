import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDisposableTestDatabase } from "../helpers/database";
import { resetPublicSchemaData } from "../helpers/database-reset";

describe("disposable PostgreSQL test database", () => {
  let database: Awaited<ReturnType<typeof createDisposableTestDatabase>>;
  let client: Client;

  beforeAll(async () => {
    database = await createDisposableTestDatabase();
    client = new Client({ connectionString: database.connectionString });
    await client.connect();
  });

  afterAll(async () => {
    await client?.end();
    await database?.drop();
  });

  it("supports isolated writes and reset", async () => {
    await client.query(`
      CREATE TABLE m03_probe (
        id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        value text NOT NULL
      )
    `);
    await client.query("INSERT INTO m03_probe (value) VALUES ($1)", ["ready"]);

    const beforeReset = await client.query<{ count: string }>(
      "SELECT count(*) FROM m03_probe",
    );
    expect(Number(beforeReset.rows[0]?.count)).toBe(1);

    await resetPublicSchemaData(client);

    const afterReset = await client.query<{ count: string }>(
      "SELECT count(*) FROM m03_probe",
    );
    expect(Number(afterReset.rows[0]?.count)).toBe(0);
  });
});
