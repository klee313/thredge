# thredge frontend

React + TypeScript + Vite based client for thredge.

## Requirements
- Node.js 20+
- pnpm/npm/yarn

## Quick start
- Install: `npm install`
- Dev server: `npm run dev`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Lint (fix): `npm run lint:fix`
- Test: `npm run test`
- Build: `npm run build`
- Preview: `npm run preview`
- OpenAPI types: `npm run openapi:types`
- OpenAPI types check: `npm run openapi:check`

## Tooling notes
- Preferred package manager: `npm` (this repo ships `package-lock.json`).
- `openapi:check` relies on `git diff` and expects a git working tree.
- `src/lib/api/generated.ts` is kept for schema drift checks; runtime types use curated definitions in `src/lib/api.ts`.

## Environment
- `VITE_API_BASE_URL`
  - API base URL. Empty string means same-origin.
- `VITE_TRUSTED_HTML`
  - Set to `1`/`true` to allow trusted HTML rendering in highlights (default: enabled).
  - Set to `0`/`false` to force plain-text rendering.
- `FRONTEND_PORT`
  - Dev server port (default: 5174).
- `VITE_DISABLE_HMR`
  - Set to `1` to disable HMR (default: enabled).
- `VITE_USE_POLLING`
  - Set to `1` to enable file watching via polling (default: disabled).

## Project notes
- Theme is applied via CSS variables (`--theme-*`) and updated at runtime.
- UI language uses i18next. Supported languages: `ko`, `en`, `tr`.
- App state in Settings is persisted in `localStorage` (key: `thredge-settings-v1`).

## Conventions
- API calls live in `src/lib/api.ts`.
- Query keys are centralized in `src/lib/queryKeys.ts`.
- Shared UI tokens are in `src/lib/uiTokens.ts`.
