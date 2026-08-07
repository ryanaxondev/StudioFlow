# PostgreSQL local service

The local PostgreSQL service uses PostgreSQL 18 and persists `/var/lib/postgresql` in a named Docker volume.

The bootstrap user is the migration role. On first initialization, `init/10-create-roles.sh` also creates restricted login roles for the Web application and Worker. Migrations remain responsible for schema ownership and grants in later milestones.

Changing bootstrap credentials after the volume has already been initialized requires `pnpm infra:reset` because Docker entrypoint initialization scripts run only for a fresh data directory.
