import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import type { EntryDetail, ThreadFeedItem } from './api'
import { queryKeys } from './queryKeys'
import {
  removeEntryFromFeed,
  removeEntryFromThreadDetail,
  removeThreadFromFeed,
  updateEntryInEntryList,
  updateEntryInFeed,
  updateEntryInThreadDetail,
  updateEntryPositionInEntryList,
  updateEntryPositionInFeed,
} from './threadCache'

const buildFeedData = (items: ThreadFeedItem[]) => ({
  pages: [{ items, page: 0, size: 20, hasNext: false }],
  pageParams: [0],
})

describe('threadCache', () => {
  it('updateEntryInFeed updates matching entry bodies in feed/search caches', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'before',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    const thread: ThreadFeedItem & { entries: EntryDetail[] } = {
      id: 'thread-1',
      title: 't',
      body: 'b',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entryCount: 1,
      entries: [entry],
    }
    queryClient.setQueryData(queryKeys.threads.feed, buildFeedData([thread]))
    queryClient.setQueryData(queryKeys.threads.searchRoot, buildFeedData([thread]))

    updateEntryInFeed(queryClient, 'entry-1', 'after')

    const feedData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.feed,
    )
    const searchData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.searchRoot,
    )
    expect((feedData?.pages[0].items[0] as { entries: EntryDetail[] }).entries[0].body).toBe(
      'after',
    )
    expect((searchData?.pages[0].items[0] as { entries: EntryDetail[] }).entries[0].body).toBe(
      'after',
    )
  })

  it('removeThreadFromFeed removes threads from feed/search caches', () => {
    const queryClient = new QueryClient()
    const thread: ThreadFeedItem = {
      id: 'thread-1',
      title: 't',
      body: 'b',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entryCount: 0,
    }
    queryClient.setQueryData(queryKeys.threads.feed, buildFeedData([thread]))
    queryClient.setQueryData(queryKeys.threads.searchRoot, buildFeedData([thread]))

    removeThreadFromFeed(queryClient, 'thread-1')

    const feedData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.feed,
    )
    const searchData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.searchRoot,
    )
    expect(feedData?.pages[0].items.length).toBe(0)
    expect(searchData?.pages[0].items.length).toBe(0)
  })

  it('removeEntryFromFeed removes entries from feed/search caches', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'before',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    const thread: ThreadFeedItem & { entries: EntryDetail[] } = {
      id: 'thread-1',
      title: 't',
      body: 'b',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entryCount: 1,
      entries: [entry],
    }
    queryClient.setQueryData(queryKeys.threads.feed, buildFeedData([thread]))
    queryClient.setQueryData(queryKeys.threads.searchRoot, buildFeedData([thread]))

    removeEntryFromFeed(queryClient, 'entry-1')

    const feedData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.feed,
    )
    const searchData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.searchRoot,
    )
    expect((feedData?.pages[0].items[0] as { entries: EntryDetail[] }).entries.length).toBe(0)
    expect((searchData?.pages[0].items[0] as { entries: EntryDetail[] }).entries.length).toBe(0)
  })

  it('updateEntryPositionInFeed updates parent/order in feed/search caches', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'body',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    const thread: ThreadFeedItem & { entries: EntryDetail[] } = {
      id: 'thread-1',
      title: 't',
      body: 'b',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entryCount: 1,
      entries: [entry],
    }
    queryClient.setQueryData(queryKeys.threads.feed, buildFeedData([thread]))
    queryClient.setQueryData(queryKeys.threads.searchRoot, buildFeedData([thread]))

    updateEntryPositionInFeed(queryClient, {
      ...entry,
      parentEntryId: 'entry-2',
      orderIndex: 3,
    })

    const feedData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.feed,
    )
    const searchData = queryClient.getQueryData<ReturnType<typeof buildFeedData>>(
      queryKeys.threads.searchRoot,
    )
    const updatedFeedEntry = (feedData?.pages[0].items[0] as { entries: EntryDetail[] }).entries[0]
    const updatedSearchEntry = (searchData?.pages[0].items[0] as { entries: EntryDetail[] }).entries[0]
    expect(updatedFeedEntry.parentEntryId).toBe('entry-2')
    expect(updatedFeedEntry.orderIndex).toBe(3)
    expect(updatedSearchEntry.parentEntryId).toBe('entry-2')
    expect(updatedSearchEntry.orderIndex).toBe(3)
  })

  it('updateEntryInThreadDetail updates entry body in thread detail cache', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'before',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    queryClient.setQueryData(queryKeys.thread.detail('thread-1'), {
      id: 'thread-1',
      title: 't',
      body: null,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entries: [entry],
    })

    updateEntryInThreadDetail(queryClient, 'thread-1', 'entry-1', 'after')

    const detail = queryClient.getQueryData<{
      entries: EntryDetail[]
    }>(queryKeys.thread.detail('thread-1'))
    expect(detail?.entries[0].body).toBe('after')
  })

  it('removeEntryFromThreadDetail removes entry from thread detail cache', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'before',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    queryClient.setQueryData(queryKeys.thread.detail('thread-1'), {
      id: 'thread-1',
      title: 't',
      body: null,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      categories: [],
      pinned: false,
      entries: [entry],
    })

    removeEntryFromThreadDetail(queryClient, 'thread-1', 'entry-1')

    const detail = queryClient.getQueryData<{
      entries: EntryDetail[]
    }>(queryKeys.thread.detail('thread-1'))
    expect(detail?.entries.length).toBe(0)
  })

  it('updateEntryInEntryList updates entry body in entries list cache', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'before',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    queryClient.setQueryData(queryKeys.threads.entries('thread-1'), [entry])

    updateEntryInEntryList(queryClient, 'thread-1', 'entry-1', 'after')

    const entries = queryClient.getQueryData<EntryDetail[]>(
      queryKeys.threads.entries('thread-1'),
    )
    expect(entries?.[0].body).toBe('after')
  })

  it('updateEntryPositionInEntryList updates entry position in entries list cache', () => {
    const queryClient = new QueryClient()
    const entry: EntryDetail = {
      id: 'entry-1',
      body: 'body',
      parentEntryId: null,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      threadId: 'thread-1',
    }
    queryClient.setQueryData(queryKeys.threads.entries('thread-1'), [entry])

    updateEntryPositionInEntryList(queryClient, 'thread-1', {
      ...entry,
      parentEntryId: 'entry-2',
      orderIndex: 2,
    })

    const entries = queryClient.getQueryData<EntryDetail[]>(
      queryKeys.threads.entries('thread-1'),
    )
    expect(entries?.[0].parentEntryId).toBe('entry-2')
    expect(entries?.[0].orderIndex).toBe(2)
  })
})
