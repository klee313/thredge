import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchThread } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useThreadDetailState } from './useThreadDetailState'
import { useThreadDetailMutations } from './useThreadDetailMutations'
import { buildEntryDepthMap } from '../lib/entryDepth'
import { buildEntryOrder } from '../lib/entryOrder'
import { useEntryDragState } from './useEntryDragState'
import { getThreadDisplay } from '../lib/threadDisplay'
import { useComposerFocusState } from './useComposerFocusState'

type UseThreadDetailControllerOptions = {
  threadId: string
  username?: string
}

export const useThreadDetailController = ({ threadId, username }: UseThreadDetailControllerOptions) => {
  const navigate = useNavigate()
  const { state, actions } = useThreadDetailState(threadId, username)
  const {
    entryComposerFocusId,
    replyComposerFocusId,
    setEntryComposerFocusId,
    setReplyComposerFocusId,
    clearEntryComposerFocus,
    clearReplyComposerFocus,
  } = useComposerFocusState()
  const didAutoFocusEntryComposer = useRef(false)
  const {
    entryBody,
    replyDrafts,
    activeReplyId,
    editingEntryId,
    editingEntryBody,
    isEditingThread,
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
  } = state
  const {
    thread: threadActions,
    entry: entryActions,
    reply: replyActions,
    ui: uiActions,
  } = actions

  const threadQuery = useQuery({
    queryKey: queryKeys.thread.detail(threadId),
    queryFn: ({ signal }) => fetchThread(threadId, { signal }),
    enabled: Boolean(threadId),
    meta: { suppressGlobalError: true },
  })

  useEffect(() => {
    didAutoFocusEntryComposer.current = false
  }, [threadId])

  useEffect(() => {
    if (!threadId || !threadQuery.isSuccess || didAutoFocusEntryComposer.current) {
      return
    }
    if (entryBody.trim()) {
      return
    }
    didAutoFocusEntryComposer.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntryComposerFocusId(`entry:${threadId}`)
  }, [entryBody, threadId, threadQuery.isSuccess])

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => fetchCategories({ signal }),
    enabled: threadQuery.isSuccess,
  })

  const {
    createCategoryMutation,
    submitCategory,
    createEntryMutation,
    createReplyMutation,
    moveEntryToMutation,
    entryError,
    clearEntryError,
    reportEntryError,
    threadError,
    threadEntryError,
    clearThreadError,
    clearThreadEntryError,
    updateThreadMutation,
    toggleThreadMuteMutation,
    hideThreadMutation,
    pinThreadMutation,
    unpinThreadMutation,
    updateEntryMutation,
    toggleEntryMuteMutation,
    hideEntryMutation,
  } = useThreadDetailMutations({
    threadId,
    state,
    actions,
    navigate,
    setEntryComposerFocusId,
  })

  useEffect(() => {
    if (threadQuery.data) {
      threadActions.syncThread(threadQuery.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadQuery.data])

  const visibleEntries = useMemo(() => {
    const entries = threadQuery.data?.entries ?? []
    return entries.filter((entry) => !entry.hidden && !entry.isHidden)
  }, [threadQuery.data?.entries])
  const entryDepth = useMemo(() => buildEntryDepthMap(visibleEntries), [visibleEntries])
  const orderedEntries = useMemo(() => buildEntryOrder(visibleEntries), [visibleEntries])
  const {
    dragState,
    dragError,
    handleDragStart,
    handleDragEnd,
    renderDropIndex,
    dropDepth,
    renderDropIndicator,
  } = useEntryDragState({
    orderedEntries,
    entryDepth,
    isMovePending: moveEntryToMutation.isPending,
    onMove: async ({ activeEntryId, overEntryId, overPosition }) => {
      const position =
        overPosition === 'before' ? 'BEFORE' : overPosition === 'after' ? 'AFTER' : 'CHILD'
      await moveEntryToMutation.mutateAsync({
        entryId: activeEntryId,
        targetEntryId: overEntryId,
        position,
      })
    },
  })

  const threadDisplay = getThreadDisplay(threadQuery.data?.body ?? null, threadQuery.data?.title)
  const theme = {
    card: `border-[var(--theme-border)] ${threadQuery.data?.pinned ? 'bg-[var(--theme-base)]' : 'bg-[var(--theme-surface)]'}`,
    entry: 'border-[var(--theme-border)] bg-[var(--theme-soft)]',
  }

  return useMemo(
    () => ({
      threadId,
      threadQuery,
      categoriesQuery,
      createCategoryMutation,
      submitCategory,
      state,
      actions,
      threadActions,
      entryActions,
      replyActions,
      uiActions,
      entryBody,
      replyDrafts,
      activeReplyId,
      editingEntryId,
      editingEntryBody,
      isEditingThread,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      entryComposerFocusId,
      setEntryComposerFocusId,
      replyComposerFocusId,
      setReplyComposerFocusId,
      clearEntryComposerFocus,
      clearReplyComposerFocus,
      createEntryMutation,
      createReplyMutation,
      moveEntryToMutation,
      entryError,
      clearEntryError,
      reportEntryError,
      threadError,
      threadEntryError,
      clearThreadError,
      clearThreadEntryError,
      updateThreadMutation,
      toggleThreadMuteMutation,
      hideThreadMutation,
      pinThreadMutation,
      unpinThreadMutation,
      updateEntryMutation,
      toggleEntryMuteMutation,
      hideEntryMutation,
      visibleEntries,
      entryDepth,
      orderedEntries,
      dragState,
      dragError,
      handleDragStart,
      handleDragEnd,
      renderDropIndex,
      dropDepth,
      renderDropIndicator,
      theme,
      threadDisplay,
    }),
    [
      activeReplyId,
      actions,
      categoriesQuery,
      clearEntryComposerFocus,
      clearEntryError,
      clearReplyComposerFocus,
      clearThreadEntryError,
      clearThreadError,
      createCategoryMutation,
      createEntryMutation,
      createReplyMutation,
      dragError,
      dragState,
      dropDepth,
      editingCategoryInput,
      editingEntryBody,
      editingEntryId,
      editingThreadBody,
      editingThreadCategories,
      entryActions,
      entryBody,
      entryComposerFocusId,
      entryDepth,
      entryError,
      handleDragEnd,
      handleDragStart,
      hideEntryMutation,
      hideThreadMutation,
      isEditingThread,
      moveEntryToMutation,
      orderedEntries,
      pinThreadMutation,
      renderDropIndex,
      renderDropIndicator,
      replyActions,
      replyComposerFocusId,
      replyDrafts,
      reportEntryError,
      setEntryComposerFocusId,
      setReplyComposerFocusId,
      state,
      submitCategory,
      threadActions,
      threadDisplay,
      threadEntryError,
      threadError,
      threadId,
      threadQuery,
      theme,
      toggleEntryMuteMutation,
      toggleThreadMuteMutation,
      uiActions,
      unpinThreadMutation,
      updateEntryMutation,
      updateThreadMutation,
      visibleEntries,
    ],
  )
}
