import type { CategorySummary, EntryDetail, EntryMovePosition, ThreadFeedItem } from '../../lib/api'

export type EntryCardData = {
  entry: EntryDetail
  depth: number
  themeEntryClass: string
  highlightQuery: string
}

export type EntryDragState = {
  activeEntryId: string | null
  overEntryId: string | null
  overPosition: 'before' | 'after' | 'child' | null
}

export type EntryCardUi = {
  isEditing: boolean
  editingBody: string
  isReplyActive: boolean
  replyDraft: string
  isEntryUpdatePending: boolean
  isEntryHidePending: boolean
  isEntryToggleMutePending: boolean
  isEntryMovePending: boolean
  isReplyPending: boolean
  dragState?: EntryDragState
  replyComposerFocusId?: string | null
  onReplyComposerFocusHandled?: () => void
}

export type EntryCardActions = {
  onEditStart: () => void
  onEditChange: (value: string) => void
  onEditCancel: () => void
  onEditSave: (value: string, isMarkdown: boolean) => void
  onToggleMute: (nextBody: string, isMarkdown: boolean) => void
  onHide: () => void
  onDragStart?: (entryId: string) => void
  onDragEnd?: () => void
  onReplyStart: () => void
  onReplyChange: (value: string) => void
  onReplyCancel: () => void
  onReplySubmit: (value: string) => void
}

export type EntryCardProps = {
  data: EntryCardData
  ui: EntryCardUi
  actions: EntryCardActions
}

export type ThreadEditorLabels = {
  save: string
  saving?: string
  cancel: string
  complete: string
  markdown: string
  categorySearchPlaceholder: string
  addCategory: string
  cancelCategory: string
  loadMore: string
}

export type ThreadEditorProps = {
  value: string
  onChange: (value: string) => void
  onSave: (value: string, isMarkdown: boolean) => void
  onCancel: () => void
  onComplete: (value: string, isMarkdown: boolean) => void
  initialIsMarkdown: boolean
  categories: CategorySummary[]
  selectedCategories: string[]
  editingCategoryInput: string
  isCreateCategoryPending: boolean
  isSaving: boolean
  buttonSize?: 'sm' | 'md'
  onToggleCategory: (name: string) => void
  onCategoryInputChange: (value: string) => void
  onCategoryCancel: () => void
  onCategorySubmit: (value: string) => void
  labels: ThreadEditorLabels
}

export type ThreadCardData = {
  thread: ThreadFeedItem
  theme: { card: string; entry: string }
  categories: CategorySummary[]
  normalizedSearchQuery: string
  linkTo: string
}

export type ThreadCardUi = {
  isEditing: boolean
  editingThreadBody: string
  editingThreadCategories: string[]
  editingCategoryInput: string
  editingEntryId: string | null
  editingEntryBody: string
  activeReplyId: string | null
  replyDrafts: Record<string, string>
  newEntryDraft: string
  isUpdateThreadPending: boolean
  isCreateCategoryPending: boolean
  isPinPending: boolean
  isUnpinPending: boolean
  isHidePending: boolean
  isEntryUpdatePending: boolean
  isEntryHidePending: boolean
  isEntryToggleMutePending: boolean
  isEntryMovePending: boolean
  isReplyPending: boolean
  isAddEntryPending: boolean
  entryComposerFocusId: string | null
  onEntryComposerFocusHandled: () => void
  replyComposerFocusId: string | null
  onReplyComposerFocusHandled: () => void
}

export type ThreadCardActions = {
  onStartEdit: () => void
  onCancelEdit: () => void
  onEditingThreadBodyChange: (value: string) => void
  onEditingCategoryToggle: (name: string) => void
  onEditingCategoryInputChange: (value: string) => void
  onEditingCategoryCancel: () => void
  onEditingCategorySubmit: (value: string) => void
  onSaveEdit: (value: string, isMarkdown: boolean) => void
  onTogglePin: () => void
  onToggleMute: (value: string, isMarkdown: boolean) => void
  onHide: () => void
  onEntryEditStart: (entryId: string, body: string) => void
  onEntryEditChange: (value: string) => void
  onEntryEditCancel: () => void
  onEntryEditSave: (entryId: string, value: string, isMarkdown: boolean) => void
  onEntryToggleMute: (entryId: string, body: string, isMarkdown: boolean) => void
  onEntryHide: (entryId: string) => void
  onEntryMoveTo: (
    entryId: string,
    targetEntryId: string,
    position: EntryMovePosition,
    threadId: string,
  ) => Promise<void>
  onReplyStart: (entryId: string) => void
  onReplyChange: (entryId: string, value: string) => void
  onReplyCancel: () => void
  onReplySubmit: (entryId: string, value: string) => void
  onNewEntryChange: (value: string) => void
  onNewEntrySubmit: (value: string) => void
}
