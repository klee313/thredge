import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { EntryCardActions, EntryCardData, EntryCardUi } from './types'
import { highlightMatches } from '../../lib/highlightMatches'
import { isMutedText, stripMutedText, toggleMutedText } from '../../lib/mutedText'
import { EntryEditor } from './EntryEditor'
import { ReplyComposer } from './ReplyComposer'
import { Tooltip } from '../common/Tooltip'
import { useEntryPressDrag } from '../../hooks/useEntryPressDrag'

type EntryCardProps = {
  data: EntryCardData
  ui: EntryCardUi
  actions: EntryCardActions
}

export function EntryCard({
  data,
  ui,
  actions,
}: EntryCardProps) {
  const { t } = useTranslation()
  const { entry, depth, themeEntryClass, highlightQuery } = data
  const {
    isEditing,
    editingBody,
    isReplyActive,
    replyDraft,
    isEntryUpdatePending,
    isEntryHidePending,
    isEntryToggleMutePending,
    isEntryMovePending,
    isReplyPending,
    dragState,
    replyComposerFocusId,
    onReplyComposerFocusHandled,
  } = ui
  const {
    onEditStart,
    onEditChange,
    onEditCancel,
    onEditSave,
    onToggleMute,
    onHide,
    onDragStart,
    onDragEnd,
    onReplyStart,
    onReplyChange,
    onReplyCancel,
    onReplySubmit,
  } = actions
  const indentClass = depth === 2 ? 'ml-6' : depth >= 3 ? 'ml-12' : ''
  const muted = isMutedText(entry.body)
  const isDragActive = Boolean(dragState?.activeEntryId)
  const isDraggingEntry = dragState?.activeEntryId === entry.id
  const dragCursorClass = isEditing
    ? 'cursor-text'
    : isDragActive
      ? 'cursor-grabbing select-none touch-none'
      : 'cursor-default'
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerLeave,
  } = useEntryPressDrag({
    entryId: entry.id,
    isEditing,
    isEntryMovePending,
    isDragActive,
    onDragStart,
    onDragEnd,
  })

  return (
    <div
      className={`relative min-h-[65px] rounded-lg border px-1.5 py-1 pb-6 shadow-sm sm:px-3 sm:py-2 sm:pb-6 ${themeEntryClass} ${indentClass} ${dragCursorClass} ${isDraggingEntry ? 'opacity-70' : ''
        }`}
      data-entry-id={entry.id}
      data-entry-depth={depth}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
    >
      {isEditing ? (
        <EntryEditor
          value={editingBody}
          onChange={onEditChange}
          onSave={onEditSave}
          onCancel={onEditCancel}
          onComplete={(value) => {
            const base = value.trim() ? value : entry.body
            onToggleMute(toggleMutedText(base))
          }}
          isSaving={isEntryUpdatePending}
          isCompletePending={isEntryToggleMutePending}
          ariaLabel={t('common.editEntry')}
          labels={{ save: t('common.save'), cancel: t('common.cancel'), complete: t('common.complete') }}
        />
      ) : (
        <>
          <div
            className={`mb-2 whitespace-pre-wrap text-sm ${muted
              ? 'text-[var(--theme-muted)] opacity-50 line-through'
              : 'text-[var(--theme-ink)]'
              }`}
            data-no-drag="true"
          >
            {highlightMatches(muted ? stripMutedText(entry.body) : entry.body, highlightQuery)}
          </div>
          <div
            className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-[var(--theme-muted)]"
            data-no-drag="true"
          >
            <Tooltip content={new Date(entry.createdAt).toLocaleString()}>
              <span className="opacity-50">
                {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </Tooltip>
            <div className="flex items-center gap-2">
              {depth < 3 && (
                <button
                  className="text-xs font-normal text-[var(--theme-muted)] opacity-50 hover:opacity-80"
                  type="button"
                  onClick={onReplyStart}
                  data-no-drag="true"
                >
                  {t('common.reply')}
                </button>
              )}
              <button
                className="text-xs font-normal text-[var(--theme-muted)] opacity-50 hover:opacity-80"
                type="button"
                onClick={onEditStart}
                data-no-drag="true"
              >
                {t('common.edit')}
              </button>
              <button
                className="text-xs font-normal text-[var(--theme-muted)] opacity-50 hover:opacity-80"
                type="button"
                onClick={onHide}
                disabled={isEntryHidePending}
                data-no-drag="true"
              >
                {t('common.archive')}
              </button>
            </div>
          </div>
        </>
      )}
      {isReplyActive && depth < 3 && (
        <ReplyComposer
          value={replyDraft}
          placeholder={t('common.replyPlaceholder')}
          onChange={onReplyChange}
          onSubmit={onReplySubmit}
          onCancel={onReplyCancel}
          isSubmitting={isReplyPending}
          labels={{ submit: t('common.reply'), cancel: t('common.cancel') }}
          focusId={`reply:${entry.id}`}
          activeFocusId={replyComposerFocusId}
          onFocusHandled={onReplyComposerFocusHandled}
        />
      )}
    </div>
  )
}
