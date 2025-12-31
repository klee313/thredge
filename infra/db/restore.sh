#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump.sql>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
input_path="$1"

if [[ ! -f "${input_path}" ]]; then
  echo "Dump file not found: ${input_path}"
  exit 1
fi

cd "${ROOT_DIR}"

echo "Restoring PostgreSQL from: ${input_path}"
cat "${input_path}" | docker compose exec -T db sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
echo "Done."

