import { useCallback, useMemo, useState } from 'react'
import {
  useEntryEditingState,
  useReplyDraftState,
  useThreadEditingState,
} from './useThreadUiState'
import { readVersionedDraft } from '../lib/draftStorage'
import { useDraftPersistence } from './useDraftPersistence'

const STORAGE_PREFIX = 'thredge.threadDetailDrafts:'
const STORAGE_VERSION = 1

type ThreadDetailDrafts = {
  entryBody: string
  replyDrafts: Record<string, string>
  isEditingThread?: boolean
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

export const useThreadDetailState = (threadId?: string, storageScope?: string) => {
  const storageKey = threadId ? `${STORAGE_PREFIX}${storageScope ?? 'anon'}:${threadId}` : null
  const legacyStorageKey = threadId && !storageScope ? `${STORAGE_PREFIX}${threadId}` : null
  const storedDrafts = useMemo<ThreadDetailDrafts | null>(() => {
    if (!storageKey) {
      return null
    }
    return readVersionedDraft<ThreadDetailDrafts>(
      [storageKey, legacyStorageKey],
      STORAGE_VERSION,
    )
  }, [legacyStorageKey, storageKey])

  const [entryBody, setEntryBody] = useState(() => storedDrafts?.entryBody ?? '')
  const [isEditingThread, setIsEditingThread] = useState(
    () => storedDrafts?.isEditingThread ?? false,
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

  const syncThread = (thread: ThreadLike) => {
    if (isEditingThread && editingThreadBody.trim()) {
      return
    }
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

  const buildDraftPayload = useCallback((overrides?: Partial<ThreadDetailDrafts>) => {
    if (typeof window === 'undefined' || !storageKey) {
      return null
    }
    const payload: ThreadDetailDrafts = {
      entryBody,
      replyDrafts: replyDraft.state.replyDrafts,
      isEditingThread,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      isAddingEditingCategory,
      editingEntryId,
      editingEntryBody,
    }
    const nextPayload: ThreadDetailDrafts = {
      ...payload,
      ...overrides,
      replyDrafts: overrides?.replyDrafts ?? payload.replyDrafts,
    }
    return nextPayload
  }, [
    editingCategoryInput,
    editingEntryBody,
    editingEntryId,
    editingThreadBody,
    editingThreadCategories,
    entryBody,
    isAddingEditingCategory,
    isEditingThread,
    replyDraft.state.replyDrafts,
    storageKey,
  ])

  const hasDrafts = useCallback((payload: ThreadDetailDrafts) => {
    const hasThreadEditDrafts = Boolean(payload.isEditingThread) && (
      Boolean(payload.editingThreadBody?.trim()) ||
      (payload.editingThreadCategories?.length ?? 0) > 0 ||
      Boolean(payload.editingCategoryInput?.trim()) ||
      Boolean(payload.isAddingEditingCategory)
    )
    return (
      Boolean(payload.entryBody.trim()) ||
      Boolean(payload.isEditingThread) ||
      hasThreadEditDrafts ||
      Boolean(payload.editingEntryId) ||
      Boolean(payload.editingEntryBody?.trim()) ||
      Object.values(payload.replyDrafts ?? {}).some((value) => value.trim())
    )
  }, [])

  const { persistDraftsNow } = useDraftPersistence<ThreadDetailDrafts, Partial<ThreadDetailDrafts>>({
    storageKey,
    legacyKeys: [legacyStorageKey],
    version: STORAGE_VERSION,
    buildPayload: buildDraftPayload,
    hasDrafts,
    onRestore: (payload) => {
      const drafts = payload ?? null
      /* eslint-disable react-hooks/set-state-in-effect */
      setEntryBody(drafts?.entryBody ?? '')
      setIsEditingThread(drafts?.isEditingThread ?? false)
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
      ui: {
        persistDraftsNow,
      },
    },
  }
}
