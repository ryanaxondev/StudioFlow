import { z } from "zod";

import { createDatabaseClient } from "../../src/db/client";
import { parseApplicationDatabaseEnvironment } from "../../src/db/config";
import { users } from "../../src/db/schema";

const inputSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.trim().toLowerCase()),
  name: z.string().trim().min(1),
});

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function assertLocalDatabase(connectionString: string): void {
  const hostname = new URL(connectionString).hostname;
  const localHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

  if (!localHosts.has(hostname)) {
    throw new Error("auth:local-user only accepts a local database URL.");
  }
}

async function main(): Promise<void> {
  const input = inputSchema.parse({
    email: readFlag("email"),
    name: readFlag("name"),
  });
  const environment = parseApplicationDatabaseEnvironment(process.env);
  assertLocalDatabase(environment.DATABASE_URL);

  const database = createDatabaseClient({
    connectionString: environment.DATABASE_URL,
    applicationName: "studioflow-local-auth-bootstrap",
    maxConnections: 1,
  });

  try {
    const [created] = await database.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
      })
      .onConflictDoNothing({ target: users.email })
      .returning({
        id: users.id,
        email: users.email,
      });

    if (created) {
      console.log(`Created local user ${created.email} (${created.id}).`);
    } else {
      console.log(`Local user ${input.email} already exists.`);
    }
  } finally {
    await database.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
