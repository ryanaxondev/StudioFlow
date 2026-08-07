#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

compose up -d --wait postgres minio mailpit clamav
compose run --rm minio-init

printf '\nStudioFlow local infrastructure is ready.\n'
printf 'PostgreSQL: %s\n' "$(compose port postgres 5432)"
printf 'MinIO API: http://%s\n' "$(compose port minio 9000)"
printf 'MinIO Console: http://%s\n' "$(compose port minio 9001)"
printf 'Mailpit UI: http://%s\n' "$(compose port mailpit 8025)"
printf 'Mailpit SMTP: %s\n' "$(compose port mailpit 1025)"
printf 'ClamAV: %s\n' "$(compose port clamav 3310)"
