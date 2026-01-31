import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { EntryDetail, EntryMoveDirection, EntryMovePosition } from '../lib/api'
import { ApiError, addEntry, moveEntry, moveEntryTo } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import {
  updateEntryPositionInEntryList,
  updateEntryPositionInFeed,
  updateEntryPositionInThreadDetail,
} from '../lib/threadCache'

type InvalidateTarget = 'feed' | 'search' | 'thread'

type CreateEntryInput = {
  threadId?: string
  body: string
  parentEntryId?: string
}

type CreateEntryVariables = {
  threadId: string
  body: string
  parentEntryId?: string
}

type MoveEntryVariables = {
  entryId: string
  direction: EntryMoveDirection
  threadId?: string
}

type MoveEntryToVariables = {
  entryId: string
  targetEntryId: string
  position: EntryMovePosition
  threadId?: string
}

type EntryActionsOptions = {
  threadId?: string
  invalidateTargets?: InvalidateTarget[]
  onEntryCreated?: (entry: EntryDetail, variables: CreateEntryVariables) => void
}

const defaultInvalidateTargets: InvalidateTarget[] = ['feed', 'search']

export const useEntryActions = (options: EntryActionsOptions = {}) => {
  const queryClient = useQueryClient()
  const invalidateTargets = options.invalidateTargets ?? defaultInvalidateTargets
  const shouldInvalidate = (target: InvalidateTarget) => invalidateTargets.includes(target)
  const [entryError, setEntryError] = useState<string | null>(null)
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
  const logError = (label: string, error: unknown) => {
    console.error(`useEntryActions: ${label} failed`, error)
    setEntryError(formatErrorMessage(label, error))
  }

  const applyEntryMove = async (moved: EntryDetail, threadId?: string | null) => {
    const resolvedThreadId = threadId ?? options.threadId ?? moved.threadId ?? undefined
    updateEntryPositionInFeed(queryClient, moved, {
      includeFeed: shouldInvalidate('feed'),
      includeSearch: shouldInvalidate('search'),
    })
    if (resolvedThreadId) {
      updateEntryPositionInEntryList(queryClient, resolvedThreadId, moved)
      updateEntryPositionInThreadDetail(queryClient, resolvedThreadId, moved)
    }
    clearEntryError()
    await invalidateEntryKeys(resolvedThreadId)
  }

  const invalidateEntryKeys = async (threadId?: string | null) => {
    const id = threadId ?? options.threadId
    if (id) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.entries(id) })
    }
    if (shouldInvalidate('thread') && id) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.thread.detail(id) })
    }
    if (shouldInvalidate('feed')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed, exact: false })
    }
    if (shouldInvalidate('search')) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.searchRoot, exact: false })
    }
  }

  const createEntryMutation = useMutation({
    mutationFn: ({ threadId, body, parentEntryId }: CreateEntryInput) => {
      const resolvedThreadId = threadId ?? options.threadId
      if (!resolvedThreadId) {
        throw new Error('Entry create failed: missing thread id')
      }
      return addEntry(resolvedThreadId, body, parentEntryId)
    },
    meta: { suppressGlobalError: true },
    onSuccess: async (created, variables) => {
      const resolvedThreadId = variables.threadId ?? options.threadId
      if (!resolvedThreadId) {
        return
      }
      const normalizedVariables: CreateEntryVariables = {
        threadId: resolvedThreadId,
        body: variables.body,
        parentEntryId: variables.parentEntryId,
      }
      options.onEntryCreated?.(created, normalizedVariables)
      clearEntryError()
      await invalidateEntryKeys(resolvedThreadId)
    },
    onError: (error) => logError('createEntry', error),
  })

  const createReplyMutation = useMutation({
    mutationFn: ({ threadId, body, parentEntryId }: CreateEntryInput) => {
      const resolvedThreadId = threadId ?? options.threadId
      if (!resolvedThreadId) {
        throw new Error('Entry create failed: missing thread id')
      }
      return addEntry(resolvedThreadId, body, parentEntryId)
    },
    meta: { suppressGlobalError: true },
    onSuccess: async (created, variables) => {
      const resolvedThreadId = variables.threadId ?? options.threadId
      if (!resolvedThreadId) {
        return
      }
      const normalizedVariables: CreateEntryVariables = {
        threadId: resolvedThreadId,
        body: variables.body,
        parentEntryId: variables.parentEntryId,
      }
      options.onEntryCreated?.(created, normalizedVariables)
      clearEntryError()
      await invalidateEntryKeys(resolvedThreadId)
    },
    onError: (error) => logError('createReply', error),
  })

  const moveEntryMutation = useMutation({
    mutationFn: ({ entryId, direction }: MoveEntryVariables) => moveEntry(entryId, direction),
    meta: { suppressGlobalError: true },
    onSuccess: async (moved, variables) => {
      await applyEntryMove(moved, variables.threadId)
    },
    onError: (error) => logError('moveEntry', error),
  })

  const moveEntryToMutation = useMutation({
    mutationFn: ({ entryId, targetEntryId, position }: MoveEntryToVariables) =>
      moveEntryTo(entryId, targetEntryId, position),
    meta: { suppressGlobalError: true },
    onSuccess: async (moved, variables) => {
      await applyEntryMove(moved, variables.threadId)
    },
    onError: (error) => logError('moveEntryTo', error),
  })

  return {
    entryError,
    clearEntryError,
    reportEntryError: logError,
    createEntryMutation,
    createReplyMutation,
    moveEntryMutation,
    moveEntryToMutation,
  }
}
