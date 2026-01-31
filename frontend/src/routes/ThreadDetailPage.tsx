import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AppOutletContext } from '../App'
import { ThreadDetailView } from '../components/threadDetail/ThreadDetailView'
import { useThreadDetailController } from '../hooks/useThreadDetailController'

export function ThreadDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authQuery } = useOutletContext<AppOutletContext>()

  if (!id) {
    return (
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-[var(--theme-ink)]">
        {t('thread.missing')}
      </div>
    )
  }

  return (
    <ThreadDetailRoute
      threadId={id}
      username={authQuery.data?.username}
      onBack={() => void navigate(-1)}
    />
  )
}

type ThreadDetailRouteProps = {
  threadId: string
  username?: string
  onBack: () => void
}

function ThreadDetailRoute({ threadId, username, onBack }: ThreadDetailRouteProps) {
  const controller = useThreadDetailController({
    threadId,
    username,
  })

  return <ThreadDetailView controller={controller} onBack={onBack} />
}
