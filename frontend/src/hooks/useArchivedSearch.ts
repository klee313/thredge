import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import type { PageResponse } from '../lib/api'

type ArchivedSearchOptions<T> = {
  queryKey: readonly unknown[]
  searchKey: (query: string) => readonly unknown[]
  fetchAll: (page: number, options?: { signal?: AbortSignal }) => Promise<PageResponse<T>>
  search: (query: string, page: number, options?: { signal?: AbortSignal }) => Promise<PageResponse<T>>
  debounceMs?: number
}

export const useArchivedSearch = <T>({
  queryKey,
  searchKey,
  fetchAll,
  search,
  debounceMs = 250,
}: ArchivedSearchOptions<T>) => {
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebouncedValue(filter.trim(), debounceMs)

  const baseQuery = useInfiniteQuery<PageResponse<T>, Error, { pages: PageResponse<T>[]; pageParams: number[] }, readonly unknown[], number>({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchAll(pageParam, { signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: debouncedFilter.length === 0,
    meta: { suppressGlobalError: true },
  })

  const searchQuery = useInfiniteQuery<PageResponse<T>, Error, { pages: PageResponse<T>[]; pageParams: number[] }, readonly unknown[], number>({
    queryKey: searchKey(debouncedFilter),
    queryFn: ({ pageParam, signal }) => search(debouncedFilter, pageParam, { signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: debouncedFilter.length > 0,
    meta: { suppressGlobalError: true },
  })

  const filtered = useMemo(() => {
    const pages = debouncedFilter.length > 0 ? searchQuery.data?.pages : baseQuery.data?.pages
    return pages ? pages.flatMap((page) => page.items) : []
  }, [baseQuery.data, debouncedFilter.length, searchQuery.data])

  const activeQuery = debouncedFilter.length > 0 ? searchQuery : baseQuery

  return {
    filter,
    setFilter,
    debouncedFilter,
    filtered,
    baseQuery,
    searchQuery,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    isSearching: debouncedFilter.length > 0 && searchQuery.isFetching,
    hasNextPage: activeQuery.hasNextPage ?? false,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
  }
}
