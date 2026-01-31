import type { JSX } from 'react'
import type { EntryDetail } from '../../lib/api'
import type { EntryDragState } from '../home/types'
import { EntryListSection } from '../home/EntryListSection'
import { EntryComposer } from '../home/EntryComposer'
import { Tooltip } from '../common/Tooltip'
import { formatDistanceToNow } from 'date-fns'

type ThreadDetailEntriesProps = {
  orderedEntries: EntryDetail[]
  entryDepth: Map<string, number>
  themeEntryClass: string
  highlightQuery: string
  renderDropIndex: number | null
  dropDepth: number
  renderDropIndicator: (depth: number, key: string) => JSX.Element
  keyPrefix: string
  isError: boolean
  errorMessage: string
  ui: {
    editingEntryId: string | null
    editingEntryBody: string
    activeReplyId: string | null
    replyDrafts: Record<string, string>
    isEntryUpdatePending: boolean
    isEntryHidePending: boolean
    isEntryToggleMutePending: boolean
    isEntryMovePending: boolean
    isReplyPending: boolean
    dragState?: EntryDragState
    replyComposerFocusId?: string | null
    onReplyComposerFocusHandled?: () => void
  }
  actions: {
    onEditStart: (entry: EntryDetail) => void
    onEditChange: (value: string) => void
    onEditCancel: () => void
    onEditSave: (entry: EntryDetail, value?: string) => void
    onToggleMute: (entry: EntryDetail, nextBody: string) => void
    onHide: (entry: EntryDetail) => void
    onDragStart?: (entryId: string) => void
    onDragEnd?: () => void
    onReplyStart: (entry: EntryDetail) => void
    onReplyChange: (entry: EntryDetail, value: string) => void
    onReplyCancel: () => void
    onReplySubmit: (entry: EntryDetail, value: string) => void
  }
  composer: {
    value: string
    placeholder: string
    onChange: (value: string) => void
    onSubmit: (value: string) => void
    isSubmitting: boolean
    labels: { submit: string; submitting?: string }
    focusId?: string
    activeFocusId?: string | null
    onFocusHandled?: () => void
  }
  lastActivityAt?: string | null
  lastActivityLabel: (relative: string) => string
}

export function ThreadDetailEntries({
  orderedEntries,
  entryDepth,
  themeEntryClass,
  highlightQuery,
  renderDropIndex,
  dropDepth,
  renderDropIndicator,
  keyPrefix,
  isError,
  errorMessage,
  ui,
  actions,
  composer,
  lastActivityAt,
  lastActivityLabel,
}: ThreadDetailEntriesProps) {
  return (
    <>
      <EntryListSection
        orderedEntries={orderedEntries}
        entryDepth={entryDepth}
        themeEntryClass={themeEntryClass}
        highlightQuery={highlightQuery}
        renderDropIndex={renderDropIndex}
        dropDepth={dropDepth}
        renderDropIndicator={renderDropIndicator}
        keyPrefix={keyPrefix}
        isError={isError}
        errorMessage={errorMessage}
        ui={ui}
        actions={actions}
      />
      <EntryComposer
        value={composer.value}
        placeholder={composer.placeholder}
        onChange={composer.onChange}
        onSubmit={composer.onSubmit}
        isSubmitting={composer.isSubmitting}
        labels={composer.labels}
        focusId={composer.focusId}
        activeFocusId={composer.activeFocusId}
        onFocusHandled={composer.onFocusHandled}
      />
      {lastActivityAt && (
        <div className="mt-2 text-xs text-[var(--theme-muted)] sm:mt-4">
          <Tooltip content={new Date(lastActivityAt).toLocaleString()}>
            <span className="opacity-50">
              {lastActivityLabel(
                formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true }),
              )}
            </span>
          </Tooltip>
        </div>
      )}
    </>
  )
}
