import { createDatabaseClient } from "../../src/db/client";
import { parseApplicationDatabaseEnvironment } from "../../src/db/config";
import {
  DEVELOPMENT_SEED_V2_VERSION,
  LATEST_DEVELOPMENT_SEED_VERSION,
  seedDevelopmentV2,
} from "../../src/modules/milestones/development-seed";
import {
  DEVELOPMENT_SEED_VERSION,
  seedDevelopmentV1,
} from "../../src/modules/projects/development-seed";

function readVersionFlag(): number {
  const index = process.argv.indexOf("--version");
  if (index < 0) return LATEST_DEVELOPMENT_SEED_VERSION;

  const raw = process.argv[index + 1];
  const version = raw ? Number(raw) : Number.NaN;
  if (!Number.isInteger(version) || version < 1) {
    throw new Error("--version must be a positive integer.");
  }
  return version;
}

function assertLocalDatabase(connectionString: string): void {
  const hostname = new URL(connectionString).hostname;
  const localHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
  if (!localHosts.has(hostname)) {
    throw new Error("seed:development only accepts a local database URL.");
  }
}

async function main(): Promise<void> {
  const environment = parseApplicationDatabaseEnvironment(process.env);
  assertLocalDatabase(environment.DATABASE_URL);
  const version = readVersionFlag();

  const database = createDatabaseClient({
    connectionString: environment.DATABASE_URL,
    applicationName: "studioflow-development-seed",
    maxConnections: 1,
  });

  try {
    const result =
      version === DEVELOPMENT_SEED_VERSION
        ? await seedDevelopmentV1(database, version)
        : version === DEVELOPMENT_SEED_V2_VERSION
          ? await seedDevelopmentV2(database, version)
          : null;
    if (!result) {
      throw new Error(
        `Unsupported development seed version ${version}. Supported versions are 1 and ${DEVELOPMENT_SEED_V2_VERSION}.`,
      );
    }
    console.log(
      `Development seed v${result.version} ready: workspace=${result.workspaceId}, client=${result.clientOrganizationId}, project=${result.projectId}.`,
    );
  } finally {
    await database.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
