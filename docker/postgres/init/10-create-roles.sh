#!/bin/sh
set -eu

: "${STUDIOFLOW_APP_DB_USER:?STUDIOFLOW_APP_DB_USER is required}"
: "${STUDIOFLOW_APP_DB_PASSWORD:?STUDIOFLOW_APP_DB_PASSWORD is required}"
: "${STUDIOFLOW_WORKER_DB_USER:?STUDIOFLOW_WORKER_DB_USER is required}"
: "${STUDIOFLOW_WORKER_DB_PASSWORD:?STUDIOFLOW_WORKER_DB_PASSWORD is required}"

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=database_name="$POSTGRES_DB" \
  --set=app_user="$STUDIOFLOW_APP_DB_USER" \
  --set=app_password="$STUDIOFLOW_APP_DB_PASSWORD" \
  --set=worker_user="$STUDIOFLOW_WORKER_DB_USER" \
  --set=worker_password="$STUDIOFLOW_WORKER_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user')
\gexec

SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'worker_user', :'worker_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'worker_user')
\gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'database_name', :'app_user')
\gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'database_name', :'worker_user')
\gexec
SQL
