import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema";

export type StudioFlowDatabase = NodePgDatabase<typeof schema>;

export type DatabaseClient = Readonly<{
  pool: Pool;
  db: StudioFlowDatabase;
  close(): Promise<void>;
}>;

export type CreateDatabaseClientOptions = Readonly<{
  connectionString: string;
  applicationName: string;
  maxConnections?: number;
  connectionTimeoutMs?: number;
  idleTimeoutMs?: number;
}>;

export function createDatabaseClient(
  options: CreateDatabaseClientOptions,
): DatabaseClient {
  const poolConfig: PoolConfig = {
    connectionString: options.connectionString,
    application_name: options.applicationName,
    max: options.maxConnections ?? 10,
    connectionTimeoutMillis: options.connectionTimeoutMs ?? 5_000,
    idleTimeoutMillis: options.idleTimeoutMs ?? 30_000,
  };

  const pool = new Pool(poolConfig);
  const db = drizzle({ client: pool, schema });

  return {
    pool,
    db,
    close: () => pool.end(),
  };
}
