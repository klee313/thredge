import { useEffect, useRef, useState } from 'react'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { useCategorySearch } from '../../hooks/useCategorySearch'
import { uiTokens } from '../../lib/uiTokens'

type ThreadCategorySelectorProps = {
  categories: { id: string; name: string }[]
  selectedCategories: string[]
  editingCategoryInput: string
  isCreateCategoryPending: boolean
  onToggleCategory: (name: string) => void
  onCategoryInputChange: (value: string) => void
  onCategoryCancel: () => void
  onCategorySubmit: (value: string) => void
  labels: {
    categorySearchPlaceholder: string
    loadMore: string
    addCategory: string
    cancelCategory: string
  }
}

export function ThreadCategorySelector({
  categories,
  selectedCategories,
  editingCategoryInput: initialCategoryInput,
  isCreateCategoryPending,
  onToggleCategory,
  onCategoryInputChange,
  onCategoryCancel,
  onCategorySubmit,
  labels,
}: ThreadCategorySelectorProps) {
  const { localValue: localCategoryInput, setLocalValue: setLocalCategoryInput } =
    useDebouncedTextInput({
      value: initialCategoryInput,
      onChange: onCategoryInputChange,
      delayMs: 300,
    })

  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0)
  const [isCategoryInputFocused, setIsCategoryInputFocused] = useState(false)
  const [isCategoryListExpanded, setIsCategoryListExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const categoryPreviewLimit = 10

  const { trimmed, normalized, filtered, hasExactMatch } = useCategorySearch(
    categories,
    localCategoryInput,
  )
  const availableCategories = filtered.filter(
    (category) => !selectedCategories.includes(category.name),
  )
  const visibleCategories =
    isCategoryInputFocused || isCategoryListExpanded
      ? availableCategories
      : availableCategories.slice(0, categoryPreviewLimit)
  const navigableCategories = visibleCategories
  const shouldShowCategoryExpand =
    !isCategoryInputFocused &&
    !isCategoryListExpanded &&
    availableCategories.length > categoryPreviewLimit
  const shouldShowCreate = Boolean(normalized) && !hasExactMatch

  useEffect(() => {
    if (navigableCategories.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFocusedCategoryIndex(0)
      return
    }
    setFocusedCategoryIndex((prev) =>
      Math.max(0, Math.min(prev, navigableCategories.length - 1)),
    )
  }, [navigableCategories])

  return (
    <div ref={containerRef} className="mt-4 py-2">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={`${uiTokens.input.base} w-[110px] px-3 py-1.5 text-xs`}
            placeholder={labels.categorySearchPlaceholder}
            aria-label={labels.categorySearchPlaceholder}
            value={localCategoryInput}
            onFocus={() => {
              setIsCategoryInputFocused(true)
              if (availableCategories.length > 0) {
                setFocusedCategoryIndex(0)
              }
            }}
            onBlur={() => {
              const container = containerRef.current
              window.setTimeout(() => {
                if (!container || !container.contains(document.activeElement)) {
                  setIsCategoryInputFocused(false)
                }
              }, 0)
            }}
            onChange={(event) => {
              setIsCategoryListExpanded(false)
              setLocalCategoryInput(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                setFocusedCategoryIndex((prev) =>
                  navigableCategories.length === 0
                    ? 0
                    : (prev + 1) % navigableCategories.length,
                )
                return
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setFocusedCategoryIndex((prev) =>
                  navigableCategories.length === 0
                    ? 0
                    : (prev + 1) % navigableCategories.length,
                )
                return
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                setFocusedCategoryIndex((prev) =>
                  navigableCategories.length === 0
                    ? 0
                    : (prev - 1 + navigableCategories.length) % navigableCategories.length,
                )
                return
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setFocusedCategoryIndex((prev) =>
                  navigableCategories.length === 0
                    ? 0
                    : (prev - 1 + navigableCategories.length) % navigableCategories.length,
                )
                return
              }
              if (event.key !== 'Enter') {
                return
              }
              event.preventDefault()
              const match = navigableCategories[focusedCategoryIndex]
              if (!match) {
                return
              }
              onToggleCategory(match.name)
              if (normalized) {
                setLocalCategoryInput('')
                onCategoryInputChange('')
              }
            }}
          />
          {visibleCategories.map((category, index) => (
            <button
              key={category.id}
              className={`rounded-full border border-[var(--theme-border)] px-3 py-1 text-xs text-[var(--theme-ink)] ${focusedCategoryIndex === index
                ? 'outline outline-2 outline-[var(--theme-primary)] outline-offset-1'
                : ''
                }`}
              type="button"
              tabIndex={-1}
              onClick={() => onToggleCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
          {shouldShowCategoryExpand && (
            <button
              className="flex h-7 items-center justify-center rounded-full border border-[var(--theme-border)] px-2 text-[11px] font-semibold text-[var(--theme-ink)] transition-all hover:opacity-80"
              type="button"
              onClick={() => setIsCategoryListExpanded(true)}
            >
              ... {labels.loadMore}
            </button>
          )}
          {shouldShowCreate && (
            <div className="flex items-center gap-1">
              <button
                className="flex h-7 items-center justify-center rounded-full border border-[var(--theme-border)] px-2 text-[11px] font-semibold text-[var(--theme-ink)] transition-all hover:opacity-80"
                type="button"
                onClick={() => {
                  onCategorySubmit(trimmed)
                  onCategoryInputChange('')
                }}
                disabled={isCreateCategoryPending}
              >
                '{trimmed}' {labels.addCategory}
              </button>
              <button
                className="flex h-7 items-center justify-center rounded-full border border-[var(--theme-border)] px-2 text-[11px] font-semibold text-[var(--theme-ink)] transition-all hover:opacity-80"
                type="button"
                onClick={() => {
                  onCategoryCancel()
                  setLocalCategoryInput('')
                }}
                disabled={isCreateCategoryPending}
              >
                {labels.cancelCategory}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
