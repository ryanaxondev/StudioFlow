import type { Client } from "pg";

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export async function resetPublicSchemaData(client: Client): Promise<void> {
  const result = await client.query<{ tablename: string }>(
    `SELECT tablename
       FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename`,
  );

  if (result.rows.length === 0) {
    return;
  }

  const tables = result.rows
    .map(({ tablename }) => `public.${quoteIdentifier(tablename)}`)
    .join(", ");

  await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}
