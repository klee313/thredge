# 로컬 개발(Phase 0)

## 전제
- Docker Desktop 설치

## 빠른 시작
- `.env`가 없으면 `.env.example`을 복사해서 `.env`로 만들고 필요 값을 수정한다.
- 실행: `docker compose up --build`

## DB 데이터가 지워지는 경우
- 현재 PostgreSQL 데이터는 레포 내 `data/postgres/`에 저장된다(bind mount).
- `docker compose down -v`는 Docker 볼륨(예: Gradle 캐시)을 삭제하지만, **`data/postgres/`는 호스트 디렉터리라서 그대로 남는다.**
- DB를 초기화하려면 `data/postgres/`를 비우거나 삭제해야 한다(주의).

## DB 백업/복원(레포 내)
- 백업: `./infra/db/backup.sh` (기본 출력: `infra/db/backups/`)
- 복원: `./infra/db/restore.sh infra/db/backups/<file>.sql`

## 포트 충돌 시
- 기본값은 28080이다. 만약 28080도 이미 사용 중이면 `.env`에서 `BACKEND_PORT`를 다른 값으로 바꾼다.
- 이때 프론트에서 백엔드로 호출할 주소도 함께 바꿔야 하므로 `VITE_API_BASE_URL=http://localhost:<BACKEND_PORT>`도 같이 수정한다.

## 접속
- Frontend: `http://localhost:5174`
- Backend health(API): `http://localhost:28080/api/health`
- Backend health(Actuator): `http://localhost:28080/actuator/health`
- Swagger UI: `http://localhost:28080/swagger-ui/index.html`
