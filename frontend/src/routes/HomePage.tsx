import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchBackendHealth } from '../lib/api'

export function HomePage() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['backendHealth'],
    queryFn: fetchBackendHealth,
  })

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{t('home.title')}</h1>

      <div className="rounded-lg border bg-white p-4 text-gray-900">
        <div className="text-sm text-gray-600">{t('home.backendHealth')}</div>
        <div className="mt-1 font-mono text-sm">
          {query.isLoading && t('home.loading')}
          {query.isError && t('home.error')}
          {query.data && JSON.stringify(query.data)}
        </div>
      </div>
    </div>
  )
}

