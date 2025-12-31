#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_PATH="${ROOT_DIR}/contracts/openapi/openapi.json"

API_BASE_URL="${API_BASE_URL:-http://localhost:28080}"

mkdir -p "$(dirname "${OUT_PATH}")"

echo "Fetching OpenAPI from: ${API_BASE_URL}/v3/api-docs"
curl -fsS "${API_BASE_URL}/v3/api-docs" | OUT="${OUT_PATH}" node -e '
  const fs = require("fs");
  const out = process.env.OUT;
  const raw = fs.readFileSync(0, "utf8");
  const json = JSON.parse(raw);
  fs.writeFileSync(out, JSON.stringify(json, null, 2) + "\n");
'

echo "Wrote: ${OUT_PATH}"
