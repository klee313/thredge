import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { UNCATEGORIZED_TOKEN } from '../lib/api'
import { useDateFilter } from './useDateFilter'
import { useHomeFeedState } from './useHomeFeedState'
import { useHomeFeedQueries } from './useHomeFeedQueries'
import { useComposerFocusState } from './useComposerFocusState'
import { useHomeFeedMutations } from './useHomeFeedMutations'

export const useHomeFeedController = (username: string, locale: string) => {
  const queryClient = useQueryClient()
  const { state, actions } = useHomeFeedState(username)
  const {
    entryComposerFocusId,
    replyComposerFocusId,
    setEntryComposerFocusId,
    setReplyComposerFocusId,
    clearEntryComposerFocus,
    clearReplyComposerFocus,
  } = useComposerFocusState()
  const {
    threadBody,
    selectedCategories,
    entryDrafts,
    replyDrafts,
    activeReplyId,
    editingThreadId,
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
    editingEntryId,
    editingEntryBody,
    searchQuery,
    searchDraft,
  } = state
  const {
    thread: threadActions,
    entry: entryActions,
    reply: replyActions,
    ui: uiActions,
  } = actions

  const normalizedSearchQuery = searchQuery.trim()

  const {
    selectedDate,
    setSelectedDate,
    selectedDateLabel,
    dateInputValue,
    parseDateInput,
    shiftDateByDays,
  } = useDateFilter(locale)

  const {
    categoriesQuery,
    categoryCountsQuery,
    filteredThreads,
    categoryCountsById,
    threadsQuery,
    searchThreadsQuery,
    normalizedSelectedCategories,
    todosQuery,
  } = useHomeFeedQueries({
    normalizedSearchQuery,
    selectedCategories,
    selectedDate,
    dateInputValue,
  })

  const newThreadCategoryNames = useMemo(
    () => normalizedSelectedCategories.filter((name) => name !== UNCATEGORIZED_TOKEN),
    [normalizedSelectedCategories],
  )

  useEffect(() => {
    if (!categoriesQuery.isSuccess) {
      return
    }
    if (normalizedSelectedCategories.length !== selectedCategories.length) {
      threadActions.setSelectedCategories(normalizedSelectedCategories)
    }
  }, [
    categoriesQuery.isSuccess,
    normalizedSelectedCategories,
    selectedCategories,
    threadActions,
  ])

  const { mutations: mutationsSource, errors: errorsSource, submitEditingCategory } =
    useHomeFeedMutations({
      state,
      actions,
      queryClient,
      newThreadCategoryNames,
      setEntryComposerFocusId,
    })

  const {
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
  } = mutationsSource

  const {
    threadError,
    threadEntryError,
    entryError,
    clearThreadError,
    clearThreadEntryError,
    clearEntryError,
  } = errorsSource

  const activeThreadsQuery = normalizedSearchQuery ? searchThreadsQuery : threadsQuery

  const onToggleUncategorized = useCallback(() => {
    threadActions.setSelectedCategories((prev) =>
      prev.includes(UNCATEGORIZED_TOKEN)
        ? prev.filter((item) => item !== UNCATEGORIZED_TOKEN)
        : [...prev, UNCATEGORIZED_TOKEN],
    )
  }, [threadActions])

  const onToggleCategory = useCallback(
    (name: string) => {
      threadActions.setSelectedCategories((prev) =>
        prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
      )
    },
    [threadActions],
  )

  const onCreateThread = useCallback(
    (body: string) => {
      threadActions.setThreadBody(body)
      createThreadMutation.mutate(body)
    },
    [createThreadMutation, threadActions],
  )

  const stateView = useMemo(
    () => ({
      threadBody,
      selectedCategories,
      entryDrafts,
      replyDrafts,
      activeReplyId,
      editingThreadId,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      editingEntryId,
      editingEntryBody,
      searchQuery,
      searchDraft,
    }),
    [
      activeReplyId,
      editingCategoryInput,
      editingEntryBody,
      editingEntryId,
      editingThreadBody,
      editingThreadCategories,
      editingThreadId,
      entryDrafts,
      replyDrafts,
      searchDraft,
      searchQuery,
      selectedCategories,
      threadBody,
    ],
  )

  const queries = useMemo(
    () => ({
      categoriesQuery,
      categoryCountsQuery,
      filteredThreads,
      categoryCountsById,
      activeThreadsQuery,
      normalizedSelectedCategories,
      selectedDate,
      selectedDateLabel,
      dateInputValue,
      todosQuery,
    }),
    [
      activeThreadsQuery,
      categoriesQuery,
      categoryCountsById,
      categoryCountsQuery,
      dateInputValue,
      filteredThreads,
      normalizedSelectedCategories,
      selectedDate,
      selectedDateLabel,
      todosQuery,
    ],
  )

  const actionsView = useMemo(
    () => ({
      threadActions,
      entryActions,
      replyActions,
      uiActions,
      setSelectedDate,
      parseDateInput,
      shiftDateByDays,
      setEntryComposerFocusId,
      setReplyComposerFocusId,
      clearEntryComposerFocus,
      clearReplyComposerFocus,
      submitEditingCategory,
      onToggleUncategorized,
      onToggleCategory,
      onCreateThread,
    }),
    [
      clearEntryComposerFocus,
      clearReplyComposerFocus,
      entryActions,
      onCreateThread,
      onToggleCategory,
      onToggleUncategorized,
      parseDateInput,
      replyActions,
      setEntryComposerFocusId,
      setReplyComposerFocusId,
      setSelectedDate,
      shiftDateByDays,
      submitEditingCategory,
      threadActions,
      uiActions,
    ],
  )

  const mutationsView = useMemo(
    () => ({
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
    }),
    [
      createCategoryMutation,
      createEntryMutation,
      createReplyMutation,
      createThreadMutation,
      deleteCategoryMutation,
      hideEntryMutation,
      hideThreadMutation,
      moveEntryToMutation,
      pinThreadMutation,
      toggleEntryMuteMutation,
      toggleThreadMuteMutation,
      unpinThreadMutation,
      updateEntryMutation,
      updateThreadMutation,
    ],
  )

  const errorsView = useMemo(
    () => ({
      threadError,
      threadEntryError,
      entryError,
      clearThreadError,
      clearThreadEntryError,
      clearEntryError,
    }),
    [
      clearEntryError,
      clearThreadEntryError,
      clearThreadError,
      entryError,
      threadEntryError,
      threadError,
    ],
  )

  const ui = useMemo(
    () => ({
      entryComposerFocusId,
      replyComposerFocusId,
    }),
    [entryComposerFocusId, replyComposerFocusId],
  )

  return useMemo(
    () => ({
      state: stateView,
      queries,
      actions: actionsView,
      mutations: mutationsView,
      errors: errorsView,
      ui,
      normalizedSearchQuery,
    }),
    [actionsView, errorsView, mutationsView, normalizedSearchQuery, queries, stateView, ui],
  )
}
