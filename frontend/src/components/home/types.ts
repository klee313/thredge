import type { FormEvent } from 'react'
import type { CategorySummary, EntryDetail } from '../../lib/api'

export type EntryCardData = {
  entry: EntryDetail
  depth: number
  themeEntryClass: string
  highlightQuery: string
}

export type EntryCardUi = {
  isEditing: boolean
  editingBody: string
  isReplyActive: boolean
  replyDraft: string
  isEntryUpdatePending: boolean
  isEntryHidePending: boolean
  isEntryToggleMutePending: boolean
  isReplyPending: boolean
}

export type EntryCardActions = {
  onEditStart: () => void
  onEditChange: (value: string) => void
  onEditCancel: () => void
  onEditSave: () => void
  onToggleMute: (nextBody: string) => void
  onHide: () => void
  onReplyStart: () => void
  onReplyChange: (value: string) => void
  onReplyCancel: () => void
  onReplySubmit: () => void
}

export type EntryCardHelpers = {
  handleTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void
  resizeTextarea: (element: HTMLTextAreaElement | null) => void
}

export type ThreadEditorLabels = {
  save: string
  saving?: string
  cancel: string
  categoryPlaceholder: string
  addCategory: string
  cancelCategory: string
}

export type ThreadEditorProps = {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  categories: CategorySummary[]
  selectedCategories: string[]
  editingCategoryInput: string
  isAddingCategory: boolean
  isCreateCategoryPending: boolean
  isSaving: boolean
  buttonSize?: 'sm' | 'md'
  onToggleCategory: (name: string) => void
  onCategoryInputChange: (value: string) => void
  onCategoryOpen: () => void
  onCategoryCancel: () => void
  onCategorySubmit: () => void
  labels: ThreadEditorLabels
  handleTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void
  resizeTextarea: (element: HTMLTextAreaElement | null) => void
}
