import type { EntryDetail } from '../lib/api'

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

export const createEntryListActions = (actions: EntryListActions) => ({
  onEditStart: (entry: EntryDetail) => actions.onEditStart(entry),
  onEditChange: actions.onEditChange,
  onEditCancel: actions.onEditCancel,
  onEditSave: (entry: EntryDetail, value: string, isMarkdown: boolean) =>
    actions.onEditSave(entry, value, isMarkdown),
  onToggleMute: (entry: EntryDetail, nextBody: string, isMarkdown: boolean) =>
    actions.onToggleMute(entry, nextBody, isMarkdown),
  onHide: (entry: EntryDetail) => actions.onHide(entry),
  onDragStart: actions.onDragStart,
  onDragEnd: actions.onDragEnd,
  onReplyStart: (entry: EntryDetail) => actions.onReplyStart(entry),
  onReplyChange: (entry: EntryDetail, value: string) => actions.onReplyChange(entry, value),
  onReplyCancel: actions.onReplyCancel,
  onReplySubmit: (entry: EntryDetail, value: string) => actions.onReplySubmit(entry, value),
})
