import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  fetchCategories,
  fetchCategoryCounts,
  fetchThreadFeedPage,
  searchThreadsPage,
  UNCATEGORIZED_TOKEN,
  type FeedFilterOptions,
} from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { formatDateInput } from '../lib/date'

type UseHomeFeedQueriesParams = {
  normalizedSearchQuery: string
  selectedCategories: string[]
  selectedDate: Date | null
  dateInputValue: string
}

export const useHomeFeedQueries = ({
  normalizedSearchQuery,
  selectedCategories,
  selectedDate,
  dateInputValue,
}: UseHomeFeedQueriesParams) => {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => fetchCategories({ signal }),
  })

  const categoryCountsQuery = useQuery({
    queryKey: queryKeys.categoriesCounts,
    queryFn: ({ signal }) => fetchCategoryCounts({ signal }),
  })

  const validCategoryNames = useMemo(() => {
    return new Set((categoriesQuery.data ?? []).map((category) => category.name))
  }, [categoriesQuery.data])

  const normalizedSelectedCategories = useMemo(() => {
    return selectedCategories.filter(
      (name) => name === UNCATEGORIZED_TOKEN || validCategoryNames.has(name),
    )
  }, [selectedCategories, validCategoryNames])

  const feedFilters: FeedFilterOptions = useMemo(() => {
    const filters: FeedFilterOptions = {}
    if (selectedDate) {
      filters.date = dateInputValue
    }
    if (normalizedSelectedCategories.length > 0) {
      const categoryMap = new Map(
        (categoriesQuery.data ?? []).map((category) => [category.name, category.id]),
      )
      const ids = normalizedSelectedCategories.flatMap((name) => {
        if (name === UNCATEGORIZED_TOKEN) {
          return [name]
        }
        const id = categoryMap.get(name)
        return id ? [id] : []
      })
      filters.categoryIds = ids
    }
    return filters
  }, [selectedDate, dateInputValue, normalizedSelectedCategories, categoriesQuery.data])

  const hasFilters = Boolean(feedFilters.date || feedFilters.categoryIds?.length)

  const threadsQuery = useInfiniteQuery({
    queryKey: hasFilters
      ? queryKeys.threads.feedFiltered(feedFilters.date, feedFilters.categoryIds)
      : queryKeys.threads.feed,
    queryFn: ({ pageParam, signal }) =>
      fetchThreadFeedPage(pageParam, undefined, hasFilters ? feedFilters : undefined, { signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: !normalizedSearchQuery,
    meta: { suppressGlobalError: true },
  })

  const searchThreadsQuery = useInfiniteQuery({
    queryKey: queryKeys.threads.search(
      normalizedSearchQuery,
      feedFilters.categoryIds,
      selectedDate ? dateInputValue : null,
    ),
    queryFn: ({ pageParam, signal }) =>
      searchThreadsPage(
        normalizedSearchQuery,
        pageParam,
        undefined,
        feedFilters.categoryIds,
        selectedDate ? dateInputValue : undefined,
        { signal },
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: Boolean(normalizedSearchQuery),
    meta: { suppressGlobalError: true },
  })

  const threadItems = useMemo(() => {
    const pages = threadsQuery.data?.pages ?? []
    return pages.flatMap((page) => page.items)
  }, [threadsQuery.data])

  const searchItems = useMemo(() => {
    const pages = searchThreadsQuery.data?.pages ?? []
    return pages.flatMap((page) => page.items)
  }, [searchThreadsQuery.data])

  const filteredThreads = useMemo(() => {
    if (normalizedSearchQuery) {
      // Search API may not always apply date filters; keep client-side guard.
      const dateFiltered = selectedDate
        ? searchItems.filter((thread) => formatDateInput(new Date(thread.createdAt)) === dateInputValue)
        : searchItems
      return dateFiltered
    }
    return threadItems
  }, [threadItems, searchItems, selectedDate, normalizedSearchQuery, dateInputValue])

  const categoryCountsById = useMemo(() => {
    const counts = categoryCountsQuery.data?.counts ?? []
    return new Map(counts.map((item) => [item.id, item.count]))
  }, [categoryCountsQuery.data])

  return {
    categoriesQuery,
    categoryCountsQuery,
    feedFilters,
    hasFilters,
    threadsQuery,
    searchThreadsQuery,
    threadItems,
    searchItems,
    filteredThreads,
    categoryCountsById,
    validCategoryNames,
    normalizedSelectedCategories,
  }
}
