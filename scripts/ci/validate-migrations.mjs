import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const migrationsDirectory = resolve(process.cwd(), "src/db/migrations");
const implementedMigrationCount = 3;
const approvedNames = [
  "0001_extensions_and_system.sql",
  "0002_identity_foundation.sql",
  "0003_outbox_and_idempotency.sql",
  "0004_workspaces_and_members.sql",
  "0005_clients_and_invitations.sql",
  "0006_projects_memberships_and_activity.sql",
  "0007_milestones.sql",
  "0008_client_actions_and_blocking.sql",
  "0009_assets_and_uploads.sql",
  "0010_deliverables_and_versions.sql",
  "0011_comments_and_threads.sql",
  "0012_review_decisions_and_revisions.sql",
  "0013_change_requests.sql",
  "0014_handoff.sql",
  "0015_operational_read_models.sql",
  "0016_jobs_notifications_and_webhooks.sql",
  "0017_analytics_and_search.sql",
  "0018_demo_instances.sql",
  "0019_performance_indexes.sql",
];

const entries = await readdir(migrationsDirectory, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort();

if (files.length !== implementedMigrationCount) {
  throw new Error(
    `M04 requires exactly ${implementedMigrationCount} release migrations; found ${files.length}.`,
  );
}

const migrationPattern = /^(\d{4})_[a-z0-9_]+\.sql$/;
const seenNumbers = new Set();

for (const [index, file] of files.entries()) {
  const match = migrationPattern.exec(file);

  if (!match) {
    throw new Error(`Invalid migration filename: ${file}`);
  }

  const migrationNumber = Number(match[1]);
  const expectedNumber = index + 1;

  if (migrationNumber !== expectedNumber) {
    throw new Error(
      `Migration sequence must be contiguous. Expected ${String(expectedNumber).padStart(4, "0")}, found ${match[1]}.`,
    );
  }

  if (seenNumbers.has(migrationNumber)) {
    throw new Error(`Duplicate migration number: ${match[1]}`);
  }
  seenNumbers.add(migrationNumber);

  const approvedName = approvedNames[index];
  if (approvedName && file !== approvedName) {
    throw new Error(
      `Migration ${match[1]} must keep its approved filename: ${approvedName}`,
    );
  }
}

console.log(
  `Migration validation passed: ${files.length} M04 migration(s) are contiguous and valid.`,
);
