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

export const useHomeFeedState = () => {
  const [threadBody, setThreadBody] = useState('')
  const [newThreadCategories, setNewThreadCategories] = useState<string[]>([])
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>({})
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editingThreadBody, setEditingThreadBody] = useState('')
  const [editingThreadCategories, setEditingThreadCategories] = useState<string[]>([])
  const [editingCategoryInput, setEditingCategoryInput] = useState('')
  const [isAddingEditingCategory, setIsAddingEditingCategory] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingEntryBody, setEditingEntryBody] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeComposerTab, setActiveComposerTab] = useState<'new' | 'search'>('new')

  const startEditThread = (thread: ThreadLike) => {
    setEditingThreadId(thread.id)
    setEditingThreadBody(thread.body ?? '')
    setEditingThreadCategories(thread.categories.map((item) => item.name))
    setEditingCategoryInput('')
    setIsAddingEditingCategory(false)
  }

  const cancelEditThread = () => {
    setEditingThreadId(null)
    setEditingThreadBody('')
    setEditingThreadCategories([])
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
      replyDrafts,
      activeReplyId,
      editingThreadId,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      isAddingEditingCategory,
      editingEntryId,
      editingEntryBody,
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
        setEditingThreadBody,
        setEditingThreadCategories,
        setEditingCategoryInput,
        setIsAddingEditingCategory,
        startEditThread,
        cancelEditThread,
        toggleEditingCategory,
      },
      entry: {
        setEditingEntryId,
        setEditingEntryBody,
        startEntryEdit,
        cancelEntryEdit,
        updateEntryDraft,
      },
      reply: {
        setActiveReplyId,
        setReplyDrafts,
        startReply,
        cancelReply,
        updateReplyDraft,
      },
      ui: {
        setSearchQuery,
        setActiveComposerTab,
      },
    },
  }
}
