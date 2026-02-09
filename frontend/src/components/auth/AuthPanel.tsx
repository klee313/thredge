import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '../../lib/api'
import { googleOAuthStartUrl, login, signup } from '../../lib/api'
import { GOOGLE_OAUTH_ENABLED } from '../../lib/env'
import { queryKeys } from '../../lib/queryKeys'
import { uiTokens } from '../../lib/uiTokens'
import { ErrorNotice } from '../common/ErrorNotice'

type AuthPanelProps = {
  authQuery: UseQueryResult<AuthUser | null, Error>
  onAuthSuccess?: () => void
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.82.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.7A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.7V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.34l2.58-2.58A8.94 8.94 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.34C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export function AuthPanel({ authQuery, onAuthSuccess }: AuthPanelProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleAuthSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed })
    await queryClient.invalidateQueries({ queryKey: queryKeys.threads.searchRoot })
    onAuthSuccess?.()
  }

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    meta: { suppressGlobalError: true },
    onSuccess: handleAuthSuccess,
  })

  const signupMutation = useMutation({
    mutationFn: () => signup(username, password),
    meta: { suppressGlobalError: true },
    onSuccess: handleAuthSuccess,
  })

  const startGoogleLogin = () => {
    window.location.href = googleOAuthStartUrl()
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {authQuery.isLoading && (
        <div className={`w-full ${uiTokens.card.surface} sm:mx-auto sm:max-w-md`}>
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--theme-muted)]">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]"
              aria-hidden="true"
            />
            {t('common.loading')}
          </div>
        </div>
      )}

      {!authQuery.isLoading && !authQuery.data && (
        <div className={`w-full ${uiTokens.card.surface} sm:mx-auto sm:max-w-md`}>
          <div className="text-sm font-semibold">
            {mode === 'login' ? t('home.loginTitle') : t('home.signupTitle')}
          </div>
          {GOOGLE_OAUTH_ENABLED && (
            <>
              <button
                className={`mt-2 flex w-full items-center justify-center gap-2 ${uiTokens.button.secondaryMd} sm:mt-3`}
                type="button"
                onClick={startGoogleLogin}
              >
                <GoogleIcon />
                {t('home.googleLoginButton')}
              </button>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--theme-muted)]">
                <div className="h-px flex-1 bg-[var(--theme-border)]" />
                <span>{t('home.authOrDivider')}</span>
                <div className="h-px flex-1 bg-[var(--theme-border)]" />
              </div>
            </>
          )}
          <form
            className={`space-y-2 sm:space-y-3 ${GOOGLE_OAUTH_ENABLED ? 'mt-3' : 'mt-2 sm:mt-3'}`}
            onSubmit={(event) => {
              event.preventDefault()
              if (mode === 'login') {
                loginMutation.mutate()
              } else {
                signupMutation.mutate()
              }
            }}
          >
            <label className="block text-sm">
              <span className="text-[var(--theme-muted)]">{t('home.username')}</span>
              <input
                className={`mt-1 ${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                pattern="[A-Za-z0-9_]+"
                title={t('home.usernameHint')}
              />
              <div className="mt-1 text-xs text-[var(--theme-muted)]">
                {t('home.usernameHint')}
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--theme-muted)]">{t('home.password')}</span>
              <input
                className={`mt-1 ${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
            <button
              className={`w-full ${uiTokens.button.primaryMd}`}
              type="submit"
              disabled={loginMutation.isPending || signupMutation.isPending}
            >
              {loginMutation.isPending || signupMutation.isPending
                ? t('common.loading')
                : mode === 'login'
                  ? t('home.loginButton')
                  : t('home.signupButton')}
            </button>
            {mode === 'login' && loginMutation.isError && (
              <ErrorNotice message={t('home.loginError')} />
            )}
            {mode === 'signup' && signupMutation.isError && (
              <ErrorNotice message={t('home.signupError')} />
            )}
          </form>
          <div className="mt-2 flex items-center justify-between text-sm text-[var(--theme-muted)] sm:mt-3">
            <span>
              {mode === 'login' ? t('home.needAccount') : t('home.haveAccount')}
            </span>
            <button
              className="font-semibold text-[var(--theme-primary)] hover:opacity-80"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? t('home.switchToSignup') : t('home.switchToLogin')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
