import { formatDistanceToNow } from 'date-fns'
import { memo, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import type { EntryDetail } from '../../lib/api'
import { ThreadCardHeader } from './ThreadCardHeader'
import { Tooltip } from '../common/Tooltip'
import type { EntryDragState, ThreadCardActions, ThreadCardData, ThreadCardUi } from './types'
import { ThreadCardBodySection } from './ThreadCardBodySection'
import { ThreadCardEntriesSection } from './ThreadCardEntriesSection'

export type ThreadCardViewProps = {
  containerRef?: Ref<HTMLDivElement>
  data: ThreadCardData
  ui: ThreadCardUi
  actions: ThreadCardActions
  displayTitle: string | null
  bodyText: string | null
  isMuted: boolean
  bodySpacingClass: string
  hasHtmlLineBreaks: boolean
  orderedEntries: EntryDetail[]
  entryDepth: Map<string, number>
  entriesIsError: boolean
  dragState: EntryDragState
  dragError: string | null
  handleDragStart: (entryId: string) => void
  handleDragEnd: () => void
  renderDropIndex: number | null
  dropDepth: number
  renderDropIndicator: (depth: number, key: string) => JSX.Element
}

export const ThreadCardView = memo(function ThreadCardView({
  containerRef,
  data,
  ui,
  actions,
  displayTitle,
  bodyText,
  isMuted,
  bodySpacingClass,
  hasHtmlLineBreaks,
  orderedEntries,
  entryDepth,
  entriesIsError,
  dragState,
  dragError,
  handleDragStart,
  handleDragEnd,
  renderDropIndex,
  dropDepth,
  renderDropIndicator,
}: ThreadCardViewProps) {
  const { t } = useTranslation()
  const {
    thread,
    theme,
    categories,
    normalizedSearchQuery,
    linkTo,
  } = data
  const {
    isEditing,
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
    editingEntryId,
    editingEntryBody,
    activeReplyId,
    replyDrafts,
    newEntryDraft,
    isUpdateThreadPending,
    isCreateCategoryPending,
    isPinPending,
    isUnpinPending,
    isHidePending,
    isEntryUpdatePending,
    isEntryHidePending,
    isEntryToggleMutePending,
    isEntryMovePending,
    isReplyPending,
    isAddEntryPending,
    entryComposerFocusId,
    onEntryComposerFocusHandled,
    replyComposerFocusId,
    onReplyComposerFocusHandled,
  } = ui
  const {
    onStartEdit,
    onCancelEdit,
    onEditingThreadBodyChange,
    onEditingCategoryToggle,
    onEditingCategoryInputChange,
    onEditingCategoryCancel,
    onEditingCategorySubmit,
    onSaveEdit,
    onTogglePin,
    onToggleMute,
    onHide,
    onEntryEditStart,
    onEntryEditChange,
    onEntryEditCancel,
    onEntryEditSave,
    onEntryToggleMute,
    onEntryHide,
    onReplyStart,
    onReplyChange,
    onReplyCancel,
    onReplySubmit,
    onNewEntryChange,
    onNewEntrySubmit,
  } = actions

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border pl-2 pr-1 pt-8 pb-1 shadow-sm sm:px-6 sm:py-5 ${thread.pinned ? 'text-xs' : ''} ${theme.card}`}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-0.5 w-full rounded-t-xl bg-[var(--theme-border)]" />
      <ThreadCardHeader
        thread={thread}
        isEditing={isEditing}
        editingThreadCategories={editingThreadCategories}
        isPinPending={isPinPending}
        isUnpinPending={isUnpinPending}
        isHidePending={isHidePending}
        labels={{
          pin: t('home.pin'),
          unpin: t('home.unpin'),
          edit: t('common.edit'),
          archive: t('common.archive'),
        }}
        onTogglePin={onTogglePin}
        onStartEdit={onStartEdit}
        onHide={onHide}
        onEditingCategoryToggle={onEditingCategoryToggle}
      />
      <ThreadCardBodySection
        isEditing={isEditing}
        displayTitle={displayTitle}
        bodyText={bodyText}
        isMuted={isMuted}
        bodySpacingClass={bodySpacingClass}
        hasHtmlLineBreaks={hasHtmlLineBreaks}
        normalizedSearchQuery={normalizedSearchQuery}
        linkTo={linkTo}
        categories={categories}
        editingThreadBody={editingThreadBody}
        editingThreadCategories={editingThreadCategories}
        editingCategoryInput={editingCategoryInput}
        isCreateCategoryPending={isCreateCategoryPending}
        isUpdateThreadPending={isUpdateThreadPending}
        onEditingThreadBodyChange={onEditingThreadBodyChange}
        onEditingCategoryToggle={onEditingCategoryToggle}
        onEditingCategoryInputChange={onEditingCategoryInputChange}
        onEditingCategoryCancel={onEditingCategoryCancel}
        onEditingCategorySubmit={onEditingCategorySubmit}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onToggleMute={onToggleMute}
        labels={{
          save: t('common.save'),
          cancel: t('common.cancel'),
          complete: t('common.complete'),
          categorySearchPlaceholder: t('home.categorySearchPlaceholder'),
          addCategory: t('home.addCategory'),
          cancelCategory: t('common.cancel'),
          loadMore: t('home.loadMore'),
        }}
      />
      {dragError && <div className="mt-3 text-xs text-red-600">{dragError}</div>}
      <ThreadCardEntriesSection
        orderedEntries={orderedEntries}
        entryDepth={entryDepth}
        themeEntryClass={theme.entry}
        highlightQuery={normalizedSearchQuery}
        renderDropIndex={renderDropIndex}
        dropDepth={dropDepth}
        renderDropIndicator={renderDropIndicator}
        keyPrefix={`thread-${thread.id}`}
        entriesIsError={entriesIsError}
        errorMessage={t('home.error')}
        ui={{
          editingEntryId,
          editingEntryBody,
          activeReplyId,
          replyDrafts,
          isEntryUpdatePending,
          isEntryHidePending,
          isEntryToggleMutePending,
          isEntryMovePending,
          isReplyPending,
          dragState,
          replyComposerFocusId,
          onReplyComposerFocusHandled,
        }}
        actions={{
          onEditStart: (entry) => onEntryEditStart(entry.id, entry.body),
          onEditChange: onEntryEditChange,
          onEditCancel: onEntryEditCancel,
          onEditSave: (entry, val) => onEntryEditSave(entry.id, val),
          onToggleMute: (entry, nextBody) => onEntryToggleMute(entry.id, nextBody),
          onHide: (entry) => onEntryHide(entry.id),
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          onReplyStart: (entry) => onReplyStart(entry.id),
          onReplyChange: (entry, value) => onReplyChange(entry.id, value),
          onReplyCancel: onReplyCancel,
          onReplySubmit: (entry, value) => onReplySubmit(entry.id, value),
        }}
        newEntryDraft={newEntryDraft}
        onNewEntryChange={onNewEntryChange}
        onNewEntrySubmit={onNewEntrySubmit}
        isAddEntryPending={isAddEntryPending}
        entryComposerFocusId={entryComposerFocusId}
        entryComposerFocusKey={`entry:${thread.id}`}
        onEntryComposerFocusHandled={onEntryComposerFocusHandled}
        showEntryComposer={!thread.pinned}
        labels={{
          entryPlaceholder: t('common.entryPlaceholder'),
          submitEntry: t('common.addEntry'),
          submittingEntry: t('common.loading'),
        }}
      />
      <div className="mt-2 text-xs text-[var(--theme-muted)] sm:mt-4">
        <Tooltip content={new Date(thread.lastActivityAt).toLocaleString()}>
          <span className="opacity-50">
            {t('home.lastActivity', {
              time: formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true }),
            })}
          </span>
        </Tooltip>
      </div>
    </div>
  )
})
