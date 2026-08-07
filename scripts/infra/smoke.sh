#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

probe_id="studioflow-m02-$(date +%s)-$$"

printf 'PostgreSQL connection... '
postgres_result="$(compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT 1"')"
test "$postgres_result" = "1"
printf 'ok\n'

printf 'MinIO PUT/GET... '
compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  minio-init -c '
    set -eu
    mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
    printf "%s" "$PROBE_ID" > /tmp/studioflow-m02-probe
    mc cp --quiet /tmp/studioflow-m02-probe "local/$MINIO_BUCKET/.m02-smoke/$PROBE_ID.txt"
    actual="$(mc cat "local/$MINIO_BUCKET/.m02-smoke/$PROBE_ID.txt")"
    test "$actual" = "$PROBE_ID"
    mc rm --quiet "local/$MINIO_BUCKET/.m02-smoke/$PROBE_ID.txt"
  ' >/dev/null
printf 'ok\n'

printf 'Mailpit SMTP capture... '
compose run --rm --no-deps \
  -e PROBE_ID="$probe_id" \
  --entrypoint /bin/sh \
  smoke-tools -c '
    set -eu
    response="$(
      printf "EHLO studioflow.local\r\nMAIL FROM:<m02@studioflow.local>\r\nRCPT TO:<smoke@studioflow.local>\r\nDATA\r\nSubject: %s\r\n\r\nStudioFlow M02 smoke\r\n.\r\nQUIT\r\n" "$PROBE_ID" |
        nc -w 5 mailpit 1025
    )"
    echo "$response" | grep -q "250"

    found=0
    for _ in 1 2 3 4 5; do
      if wget -qO- http://mailpit:8025/api/v1/messages | grep -q "$PROBE_ID"; then
        found=1
        break
      fi
      sleep 1
    done
    test "$found" -eq 1
  ' >/dev/null
printf 'ok\n'

printf 'ClamAV clean-file scan... '
printf 'StudioFlow M02 clean probe\n' |
  compose exec -T clamav clamdscan --no-summary - >/dev/null
printf 'ok\n'

printf 'ClamAV EICAR rejection... '
set +e
eicar_output="$(
  printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' |
    compose exec -T clamav clamdscan --no-summary - 2>&1
)"
eicar_status=$?
set -e

test "$eicar_status" -eq 1
grep -q 'FOUND' <<<"$eicar_output"
printf 'ok\n'

printf '\nM02 infrastructure smoke tests passed.\n'
