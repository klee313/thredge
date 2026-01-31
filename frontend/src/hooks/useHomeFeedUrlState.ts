import { useMemo, useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const parseCategoryPath = (value?: string) => {
  if (!value) {
    return []
  }
  return value
    .split(',')
    .map((item) => safeDecode(item))
    .filter(Boolean)
}

const buildCategoryPath = (names: string[]) =>
  names.map((name) => encodeURIComponent(name)).join(',')
const isSameCategoryList = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index])

type UseHomeFeedUrlStateOptions = {
  initialSearchDraft?: string
}

export const useHomeFeedUrlState = ({ initialSearchDraft = '' }: UseHomeFeedUrlStateOptions) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categoryPath } = useParams<{ categoryPath?: string }>()
  const navigate = useNavigate()
  const updateSearchParams = useCallback(
    (updater: (current: URLSearchParams) => URLSearchParams) => {
      setSearchParams((prev) => updater(new URLSearchParams(prev)), { replace: true })
    },
    [setSearchParams],
  )

  const queryCategories = useMemo(
    () => searchParams.get('c')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )
  const selectedCategories = useMemo(() => {
    const pathCategories = parseCategoryPath(categoryPath)
    if (pathCategories.length > 0) {
      return pathCategories
    }
    return queryCategories
  }, [categoryPath, queryCategories])

  const searchQuery = searchParams.get('q') ?? ''
  const [searchDraft, setSearchDraft] = useState(
    () => searchQuery || initialSearchDraft || '',
  )
  useEffect(() => {
    // Sync draft only when URL query changes externally (not while typing).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchDraft(searchQuery)
  }, [searchQuery])

  const setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (update) => {
      const next = typeof update === 'function' ? update(selectedCategories) : update
      if (isSameCategoryList(next, selectedCategories)) {
        return
      }
      const nextPath = buildCategoryPath(next)
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('c')
      const search = newParams.toString()
      const targetPath = nextPath ? `/categories/${nextPath}` : '/'
      void navigate(search ? `${targetPath}?${search}` : targetPath, { replace: true })
    },
    [navigate, searchParams, selectedCategories],
  )

  const setSearchQueryState = useCallback(
    (query: string) => {
      setSearchDraft(query)
      updateSearchParams((newParams) => {
        if (query) {
          newParams.set('q', query)
        } else {
          newParams.delete('q')
        }
        return newParams
      })
    },
    [updateSearchParams],
  )

  useEffect(() => {
    if (queryCategories.length === 0) {
      return
    }
    const pathCategories = parseCategoryPath(categoryPath)
    if (pathCategories.length > 0) {
      updateSearchParams((next) => {
        next.delete('c')
        return next
      })
      return
    }
    const nextPath = buildCategoryPath(queryCategories)
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('c')
    const search = newParams.toString()
    void navigate(search ? `/categories/${nextPath}?${search}` : `/categories/${nextPath}`, {
      replace: true,
    })
  }, [categoryPath, navigate, queryCategories, searchParams, updateSearchParams])

  return {
    selectedCategories,
    searchQuery,
    searchDraft,
    setSearchDraft,
    setSelectedCategories,
    setSearchQuery: setSearchQueryState,
  }
}
