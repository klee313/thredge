import { useState } from 'react'

type ThreadLike = {
  id: string
  body?: string | null
  categories: { name: string }[]
}

type EntryLike = {
  id: string
  body: string
}

const useThreadEditingState = () => {
  const [editingThreadBody, setEditingThreadBody] = useState('')
  const [editingThreadCategories, setEditingThreadCategories] = useState<string[]>([])
  const [editingCategoryInput, setEditingCategoryInput] = useState('')
  const [isAddingEditingCategory, setIsAddingEditingCategory] = useState(false)

  const applyThread = (thread: ThreadLike | null) => {
    if (!thread) {
      setEditingThreadBody('')
      setEditingThreadCategories([])
      return
    }
    setEditingThreadBody(thread.body ?? '')
    setEditingThreadCategories(thread.categories.map((item) => item.name))
  }

  const resetCategoryInputs = () => {
    setEditingCategoryInput('')
    setIsAddingEditingCategory(false)
  }

  const syncThread = (thread: ThreadLike) => {
    applyThread(thread)
  }

  const startEditThread = (thread: ThreadLike) => {
    applyThread(thread)
    resetCategoryInputs()
  }

  const cancelEditThread = (thread: ThreadLike | null) => {
    applyThread(thread)
    resetCategoryInputs()
  }

  const toggleEditingCategory = (name: string) => {
    setEditingThreadCategories((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    )
  }

  return {
    state: {
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      isAddingEditingCategory,
    },
    actions: {
      setEditingThreadBody,
      setEditingThreadCategories,
      setEditingCategoryInput,
      setIsAddingEditingCategory,
      syncThread,
      startEditThread,
      cancelEditThread,
      toggleEditingCategory,
    },
  }
}

const useEntryEditingState = () => {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingEntryBody, setEditingEntryBody] = useState('')

  const startEntryEdit = (entry: EntryLike) => {
    setEditingEntryId(entry.id)
    setEditingEntryBody(entry.body)
  }

  const cancelEntryEdit = () => {
    setEditingEntryId(null)
    setEditingEntryBody('')
  }

  return {
    state: {
      editingEntryId,
      editingEntryBody,
    },
    actions: {
      setEditingEntryId,
      setEditingEntryBody,
      startEntryEdit,
      cancelEntryEdit,
    },
  }
}

const useReplyDraftState = () => {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const startReply = (entryId: string) => {
    setActiveReplyId(entryId)
    setReplyDrafts((prev) => ({
      ...prev,
      [entryId]: prev[entryId] ?? '',
    }))
  }

  const cancelReply = () => {
    setActiveReplyId(null)
  }

  const updateReplyDraft = (entryId: string, value: string) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [entryId]: value,
    }))
  }

  return {
    state: {
      replyDrafts,
      activeReplyId,
    },
    actions: {
      setReplyDrafts,
      setActiveReplyId,
      startReply,
      cancelReply,
      updateReplyDraft,
    },
  }
}

export { useEntryEditingState, useReplyDraftState, useThreadEditingState }
