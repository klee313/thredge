import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategorySearch } from '../../hooks/useCategorySearch'
import { InlineIcon } from '../common/InlineIcon'
import xIcon from '../../assets/x.svg?raw'

type DropdownCategoryItem = {
  id: string
  name: string
  count: number
  canDelete: boolean
}

export type SearchDropdownProps = {
  query: string
  onQueryChange: (value: string) => void
  onSearch: (query: string) => void
  onRequestClose: () => void
  categories: DropdownCategoryItem[]
  recentCategories?: { name: string; path: string }[]
  selectedCategories: string[]
  uncategorizedCount: number
  uncategorizedToken: string
  isCreateCategoryPending?: boolean
  labels: {
    categoriesTitle: string
    uncategorized: string
    deleteCategory: string
    noCategories: string
    addCategory: string
  }
  onToggleCategory: (name: string) => void
  onToggleUncategorized: () => void
  onDeleteCategory: (id: string, name: string) => void
  onCreateCategory?: (name: string) => void
}

export function SearchDropdown({
  query,
  onQueryChange,
  onSearch,
  onRequestClose,
  categories,
  selectedCategories,
  uncategorizedCount,
  uncategorizedToken,
  isCreateCategoryPending,
  labels,
  onToggleCategory,
  onToggleUncategorized,
  onDeleteCategory,
  onCreateCategory,
}: SearchDropdownProps) {
  const { t } = useTranslation()
  const { trimmed, filtered: filteredCategories, hasExactMatch } = useCategorySearch(
    categories,
    query,
  )
  const shouldShowCreate = Boolean(trimmed) && !hasExactMatch && Boolean(onCreateCategory)

  const groupedItems = useMemo(() => {
    const selectedSet = new Set(selectedCategories)
    const selected: DropdownCategoryItem[] = []
    const unselected: DropdownCategoryItem[] = []

    filteredCategories.forEach((category) => {
      if (selectedSet.has(category.name)) {
        selected.push(category)
      } else {
        unselected.push(category)
      }
    })

    const sortFn = (a: DropdownCategoryItem, b: DropdownCategoryItem) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

    selected.sort(sortFn)
    unselected.sort(sortFn)

    type ListItem =
      | { type: 'header'; char: string }
      | { type: 'category'; data: DropdownCategoryItem }

    const items: ListItem[] = []

    selected.forEach((category) => {
      items.push({ type: 'category', data: category })
    })

    let lastChar = ''
    unselected.forEach((category) => {
      const char = category.name.charAt(0).toUpperCase()
      if (char !== lastChar) {
        items.push({ type: 'header', char })
        lastChar = char
      }
      items.push({ type: 'category', data: category })
    })

    return items
  }, [filteredCategories, selectedCategories])

  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-full">
      <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 shadow-lg">
        <button
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold ${
            trimmed
              ? 'text-[var(--theme-ink)] hover:bg-[var(--theme-base)]'
              : 'text-[var(--theme-muted)] opacity-70'
          }`}
          type="button"
          disabled={!trimmed}
          onClick={() => {
            if (!trimmed) {
              return
            }
            onSearch(trimmed)
            onRequestClose()
          }}
        >
          <span>
            {trimmed ? t('home.searchAction', { query: trimmed }) : t('home.searchPlaceholder')}
          </span>
        </button>
        <div className="mt-3 border-t border-[var(--theme-border)] pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--theme-muted)] opacity-70">
            {labels.categoriesTitle}
          </div>
          <div className="mt-2 flex max-h-52 flex-wrap items-center gap-2 overflow-y-auto pr-1">
            <button
              className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                selectedCategories.includes(uncategorizedToken)
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]'
                  : 'border-[var(--theme-border)] text-[var(--theme-ink)]'
              }`}
              type="button"
              onClick={onToggleUncategorized}
            >
              {labels.uncategorized}{' '}
              <span
                className={`text-[10px] ${
                  selectedCategories.includes(uncategorizedToken)
                    ? 'text-[var(--theme-on-primary)] opacity-80'
                    : 'text-[var(--theme-muted)] opacity-60'
                }`}
              >
                ({uncategorizedCount})
              </span>
            </button>
            {groupedItems.map((item, index) => {
              if (item.type === 'header') {
                return (
                  <button
                    key={`header-${item.char}-${index}`}
                    className="flex h-[14px] w-[13px] items-center justify-center rounded-[1px] bg-[var(--theme-primary)] text-[10px] font-bold leading-none text-[var(--theme-on-primary)] hover:brightness-110"
                    type="button"
                    onClick={() => onQueryChange(item.char)}
                  >
                    {item.char}
                  </button>
                )
              }

              const category = item.data
              const isSelected = selectedCategories.includes(category.name)
              return (
                <div key={category.id} className="relative flex items-center">
                  <button
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                      isSelected
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]'
                        : 'border-[var(--theme-border)] text-[var(--theme-ink)]'
                    }`}
                    type="button"
                    onClick={() => onToggleCategory(category.name)}
                  >
                    {category.name}{' '}
                    <span
                      className={`text-[10px] ${
                        isSelected
                          ? 'text-[var(--theme-on-primary)] opacity-80'
                          : 'text-[var(--theme-muted)] opacity-60'
                      }`}
                    >
                      ({category.count})
                    </span>
                  </button>
                  {category.canDelete && (
                    <button
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[10px] text-[var(--theme-muted)] hover:opacity-80"
                      type="button"
                      onClick={() => onDeleteCategory(category.id, category.name)}
                      aria-label={labels.deleteCategory}
                    >
                      <InlineIcon svg={xIcon} className="[&>svg]:h-2.5 [&>svg]:w-2.5" />
                    </button>
                  )}
                </div>
              )
            })}
            {shouldShowCreate && onCreateCategory && (
              <div className="flex items-center gap-1">
                <button
                  className="flex h-6 items-center justify-center rounded-full border border-[var(--theme-border)] px-2 text-[10px] font-semibold text-[var(--theme-ink)] transition-all hover:opacity-80"
                  type="button"
                  onClick={() => {
                    if (isCreateCategoryPending) {
                      return
                    }
                    onCreateCategory(trimmed)
                    onQueryChange('')
                  }}
                  disabled={isCreateCategoryPending}
                >
                  '{trimmed}' {labels.addCategory}
                </button>
              </div>
            )}
            {groupedItems.length === 0 && (
              <div className="text-xs text-[var(--theme-muted)]">{labels.noCategories}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
