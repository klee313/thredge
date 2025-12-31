# DB 백업/복원

## 목적
- 로컬 `docker compose`의 PostgreSQL 데이터를 레포 안에 백업/복원할 수 있게 한다.
- 덤프 파일은 기본적으로 git에 커밋되지 않도록 `.gitignore` 처리되어 있다.
- PostgreSQL 실제 데이터 디렉터리는 레포 내 `data/postgres/`에 저장된다(기본 `.gitignore`).

## 백업
- `./infra/db/backup.sh`
  - 기본 출력: `infra/db/backups/<timestamp>.sql`
  - 옵션으로 파일 경로를 직접 지정 가능

## 복원
- `./infra/db/restore.sh <dump.sql>`
  - 주의: 복원 과정에서 기존 데이터가 덮어써질 수 있다(덤프 파일 옵션에 따라).
