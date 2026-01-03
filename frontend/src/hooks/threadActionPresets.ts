import type { InvalidateTarget } from './useThreadActions'

export const THREAD_LIST_INVALIDATIONS: InvalidateTarget[] = [
  'feed',
  'search',
  'hiddenThreads',
  'hiddenEntries',
]

export const THREAD_DETAIL_INVALIDATIONS: InvalidateTarget[] = [
  'feed',
  'thread',
  'hiddenThreads',
  'hiddenEntries',
]
