import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  fetchHiddenEntriesPage,
  fetchHiddenThreadsPage,
  fetchTodos,
  purgeEntry,
  purgeThread,
  restoreEntry,
  restoreThread,
  searchHiddenEntriesPage,
  searchHiddenThreadsPage,
  updateTodo,
} from '../lib/api'
import { highlightMatches } from '../lib/highlightMatches'
import { useArchivedSearch } from '../hooks/useArchivedSearch'
import { queryKeys } from '../lib/queryKeys'
import { uiTokens } from '../lib/uiTokens'
import { Tooltip } from '../components/common/Tooltip'
import { ErrorNotice } from '../components/common/ErrorNotice'

export function ArchivePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<string | null>(null)

  const threads = useArchivedSearch({
    queryKey: queryKeys.threads.hidden,
    searchKey: queryKeys.threads.hiddenSearch,
    fetchAll: (page, options) => fetchHiddenThreadsPage(page, undefined, options),
    search: (query, page, options) => searchHiddenThreadsPage(query, page, undefined, undefined, options),
  })

  const entries = useArchivedSearch({
    queryKey: queryKeys.entries.hidden,
    searchKey: queryKeys.entries.hiddenSearch,
    fetchAll: (page, options) => fetchHiddenEntriesPage(page, undefined, options),
    search: (query, page, options) => searchHiddenEntriesPage(query, page, undefined, options),
  })

  const todosQuery = useQuery({
    queryKey: queryKeys.todos.list,
    queryFn: ({ signal }) => fetchTodos({ signal }),
    meta: { suppressGlobalError: true },
  })

  const completedTodos = useMemo(() => {
    const todos = todosQuery.data ?? []
    return [...todos]
      .filter((todo) => todo.done)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [todosQuery.data])

  const restoreThreadMutation = useMutation({
    mutationFn: (id: string) => restoreThread(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.hidden })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.hiddenSearchRoot })
      setToast(t('archive.restoredThread'))
    },
  })

  const restoreEntryMutation = useMutation({
    mutationFn: (id: string) => restoreEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.hidden })
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.hiddenSearchRoot })
      setToast(t('archive.restoredEntry'))
    },
  })

  const purgeThreadMutation = useMutation({
    mutationFn: (id: string) => purgeThread(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.hidden })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.hiddenSearchRoot })
      setToast(t('archive.purgedThread'))
    },
  })

  const purgeEntryMutation = useMutation({
    mutationFn: (id: string) => purgeEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.hidden })
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.hiddenSearchRoot })
      setToast(t('archive.purgedEntry'))
    },
  })

  const restoreTodoMutation = useMutation({
    mutationFn: (id: string) => updateTodo(id, { done: false }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.todos.list })
      setToast(t('archive.restoredTodo'))
    },
  })

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(null), 2000)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <div className="space-y-2 sm:space-y-4">
      <h1 className="text-xl font-semibold">{t('archive.title')}</h1>

      {toast && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {toast}
        </div>
      )}

      <div className={uiTokens.card.surface}>
        <div className="text-sm font-semibold">{t('archive.completedTodos')}</div>
        <div className="mt-2 space-y-2 sm:mt-3">
          {todosQuery.isLoading && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.loading')}
            </div>
          )}
          {todosQuery.isError && <ErrorNotice message={t('archive.error')} />}
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-1.5 py-1 sm:px-3 sm:py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[var(--theme-ink)]">
                  {todo.task}
                </div>
                <button
                  className="text-xs text-[var(--theme-primary)] underline"
                  type="button"
                  onClick={() => {
                    if (!window.confirm(t('archive.restoreConfirmTodo'))) {
                      return
                    }
                    restoreTodoMutation.mutate(todo.id)
                  }}
                  disabled={restoreTodoMutation.isPending}
                >
                  {t('archive.restore')}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-[var(--theme-muted)]">
                <span>{todo.blocker || t('todo.emptyValue')}</span>
                <Tooltip content={new Date(todo.updatedAt).toLocaleString()}>
                  {formatDistanceToNow(new Date(todo.updatedAt), { addSuffix: true })}
                </Tooltip>
              </div>
            </div>
          ))}
          {!todosQuery.isLoading && completedTodos.length === 0 && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.emptyTodos')}
            </div>
          )}
        </div>
      </div>

      <div className={uiTokens.card.surface}>
        <div className="text-sm font-semibold">{t('archive.hiddenThreads')}</div>
        <input
          className={`mt-1 ${uiTokens.input.base} ${uiTokens.input.paddingMd} sm:mt-2`}
          placeholder={t('archive.filterThreads')}
          value={threads.filter}
          onChange={(event) => threads.setFilter(event.target.value)}
        />
        {threads.isSearching && (
          <div className="mt-1 text-xs text-[var(--theme-muted)]">
            {t('archive.searching')}
          </div>
        )}
        <div className="mt-2 space-y-2 sm:mt-3">
          {threads.isLoading && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.loading')}
            </div>
          )}
          {threads.isError && <ErrorNotice message={t('archive.error')} />}
          {threads.filtered.map((thread) => (
            <div
              key={thread.id}
              className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-1.5 py-1 sm:px-3 sm:py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  className="text-sm font-semibold text-[var(--theme-primary)] hover:underline"
                  to={`/threads/${thread.id}`}
                >
                  {highlightMatches(thread.title, threads.debouncedFilter, { disableLinks: true })}
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-[var(--theme-primary)] underline"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t('archive.restoreConfirmThread'))) {
                        return
                      }
                      restoreThreadMutation.mutate(thread.id)
                    }}
                    disabled={restoreThreadMutation.isPending}
                  >
                    {t('archive.restore')}
                  </button>
                  <button
                    className="text-xs text-rose-600 underline"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t('archive.purgeConfirmThread'))) {
                        return
                      }
                      purgeThreadMutation.mutate(thread.id)
                    }}
                    disabled={purgeThreadMutation.isPending}
                  >
                    {t('archive.purge')}
                  </button>
                </div>
              </div>
              <div className="text-xs text-[var(--theme-muted)]">
                <Tooltip content={new Date(thread.lastActivityAt).toLocaleString()}>
                  <span className="opacity-50">
                    {t('archive.lastActivity', {
                      time: formatDistanceToNow(new Date(thread.lastActivityAt), {
                        addSuffix: true,
                      }),
                    })}
                  </span>
                </Tooltip>
              </div>
            </div>
          ))}
          {!threads.isLoading && threads.filtered.length === 0 && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.emptyThreads')}
            </div>
          )}
          {threads.hasNextPage && (
            <button
              className={uiTokens.button.secondarySm}
              type="button"
              onClick={() => {
                void threads.fetchNextPage()
              }}
              disabled={threads.isFetchingNextPage}
            >
              {threads.isFetchingNextPage ? t('common.loading') : t('archive.loadMore')}
            </button>
          )}
        </div>
      </div>

      <div className={uiTokens.card.surface}>
        <div className="text-sm font-semibold">{t('archive.hiddenEntries')}</div>
        <input
          className={`mt-1 ${uiTokens.input.base} ${uiTokens.input.paddingMd} sm:mt-2`}
          placeholder={t('archive.filterEntries')}
          value={entries.filter}
          onChange={(event) => entries.setFilter(event.target.value)}
        />
        {entries.isSearching && (
          <div className="mt-1 text-xs text-[var(--theme-muted)]">
            {t('archive.searching')}
          </div>
        )}
        <div className="mt-2 space-y-2 sm:mt-3">
          {entries.isLoading && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.loading')}
            </div>
          )}
          {entries.isError && <ErrorNotice message={t('archive.error')} />}
          {entries.filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-1.5 py-1 sm:px-3 sm:py-2"
            >
              <div className="text-sm text-[var(--theme-ink)]">
                {highlightMatches(entry.body, entries.debouncedFilter)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-[var(--theme-muted)]">
                <Tooltip content={new Date(entry.createdAt).toLocaleString()}>
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </Tooltip>
                <div className="flex items-center gap-2">
                  {entry.threadId && (
                    <Link className="text-xs text-[var(--theme-primary)] underline" to={`/threads/${entry.threadId}`}>
                      {t('archive.openThread')}
                    </Link>
                  )}
                  <button
                    className="text-xs text-[var(--theme-primary)] underline"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t('archive.restoreConfirmEntry'))) {
                        return
                      }
                      restoreEntryMutation.mutate(entry.id)
                    }}
                    disabled={restoreEntryMutation.isPending}
                  >
                    {t('archive.restore')}
                  </button>
                  <button
                    className="text-xs text-rose-600 underline"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t('archive.purgeConfirmEntry'))) {
                        return
                      }
                      purgeEntryMutation.mutate(entry.id)
                    }}
                    disabled={purgeEntryMutation.isPending}
                  >
                    {t('archive.purge')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!entries.isLoading && entries.filtered.length === 0 && (
            <div className="text-sm text-[var(--theme-muted)]">
              {t('archive.emptyEntries')}
            </div>
          )}
          {entries.hasNextPage && (
            <button
              className={uiTokens.button.secondarySm}
              type="button"
              onClick={() => {
                void entries.fetchNextPage()
              }}
              disabled={entries.isFetchingNextPage}
            >
              {entries.isFetchingNextPage ? t('common.loading') : t('archive.loadMore')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
