import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { uiTokens } from '../lib/uiTokens'

export function RouteErrorPage() {
  const { t } = useTranslation()
  const error = useRouteError()

  const fallbackMessage = t('common.actionFailed')
  if (isRouteErrorResponse(error)) {
    const titleKey = error.status === 404 ? 'notFound.title' : 'common.actionFailed'
    return (
      <div className={uiTokens.card.surface}>
        <div className="text-sm font-semibold">{t(titleKey)}</div>
        <div className="mt-2 text-sm text-[var(--theme-muted)]">
          {error.status} {error.statusText || fallbackMessage}
        </div>
      </div>
    )
  }

  const message =
    error instanceof Error ? error.message : fallbackMessage

  return (
    <div className={uiTokens.card.surface}>
      <div className="text-sm font-semibold">{t('common.actionFailed')}</div>
      <div className="mt-2 text-sm text-[var(--theme-muted)]">
        {message}
      </div>
    </div>
  )
}
