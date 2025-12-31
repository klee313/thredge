# OpenAPI 계약(공용)

이 디렉터리는 프론트엔드/백엔드가 공통으로 참조하는 API 계약을 저장한다.

## 원칙
- 백엔드가 `springdoc`으로 생성한 OpenAPI를 `openapi.json`으로 내보내서 커밋한다.
- 프론트엔드는 실행 중인 백엔드 URL이 아니라 `openapi.json` 파일을 기준으로 타입을 생성한다.

## 파일
- `contracts/openapi/openapi.json`: 현재 API 계약(커밋 대상)

## 업데이트
1) 로컬에서 백엔드를 띄운다: `docker compose up -d`
2) 계약 갱신: `./scripts/openapi/update.sh`

