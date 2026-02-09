# Cloudflare Rate Limit 운영 가이드

## 목적
- 이 문서는 Thredge 프로젝트에 Cloudflare Rate Limit을 적용할 때의 기준값과 운영 절차를 정리한다.
- 기준일: 2026-02-09

## 현재 인증 구조 요약
- 현재 백엔드는 JWT/Bearer가 아니라 서버 세션 기반 인증이다.
- 로그인 시 `SecurityContext`를 세션에 저장하고 쿠키(`THREDGE_SESSION`)로 인증 상태를 유지한다.
- 프론트엔드는 `credentials: 'include'`로 쿠키를 포함해 API를 호출한다.

참고 파일:
- `backend/src/main/kotlin/com/thredge/backend/config/SecurityConfig.kt`
- `backend/src/main/kotlin/com/thredge/backend/api/AuthController.kt`
- `backend/src/main/resources/application.yml`
- `frontend/src/lib/api.ts`

## 핵심 원칙
- 인증과 Rate Limit은 역할이 다르다.
- 인증은 "누구인지" 확인하고, Rate Limit은 "얼마나 호출하는지"를 제한한다.
- 따라서 "인증됨"만으로 무제한 완화는 권장하지 않는다.
- 경로/메서드/리스크별로 차등 제한한다.

## Google OAuth 전환 시 해석
- Google OAuth 도입 자체는 신원 확인을 강화한다.
- 하지만 이것만으로 탈취 토큰 재사용 위험이 사라지지 않는다.
- 아래 조건까지 갖추면 완화 가능한 범위가 커진다.
  - 짧은 Access Token 수명
  - Refresh Token Rotation
  - Refresh Token 재사용 탐지
- 그래도 고비용/민감 엔드포인트는 강한 제한을 유지한다.

## 엔드포인트별 권장 시작값
- 단위는 Cloudflare edge 기준이며, 초기 적용 후 3~7일 로그 기반 조정한다.

| 대상 | 권장 제한 | 초과 시 액션 | 비고 |
|---|---:|---|---|
| `POST /api/auth/login` (OAuth 전환 후 `POST /api/auth/oauth/*` 포함) | 10 req / 1 min / IP | Managed Challenge, 반복 시 10분 Block | 인증 진입점 보호 |
| `POST /api/auth/signup` (유지 시) | 3 req / 10 min / IP | 30분 Block | 대량 생성 방지 |
| `POST /api/auth/password` | 5 req / 30 min / IP | 30분 Block | 계정 방어 |
| `POST /api/ai/blocker-recommendations` | 12 req / 1 min / IP | Managed Challenge 또는 5분 Block | 비용 유발 API |
| `POST/PATCH/DELETE /api/threads*` | 60 req / 1 min / IP | Throttle 또는 Managed Challenge | 쓰기 폭주 방지 |
| `POST/PATCH/DELETE /api/entries*` | 60 req / 1 min / IP | Throttle 또는 Managed Challenge | 쓰기 폭주 방지 |
| `POST/PATCH /api/todos*` | 60 req / 1 min / IP | Throttle 또는 Managed Challenge | 쓰기 폭주 방지 |
| 관리자 쓰기 (`DELETE /api/admin/users/*`, `PUT /api/admin/signup-policy`) | 10 req / 1 min / IP | 10분 Block | 고위험 작업 |
| `GET /api/*` (`/api/health` 제외) | 300 req / 1 min / IP | 초기 Log/Throttle | 조회는 상대적 완화 |

## 제외 대상
- `/api/health`는 제외한다.
- 정적 리소스(`*.js`, `*.css`, 이미지)는 제외한다.

## Cloudflare 룰 구성 순서 권장
1. 가장 민감한 경로부터 개별 룰 생성 (`auth`, `ai`, `admin`).
2. 공통 쓰기 룰 (`POST/PATCH/DELETE /api/*`)을 추가.
3. 조회 룰(`GET /api/*`)은 느슨하게 적용.
4. 첫 주는 Challenge/Throttle 위주로 false positive 확인.
5. 이상 트래픽 패턴이 확인되면 Block 시간과 임계치를 점진 조정.

## Terraform으로 배포/운영
권장 방식은 Cloudflare 설정을 IaC(Terraform)로 관리하는 것이다.

### 1) 준비
- Cloudflare API Token 발급 (최소 권한: Zone Read/Edit, Rulesets Edit)
- Zone ID 확인
- Terraform 설치

### 2) 환경 변수 설정
```bash
export CLOUDFLARE_API_TOKEN=...
export TF_VAR_cloudflare_zone_id=...
```

### 3) 배포 명령
```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

### 4) 운영 원칙
- PR에서 `plan`, main 머지 후 `apply`로 분리한다.
- Terraform state는 원격 백엔드(S3 + lock 또는 Terraform Cloud)를 사용한다.
- Cloudflare 대시보드 수동 변경은 최소화한다.

### 5) 롤백
- 이전 Git 커밋으로 IaC를 되돌린 후 `terraform apply`로 원복한다.

## 점검 체크리스트
- 배포 직후 429/Challenge 비율이 급증하지 않았는가?
- 특정 NAT 환경(회사망, 모바일 캐리어)에서 정상 사용자가 과차단되지 않는가?
- `/api/ai/blocker-recommendations` 호출량이 기대치 내로 유지되는가?
- 관리자 API에 별도 룰이 적용되어 있는가?

