import { randomUUID } from "node:crypto";

import { Client } from "pg";

const defaultAdminUrl =
  "postgresql://studioflow_migrator:studioflow_migrator_dev@127.0.0.1:5432/postgres";

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function createDatabaseName(prefix = "studioflow_test"): string {
  const suffix = randomUUID().replaceAll("-", "");
  return `${prefix}_${suffix}`;
}

export type DisposableTestDatabase = Readonly<{
  name: string;
  connectionString: string;
  drop(): Promise<void>;
}>;

export async function createDisposableTestDatabase(): Promise<DisposableTestDatabase> {
  const adminUrl = process.env.TEST_DATABASE_ADMIN_URL ?? defaultAdminUrl;
  const databaseName = createDatabaseName();
  const adminClient = new Client({ connectionString: adminUrl });

  await adminClient.connect();

  try {
    await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  } finally {
    await adminClient.end();
  }

  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${databaseName}`;

  return {
    name: databaseName,
    connectionString: databaseUrl.toString(),
    async drop() {
      const cleanupClient = new Client({ connectionString: adminUrl });
      await cleanupClient.connect();

      try {
        await cleanupClient.query(
          `DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)} WITH (FORCE)`,
        );
      } finally {
        await cleanupClient.end();
      }
    },
  };
}
