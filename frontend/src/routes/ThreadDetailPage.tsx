import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AppOutletContext } from '../App'
import { ThreadDetailView } from '../components/threadDetail/ThreadDetailView'
import { useThreadDetailController } from '../hooks/useThreadDetailController'

export function ThreadDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authQuery } = useOutletContext<AppOutletContext>()
  const [searchParams] = useSearchParams()
  const autoEdit = searchParams.get('edit') === '1'
  const autoInsertTodoExample = searchParams.get('todoExample') === '1'

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
      autoEdit={autoEdit}
      autoInsertTodoExample={autoInsertTodoExample}
      onBack={() => void navigate(-1)}
    />
  )
}

type ThreadDetailRouteProps = {
  threadId: string
  username?: string
  autoEdit: boolean
  autoInsertTodoExample: boolean
  onBack: () => void
}

function ThreadDetailRoute({
  threadId,
  username,
  autoEdit,
  autoInsertTodoExample,
  onBack,
}: ThreadDetailRouteProps) {
  const controller = useThreadDetailController({
    threadId,
    username,
    autoEditThread: autoEdit,
    autoInsertTodoExample,
  })

  return <ThreadDetailView controller={controller} onBack={onBack} />
}
