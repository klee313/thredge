import { uiTokens } from '../../lib/uiTokens'
import { NewThreadComposer } from './NewThreadComposer'

type HomeFeedComposerProps = {
  title: string
  displayName: string
  username: string
  threadBody: string
  onThreadBodyChange: (value: string) => void
  onThreadSubmit: (value: string) => void
  isThreadSubmitting: boolean
  categorySelector?: {
    categories: { id: string; name: string }[]
    selectedCategories: string[]
    isCreateCategoryPending: boolean
    onToggleCategory: (name: string) => void
    onCategorySubmit: (value: string) => void
    labels: {
      categorySearchPlaceholder: string
      loadMore: string
      addCategory: string
      cancelCategory: string
    }
  }
}

export function HomeFeedComposer({
  title,
  displayName,
  username,
  threadBody,
  onThreadBodyChange,
  onThreadSubmit,
  isThreadSubmitting,
  categorySelector,
}: HomeFeedComposerProps) {
  return (
    <div className={`${uiTokens.card.surface} pt-2 sm:pt-4`}>
      <div className="relative">
        <NewThreadComposer
          title={title}
          displayName={displayName}
          username={username}
          value={threadBody}
          onChange={onThreadBodyChange}
          onSubmit={onThreadSubmit}
          isSubmitting={isThreadSubmitting}
          categorySelector={categorySelector}
        />
      </div>
    </div>
  )
}
