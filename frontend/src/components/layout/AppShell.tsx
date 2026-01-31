import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { applyTheme, resolveTheme } from '../../lib/uiTheme'
import { useSettingsStore } from '../../store/settingsStore'
import { useGlobalErrorStore } from '../../store/globalErrorStore'
import { useGlobalErrorReporter } from '../../hooks/useGlobalErrorReporter'
import { usePinchFontSize } from '../../hooks/usePinchFontSize'
import { AppHeader } from './AppHeader'
import { GlobalErrorBanner } from './GlobalErrorBanner'
import { HeaderSlotProvider } from './HeaderSlotContext'
import { ProfileCorner } from './ProfileCorner'
import i18n from '../../i18n'
import { supportedLanguages, type SupportedLanguage } from '../../lib/languages'

type AppShellProps = {
  children: ReactNode
  isAdmin: boolean
  isAuthenticated: boolean
  isAuthLoading: boolean
  onLogout: () => void
  isLogoutPending: boolean
  displayName?: string | null
  username?: string | null
}

type GlobalErrorEntry = {
  userMessage: string
  devMessage?: string
  source: string
  at: number
}

export function AppShell({
  children,
  isAdmin,
  isAuthenticated,
  isAuthLoading,
  onLogout,
  isLogoutPending,
  displayName,
  username,
}: AppShellProps) {
  const [headerSlot, setHeaderSlot] = useState<ReactNode | null>(null)
  const {
    themePreset,
    themeCustomColor,
    pinchZoomEnabled,
    uiLanguage,
    profileImageUrl,
    setPartial,
  } =
    useSettingsStore()
  const { message: globalError, clearError, autoDismissMs } = useGlobalErrorStore()
  const { t } = useTranslation()
  usePinchFontSize(pinchZoomEnabled)

  const errorSources = useMemo(
    () => ['api', 'auth', 'ui', 'network', 'runtime', 'unknown'],
    [],
  )
  const handleGlobalError = useCallback((entry: GlobalErrorEntry) => {
    console.warn('[global-error]', entry)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thredge:global-error', { detail: entry }))
    }
  }, [])

  useGlobalErrorReporter(handleGlobalError, { sources: errorSources })

  useEffect(() => {
    applyTheme(resolveTheme(themePreset, themeCustomColor))
  }, [themePreset, themeCustomColor])

  useEffect(() => {
    const current = i18n.resolvedLanguage ?? i18n.language
    if (!current || !supportedLanguages.includes(current as SupportedLanguage)) {
      return
    }
    if (current !== uiLanguage) {
      setPartial({ uiLanguage: current as SupportedLanguage })
    }
  }, [setPartial, uiLanguage])

  useEffect(() => {
    const current = i18n.resolvedLanguage ?? i18n.language
    if (!uiLanguage || current === uiLanguage) {
      return
    }
    void i18n.changeLanguage(uiLanguage)
  }, [uiLanguage])

  useEffect(() => {
    if (!globalError) {
      return
    }
    const timer = window.setTimeout(() => {
      clearError()
    }, autoDismissMs)
    return () => window.clearTimeout(timer)
  }, [autoDismissMs, clearError, globalError])

  return (
    <div className="min-h-full bg-[var(--theme-base)] text-[var(--theme-ink)]">
      <AppHeader
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        onLogout={onLogout}
        isLogoutPending={isLogoutPending}
        headerSlot={headerSlot}
      />
      {globalError && (
        <GlobalErrorBanner
          message={globalError}
          dismissLabel={t('common.dismiss')}
          onDismiss={clearError}
        />
      )}
      {isAuthenticated && displayName && username && (
        <ProfileCorner
          displayName={displayName}
          username={username}
          imageUrl={profileImageUrl}
          imageAlt={t('settings.profileImageAlt')}
        />
      )}
      <HeaderSlotProvider setHeaderSlot={setHeaderSlot}>
        <main className="w-full pl-2 pr-1 pt-6 pb-4 sm:mx-auto sm:max-w-3xl sm:px-4 sm:py-6">
          {children}
        </main>
      </HeaderSlotProvider>
    </div>
  )
}
