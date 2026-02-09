import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useParams } from 'react-router-dom'
import { UNCATEGORIZED_TOKEN } from '../../lib/api'
import type { useHomeFeedController } from '../../hooks/useHomeFeedController'
import { useHeaderSlot } from '../layout/HeaderSlotContext'
import { HomeFeedComposer } from './HomeFeedComposer'
import { HomeFeedThreadList } from './HomeFeedThreadList'
import { SearchForm } from './SearchForm'
import { TodoThreadWidget } from './TodoThreadWidget'
import { useSettingsStore } from '../../store/settingsStore'

const RECENT_CATEGORIES_STORAGE_KEY = 'thredge:recent-categories'
const RECENT_CATEGORIES_LIMIT = 5

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const parseCategoryPath = (value?: string) =>
  value
    ? value
        .split(',')
        .map((item) => safeDecode(item).trim())
        .filter(Boolean)
    : []

const loadRecentCategories = () => {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(RECENT_CATEGORIES_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(
      (item) =>
        typeof item === 'string' && item.trim() && item.trim() !== UNCATEGORIZED_TOKEN,
    )
  } catch {
    return []
  }
}

const saveRecentCategories = (items: string[]) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(RECENT_CATEGORIES_STORAGE_KEY, JSON.stringify(items))
}

type HomeFeedViewProps = {
  controller: ReturnType<typeof useHomeFeedController>
  displayName: string
  username: string
}

export function HomeFeedView({ controller, displayName, username }: HomeFeedViewProps) {
  const { t } = useTranslation()
  const showTodoPanel = useSettingsStore((state) => state.showTodoPanel)
  const { categoryPath } = useParams<{ categoryPath?: string }>()
  const { setHeaderSlot } = useHeaderSlot()
  const {
    state,
    queries,
    actions,
    mutations,
  } = controller
  const {
    selectedCategories,
    searchDraft,
    threadBody,
  } = state
  const {
    categoriesQuery,
    categoryCountsQuery,
    categoryCountsById,
    todosQuery,
  } = queries
  const {
    threadActions,
    uiActions,
    onToggleUncategorized,
    onToggleCategory,
  } = actions
  const {
    createThreadMutation,
    createCategoryMutation,
    deleteCategoryMutation,
  } = mutations
  const [recentCategories, setRecentCategories] = useState<string[]>(() =>
    loadRecentCategories(),
  )

  useEffect(() => {
    const nextCategories = parseCategoryPath(categoryPath).filter(
      (name) => name !== UNCATEGORIZED_TOKEN,
    )
    if (nextCategories.length === 0) {
      return
    }
    setRecentCategories((prev) => {
      const updated = prev.filter((name) => name !== UNCATEGORIZED_TOKEN)
      nextCategories.forEach((name) => {
        const existingIndex = updated.indexOf(name)
        if (existingIndex >= 0) {
          updated.splice(existingIndex, 1)
        }
        updated.unshift(name)
      })
      const trimmed = updated.slice(0, RECENT_CATEGORIES_LIMIT)
      saveRecentCategories(trimmed)
      return trimmed
    })
  }, [categoryPath])

  const recentCategoryLinks = useMemo(
    () =>
      recentCategories.map((name) => ({
        name,
        path: `/categories/${encodeURIComponent(name)}`,
      })),
    [recentCategories],
  )

  const headerSearch = useMemo(
    () => (
      <SearchForm
        value={searchDraft}
        onChange={uiActions.setSearchDraft}
        onSearch={uiActions.setSearchQuery}
        onClear={() => uiActions.setSearchQuery('')}
        dropdown={{
          categories:
            categoriesQuery.data?.map((category) => {
              const globalCount = categoryCountsById.get(category.id) ?? 0

              return {
                id: category.id,
                name: category.name,
                count: globalCount,
                canDelete: categoryCountsQuery.isSuccess && globalCount === 0,
              }
            }) ?? [],
          recentCategories: recentCategoryLinks,
          selectedCategories,
          uncategorizedCount: categoryCountsQuery.data?.uncategorizedCount ?? 0,
          uncategorizedToken: UNCATEGORIZED_TOKEN,
          labels: {
            categoriesTitle: t('nav.allCategories'),
            uncategorized: t('home.uncategorized'),
            deleteCategory: t('home.deleteCategory'),
            noCategories: t('home.noCategories'),
            addCategory: t('home.addCategory'),
          },
          onToggleUncategorized,
          onToggleCategory,
          onDeleteCategory: (id, name) => {
            const shouldDelete = window.confirm(t('home.deleteCategoryConfirm', { name }))
            if (!shouldDelete) {
              return
            }
            deleteCategoryMutation.mutate({ id, name })
          },
          onCreateCategory: (name) => {
            createCategoryMutation.mutate({ name, target: 'filter' })
          },
          isCreateCategoryPending: createCategoryMutation.isPending,
        }}
      />
    ),
    [
      categoryCountsById,
      categoryCountsQuery.data?.uncategorizedCount,
      categoryCountsQuery.isSuccess,
      categoriesQuery.data,
      createCategoryMutation,
      deleteCategoryMutation,
      onToggleCategory,
      onToggleUncategorized,
      searchDraft,
      selectedCategories,
      t,
      uiActions,
      recentCategoryLinks,
    ],
  )

  const newThreadTitle = useMemo(() => {
    if (selectedCategories.length === 0) {
      return t('home.newThreadComposerTitle')
    }
    const categoryLabel = selectedCategories
      .map((name) => (name === UNCATEGORIZED_TOKEN ? t('home.uncategorized') : name))
      .join(', ')
    return t('home.newThreadComposerTitleWithCategories', { categories: categoryLabel })
  }, [selectedCategories, t])

  const newThreadCategorySelector = useMemo(() => {
    if (selectedCategories.length > 0) {
      return undefined
    }
    return {
      categories: categoriesQuery.data ?? [],
      selectedCategories,
      isCreateCategoryPending: createCategoryMutation.isPending,
      onToggleCategory,
      onCategorySubmit: (value: string) => {
        createCategoryMutation.mutate({ name: value, target: 'filter' })
      },
      labels: {
        categorySearchPlaceholder: t('home.categorySearchPlaceholder'),
        loadMore: t('home.loadMore'),
        addCategory: t('home.addCategory'),
        cancelCategory: t('common.cancel'),
      },
    }
  }, [
    categoriesQuery.data,
    createCategoryMutation,
    onToggleCategory,
    selectedCategories,
    t,
  ])

  useEffect(() => {
    setHeaderSlot(headerSearch)
    return () => setHeaderSlot(null)
  }, [headerSearch, setHeaderSlot])

  return (
    <div className="space-y-14 sm:space-y-16">
      {recentCategoryLinks.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--theme-muted)]">
          <span className="shrink-0 font-normal uppercase tracking-wide">
            {t('nav.recentCategories')}
          </span>
          <div className="flex min-w-0 items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
            {recentCategoryLinks.map((category) => (
              <NavLink
                key={category.name}
                to={category.path}
                className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--theme-ink)] transition-colors hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
                aria-label={t('nav.recentCategoryLink', { category: category.name })}
              >
                {category.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
      <HomeFeedComposer
        title={newThreadTitle}
        displayName={displayName}
        username={username}
        threadBody={threadBody}
        onThreadBodyChange={threadActions.setThreadBody}
        onThreadSubmit={(body) => {
          threadActions.setThreadBody(body)
          createThreadMutation.mutate(body)
        }}
        isThreadSubmitting={createThreadMutation.isPending}
        categorySelector={newThreadCategorySelector}
      />
      {showTodoPanel && (todosQuery.isLoading || todosQuery.isError || todosQuery.isSuccess) && (
        <div className="sm:pointer-events-none sm:fixed sm:left-4 sm:top-24 sm:z-20 sm:w-[19rem]">
          <div className="sm:pointer-events-auto">
            <TodoThreadWidget
              todos={todosQuery.data ?? []}
              isLoading={todosQuery.isLoading}
              isError={todosQuery.isError}
            />
          </div>
        </div>
      )}
      <HomeFeedThreadList controller={controller} />
    </div>
  )
}
