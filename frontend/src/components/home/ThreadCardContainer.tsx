import { memo } from 'react'
import type { CategorySummary, ThreadFeedItem } from '../../lib/api'
import { ThreadCard } from './ThreadCard'
import type { useHomeFeedController } from '../../hooks/useHomeFeedController'
import { useThreadCardAdapter } from '../../hooks/useThreadCardAdapter'

type ThreadCardContainerProps = {
  controller: ReturnType<typeof useHomeFeedController>
  thread: ThreadFeedItem
  categories: CategorySummary[]
}

export const ThreadCardContainer = memo(function ThreadCardContainer({
  controller,
  thread,
  categories,
}: ThreadCardContainerProps) {
  const { data, ui, actions } = useThreadCardAdapter({ controller, thread, categories })

  return (
    <ThreadCard
      data={data}
      ui={ui}
      actions={actions}
    />
  )
})
