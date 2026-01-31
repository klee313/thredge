# Refactor Candidates

## Candidate 1
- 파일명: frontend/src/components/home/SearchForm.tsx
- 역할/책임 요약: 홈 헤더 검색 입력 및 검색 제출/초기화, 드롭다운 표시 제어.
- 상태 소유권/전파 경로: 검색 입력값(draftValue)과 드롭다운 열림 상태를 로컬에서 소유하며, 검색/변경 이벤트를 상위(HomeFeedView)로 전파.
- 의존성/결합도: useTranslation, uiTokens, SearchDropdown(추가 예정), 부모에서 내려오는 dropdown 데이터에 의존.
- 리팩토링 목적: 입력 처리와 드롭다운/카테고리 UI가 한 컴포넌트에 혼재해 복잡도 증가.
- 계약(Contract)과 불변조건(Invariants): 검색 제출 시 공백 제거, 빈 값이면 clear 실행. 드롭다운 열림/닫힘 동작 동일.
- definition of done: 헤더 검색 입력 UI/동작 동일, 드롭다운 UI/동작 동일.
- 작업 단위:
  - [M/Low] 드롭다운 렌더링/로직을 별도 컴포넌트로 분리하고 props로 연결.
  - [M/Low] SearchForm 내 상태/핸들러 최소화 및 분리 후 동작 동일 확인.

## Candidate 2
- 파일명: frontend/src/components/home/SearchDropdown.tsx
- 역할/책임 요약: 검색 드롭다운 UI 렌더링 및 카테고리 목록 필터/그룹/액션 처리.
- 상태 소유권/전파 경로: 입력 쿼리 값은 외부에서 받고, 필터/그룹 계산은 내부에서 수행.
- 의존성/결합도: useCategorySearch, useTranslation, InlineIcon/xIcon, 부모에서 전달되는 카테고리/액션 props.
- 리팩토링 목적: SearchForm에서 분리된 드롭다운 UI를 독립 컴포넌트로 분리하여 책임 경계를 명확화.
- 계약(Contract)과 불변조건(Invariants): 필터 로직 동일, 알파벳 헤더/카테고리 버튼/삭제 버튼/추가 버튼 동작 동일.
- definition of done: 렌더 결과 동일, 모든 버튼/액션 동작 동일.
- 작업 단위:
  - [M/Low] SearchForm에서 마크업/로직 이동 및 필요한 props 정의.
  - [M/Low] 필터/그룹/추가 버튼 로직 유지.

## 작업 이력
- 2026-01-24: SearchForm에서 드롭다운 렌더링/로직 분리, SearchDropdown 신설 및 연결. 렌더 결과 동일.
