import type { JSX } from 'react'
import type { EntryDetail } from '../../lib/api'
import type { EntryDragState } from './types'
import { EntryCard } from './EntryCard'

type EntryListUi = {
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

type EntryListActions = {
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

type EntryListProps = {
  orderedEntries: EntryDetail[]
  entryDepth: Map<string, number>
  themeEntryClass: string
  highlightQuery: string
  ui: EntryListUi
  actions: EntryListActions
  renderDropIndex: number | null
  dropDepth: number
  renderDropIndicator: (depth: number, key: string) => JSX.Element
  keyPrefix: string
}

export function EntryList({
  orderedEntries,
  entryDepth,
  themeEntryClass,
  highlightQuery,
  ui,
  actions,
  renderDropIndex,
  dropDepth,
  renderDropIndicator,
  keyPrefix,
}: EntryListProps) {
  const rendered: JSX.Element[] = []
  orderedEntries.forEach((entry) => {
    const depth = entryDepth.get(entry.id) ?? 1
    if (renderDropIndex !== null && renderDropIndex === rendered.length) {
      rendered.push(renderDropIndicator(dropDepth, `${keyPrefix}-drop-${entry.id}`))
    }
    rendered.push(
      <EntryCard
        key={entry.id}
        data={{
          entry,
          depth,
          themeEntryClass,
          highlightQuery,
        }}
        ui={{
          isEditing: ui.editingEntryId === entry.id,
          editingBody: ui.editingEntryBody,
          isReplyActive: ui.activeReplyId === entry.id,
          replyDraft: ui.replyDrafts[entry.id] ?? '',
          isEntryUpdatePending: ui.isEntryUpdatePending,
          isEntryHidePending: ui.isEntryHidePending,
          isEntryToggleMutePending: ui.isEntryToggleMutePending,
          isEntryMovePending: ui.isEntryMovePending,
          isReplyPending: ui.isReplyPending,
          dragState: ui.dragState,
          replyComposerFocusId: ui.replyComposerFocusId,
          onReplyComposerFocusHandled: ui.onReplyComposerFocusHandled,
        }}
        actions={{
          onEditStart: () => actions.onEditStart(entry),
          onEditChange: actions.onEditChange,
          onEditCancel: actions.onEditCancel,
          onEditSave: (val, isMarkdown) => actions.onEditSave(entry, val, isMarkdown),
          onToggleMute: (nextBody, isMarkdown) => actions.onToggleMute(entry, nextBody, isMarkdown),
          onHide: () => actions.onHide(entry),
          onDragStart: actions.onDragStart,
          onDragEnd: actions.onDragEnd,
          onReplyStart: () => actions.onReplyStart(entry),
          onReplyChange: (value) => actions.onReplyChange(entry, value),
          onReplyCancel: actions.onReplyCancel,
          onReplySubmit: (value) => actions.onReplySubmit(entry, value),
        }}
      />,
    )
  })
  if (renderDropIndex !== null && renderDropIndex === rendered.length) {
    rendered.push(renderDropIndicator(dropDepth, `${keyPrefix}-drop-tail`))
  }
  return <>{rendered}</>
}
