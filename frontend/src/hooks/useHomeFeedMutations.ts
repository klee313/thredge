import { useMutation, type QueryClient } from '@tanstack/react-query'
import { createThread } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useCategoryMutations } from './useCategoryMutations'
import { useEntryActions } from './useEntryActions'
import { useThreadActions } from './useThreadActions'
import { THREAD_LIST_INVALIDATIONS } from './threadActionPresets'
import type { useHomeFeedState } from './useHomeFeedState'

type HomeFeedState = ReturnType<typeof useHomeFeedState>['state']
type HomeFeedActions = ReturnType<typeof useHomeFeedState>['actions']

type UseHomeFeedMutationsParams = {
  state: HomeFeedState
  actions: HomeFeedActions
  queryClient: QueryClient
  newThreadCategoryNames: string[]
  setEntryComposerFocusId?: (focusId: string | null) => void
}

export const useHomeFeedMutations = ({
  state,
  actions,
  queryClient,
  newThreadCategoryNames,
  setEntryComposerFocusId,
}: UseHomeFeedMutationsParams) => {
  const {
    entryDrafts,
    replyDrafts,
    editingThreadId,
    editingEntryId,
  } = state
  const {
    thread: threadActions,
    entry: entryActions,
    reply: replyActions,
    ui: uiActions,
  } = actions

  const createThreadMutation = useMutation({
    mutationFn: (body: string) => createThread(body || null, newThreadCategoryNames),
    onSuccess: async (created) => {
      threadActions.setThreadBody('')
      uiActions.persistDraftsNow({ threadBody: '' })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed, exact: false })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.searchRoot, exact: false })
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      await queryClient.invalidateQueries({ queryKey: queryKeys.categoriesCounts })
      setEntryComposerFocusId?.(`entry:${created.id}`)
    },
  })

  const { createCategoryMutation } = useCategoryMutations({
    onCreateSuccess: (created, variables) => {
      const target = variables.target === 'edit' ? 'edit' : 'filter'
      if (target === 'edit') {
        threadActions.setEditingThreadCategories((prev) =>
          prev.includes(created.name) ? prev : [...prev, created.name],
        )
        threadActions.setEditingCategoryInput('')
        threadActions.setIsAddingEditingCategory(false)
        return
      }
      threadActions.setSelectedCategories((prev) =>
        prev.includes(created.name) ? prev : [...prev, created.name],
      )
    },
  })

  const submitEditingCategory = (value: string) => {
    const name = value.trim()
    if (!name) {
      return
    }
    createCategoryMutation.mutate({ name, target: 'edit' })
  }

  const {
    createEntryMutation,
    createReplyMutation,
    moveEntryToMutation,
    entryError,
    clearEntryError,
  } = useEntryActions({
    invalidateTargets: ['feed', 'search'],
    onEntryCreated: (_created, variables) => {
      if (variables.parentEntryId) {
        replyActions.updateReplyDraft(variables.parentEntryId, '')
        replyActions.cancelReply()
        uiActions.persistDraftsNow({
          replyDrafts: { ...replyDrafts, [variables.parentEntryId]: '' },
        })
      } else {
        entryActions.updateEntryDraft(variables.threadId, '')
        setEntryComposerFocusId?.(`entry:${variables.threadId}`)
        uiActions.persistDraftsNow({
          entryDrafts: { ...entryDrafts, [variables.threadId]: '' },
        })
      }
    },
  })

  const {
    threadError,
    entryError: threadEntryError,
    clearThreadError,
    clearEntryError: clearThreadEntryError,
    updateThreadMutation,
    toggleThreadMuteMutation,
    hideThreadMutation,
    pinThreadMutation,
    unpinThreadMutation,
    updateEntryMutation,
    toggleEntryMuteMutation,
    hideEntryMutation,
  } = useThreadActions({
    invalidateTargets: THREAD_LIST_INVALIDATIONS,
    onThreadUpdated: (threadId) => {
      if (editingThreadId !== threadId) {
        return
      }
      threadActions.cancelEditThread()
    },
    onEntryUpdated: (entryId) => {
      if (editingEntryId === entryId) {
        entryActions.cancelEntryEdit()
      }
    },
  })

  const { deleteCategoryMutation } = useCategoryMutations({
    invalidateThreadsFeed: true,
    invalidateThreadsSearch: true,
    onDeleteSuccess: (variables) => {
      const removedName = variables.name as string
      if (!removedName) {
        return
      }
      threadActions.setSelectedCategories((prev) => prev.filter((item) => item !== removedName))
    },
  })

  return {
    mutations: {
      createThreadMutation,
      createCategoryMutation,
      deleteCategoryMutation,
      createEntryMutation,
      createReplyMutation,
      moveEntryToMutation,
      updateThreadMutation,
      toggleThreadMuteMutation,
      hideThreadMutation,
      pinThreadMutation,
      unpinThreadMutation,
      updateEntryMutation,
      toggleEntryMuteMutation,
      hideEntryMutation,
    },
    errors: {
      threadError,
      threadEntryError,
      entryError,
      clearThreadError,
      clearThreadEntryError,
      clearEntryError,
    },
    submitEditingCategory,
  }
}
