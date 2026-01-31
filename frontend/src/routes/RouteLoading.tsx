import { useTranslation } from 'react-i18next'
import { uiTokens } from '../lib/uiTokens'

export function RouteLoading() {
  const { t } = useTranslation()

  return (
    <div className={`${uiTokens.card.surface} text-sm text-[var(--theme-muted)]`}>
      {t('common.loading')}
    </div>
  )
}
