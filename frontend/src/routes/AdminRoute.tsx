import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../App'
import { ApiError } from '../lib/api'
import { uiTokens } from '../lib/uiTokens'
import { AdminPage } from './AdminPage'

export function AdminRoute() {
  const { t } = useTranslation()
  const { authQuery } = useOutletContext<AppOutletContext>()

  if (authQuery.isLoading) {
    return <div className={uiTokens.card.surface}>{t('common.loading')}</div>
  }

  if (authQuery.isError) {
    if (authQuery.error instanceof ApiError && authQuery.error.status === 401) {
      return <div className={uiTokens.card.surface}>{t('admin.loginRequired')}</div>
    }
    return <div className={uiTokens.card.surface}>{t('admin.error')}</div>
  }

  if (!authQuery.data) {
    return <div className={uiTokens.card.surface}>{t('admin.loginRequired')}</div>
  }

  if (authQuery.data.role !== 'ADMIN') {
    return <div className={uiTokens.card.surface}>{t('admin.adminOnly')}</div>
  }

  return <AdminPage />
}
