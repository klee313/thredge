import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateFilter } from './DateFilter'
import { ThreadCardContainer } from './ThreadCardContainer'
import { uiTokens } from '../../lib/uiTokens'
import { UNCATEGORIZED_TOKEN } from '../../lib/api'
import { ErrorNotice } from '../common/ErrorNotice'
import type { useHomeFeedController } from '../../hooks/useHomeFeedController'

type HomeFeedThreadListProps = {
  controller: ReturnType<typeof useHomeFeedController>
}

export function HomeFeedThreadList({ controller }: HomeFeedThreadListProps) {
  const { t } = useTranslation()
  const {
    state,
    queries,
    actions,
    errors,
    normalizedSearchQuery,
  } = controller
  const {
    selectedCategories,
  } = state
  const {
    categoriesQuery,
    filteredThreads,
    activeThreadsQuery,
    selectedDate,
    selectedDateLabel,
    dateInputValue,
  } = queries
  const {
    setSelectedDate,
    parseDateInput,
    shiftDateByDays,
  } = actions
  const {
    threadError,
    threadEntryError,
    entryError,
    clearThreadError,
    clearThreadEntryError,
    clearEntryError,
  } = errors

  const categoryTitle = useMemo(() => {
    if (selectedCategories.length === 0) {
      return null
    }
    const labels = selectedCategories.map((name) =>
      name === UNCATEGORIZED_TOKEN ? t('home.uncategorized') : name,
    )
    if (labels.length === 1) {
      return t('home.threadsTitleForCategory', { category: labels[0] })
    }
    return t('home.threadsTitleForCategories', { count: labels.length })
  }, [selectedCategories, t])

  return (
    <>
      {(threadError || threadEntryError || entryError) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <div>{t('common.actionFailed')}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <button
              className="rounded-md border border-amber-300 px-2 py-0.5"
              type="button"
              onClick={() => {
                clearThreadError()
                clearThreadEntryError()
                clearEntryError()
              }}
            >
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      )}
      <div className={`${uiTokens.card.surface} pt-2 sm:pt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-0">
          <div className="text-sm font-semibold">
            {normalizedSearchQuery
              ? t('home.searchTitle', {
                  query: normalizedSearchQuery,
                  count: filteredThreads.length,
                })
              : categoryTitle
                ? categoryTitle
                : selectedDateLabel
                  ? t('home.threadsTitleForDate', { date: selectedDateLabel })
                  : t('home.threadsTitle')}
          </div>
          <DateFilter
            selectedDate={selectedDate}
            dateInputValue={dateInputValue}
            labels={{
              allDates: t('home.allDates'),
              prevDay: t('home.prevDay'),
              nextDay: t('home.nextDay'),
              dateInputLabel: t('home.dateInputLabel'),
            }}
            onClear={() => setSelectedDate(null)}
            onPrev={() => {
              const base = selectedDate ?? new Date()
              setSelectedDate(shiftDateByDays(base, -1))
            }}
            onNext={() => {
              const base = selectedDate ?? new Date()
              setSelectedDate(shiftDateByDays(base, 1))
            }}
            onInputChange={(value) => setSelectedDate(parseDateInput(value))}
          />
        </div>
        <div className="mt-6 space-y-20 sm:mt-8 sm:space-y-24">
          {activeThreadsQuery.isLoading && (
            <div className="text-sm text-[var(--theme-muted)]">{t('common.loading')}</div>
          )}
          {activeThreadsQuery.isError && <ErrorNotice message={t('home.error')} />}
          {filteredThreads.map((thread) => {
            return (
              <ThreadCardContainer
                key={thread.id}
                controller={controller}
                thread={thread}
                categories={categoriesQuery.data ?? []}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
