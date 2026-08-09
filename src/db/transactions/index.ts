import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PoolClient } from "pg";

import type { DatabaseClient } from "../client";
import * as schema from "../schema";

export type TransactionDatabase = NodePgDatabase<typeof schema>;

export type TransactionContext = Readonly<{
  db: TransactionDatabase;
  client: PoolClient;
}>;

export async function withTransaction<T>(
  database: DatabaseClient,
  operation: (transaction: TransactionContext) => Promise<T>,
): Promise<T> {
  const client = await database.pool.connect();

  try {
    await client.query("BEGIN");
    const transactionDatabase = drizzle({ client, schema });
    const result = await operation({ db: transactionDatabase, client });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original transaction failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
