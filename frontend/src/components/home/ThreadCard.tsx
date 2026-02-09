import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { EntryDetail } from '../../lib/api'
import { fetchThreadEntries } from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'
import { buildEntryOrder } from '../../lib/entryOrder'
import { buildEntryDepthMap } from '../../lib/entryDepth'
import { getThreadDisplay } from '../../lib/threadDisplay'
import { useEntryDragState } from '../../hooks/useEntryDragState'
import { useVisibility } from '../../hooks/useVisibility'
import { ThreadCardView } from './ThreadCardView'
import type { ThreadCardActions, ThreadCardData, ThreadCardUi } from './types'

export type ThreadCardProps = {
  data: ThreadCardData
  ui: ThreadCardUi
  actions: ThreadCardActions
}

export function ThreadCard({ data, ui, actions }: ThreadCardProps) {
  const { thread } = data
  const { ref: cardRef, isVisible } = useVisibility({ rootMargin: '200px 0px' })

  const entriesQuery = useQuery({
    queryKey: queryKeys.threads.entries(thread.id),
    queryFn: ({ signal }) => fetchThreadEntries(thread.id, { signal }),
    enabled: isVisible && thread.entryCount > 0,
    meta: { suppressGlobalError: true },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const visibleEntries = useMemo(() => {
    const entries: EntryDetail[] = entriesQuery.data ?? []
    return entries.filter((e) => !e.hidden && !e.isHidden)
  }, [entriesQuery.data])
  const orderedEntries = useMemo(() => buildEntryOrder(visibleEntries), [visibleEntries])
  const entryDepth = useMemo(() => buildEntryDepthMap(visibleEntries), [visibleEntries])

  const {
    dragState,
    dragError,
    handleDragStart,
    handleDragEnd,
    renderDropIndex,
    dropDepth,
    renderDropIndicator,
  } = useEntryDragState({
    orderedEntries,
    entryDepth,
    isMovePending: ui.isEntryMovePending,
    onMove: async ({ activeEntryId, overEntryId, overPosition }) => {
      const position =
        overPosition === 'before' ? 'BEFORE' : overPosition === 'after' ? 'AFTER' : 'CHILD'
      await actions.onEntryMoveTo(activeEntryId, overEntryId, position, thread.id)
    },
  })

  const display = getThreadDisplay(thread.body, thread.title)

  return (
    <ThreadCardView
      containerRef={cardRef}
      data={data}
      ui={ui}
      actions={actions}
      displayTitle={display.displayTitle}
      bodyText={display.bodyText}
      isMuted={display.isMuted}
      bodySpacingClass={display.bodySpacingClass}
      hasHtmlLineBreaks={display.hasHtmlLineBreaks}
      isMarkdown={thread.isMarkdown}
      orderedEntries={orderedEntries}
      entryDepth={entryDepth}
      entriesIsError={entriesQuery.isError}
      dragState={dragState}
      dragError={dragError}
      handleDragStart={handleDragStart}
      handleDragEnd={handleDragEnd}
      renderDropIndex={renderDropIndex}
      dropDepth={dropDepth}
      renderDropIndicator={renderDropIndicator}
    />
  )
}
