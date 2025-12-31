# OpenAPI (FE/BE 계약)

## 백엔드 제공(OpenAPI/Swagger UI)
- OpenAPI JSON(런타임): `http://localhost:28080/v3/api-docs`
- Swagger UI: `http://localhost:28080/swagger-ui/index.html`

## 공용 계약 파일(커밋 대상)
- `contracts/openapi/openapi.json`
  - 백엔드에서 생성한 OpenAPI를 레포에 저장한 “계약 소스”

## 프론트 타입 생성
1) 계약 파일 갱신(백엔드 실행 필요)
   - `docker compose up -d`
   - `./scripts/openapi/update.sh`
2) 프론트에서 타입 생성(계약 파일 기준):
   - `cd frontend`
   - `npm run openapi:types`

생성 결과는 `frontend/src/lib/api/generated.ts`에 기록된다.
