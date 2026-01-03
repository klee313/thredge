import { useState } from 'react'
import {
  useEntryEditingState,
  useReplyDraftState,
  useThreadEditingState,
} from './useThreadUiState'

type ThreadLike = {
  id: string
  body?: string | null
  categories: { name: string }[]
}

export const useHomeFeedState = () => {
  const [threadBody, setThreadBody] = useState('')
  const [newThreadCategories, setNewThreadCategories] = useState<string[]>([])
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>({})
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeComposerTab, setActiveComposerTab] = useState<'new' | 'search'>('new')

  const threadEditor = useThreadEditingState()
  const entryEditor = useEntryEditingState()
  const replyDraft = useReplyDraftState()

  const startEditThread = (thread: ThreadLike) => {
    setEditingThreadId(thread.id)
    threadEditor.actions.startEditThread(thread)
  }

  const cancelEditThread = () => {
    setEditingThreadId(null)
    threadEditor.actions.cancelEditThread(null)
  }

  const updateEntryDraft = (threadId: string, value: string) => {
    setEntryDrafts((prev) => ({
      ...prev,
      [threadId]: value,
    }))
  }

  return {
    state: {
      threadBody,
      newThreadCategories,
      newCategoryInput,
      isAddingNewCategory,
      selectedCategories,
      entryDrafts,
      replyDrafts: replyDraft.state.replyDrafts,
      activeReplyId: replyDraft.state.activeReplyId,
      editingThreadId,
      editingThreadBody: threadEditor.state.editingThreadBody,
      editingThreadCategories: threadEditor.state.editingThreadCategories,
      editingCategoryInput: threadEditor.state.editingCategoryInput,
      isAddingEditingCategory: threadEditor.state.isAddingEditingCategory,
      editingEntryId: entryEditor.state.editingEntryId,
      editingEntryBody: entryEditor.state.editingEntryBody,
      searchQuery,
      activeComposerTab,
    },
    actions: {
      thread: {
        setThreadBody,
        setNewThreadCategories,
        setNewCategoryInput,
        setIsAddingNewCategory,
        setSelectedCategories,
        setEditingThreadId,
        setEditingThreadBody: threadEditor.actions.setEditingThreadBody,
        setEditingThreadCategories: threadEditor.actions.setEditingThreadCategories,
        setEditingCategoryInput: threadEditor.actions.setEditingCategoryInput,
        setIsAddingEditingCategory: threadEditor.actions.setIsAddingEditingCategory,
        startEditThread,
        cancelEditThread,
        toggleEditingCategory: threadEditor.actions.toggleEditingCategory,
      },
      entry: {
        setEditingEntryId: entryEditor.actions.setEditingEntryId,
        setEditingEntryBody: entryEditor.actions.setEditingEntryBody,
        startEntryEdit: entryEditor.actions.startEntryEdit,
        cancelEntryEdit: entryEditor.actions.cancelEntryEdit,
        updateEntryDraft,
      },
      reply: {
        setActiveReplyId: replyDraft.actions.setActiveReplyId,
        setReplyDrafts: replyDraft.actions.setReplyDrafts,
        startReply: replyDraft.actions.startReply,
        cancelReply: replyDraft.actions.cancelReply,
        updateReplyDraft: replyDraft.actions.updateReplyDraft,
      },
      ui: {
        setSearchQuery,
        setActiveComposerTab,
      },
    },
  }
}
