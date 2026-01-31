import type { NavigateFunction } from 'react-router-dom'
import { useCategoryMutations } from './useCategoryMutations'
import { useEntryActions } from './useEntryActions'
import { useThreadActions } from './useThreadActions'
import { THREAD_DETAIL_INVALIDATIONS } from './threadActionPresets'
import type { useThreadDetailState } from './useThreadDetailState'

type ThreadDetailState = ReturnType<typeof useThreadDetailState>['state']
type ThreadDetailActions = ReturnType<typeof useThreadDetailState>['actions']

type UseThreadDetailMutationsParams = {
  threadId: string
  state: ThreadDetailState
  actions: ThreadDetailActions
  navigate: NavigateFunction
  setEntryComposerFocusId: (focusId: string | null) => void
}

export const useThreadDetailMutations = ({
  threadId,
  state,
  actions,
  navigate,
  setEntryComposerFocusId,
}: UseThreadDetailMutationsParams) => {
  const {
    replyDrafts,
    isEditingThread,
  } = state
  const {
    thread: threadActions,
    entry: entryActions,
    reply: replyActions,
    ui: uiActions,
  } = actions

  const { createCategoryMutation } = useCategoryMutations({
    onCreateSuccess: (created) => {
      threadActions.setEditingThreadCategories((prev) =>
        prev.includes(created.name) ? prev : [...prev, created.name],
      )
      threadActions.setEditingCategoryInput('')
      threadActions.setIsAddingEditingCategory(false)
    },
  })

  const submitCategory = (value: string) => {
    const name = value.trim()
    if (!name) {
      return
    }
    createCategoryMutation.mutate({ name })
  }

  const {
    createEntryMutation,
    createReplyMutation,
    moveEntryToMutation,
    entryError,
    clearEntryError,
    reportEntryError,
  } = useEntryActions({
    threadId,
    invalidateTargets: ['thread', 'feed'],
    onEntryCreated: (_created, variables) => {
      if (variables.parentEntryId) {
        replyActions.updateReplyDraft(variables.parentEntryId, '')
        replyActions.cancelReply()
        uiActions.persistDraftsNow({
          replyDrafts: { ...replyDrafts, [variables.parentEntryId]: '' },
        })
      } else {
        entryActions.setEntryBody('')
        setEntryComposerFocusId(`entry:${variables.threadId}`)
        uiActions.persistDraftsNow({ entryBody: '' })
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
    threadId,
    invalidateTargets: THREAD_DETAIL_INVALIDATIONS,
    onThreadUpdated: () => {
      if (!isEditingThread) {
        return
      }
      threadActions.setIsEditingThread(false)
      threadActions.setEditingCategoryInput('')
      threadActions.setIsAddingEditingCategory(false)
    },
    onThreadHidden: () => {
      void navigate('/')
    },
  })

  return {
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
  }
}
