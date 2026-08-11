import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createDatabaseClient } from "../../src/db/client";
import { parseApplicationDatabaseEnvironment } from "../../src/db/config";
import { users, workspaceMembers, workspaces } from "../../src/db/schema";
import { createWorkspaceForControlledSetup } from "../../src/modules/memberships/setup";

const inputSchema = z.object({
  ownerEmail: z.string().trim().toLowerCase().email(),
  workspaceName: z.string().trim().min(1).max(160),
  timezone: z.string().trim().min(1).default("UTC"),
  displayCurrency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default("USD"),
});

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function assertLocalDatabase(connectionString: string): void {
  const hostname = new URL(connectionString).hostname;
  const localHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
  if (!localHosts.has(hostname)) {
    throw new Error("workspace:local-setup only accepts a local database URL.");
  }
}

async function main(): Promise<void> {
  const input = inputSchema.parse({
    ownerEmail: readFlag("owner"),
    workspaceName: readFlag("name"),
    timezone: readFlag("timezone") ?? "UTC",
    displayCurrency: readFlag("currency") ?? "USD",
  });
  const environment = parseApplicationDatabaseEnvironment(process.env);
  assertLocalDatabase(environment.DATABASE_URL);

  const database = createDatabaseClient({
    connectionString: environment.DATABASE_URL,
    applicationName: "studioflow-local-workspace-bootstrap",
    maxConnections: 1,
  });

  try {
    const [owner] = await database.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.ownerEmail))
      .limit(1);

    if (!owner) {
      throw new Error(
        `Local user ${input.ownerEmail} does not exist. Run auth:local-user first.`,
      );
    }

    const [existing] = await database.db
      .select({ id: workspaces.id })
      .from(workspaces)
      .innerJoin(
        workspaceMembers,
        and(
          eq(workspaceMembers.workspaceId, workspaces.id),
          eq(workspaceMembers.userId, owner.id),
        ),
      )
      .where(
        and(
          eq(workspaces.name, input.workspaceName),
          eq(workspaceMembers.role, "AGENCY_OWNER"),
          eq(workspaceMembers.status, "ACTIVE"),
        ),
      )
      .limit(1);

    if (existing) {
      console.log(`Local Workspace already exists (${existing.id}).`);
      return;
    }

    const created = await createWorkspaceForControlledSetup({
      database,
      ownerUserId: owner.id,
      name: input.workspaceName,
      timezone: input.timezone,
      displayCurrency: input.displayCurrency,
    });

    console.log(
      `Created local Workspace ${input.workspaceName} (${created.workspaceId}).`,
    );
  } finally {
    await database.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
