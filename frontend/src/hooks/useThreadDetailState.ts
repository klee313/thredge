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

export const useThreadDetailState = () => {
  const [entryBody, setEntryBody] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingEntryBody, setEditingEntryBody] = useState('')
  const [isEditingThread, setIsEditingThread] = useState(false)
  const [editingThreadBody, setEditingThreadBody] = useState('')
  const [editingThreadCategories, setEditingThreadCategories] = useState<string[]>([])
  const [editingCategoryInput, setEditingCategoryInput] = useState('')
  const [isAddingEditingCategory, setIsAddingEditingCategory] = useState(false)

  const syncThread = (thread: ThreadLike) => {
    setEditingThreadBody(thread.body ?? '')
    setEditingThreadCategories(thread.categories.map((item) => item.name))
  }

  const startEditThread = (thread: ThreadLike) => {
    setIsEditingThread(true)
    setEditingThreadBody(thread.body ?? '')
    setEditingThreadCategories(thread.categories.map((item) => item.name))
    setEditingCategoryInput('')
    setIsAddingEditingCategory(false)
  }

  const cancelEditThread = (thread: ThreadLike) => {
    setIsEditingThread(false)
    setEditingThreadBody(thread.body ?? '')
    setEditingThreadCategories(thread.categories.map((item) => item.name))
    setEditingCategoryInput('')
    setIsAddingEditingCategory(false)
  }

  const toggleEditingCategory = (name: string) => {
    setEditingThreadCategories((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    )
  }

  const startEntryEdit = (entry: EntryLike) => {
    setEditingEntryId(entry.id)
    setEditingEntryBody(entry.body)
  }

  const cancelEntryEdit = () => {
    setEditingEntryId(null)
    setEditingEntryBody('')
  }

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
      entryBody,
      replyDrafts,
      activeReplyId,
      editingEntryId,
      editingEntryBody,
      isEditingThread,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      isAddingEditingCategory,
    },
    actions: {
      setEntryBody,
      setReplyDrafts,
      setActiveReplyId,
      setEditingEntryId,
      setEditingEntryBody,
      setIsEditingThread,
      setEditingThreadBody,
      setEditingThreadCategories,
      setEditingCategoryInput,
      setIsAddingEditingCategory,
      syncThread,
      startEditThread,
      cancelEditThread,
      toggleEditingCategory,
      startEntryEdit,
      cancelEntryEdit,
      startReply,
      cancelReply,
      updateReplyDraft,
    },
  }
}
