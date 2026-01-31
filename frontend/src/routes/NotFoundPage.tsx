import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { uiTokens } from '../lib/uiTokens'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className={uiTokens.card.surface}>
      <div className="text-sm font-semibold">{t('notFound.title')}</div>
      <div className="mt-2 text-sm text-[var(--theme-muted)]">
        {t('notFound.description')}
      </div>
      <Link
        to="/"
        className="mt-3 inline-flex text-sm font-semibold text-[var(--theme-primary)] hover:underline"
      >
        {t('notFound.goHome')}
      </Link>
    </div>
  )
}
