#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/infra/db/backups"

mkdir -p "${BACKUP_DIR}"

timestamp="$(date +%Y%m%d_%H%M%S)"
output_path="${1:-${BACKUP_DIR}/${timestamp}.sql}"

cd "${ROOT_DIR}"

echo "Backing up PostgreSQL to: ${output_path}"
docker compose exec -T db sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges --clean --if-exists' > "${output_path}"
echo "Done."

