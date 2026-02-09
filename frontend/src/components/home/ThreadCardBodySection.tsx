import { ThreadEditor } from './ThreadEditor'
import { ThreadBodyDisplay } from './ThreadBodyDisplay'
import { highlightMatches } from '../../lib/highlightMatches'
import type { CategorySummary } from '../../lib/api'

type ThreadCardBodySectionProps = {
  isEditing: boolean
  displayTitle: string | null
  bodyText: string | null
  isMuted: boolean
  bodySpacingClass: string
  hasHtmlLineBreaks: boolean
  isMarkdown: boolean
  normalizedSearchQuery: string
  linkTo: string
  categories: CategorySummary[]
  editingThreadBody: string
  editingThreadCategories: string[]
  editingCategoryInput: string
  isCreateCategoryPending: boolean
  isUpdateThreadPending: boolean
  onEditingThreadBodyChange: (value: string) => void
  onEditingCategoryToggle: (value: string) => void
  onEditingCategoryInputChange: (value: string) => void
  onEditingCategoryCancel: () => void
  onEditingCategorySubmit: (value: string) => void
  onSaveEdit: (value: string, isMarkdown: boolean) => void
  onCancelEdit: () => void
  onToggleMute: (value: string, isMarkdown: boolean) => void
  labels: {
    save: string
    cancel: string
    complete: string
    markdown: string
    categorySearchPlaceholder: string
    addCategory: string
    cancelCategory: string
    loadMore: string
  }
}

export function ThreadCardBodySection({
  isEditing,
  displayTitle,
  bodyText,
  isMuted,
  bodySpacingClass,
  hasHtmlLineBreaks,
  isMarkdown,
  normalizedSearchQuery,
  linkTo,
  categories,
  editingThreadBody,
  editingThreadCategories,
  editingCategoryInput,
  isCreateCategoryPending,
  isUpdateThreadPending,
  onEditingThreadBodyChange,
  onEditingCategoryToggle,
  onEditingCategoryInputChange,
  onEditingCategoryCancel,
  onEditingCategorySubmit,
  onSaveEdit,
  onCancelEdit,
  onToggleMute,
  labels,
}: ThreadCardBodySectionProps) {
  if (isEditing) {
    return (
      <>
        {displayTitle && (
          <div className="mt-8 pl-3 text-sm font-semibold">
            <span
              className={
                isMuted
                  ? 'text-[var(--theme-muted)] opacity-50 line-through'
                  : 'text-[var(--theme-ink)]'
              }
            >
              {highlightMatches(displayTitle, normalizedSearchQuery, { disableLinks: true })}
            </span>
          </div>
        )}
        <div className={displayTitle ? '' : 'mt-6'}>
          <ThreadEditor
            value={editingThreadBody}
            onChange={onEditingThreadBodyChange}
            initialIsMarkdown={isMarkdown}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            onComplete={onToggleMute}
            categories={categories}
            selectedCategories={editingThreadCategories}
            editingCategoryInput={editingCategoryInput}
            isCreateCategoryPending={isCreateCategoryPending}
            isSaving={isUpdateThreadPending}
            onToggleCategory={onEditingCategoryToggle}
            onCategoryInputChange={onEditingCategoryInputChange}
            onCategoryCancel={onEditingCategoryCancel}
            onCategorySubmit={onEditingCategorySubmit}
            labels={{
              save: labels.save,
              cancel: labels.cancel,
              complete: labels.complete,
              markdown: labels.markdown,
              categorySearchPlaceholder: labels.categorySearchPlaceholder,
              addCategory: labels.addCategory,
              cancelCategory: labels.cancelCategory,
              loadMore: labels.loadMore,
            }}
          />
        </div>
      </>
    )
  }

  return (
      <ThreadBodyDisplay
        displayTitle={displayTitle}
        bodyText={bodyText}
        isMuted={isMuted}
        bodySpacingClass={bodySpacingClass}
        hasHtmlLineBreaks={hasHtmlLineBreaks}
        highlightQuery={normalizedSearchQuery}
        linkTo={linkTo}
        isMarkdown={isMarkdown}
      />
  )
}
