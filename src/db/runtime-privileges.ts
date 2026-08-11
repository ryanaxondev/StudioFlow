import { Client } from "pg";

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function roleFromConnectionString(connectionString: string): string {
  const username = new URL(connectionString).username;

  if (!username) {
    throw new Error("Database connection URL does not include a username.");
  }

  return decodeURIComponent(username);
}

async function roleExists(client: Client, role: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = $1) AS exists",
    [role],
  );

  return result.rows[0]?.exists ?? false;
}

export type RuntimePrivilegeResult = Readonly<{
  appRoleApplied: boolean;
  workerRoleApplied: boolean;
}>;

export async function applyRuntimePrivileges(options: {
  migrationConnectionString: string;
  appConnectionString: string;
  workerConnectionString: string;
  strict?: boolean;
}): Promise<RuntimePrivilegeResult> {
  const appRole = roleFromConnectionString(options.appConnectionString);
  const workerRole = roleFromConnectionString(options.workerConnectionString);
  const client = new Client({
    connectionString: options.migrationConnectionString,
  });

  await client.connect();

  try {
    const [appExists, workerExists] = await Promise.all([
      roleExists(client, appRole),
      roleExists(client, workerRole),
    ]);

    if (options.strict && (!appExists || !workerExists)) {
      const missingRoles = [
        ...(appExists ? [] : [appRole]),
        ...(workerExists ? [] : [workerRole]),
      ];
      throw new Error(
        `Runtime database role(s) missing: ${missingRoles.join(", ")}`,
      );
    }

    if (appExists) {
      const role = quoteIdentifier(appRole);
      await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
      await client.query(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
          users, sessions, accounts, verifications, idempotency_records, outbox_events,
          workspaces, workspace_branding, workspace_members,
          client_organizations, client_members, invitations
         TO ${role}`,
      );
      await client.query(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public
         GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${role}`,
      );
      await client.query(
        `REVOKE ALL ON TABLE studioflow_migrations FROM ${role}`,
      );
    }

    if (workerExists) {
      const role = quoteIdentifier(workerRole);
      await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
      await client.query(
        `GRANT SELECT, INSERT, UPDATE ON TABLE outbox_events TO ${role}`,
      );
      await client.query(
        `REVOKE ALL ON TABLE studioflow_migrations FROM ${role}`,
      );
    }

    return {
      appRoleApplied: appExists,
      workerRoleApplied: workerExists,
    };
  } finally {
    await client.end();
  }
}
