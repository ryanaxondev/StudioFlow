#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

probe_id="studioflow-m02-persist-$(date +%s)-$$"

printf 'Writing persistence probes...\n'

compose exec -T postgres sh -lc "
  psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -v ON_ERROR_STOP=1 \\
    -c \"CREATE TABLE IF NOT EXISTS m02_persistence_probe (id text PRIMARY KEY);\" \\
    -c \"INSERT INTO m02_persistence_probe (id) VALUES ('$probe_id') ON CONFLICT DO NOTHING;\"
" >/dev/null

compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  minio-init -c '
    set -eu
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
    printf "%s" "$PROBE_ID" > /tmp/studioflow-m02-persistence
    mc cp --quiet /tmp/studioflow-m02-persistence "local/$MINIO_BUCKET/.m02-persistence/$PROBE_ID.txt"
  ' >/dev/null

compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  smoke-tools -c '
    set -eu
    printf "EHLO studioflow.local\r\nMAIL FROM:<m02@studioflow.local>\r\nRCPT TO:<persistence@studioflow.local>\r\nDATA\r\nSubject: %s\r\n\r\nStudioFlow M02 persistence probe\r\n.\r\nQUIT\r\n" "$PROBE_ID" |
      nc -w 5 mailpit 1025 >/dev/null
  '

compose exec -T -e PROBE_ID="$probe_id" clamav sh -lc 'printf "%s" "$PROBE_ID" > /var/lib/clamav/.studioflow-m02-persistence'

printf 'Recreating service containers without deleting named volumes...\n'
compose down
"$repo_root/scripts/infra/up.sh" >/dev/null

printf 'Verifying PostgreSQL persistence... '
postgres_count="$(compose exec -T postgres sh -lc "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -Atqc \"SELECT count(*) FROM m02_persistence_probe WHERE id = '$probe_id';\"")"
test "$postgres_count" = "1"
printf 'ok\n'

printf 'Verifying MinIO persistence... '
compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  minio-init -c '
    set -eu
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
    actual="$(mc cat "local/$MINIO_BUCKET/.m02-persistence/$PROBE_ID.txt")"
    test "$actual" = "$PROBE_ID"
  ' >/dev/null
printf 'ok\n'

printf 'Verifying Mailpit persistence... '
compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  smoke-tools -c '
    set -eu
    wget -qO- http://mailpit:8025/api/v1/messages | grep -q "$PROBE_ID"
  ' >/dev/null
printf 'ok\n'

printf 'Verifying ClamAV signature-volume persistence... '
clamav_probe="$(compose exec -T clamav cat /var/lib/clamav/.studioflow-m02-persistence)"
test "$clamav_probe" = "$probe_id"
printf 'ok\n'

printf 'Cleaning persistence probes...\n'
compose exec -T postgres sh -lc "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -v ON_ERROR_STOP=1 -c \"DELETE FROM m02_persistence_probe WHERE id = '$probe_id';\"" >/dev/null
compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  minio-init -c '
    set -eu
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
    mc rm --quiet "local/$MINIO_BUCKET/.m02-persistence/$PROBE_ID.txt"
  ' >/dev/null
compose exec -T clamav rm -f /var/lib/clamav/.studioflow-m02-persistence

printf '\nM02 service restart persistence test passed.\n'
