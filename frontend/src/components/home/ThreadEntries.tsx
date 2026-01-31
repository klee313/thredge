import type { JSX } from 'react'
import type { EntryDetail } from '../../lib/api'
import type { EntryDragState } from './types'
import { EntryListSection } from './EntryListSection'

type ThreadEntriesProps = {
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
}

export function ThreadEntries({
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
}: ThreadEntriesProps) {
  return (
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
  )
}
