#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

require_docker_compose() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required." >&2
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose v2 is required." >&2
    exit 1
  fi
}

compose() {
  docker compose "$@"
}

require_docker_compose
