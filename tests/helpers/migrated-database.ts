import { createDatabaseClient, type DatabaseClient } from "../../src/db/client";
import { applyMigrations } from "../../src/db/migrations/runner";
import { createDisposableTestDatabase } from "./database";

export type MigratedTestDatabase = Readonly<{
  name: string;
  connectionString: string;
  database: DatabaseClient;
  drop(): Promise<void>;
}>;

export async function createMigratedTestDatabase(): Promise<MigratedTestDatabase> {
  const disposable = await createDisposableTestDatabase();
  await applyMigrations({ connectionString: disposable.connectionString });
  const database = createDatabaseClient({
    connectionString: disposable.connectionString,
    applicationName: "studioflow-test",
    maxConnections: 5,
  });

  return {
    name: disposable.name,
    connectionString: disposable.connectionString,
    database,
    async drop() {
      await database.close();
      await disposable.drop();
    },
  };
}
