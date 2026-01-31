import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { EntryDetail, ThreadDetail, ThreadSummary } from '../lib/api'
import { ApiError } from '../lib/api'
import {
  hideEntry,
  hideThread,
  pinThread,
  unpinThread,
  updateEntry,
  updateThread,
} from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import {
  removeEntryFromThreadDetail,
  removeEntryFromFeed,
  removeThreadFromFeed,
  setThreadPinnedInFeed,
  updateEntryInEntryList,
  updateEntryInFeed,
  updateEntryInThreadDetail,
  updateThreadInFeed,
} from '../lib/threadCache'

export type InvalidateTarget =
  | 'feed'
  | 'search'
  | 'thread'
  | 'hiddenThreads'
  | 'hiddenEntries'

type ThreadActionsOptions = {
  threadId?: string
  invalidateTargets?: InvalidateTarget[]
  onThreadUpdated?: (threadId: string) => void
  onThreadHidden?: (threadId: string) => void
  onThreadPinned?: (updated: ThreadSummary) => void
  onThreadUnpinned?: (updated: ThreadSummary) => void
  onEntryUpdated?: (entryId: string, body: string, threadId?: string | null) => void
  onEntryHidden?: (entryId: string) => void
}

const defaultInvalidateTargets: InvalidateTarget[] = ['feed', 'thread']

export const useThreadActions = (options: ThreadActionsOptions = {}) => {
  const queryClient = useQueryClient()
  const invalidateTargets = options.invalidateTargets ?? defaultInvalidateTargets
  const shouldInvalidate = (target: InvalidateTarget) => invalidateTargets.includes(target)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [entryError, setEntryError] = useState<string | null>(null)
  const clearThreadError = useCallback(() => setThreadError(null), [])
  const clearEntryError = useCallback(() => setEntryError(null), [])
  const formatErrorMessage = (label: string, error: unknown) => {
    if (error instanceof ApiError) {
      return error.detail || error.label || label
    }
    if (error instanceof Error) {
      return error.message || label
    }
    return label
  }
  const logThreadError = (label: string, error: unknown) => {
    console.error(`useThreadActions: ${label} failed`, error)
    setThreadError(formatErrorMessage(label, error))
  }
  const logEntryError = (label: string, error: unknown) => {
    console.error(`useThreadActions: ${label} failed`, error)
    setEntryError(formatErrorMessage(label, error))
  }

  const feedUpdateOptions = {
    includeFeed: shouldInvalidate('feed'),
    includeSearch: shouldInvalidate('search'),
  }

  const applyThreadUpdate = async (threadId: string, body: string) => {
    updateThreadInFeed(queryClient, threadId, { body }, feedUpdateOptions)
    queryClient.setQueryData(queryKeys.thread.detail(threadId), (old: ThreadDetail | undefined) =>
      old ? { ...old, body } : old,
    )
    options.onThreadUpdated?.(threadId)
    clearThreadError()
    await invalidateThreadKeys(threadId)
  }

  const invalidateThreadKeys = async (threadId?: string | null) => {
    const id = threadId ?? options.threadId
    if (id) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.entries(id) })
    }
    if (shouldInvalidate('thread') && id) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.thread.detail(id) })
    }
    if (shouldInvalidate('feed')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed, exact: false })
      await queryClient.invalidateQueries({ queryKey: queryKeys.categoriesCounts })
    }
    if (shouldInvalidate('search')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.searchRoot, exact: false })
    }
    if (shouldInvalidate('hiddenThreads')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.hidden, exact: false })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.threads.hiddenSearchRoot,
        exact: false,
      })
    }
    if (shouldInvalidate('hiddenEntries')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.hidden, exact: false })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.entries.hiddenSearchRoot,
        exact: false,
      })
    }
  }

  const updateThreadMutation = useMutation({
    mutationFn: ({
      threadId,
      body,
      categoryNames,
    }: {
      threadId: string
      body: string
      categoryNames: string[]
    }) => updateThread(threadId, body, categoryNames),
    meta: { suppressGlobalError: true },
    onSuccess: async (_, variables) => {
      await applyThreadUpdate(variables.threadId, variables.body)
    },
    onError: (error) => logThreadError('updateThread', error),
  })

  const toggleThreadMuteMutation = useMutation({
    mutationFn: ({
      threadId,
      body,
      categoryNames,
    }: {
      threadId: string
      body: string
      categoryNames: string[]
    }) => updateThread(threadId, body, categoryNames),
    meta: { suppressGlobalError: true },
    onSuccess: async (_, variables) => {
      await applyThreadUpdate(variables.threadId, variables.body)
    },
    onError: (error) => logThreadError('toggleThreadMute', error),
  })

  const hideThreadMutation = useMutation({
    mutationFn: (threadId: string) => hideThread(threadId),
    meta: { suppressGlobalError: true },
    onSuccess: async (_, threadId) => {
      removeThreadFromFeed(queryClient, threadId, feedUpdateOptions)
      queryClient.removeQueries({ queryKey: queryKeys.thread.detail(threadId) })
      options.onThreadHidden?.(threadId)
      clearThreadError()
      await invalidateThreadKeys(threadId)
    },
    onError: (error) => logThreadError('hideThread', error),
  })

  const pinThreadMutation = useMutation({
    mutationFn: (threadId: string) => pinThread(threadId),
    meta: { suppressGlobalError: true },
    onSuccess: async (updated) => {
      setThreadPinnedInFeed(queryClient, updated, true, feedUpdateOptions)
      queryClient.setQueryData(queryKeys.thread.detail(updated.id), (old: ThreadDetail | undefined) =>
        old ? { ...old, pinned: true } : old,
      )
      options.onThreadPinned?.(updated)
      clearThreadError()
      await invalidateThreadKeys(updated.id)
    },
    onError: (error) => logThreadError('pinThread', error),
  })

  const unpinThreadMutation = useMutation({
    mutationFn: (threadId: string) => unpinThread(threadId),
    meta: { suppressGlobalError: true },
    onSuccess: async (updated) => {
      setThreadPinnedInFeed(queryClient, updated, false, feedUpdateOptions)
      queryClient.setQueryData(queryKeys.thread.detail(updated.id), (old: ThreadDetail | undefined) =>
        old ? { ...old, pinned: false } : old,
      )
      options.onThreadUnpinned?.(updated)
      clearThreadError()
      await invalidateThreadKeys(updated.id)
    },
    onError: (error) => logThreadError('unpinThread', error),
  })

  const applyEntryUpdate = (updated: EntryDetail, threadId?: string | null) => {
    const resolvedThreadId = threadId ?? updated.threadId ?? undefined
    updateEntryInFeed(queryClient, updated.id, updated.body, feedUpdateOptions)
    if (resolvedThreadId) {
      updateEntryInEntryList(queryClient, resolvedThreadId, updated.id, updated.body)
      updateEntryInThreadDetail(queryClient, resolvedThreadId, updated.id, updated.body)
    }
    options.onEntryUpdated?.(updated.id, updated.body, updated.threadId)
    return resolvedThreadId
  }

  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, body }: { entryId: string; body: string; threadId?: string }) =>
      updateEntry(entryId, body),
    meta: { suppressGlobalError: true },
    onSuccess: async (updated, variables) => {
      const resolvedThreadId = applyEntryUpdate(updated, variables.threadId)
      clearEntryError()
      await invalidateThreadKeys(resolvedThreadId)
    },
    onError: (error) => logEntryError('updateEntry', error),
  })

  const toggleEntryMuteMutation = useMutation({
    mutationFn: ({ entryId, body }: { entryId: string; body: string; threadId?: string }) =>
      updateEntry(entryId, body),
    meta: { suppressGlobalError: true },
    onSuccess: async (updated, variables) => {
      const resolvedThreadId = applyEntryUpdate(updated, variables.threadId)
      clearEntryError()
      await invalidateThreadKeys(resolvedThreadId)
    },
    onError: (error) => logEntryError('toggleEntryMute', error),
  })

  const hideEntryMutation = useMutation({
    mutationFn: ({ entryId }: { entryId: string; threadId?: string }) => hideEntry(entryId),
    meta: { suppressGlobalError: true },
    onSuccess: async (_, variables) => {
      const threadId = variables.threadId ?? options.threadId
      if (threadId) {
        queryClient.setQueryData<EntryDetail[]>(queryKeys.threads.entries(threadId), (old) =>
          old ? old.filter((e) => e.id !== variables.entryId) : [],
        )
        removeEntryFromThreadDetail(queryClient, threadId, variables.entryId)
      }
      removeEntryFromFeed(queryClient, variables.entryId, feedUpdateOptions)
      options.onEntryHidden?.(variables.entryId)
      clearEntryError()
      await invalidateThreadKeys(threadId)
    },
    onError: (error) => logEntryError('hideEntry', error),
  })

  return {
    threadError,
    entryError,
    clearThreadError,
    clearEntryError,
    reportThreadError: logThreadError,
    reportEntryError: logEntryError,
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
