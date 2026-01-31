import { useMemo } from 'react'

type CategoryLike = { name: string }

export const useCategorySearch = <T extends CategoryLike>(
  categories: T[],
  searchQuery: string,
) => {
  const trimmed = searchQuery.trim()
  const normalized = trimmed.toLowerCase()
  const filtered = useMemo(() => {
    if (!normalized) {
      return categories
    }
    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalized),
    )
  }, [categories, normalized])
  const hasExactMatch = useMemo(() => {
    if (!normalized) {
      return false
    }
    return categories.some((category) => category.name.toLowerCase() === normalized)
  }, [categories, normalized])

  return { trimmed, normalized, filtered, hasExactMatch }
}
