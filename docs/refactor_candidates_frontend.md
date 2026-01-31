# 프론트엔드 리팩토링 후보 파일 목록

범위: `frontend/src` 엔트리포인트(`main.tsx` → `router.tsx` → `routes/*`)부터 톱다운으로 확인한 결과, 리팩토링 필요성이 높은 후보만 정리.

---

## 1) frontend/src/components/layout/AppShell.tsx
- 파일명: `frontend/src/components/layout/AppShell.tsx`
- 역할/책임 요약: 앱 전역 레이아웃, 전역 에러 배너, 테마/언어 초기화, 글로벌 에러 리포팅과 자동 해제 처리.
- 상태 소유권/전파 경로: 테마/언어는 settings store + i18n 양방향 동기화, 글로벌 에러는 globalErrorStore에서 상태를 수신하고 UI로 전파.
- 의존성/결합도: `useSettingsStore`, `useGlobalErrorStore`, `useGlobalErrorReporter`, `i18n` 등 여러 전역 시스템에 결합.
- 리팩토링 목적: 사이드 이펙트가 한 컴포넌트에 몰려 있어 책임 경계가 흐림. 테마/언어 동기화, 글로벌 에러 처리 로직을 훅으로 분리해 테스트/변경 용이성 확보.
- 계약(Contract)과 불변조건(Invariants): 테마 적용/언어 변경은 사용자가 설정한 값과 일치해야 함. 글로벌 에러는 자동 해제 시간 내 표시.
- definition of done: 렌더 결과 동일, 테마/언어 동작 동일, 글로벌 에러 배너 표시/자동 해제 동작 동일.
- 작업 단위 (난이도/리스크):
  - 전역 테마/언어 동기화 로직을 `useAppThemeSync`, `useAppLanguageSync` 훅으로 분리 (난이도: 중, 리스크: 중)
  - 글로벌 에러 자동 해제 + 리포팅 로직을 `useGlobalErrorEffects`로 분리 (난이도: 중, 리스크: 중)

## 2) frontend/src/routes/ArchivePage.tsx
- 파일명: `frontend/src/routes/ArchivePage.tsx`
- 역할/책임 요약: 숨김 스레드/엔트리 검색, 복구, 목록 렌더링, 토스트 메시지 처리.
- 상태 소유권/전파 경로: 로컬 state(`toast`) + `useArchivedSearch` 훅 상태 + react-query mutation 상태가 UI로 직접 결합.
- 의존성/결합도: `useArchivedSearch`, `queryKeys`, API 함수, `Tooltip`, `ErrorNotice` 등 다수.
- 리팩토링 목적: 스레드/엔트리 섹션 구조가 거의 동일하여 중복이 큼. 검색/목록/복구 로직을 공통 섹션 컴포넌트로 분리하면 유지보수성 향상.
- 계약(Contract)과 불변조건(Invariants): 복구 후 관련 쿼리 invalidate 및 UI 토스트 표시. 검색/필터 동작 동일.
- definition of done: 목록/검색/복구/토스트 동작 동일, 렌더 결과 동일.
- 작업 단위 (난이도/리스크):
  - 스레드/엔트리 섹션 공통 컴포넌트로 추출 (난이도: 중, 리스크: 중)
  - 복구 mutation 결과 처리/토스트 로직을 공통 유틸 또는 훅으로 이동 (난이도: 중, 리스크: 중)

## 3) frontend/src/routes/SettingsPage.tsx
- 파일명: `frontend/src/routes/SettingsPage.tsx`
- 역할/책임 요약: UI 언어/테마/핀치 줌 설정, 비밀번호 변경, 카테고리 관리 UI를 한 화면에서 처리.
- 상태 소유권/전파 경로: react-hook-form + 로컬 state + settings store + 글로벌 에러 store 결합.
- 의존성/결합도: `useSettingsStore`, `uiTheme`, `useCategoryMutations`, `react-hook-form` 등 복합 의존.
- 리팩토링 목적: 서로 독립적인 기능(설정/비밀번호/카테고리)이 한 파일에 혼재. 훅과 섹션 컴포넌트로 분리해 책임 분리.
- 계약(Contract)과 불변조건(Invariants): 저장 시 settings store 업데이트, 테마/언어 즉시 반영. 비밀번호 변경 성공 시 입력 초기화.
- definition of done: 설정/비밀번호/카테고리 동작 동일, UI와 저장 로직 동일.
- 작업 단위 (난이도/리스크):
  - 설정 폼 로직을 `useSettingsForm` 훅으로 분리 (난이도: 중, 리스크: 중)
  - 비밀번호 섹션/카테고리 섹션을 라우트 단위 분리 또는 컴포넌트 분리 (난이도: 중, 리스크: 중)
  - 저장 토스트/이펙트 처리 공통화 (난이도: 중, 리스크: 중)

## 4) frontend/src/routes/AdminPage.tsx
- 파일명: `frontend/src/routes/AdminPage.tsx`
- 역할/책임 요약: 가입 정책 토글 + 관리자 유저 리스트/삭제 관리.
- 상태 소유권/전파 경로: react-query 상태가 직접 UI를 제어.
- 의존성/결합도: API, `queryKeys`, `ErrorNotice`, global error store.
- 리팩토링 목적: 섹션별 UI와 데이터 로딩/에러 처리 패턴이 반복. 섹션 컴포넌트로 분리해 중복 제거.
- 계약(Contract)과 불변조건(Invariants): 정책 토글/유저 삭제 성공 시 해당 쿼리 invalidate.
- definition of done: 동작 동일, 표시 내용 동일.
- 작업 단위 (난이도/리스크):
  - 가입 정책 섹션/유저 섹션을 컴포넌트화 (난이도: 하, 리스크: 하)

## 5) frontend/src/components/home/CategoryFilterBar.tsx
- 파일명: `frontend/src/components/home/CategoryFilterBar.tsx`
- 역할/책임 요약: 홈 카테고리 검색/필터/생성 UI 및 리스트 렌더링.
- 상태 소유권/전파 경로: 로컬 state + `useCategorySearch` 결과가 UI와 상호작용.
- 의존성/결합도: `useCategorySearch`, `uiTokens`에 깊게 의존.
- 리팩토링 목적: 검색/필터링/정렬/그룹화/렌더링 로직이 한 파일에 결합. 화면 로직 분리 필요.
- 계약(Contract)과 불변조건(Invariants): 선택된 카테고리 표시, 검색 필터 동작, 생성 버튼 조건 유지.
- definition of done: 동일한 카테고리 선택/필터/생성 동작, 렌더 결과 동일.
- 작업 단위 (난이도/리스크):
  - 리스트 데이터 가공 로직을 `useCategoryFilterViewModel`로 분리 (난이도: 중, 리스크: 중)
  - 버튼/리스트 렌더링을 하위 컴포넌트로 분리 (난이도: 중, 리스크: 중)

## 6) frontend/src/components/home/ThreadCategorySelector.tsx
- 파일명: `frontend/src/components/home/ThreadCategorySelector.tsx`
- 역할/책임 요약: 스레드 편집 시 카테고리 검색/추가/선택 UI.
- 상태 소유권/전파 경로: 로컬 state + debounced input + `useCategorySearch` 조합.
- 의존성/결합도: `useCategorySearch`, `useDebouncedTextInput`에 결합.
- 리팩토링 목적: CategoryFilterBar와 유사 로직이 중복. 공통 훅/컴포넌트로 통합 가능.
- 계약(Contract)과 불변조건(Invariants): 키보드 네비게이션/선택 동작 동일, 입력/생성 흐름 유지.
- definition of done: 카테고리 선택/생성/키보드 이동 동작 동일.
- 작업 단위 (난이도/리스크):
  - CategoryFilterBar와 공통 로직 추출 (난이도: 중, 리스크: 중)
  - 키보드 네비게이션 로직을 별도 훅으로 분리 (난이도: 중, 리스크: 중)

## 7) frontend/src/components/home/ThreadCardView.tsx
- 파일명: `frontend/src/components/home/ThreadCardView.tsx`
- 역할/책임 요약: 스레드 카드 UI 전체(헤더/바디/엔트리/메타정보) 렌더링과 액션 연결.
- 상태 소유권/전파 경로: 상위 컨트롤러에서 내려오는 대규모 props와 UI 상태/액션 연결.
- 의존성/결합도: `ThreadCardHeader`, `ThreadCardBodySection`, `ThreadCardEntriesSection` 등 다수 컴포넌트 결합.
- 리팩토링 목적: props 폭이 너무 넓고 UI 책임이 큼. 표면 API 축소 및 뷰모델 패턴으로 가독성/유지보수성 개선.
- 계약(Contract)과 불변조건(Invariants): 핀/숨김/편집/엔트리 작성 등 모든 액션 동작 동일.
- definition of done: 동일한 UI 상태, 동일한 사용자 동작 결과.
- 작업 단위 (난이도/리스크):
  - `ThreadCardView`를 헤더/바디/엔트리/메타 분리된 프레젠터로 분리 (난이도: 중, 리스크: 중)
  - props 구조를 `viewModel` 형태로 축소 (난이도: 중, 리스크: 중)

## 8) frontend/src/components/home/EntryCard.tsx
- 파일명: `frontend/src/components/home/EntryCard.tsx`
- 역할/책임 요약: 엔트리 카드 렌더링, 편집/뮤트/숨김/리플라이 UI, 드래그 이벤트 처리.
- 상태 소유권/전파 경로: UI 상태/액션을 props로 받고 drag state와 pointer 이벤트를 내부에서 처리.
- 의존성/결합도: `useEntryPressDrag`, `EntryEditor`, `ReplyComposer` 등 다수 결합.
- 리팩토링 목적: 이벤트 처리/렌더링/스타일 로직이 섞여 복잡도 높음. 행동 로직 훅 분리 필요.
- 계약(Contract)과 불변조건(Invariants): 드래그 동작, 편집/숨김/리플라이 흐름 동일.
- definition of done: 입력/드래그/편집 동작 동일.
- 작업 단위 (난이도/리스크):
  - 드래그/포인터 핸들링 로직을 별도 훅으로 분리 (난이도: 중, 리스크: 중)
  - 편집/뷰 모드를 하위 컴포넌트로 분리 (난이도: 중, 리스크: 중)

## 9) frontend/src/components/threadDetail/ThreadDetailView.tsx
- 파일명: `frontend/src/components/threadDetail/ThreadDetailView.tsx`
- 역할/책임 요약: 스레드 상세 화면 전반(헤더/바디/엔트리/액션/에러 처리).
- 상태 소유권/전파 경로: 컨트롤러에서 전달되는 많은 상태/액션을 단일 컴포넌트가 직접 처리.
- 의존성/결합도: `ThreadCardHeader`, `ThreadEditor`, `ThreadDetailEntries` 등 다수 결합.
- 리팩토링 목적: 홈 스레드 카드와 중복되는 UI/로직이 큼. 공통 컴포넌트로 통합 필요.
- 계약(Contract)과 불변조건(Invariants): 스레드 편집/엔트리 작성/에러 처리 동작 동일.
- definition of done: 상세 페이지 UI와 액션 동작 동일.
- 작업 단위 (난이도/리스크):
  - ThreadCardView와 공유 가능한 부분 통합 (난이도: 중, 리스크: 중)
  - 에러 배너/상태 처리 공통 컴포넌트화 (난이도: 하, 리스크: 하)

## 10) frontend/src/components/threadDetail/ThreadDetailEntries.tsx
- 파일명: `frontend/src/components/threadDetail/ThreadDetailEntries.tsx`
- 역할/책임 요약: 상세 페이지에서 엔트리 리스트 + 엔트리 작성 + 마지막 활동 표시.
- 상태 소유권/전파 경로: props 기반 렌더링, EntryListSection/EntryComposer 조합.
- 의존성/결합도: 홈 `ThreadCardEntriesSection`과 구조가 유사.
- 리팩토링 목적: 홈 카드와 엔트리 섹션 구현이 중복. 공통 컴포넌트로 합치면 유지보수성 향상.
- 계약(Contract)과 불변조건(Invariants): 엔트리 렌더/작성/마지막 활동 표시 동일.
- definition of done: 홈/상세에서 동일한 엔트리 렌더 동작 유지.
- 작업 단위 (난이도/리스크):
  - `ThreadCardEntriesSection`과 공통 컴포넌트로 통합 (난이도: 중, 리스크: 중)

## 11) frontend/src/hooks/useHomeFeedController.ts
- 파일명: `frontend/src/hooks/useHomeFeedController.ts`
- 역할/책임 요약: 홈 피드 전체 상태/쿼리/액션/뮤테이션 결합 컨트롤러.
- 상태 소유권/전파 경로: 여러 훅들의 상태를 합성하여 뷰에 제공.
- 의존성/결합도: `useHomeFeedState`, `useHomeFeedQueries`, `useHomeFeedMutations` 등 강결합.
- 리팩토링 목적: 훅 내부에서 너무 많은 객체를 구성하고 있어 인지 부하가 큼. 뷰 모델 계층 분리 필요.
- 계약(Contract)과 불변조건(Invariants): 기존 컨트롤러 반환 구조 유지(또는 점진적 마이그레이션).
- definition of done: 기존 UI 동작 동일, 렌더 동일.
- 작업 단위 (난이도/리스크):
  - 반환 구조를 `state/queries/actions/mutations`를 더 작은 단위로 분리 (난이도: 중, 리스크: 중)
  - `useMemo` 구조 단순화/중복 제거 (난이도: 중, 리스크: 중)

## 12) frontend/src/hooks/useHomeFeedState.ts
- 파일명: `frontend/src/hooks/useHomeFeedState.ts`
- 역할/책임 요약: 홈 피드 로컬 상태 + 드래프트 복원/저장 관리.
- 상태 소유권/전파 경로: 로컬 state + URL state + draft storage를 통합.
- 의존성/결합도: `useDraftPersistence`, `useHomeFeedUrlState`, UI state 훅들 결합.
- 리팩토링 목적: draft 복원 로직과 UI 상태 관리가 한 파일에 혼재. 관심사 분리 필요.
- 계약(Contract)과 불변조건(Invariants): draft 복원/저장 동작, URL state 동작 동일.
- definition of done: 저장/복원 동작 동일.
- 작업 단위 (난이도/리스크):
  - draft persistence 관련 로직을 별도 훅으로 분리 (난이도: 중, 리스크: 중)
  - state slice를 도메인별로 분리 (난이도: 중, 리스크: 중)

## 13) frontend/src/hooks/useHomeFeedMutations.ts
- 파일명: `frontend/src/hooks/useHomeFeedMutations.ts`
- 역할/책임 요약: 홈 피드에서 스레드/엔트리/카테고리 뮤테이션 처리.
- 상태 소유권/전파 경로: mutation 성공 시 다수 invalidate 및 draft 갱신.
- 의존성/결합도: `useEntryActions`, `useThreadActions`, `useCategoryMutations` 등 복합 결합.
- 리팩토링 목적: invalidate 범위가 넓어 서버 부하 증가 위험. 서버 부하 최소화를 우선(규칙 적용).
- 계약(Contract)과 불변조건(Invariants): 뮤테이션 후 화면 데이터 일관성 유지.
- definition of done: 동일한 데이터 일관성과 UI 갱신, 불필요한 중복 요청 감소.
- 작업 단위 (난이도/리스크):
  - invalidate 범위 축소 및 조건부 invalidate (난이도: 중, 리스크: 중) # 서버 부하 우선
  - draft 갱신 로직 공통화 (난이도: 중, 리스크: 중)

## 14) frontend/src/hooks/useThreadDetailController.ts
- 파일명: `frontend/src/hooks/useThreadDetailController.ts`
- 역할/책임 요약: 스레드 상세 상태/쿼리/뮤테이션/드래그 상태 집계.
- 상태 소유권/전파 경로: thread query + mutations + UI state를 단일 반환으로 묶음.
- 의존성/결합도: `useThreadDetailState`, `useThreadDetailMutations`, `useEntryDragState`, `getThreadDisplay` 등 결합.
- 리팩토링 목적: 반환 객체가 과도하게 커서 재사용/테스트 난이도 상승. 레이어 분리가 필요.
- 계약(Contract)과 불변조건(Invariants): 상세 페이지 동작 동일.
- definition of done: 동일한 동작과 UI 유지.
- 작업 단위 (난이도/리스크):
  - UI 관련 반환값/도메인 로직 반환값 분리 (난이도: 중, 리스크: 중)
  - entry 계산/drag 로직 분리 (난이도: 중, 리스크: 중)
