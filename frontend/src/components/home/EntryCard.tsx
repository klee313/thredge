import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { EntryCardActions, EntryCardData, EntryCardHelpers, EntryCardUi } from './types'
import { highlightMatches } from '../../lib/highlightMatches'
import { isMutedText, stripMutedText, toggleMutedText } from '../../lib/mutedText'
import eraserIcon from '../../assets/eraser.svg'
import { EntryEditor } from './EntryEditor'
import { ReplyComposer } from './ReplyComposer'

type EntryCardProps = {
  data: EntryCardData
  ui: EntryCardUi
  actions: EntryCardActions
  helpers: EntryCardHelpers
}

export function EntryCard({
  data,
  ui,
  actions,
  helpers,
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
    isReplyPending,
  } = ui
  const {
    onEditStart,
    onEditChange,
    onEditCancel,
    onEditSave,
    onToggleMute,
    onHide,
    onReplyStart,
    onReplyChange,
    onReplyCancel,
    onReplySubmit,
  } = actions
  const { handleTextareaInput, resizeTextarea } = helpers
  const indentClass = depth === 2 ? 'ml-6' : depth >= 3 ? 'ml-12' : ''
  const muted = isMutedText(entry.body)

  return (
    <div
      className={`relative min-h-[65px] rounded-lg border px-1.5 py-1 pb-6 pr-16 shadow-sm sm:px-3 sm:py-2 sm:pb-6 sm:pr-20 ${themeEntryClass} ${indentClass}`}
    >
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <button
          className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-500"
          type="button"
          onClick={onEditStart}
          aria-label={t('common.edit')}
        >
          <img className="h-3.5 w-3.5" src={eraserIcon} alt="" />
        </button>
        <button
          className={`rounded-full border px-1 py-0 text-[8px] ${
            muted ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-400'
          }`}
          type="button"
          onClick={() => onToggleMute(toggleMutedText(entry.body))}
          disabled={isEntryToggleMutePending}
          aria-label="Toggle strikethrough"
        >
          -
        </button>
        <button
          className="rounded-full border border-gray-200 px-1 py-0 text-[8px] text-gray-400"
          type="button"
          onClick={onHide}
          disabled={isEntryHidePending}
          aria-label={t('common.archive')}
        >
          ×
        </button>
      </div>
      {depth < 3 && (
        <button
          className="absolute bottom-2 right-2 rounded-md border border-gray-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700"
          type="button"
          onClick={onReplyStart}
        >
          {t('common.reply')}
        </button>
      )}
      {isEditing ? (
        <EntryEditor
          value={editingBody}
          onChange={onEditChange}
          onSave={onEditSave}
          onCancel={onEditCancel}
          isSaving={isEntryUpdatePending}
          labels={{ save: t('common.save'), cancel: t('common.cancel') }}
          handleTextareaInput={handleTextareaInput}
          resizeTextarea={resizeTextarea}
        />
      ) : (
        <>
          <div
            className={`mb-2 text-sm ${muted ? 'text-gray-400 line-through' : 'text-gray-800'}`}
          >
            {highlightMatches(muted ? stripMutedText(entry.body) : entry.body, highlightQuery)}
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">
            {formatDistanceToNow(new Date(entry.createdAt), {
              addSuffix: true,
            })}
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
          handleTextareaInput={handleTextareaInput}
          resizeTextarea={resizeTextarea}
        />
      )}
    </div>
  )
}
