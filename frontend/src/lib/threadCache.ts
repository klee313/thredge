import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { EntryDetail, PageResponse, ThreadDetail, ThreadFeedItem, ThreadSummary } from './api'
import { queryKeys } from './queryKeys'

type ThreadFeedData = InfiniteData<PageResponse<ThreadFeedItem>>
type ThreadFeedItemWithEntries = ThreadFeedItem & { entries: EntryDetail[] }

const hasEntries = (thread: ThreadFeedItem): thread is ThreadFeedItemWithEntries =>
  Array.isArray((thread as ThreadFeedItemWithEntries).entries)

const updateFeedPages = (
  data: ThreadFeedData | undefined,
  updater: (items: ThreadFeedItem[]) => ThreadFeedItem[],
) => {
  if (!data) {
    return data
  }
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: updater(page.items),
    })),
  }
}

type FeedUpdateOptions = {
  includeFeed?: boolean
  includeSearch?: boolean
}

const applyFeedUpdater = (
  queryClient: QueryClient,
  updater: (data: ThreadFeedData | undefined) => ThreadFeedData | undefined,
  options: FeedUpdateOptions = {},
) => {
  const { includeFeed = true, includeSearch = true } = options
  if (includeFeed) {
    queryClient.setQueriesData({ queryKey: queryKeys.threads.feed, exact: false }, updater)
  }
  if (includeSearch) {
    queryClient.setQueriesData({ queryKey: queryKeys.threads.searchRoot, exact: false }, updater)
  }
}

export const removeThreadFromFeed = (
  queryClient: QueryClient,
  threadId: string,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) =>
    updateFeedPages(data, (items) => items.filter((thread) => thread.id !== threadId))
  applyFeedUpdater(queryClient, updater, options)
}

export const setThreadPinnedInFeed = (
  queryClient: QueryClient,
  updated: ThreadSummary,
  pinned: boolean,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) =>
    updateFeedPages(data, (items) =>
      items.map((thread) => (thread.id === updated.id ? { ...thread, pinned } : thread)),
    )
  applyFeedUpdater(queryClient, updater, options)
}

export const updateEntryInFeed = (
  queryClient: QueryClient,
  entryId: string,
  body: string,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) => {
    return updateFeedPages(data, (items) =>
      items.map((thread) => {
        if (!hasEntries(thread)) {
          return thread
        }
        return {
          ...thread,
          entries: thread.entries.map((entry) =>
            entry.id === entryId ? { ...entry, body } : entry,
          ),
        }
      }),
    )
  }
  applyFeedUpdater(queryClient, updater, options)
}

export const updateEntryPositionInFeed = (
  queryClient: QueryClient,
  entry: EntryDetail,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) => {
    return updateFeedPages(data, (items) =>
      items.map((thread) => {
        if (!hasEntries(thread)) {
          return thread
        }
        return {
          ...thread,
          entries: thread.entries.map((item) =>
            item.id === entry.id
              ? {
                ...item,
                parentEntryId: entry.parentEntryId,
                orderIndex: entry.orderIndex,
                createdAt: entry.createdAt,
              }
              : item,
          ),
        }
      }),
    )
  }
  applyFeedUpdater(queryClient, updater, options)
}

export const removeEntryFromFeed = (
  queryClient: QueryClient,
  entryId: string,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) => {
    return updateFeedPages(data, (items) =>
      items.map((thread) => {
        if (!hasEntries(thread)) {
          return thread
        }
        return {
          ...thread,
          entries: thread.entries.filter((entry) => entry.id !== entryId),
        }
      }),
    )
  }
  applyFeedUpdater(queryClient, updater, options)
}

export const updateEntryInThreadDetail = (
  queryClient: QueryClient,
  threadId: string,
  entryId: string,
  body: string,
) => {
  queryClient.setQueryData(queryKeys.thread.detail(threadId), (data: ThreadDetail | undefined) => {
    if (!data) {
      return data
    }
    const newEntries = data.entries.map((entry) =>
      entry.id === entryId ? { ...entry, body } : entry,
    )
    return {
      ...data,
      entries: newEntries,
    }
  })
}

export const updateEntryPositionInThreadDetail = (
  queryClient: QueryClient,
  threadId: string,
  entry: EntryDetail,
) => {
  queryClient.setQueryData<ThreadDetail | undefined>(queryKeys.thread.detail(threadId), (data) => {
    if (!data) {
      return data
    }
    return {
      ...data,
      entries: data.entries.map((item) =>
        item.id === entry.id
          ? {
            ...item,
            parentEntryId: entry.parentEntryId,
            orderIndex: entry.orderIndex,
            createdAt: entry.createdAt,
          }
          : item,
      ),
    }
  })
}

export const removeEntryFromThreadDetail = (
  queryClient: QueryClient,
  threadId: string,
  entryId: string,
) => {
  queryClient.setQueryData<ThreadDetail | undefined>(queryKeys.thread.detail(threadId), (data) => {
    if (!data) {
      return data
    }
    return {
      ...data,
      entries: data.entries.filter((entry) => entry.id !== entryId),
    }
  })
}

export const updateThreadInFeed = (
  queryClient: QueryClient,
  threadId: string,
  updates: Partial<ThreadFeedItem>,
  options?: FeedUpdateOptions,
) => {
  const updater = (data: ThreadFeedData | undefined) =>
    updateFeedPages(data, (items) =>
      items.map((thread) => (thread.id === threadId ? { ...thread, ...updates } : thread)),
    )
  applyFeedUpdater(queryClient, updater, options)
}

export const updateEntryInEntryList = (
  queryClient: QueryClient,
  threadId: string,
  entryId: string,
  body: string,
) => {
  queryClient.setQueryData<EntryDetail[]>(queryKeys.threads.entries(threadId), (old) => {
    if (!old) return old
    return old.map((entry) => (entry.id === entryId ? { ...entry, body } : entry))
  })
}

export const updateEntryPositionInEntryList = (
  queryClient: QueryClient,
  threadId: string,
  entry: EntryDetail,
) => {
  queryClient.setQueryData<EntryDetail[]>(queryKeys.threads.entries(threadId), (old) => {
    if (!old) return old
    return old.map((item) =>
      item.id === entry.id
        ? {
            ...item,
            parentEntryId: entry.parentEntryId,
            orderIndex: entry.orderIndex,
            createdAt: entry.createdAt,
          }
        : item,
    )
  })
}
