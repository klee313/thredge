import { useState, useMemo, useCallback } from 'react'
import {
  useEntryEditingState,
  useReplyDraftState,
  useThreadEditingState,
} from './useThreadUiState'
import { useHomeFeedUrlState } from './useHomeFeedUrlState'
import { readVersionedDraft } from '../lib/draftStorage'
import { useDraftPersistence } from './useDraftPersistence'

const STORAGE_KEY_PREFIX = 'thredge.homeFeedDrafts:'
const LEGACY_STORAGE_KEY = 'thredge.homeFeedDrafts'
const STORAGE_VERSION = 1

type HomeFeedDrafts = {
  threadBody: string
  entryDrafts: Record<string, string>
  replyDrafts: Record<string, string>
  searchDraft?: string
  editingThreadId?: string | null
  editingThreadBody?: string
  editingThreadCategories?: string[]
  editingCategoryInput?: string
  isAddingEditingCategory?: boolean
  editingEntryId?: string | null
  editingEntryBody?: string
}


type ThreadLike = {
  id: string
  body?: string | null
  categories: { name: string }[]
}

export const useHomeFeedState = (storageScope?: string) => {
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}${storageScope ?? 'anon'}`,
    [storageScope],
  )

  const legacyKey = storageScope ? null : LEGACY_STORAGE_KEY
  const storedDrafts = useMemo<HomeFeedDrafts | null>(() => {
    return readVersionedDraft<HomeFeedDrafts>([storageKey, legacyKey], STORAGE_VERSION)
  }, [legacyKey, storageKey])

  const [threadBody, setThreadBody] = useState(() => storedDrafts?.threadBody ?? '')
  const {
    selectedCategories,
    searchQuery,
    searchDraft,
    setSearchDraft,
    setSelectedCategories,
    setSearchQuery: setSearchQueryState,
  } = useHomeFeedUrlState({
    initialSearchDraft: storedDrafts?.searchDraft ?? '',
  })

  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>(
    () => storedDrafts?.entryDrafts ?? {},
  )
  const [editingThreadId, setEditingThreadId] = useState<string | null>(
    () => storedDrafts?.editingThreadId ?? null,
  )

  const threadEditor = useThreadEditingState()
  const entryEditor = useEntryEditingState()
  const replyDraft = useReplyDraftState()
  const {
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
    isAddingEditingCategory,
  } = threadEditor.state
  const { editingEntryId, editingEntryBody } = entryEditor.state

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

  const buildDraftPayload = useCallback((overrides?: Partial<HomeFeedDrafts>) => {
    if (typeof window === 'undefined') {
      return null
    }
    const payload: HomeFeedDrafts = {
      threadBody,
      entryDrafts,
      replyDrafts: replyDraft.state.replyDrafts,
      searchDraft,
      editingThreadId,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      isAddingEditingCategory,
      editingEntryId,
      editingEntryBody,
    }
    const nextPayload: HomeFeedDrafts = {
      ...payload,
      ...overrides,
      entryDrafts: overrides?.entryDrafts ?? payload.entryDrafts,
      replyDrafts: overrides?.replyDrafts ?? payload.replyDrafts,
    }
    return nextPayload
  }, [
    entryDrafts,
    editingCategoryInput,
    editingEntryBody,
    editingEntryId,
    editingThreadBody,
    editingThreadCategories,
    editingThreadId,
    isAddingEditingCategory,
    replyDraft.state.replyDrafts,
    searchDraft,
    threadBody,
  ])

  const hasDrafts = useCallback((payload: HomeFeedDrafts) => (
    Boolean(payload.threadBody.trim()) ||
    Boolean(payload.searchDraft?.trim()) ||
    Boolean(payload.editingThreadId) ||
    Boolean(payload.editingEntryId) ||
    Boolean(payload.editingThreadBody?.trim()) ||
    (payload.editingThreadCategories?.length ?? 0) > 0 ||
    Boolean(payload.editingCategoryInput?.trim()) ||
    Boolean(payload.isAddingEditingCategory) ||
    Boolean(payload.editingEntryBody?.trim()) ||
    Object.values(payload.entryDrafts ?? {}).some((value) => value.trim()) ||
    Object.values(payload.replyDrafts ?? {}).some((value) => value.trim())
  ), [])

  const { persistDraftsNow } = useDraftPersistence<HomeFeedDrafts, Partial<HomeFeedDrafts>>({
    storageKey,
    legacyKeys: [legacyKey],
    version: STORAGE_VERSION,
    buildPayload: buildDraftPayload,
    hasDrafts,
    onRestore: (payload) => {
      const drafts = payload ?? null
      /* eslint-disable react-hooks/set-state-in-effect */
      setThreadBody(drafts?.threadBody ?? '')
      setEntryDrafts(drafts?.entryDrafts ?? {})
      setSearchDraft(drafts?.searchDraft ?? searchQuery)
      setEditingThreadId(drafts?.editingThreadId ?? null)
      /* eslint-enable react-hooks/set-state-in-effect */
      replyDraft.actions.setReplyDrafts(drafts?.replyDrafts ?? {})
      replyDraft.actions.setActiveReplyId(null)
      threadEditor.actions.setEditingThreadBody(drafts?.editingThreadBody ?? '')
      threadEditor.actions.setEditingThreadCategories(drafts?.editingThreadCategories ?? [])
      threadEditor.actions.setEditingCategoryInput(drafts?.editingCategoryInput ?? '')
      threadEditor.actions.setIsAddingEditingCategory(drafts?.isAddingEditingCategory ?? false)
      entryEditor.actions.setEditingEntryId(drafts?.editingEntryId ?? null)
      entryEditor.actions.setEditingEntryBody(drafts?.editingEntryBody ?? '')
    },
  })

  return {
    state: {
      threadBody,
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
      searchDraft,
    },
    actions: {
      thread: {
        setThreadBody,
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
        setSearchQuery: setSearchQueryState,
        setSearchDraft,
        persistDraftsNow,
      },
    },
  }
}
