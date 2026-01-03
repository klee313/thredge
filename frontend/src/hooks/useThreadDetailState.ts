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

export const useThreadDetailState = () => {
  const [entryBody, setEntryBody] = useState('')
  const [isEditingThread, setIsEditingThread] = useState(false)
  const threadEditor = useThreadEditingState()
  const entryEditor = useEntryEditingState()
  const replyDraft = useReplyDraftState()

  const syncThread = (thread: ThreadLike) => {
    threadEditor.actions.syncThread(thread)
  }

  const startEditThread = (thread: ThreadLike) => {
    setIsEditingThread(true)
    threadEditor.actions.startEditThread(thread)
  }

  const cancelEditThread = (thread: ThreadLike) => {
    setIsEditingThread(false)
    threadEditor.actions.cancelEditThread(thread)
  }

  return {
    state: {
      entryBody,
      replyDrafts: replyDraft.state.replyDrafts,
      activeReplyId: replyDraft.state.activeReplyId,
      editingEntryId: entryEditor.state.editingEntryId,
      editingEntryBody: entryEditor.state.editingEntryBody,
      isEditingThread,
      editingThreadBody: threadEditor.state.editingThreadBody,
      editingThreadCategories: threadEditor.state.editingThreadCategories,
      editingCategoryInput: threadEditor.state.editingCategoryInput,
      isAddingEditingCategory: threadEditor.state.isAddingEditingCategory,
    },
    actions: {
      thread: {
        setIsEditingThread,
        setEditingThreadBody: threadEditor.actions.setEditingThreadBody,
        setEditingThreadCategories: threadEditor.actions.setEditingThreadCategories,
        setEditingCategoryInput: threadEditor.actions.setEditingCategoryInput,
        setIsAddingEditingCategory: threadEditor.actions.setIsAddingEditingCategory,
        syncThread,
        startEditThread,
        cancelEditThread,
        toggleEditingCategory: threadEditor.actions.toggleEditingCategory,
      },
      entry: {
        setEntryBody,
        setEditingEntryId: entryEditor.actions.setEditingEntryId,
        setEditingEntryBody: entryEditor.actions.setEditingEntryBody,
        startEntryEdit: entryEditor.actions.startEntryEdit,
        cancelEntryEdit: entryEditor.actions.cancelEntryEdit,
      },
      reply: {
        setReplyDrafts: replyDraft.actions.setReplyDrafts,
        setActiveReplyId: replyDraft.actions.setActiveReplyId,
        startReply: replyDraft.actions.startReply,
        cancelReply: replyDraft.actions.cancelReply,
        updateReplyDraft: replyDraft.actions.updateReplyDraft,
      },
    },
  }
}
