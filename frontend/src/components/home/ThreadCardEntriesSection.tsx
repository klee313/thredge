import type { JSX } from 'react'
import type { EntryDetail } from '../../lib/api'
import type { EntryDragState } from './types'
import { ThreadEntries } from './ThreadEntries'
import { EntryComposer } from './EntryComposer'
import { createEntryListActions } from '../../hooks/useEntryListActions'

type ThreadCardEntriesSectionProps = {
  orderedEntries: EntryDetail[]
  entryDepth: Map<string, number>
  themeEntryClass: string
  highlightQuery: string
  renderDropIndex: number | null
  dropDepth: number
  renderDropIndicator: (depth: number, key: string) => JSX.Element
  keyPrefix: string
  entriesIsError: boolean
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
    onEditSave: (entry: EntryDetail, value: string, isMarkdown: boolean) => void
    onToggleMute: (entry: EntryDetail, nextBody: string, isMarkdown: boolean) => void
    onHide: (entry: EntryDetail) => void
    onDragStart?: (entryId: string) => void
    onDragEnd?: () => void
    onReplyStart: (entry: EntryDetail) => void
    onReplyChange: (entry: EntryDetail, value: string) => void
    onReplyCancel: () => void
    onReplySubmit: (entry: EntryDetail, value: string) => void
  }
  newEntryDraft: string
  onNewEntryChange: (value: string) => void
  onNewEntrySubmit: (value: string) => void
  isAddEntryPending: boolean
  entryComposerFocusId?: string | null
  entryComposerFocusKey: string
  onEntryComposerFocusHandled?: () => void
  showEntryComposer: boolean
  labels: {
    entryPlaceholder: string
    submitEntry: string
    submittingEntry: string
  }
}

export function ThreadCardEntriesSection({
  orderedEntries,
  entryDepth,
  themeEntryClass,
  highlightQuery,
  renderDropIndex,
  dropDepth,
  renderDropIndicator,
  keyPrefix,
  entriesIsError,
  errorMessage,
  ui,
  actions,
  newEntryDraft,
  onNewEntryChange,
  onNewEntrySubmit,
  isAddEntryPending,
  entryComposerFocusId,
  entryComposerFocusKey,
  onEntryComposerFocusHandled,
  showEntryComposer,
  labels,
}: ThreadCardEntriesSectionProps) {
  return (
    <>
      <ThreadEntries
        orderedEntries={orderedEntries}
        entryDepth={entryDepth}
        themeEntryClass={themeEntryClass}
        highlightQuery={highlightQuery}
        renderDropIndex={renderDropIndex}
        dropDepth={dropDepth}
        renderDropIndicator={renderDropIndicator}
        keyPrefix={keyPrefix}
        isError={entriesIsError}
        errorMessage={errorMessage}
        ui={ui}
        actions={createEntryListActions(actions)}
      />
      {showEntryComposer && (
        <EntryComposer
          value={newEntryDraft}
          placeholder={labels.entryPlaceholder}
          onChange={onNewEntryChange}
          onSubmit={onNewEntrySubmit}
          isSubmitting={isAddEntryPending}
          labels={{ submit: labels.submitEntry, submitting: labels.submittingEntry }}
          focusId={entryComposerFocusKey}
          activeFocusId={entryComposerFocusId}
          onFocusHandled={onEntryComposerFocusHandled}
        />
      )}
    </>
  )
}
