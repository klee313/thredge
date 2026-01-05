# FE UI/UX 원칙 리뷰 (60·30·10 + 대비, 위계/근접성, 8px 그리드/반복, Hick/Jakob/F-패턴)

## 개요
- 대상: `/frontend` UI 구현 전반
- 방법: 코드 기반 정성 리뷰 (레이아웃/스타일/컴포넌트 구조/상호작용)
- 판단 기준: 각 원칙에 대해 `적용/부분 적용/미흡`으로 구분

## 원칙별 평가 요약
- 60·30·10 + 대비: 부분 적용
- 시각적 위계 + 근접성: 부분 적용
- 8px 그리드 + 반복: 부분 적용
- Hick’s Law + CTA 설계: 부분 적용
- Jakob’s law: 부분 적용
- F-패턴: 부분 적용

## 상세 리뷰

### 1) 60·30·10 + 대비
- 상태: 부분 적용
- 근거
  - 테마 색상 체계가 기본/보조/강조 역할을 나누어 사용됨. 기본 배경과 카드/서페이스, 주요 액션 컬러가 구분됨: `frontend/src/index.css`, `frontend/src/lib/uiTheme.ts`, `frontend/src/lib/uiTokens.ts`
  - `uiTheme.ts`에서 primary 대비를 위한 `onPrimary` 계산이 있으며 CTA 버튼/태그에서 사용됨: `frontend/src/lib/uiTheme.ts`, `frontend/src/lib/uiTokens.ts`
- 미흡/리스크
  - 60·30·10 비율을 강제하는 레이아웃/토큰 규칙이 없음. 특정 화면에서 primary 색 사용량이 제한되지 않음
  - 대비는 primary/onPrimary 중심으로 보장되며, muted/soft 조합 대비 기준은 별도 검증이 필요

### 2) 시각적 위계 + 근접성
- 상태: 부분 적용
- 근거
  - 제목/섹션/본문의 폰트 크기/굵기 차이로 위계를 부여함: `frontend/src/routes/SettingsPage.tsx`, `frontend/src/routes/ArchivePage.tsx`, `frontend/src/routes/HomePage.tsx`
  - 카드/폼 내부에서 `space-y-*`, `mt-*` 등 간격으로 그룹핑(근접성) 구현: `frontend/src/routes/HomePage.tsx`, `frontend/src/routes/ArchivePage.tsx`
- 미흡/리스크
  - Thread/Entry 카드에 작은 아이콘 버튼이 밀집되어 있어 핵심 정보 대비 조작 요소가 경쟁하는 구간이 존재: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`

### 3) 8px 그리드 + 반복
- 상태: 부분 적용
- 근거
  - 공통 토큰(`uiTokens`)으로 버튼/입력/태그 스타일을 반복 사용해 시각적 일관성을 확보: `frontend/src/lib/uiTokens.ts`
  - 간격 단위가 Tailwind 스케일(4px 단위)을 기반으로 반복 적용됨: `frontend/src/App.tsx`, `frontend/src/routes/HomePage.tsx`, `frontend/src/routes/ArchivePage.tsx`
- 미흡/리스크
  - `px-1.5`, `text-[10px]` 등 4px/8px 그리드에서 벗어난 크기가 다수 있어 엄격한 8px 그리드는 아님: `frontend/src/components/home/EntryCard.tsx`, `frontend/src/components/home/ThreadCardHeader.tsx`

### 4) Hick’s Law + CTA 설계
- 상태: 부분 적용
- 근거
  - 주요 CTA는 primary 스타일로 일관되게 강조됨(로그인, 저장, 복원 등): `frontend/src/routes/HomePage.tsx`, `frontend/src/routes/SettingsPage.tsx`, `frontend/src/routes/ArchivePage.tsx`
  - Secondary/outline 스타일로 보조 행동을 구분: `frontend/src/lib/uiTokens.ts`
- 미흡/리스크
  - Thread/Entry 카드 내 다수의 미니 버튼(편집/핀/뮤트/삭제/이동 등)이 한 뷰에 모여 있어 선택 부담이 큼: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`
  - 아이콘(−, ×) 중심의 조작은 의미를 학습해야 하므로 Hick’s Law 관점에서 인지 부담 증가 가능

### 5) Jakob’s law
- 상태: 부분 적용
- 근거
  - 상단 네비게이션, 폼 레이블/입력, 버튼 패턴이 일반적인 웹 관습과 유사: `frontend/src/App.tsx`, `frontend/src/routes/HomePage.tsx`, `frontend/src/routes/SettingsPage.tsx`
- 미흡/리스크
  - 단일 문자 아이콘(−/×) 및 아이콘-only 버튼 비중이 높아 표준적 UI 기대와 다를 수 있음: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`

### 6) F-패턴
- 상태: 부분 적용
- 근거
  - 텍스트 중심 레이아웃에서 왼쪽 정렬, 상단 헤더 → 콘텐츠 리스트 흐름이 자연스러운 스캔 패턴을 지원: `frontend/src/App.tsx`, `frontend/src/routes/HomePage.tsx`, `frontend/src/routes/ArchivePage.tsx`
  - 리스트/카드형 콘텐츠가 수직으로 쌓여 정보 스캔에 유리함: `frontend/src/components/home/ThreadCard.tsx`, `frontend/src/components/home/EntryCard.tsx`
- 미흡/리스크
  - 카드 상단 우측/우상단에 조작 버튼이 집중되어 있어 시선 흐름이 분산될 수 있음

## 개선 액션 아이템 (우선순위)
- P0: Thread/Entry 카드의 조작 버튼 밀도를 낮춰 CTA 선택 부담을 줄임 (Hick’s Law, 시각적 위계)
  - 후보: 보조 액션을 드롭다운/메뉴로 묶기, hover/long-press 시 노출, 1차 CTA만 상시 노출
- P1: 8px 그리드 정합성 개선 (spacing/size 규칙 통일)
  - 후보: `px-1.5`, `text-[10px]` 등 비정형 값 정리, `uiTokens` 기준으로 단일화
- P1: 대비 기준 문서화 및 muted/soft 대비 점검
  - 후보: 테마 토큰별 대비 기준 정의, 위반 조합 체크리스트 작성
- P2: F-패턴 보강을 위한 정보 우선순위 재배치
  - 후보: 카드 상단 좌측에 핵심 텍스트/메타 집중, 우측 조작은 2차 영역으로 이동

## 수정 필요 항목 목록 (우선순위 평가)
- P0: 카드 내 조작 버튼 과밀로 인한 선택 부담 (Hick’s Law 위반 위험)
  - 근거: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`
  - 영향: 핵심 콘텐츠 대비 조작 요소가 경쟁하여 시각적 위계와 CTA 집중도 저하
- P1: 아이콘-only 조작(−/×)의 의미 학습 부담 (Jakob’s law 위반 위험)
  - 근거: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`
  - 영향: 표준 UI 기대와 다를 수 있어 오동작 가능성 및 학습 비용 증가
- P1: 8px 그리드 불일치(비정형 spacing/size)
  - 근거: `frontend/src/components/home/EntryCard.tsx`, `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/lib/uiTokens.ts`
  - 영향: 화면 간 리듬/정렬 일관성 저하, 미세한 시각적 어수선함 발생
- P2: 카드 상단 우측 조작 집중으로 F-패턴 시선 분산
  - 근거: `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/components/home/EntryCard.tsx`
  - 영향: 상단 좌측의 핵심 정보 스캔 흐름 방해 가능
- P2: 60·30·10 비율 및 대비 기준의 명문화 부재
  - 근거: `frontend/src/index.css`, `frontend/src/lib/uiTheme.ts`
  - 영향: 화면별 색상 비율/대비 품질 편차 가능성

## 구체 수정안 (위반 구간 중심)
### ThreadCardHeader 조작 영역 축소
- 대상: `frontend/src/components/home/ThreadCardHeader.tsx`
- 제안
  - 핀/편집/뮤트/숨김 버튼 중 1차 CTA(예: 편집)만 상시 노출
  - 나머지는 `...` 메뉴로 합쳐 선택지 수를 줄임 (Hick’s Law 완화)
  - 아이콘-only 버튼에는 텍스트 라벨 또는 tooltip 추가로 Jakob’s law 위반 완화

### EntryCard 조작 버튼 통합
- 대상: `frontend/src/components/home/EntryCard.tsx`
- 제안
  - 상단 우측 버튼군(편집/뮤트/숨김)을 메뉴로 통합하거나 hover 시 노출
  - 하단 우측 이동 버튼은 필요 시에만 노출하거나 한 단계로 축소해 시선 분산 감소

### 8px 그리드 정렬
- 대상: `frontend/src/components/home/EntryCard.tsx`, `frontend/src/components/home/ThreadCardHeader.tsx`, `frontend/src/lib/uiTokens.ts`
- 제안
  - `text-[10px]`, `px-1.5` 등 비정형 값을 8px 그리드 기반으로 재조정
  - `uiTokens`에 크기 단위를 고정하여 페이지별 편차를 줄임

### CTA 대비/비율 보강
- 대상: `frontend/src/lib/uiTheme.ts`, `frontend/src/lib/uiTokens.ts`
- 제안
  - primary/onPrimary 대비 외에 muted/soft 조합의 최소 대비 기준 정의
  - 60·30·10 비율을 가이드 문서로 정의하고 주요 화면에 체크리스트 적용

## 결론
- 핵심 디자인 토큰과 레이아웃 패턴은 일관되지만, 8px 그리드의 엄격성/CTA 집중도/조작 요소 밀도 측면에서 ‘부분 적용’ 수준임
- 원칙 충족도를 높이려면 조작 요소 밀도 완화, 8px 그리드 정합성 강화, 대비/비율 가이드 문서화가 필요함
