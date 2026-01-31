import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EntryDragState } from '../components/home/types'

type DragPosition = 'before' | 'after' | 'child'

type UseEntryDragStateOptions = {
  orderedEntries: Array<{ id: string }>
  entryDepth: Map<string, number>
  isMovePending?: boolean
  maxDepth?: number
  onMove: (state: {
    activeEntryId: string
    overEntryId: string
    overPosition: DragPosition
  }) => Promise<void>
}

export const useEntryDragState = ({
  orderedEntries,
  entryDepth,
  isMovePending = false,
  maxDepth = 3,
  onMove,
}: UseEntryDragStateOptions) => {
  const [dragState, setDragState] = useState<EntryDragState>({
    activeEntryId: null,
    overEntryId: null,
    overPosition: null,
  })
  const [dragError, setDragError] = useState<string | null>(null)
  const dragStateRef = useRef(dragState)

  const setDragStateSafe = useCallback(
    (updater: EntryDragState | ((prev: EntryDragState) => EntryDragState)) =>
      setDragState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        dragStateRef.current = next
        return next
      }),
    [],
  )

  const resetDragState = useCallback(
    () => setDragStateSafe({ activeEntryId: null, overEntryId: null, overPosition: null }),
    [setDragStateSafe],
  )

  const finalizeDrag = useCallback(
    async (state: EntryDragState) => {
      const { activeEntryId, overEntryId, overPosition } = state
      if (!activeEntryId || !overEntryId || !overPosition) {
        return
      }
      try {
        await onMove({ activeEntryId, overEntryId, overPosition })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Reply move failed.'
        setDragError(message)
      }
    },
    [onMove],
  )

  const handleDragStart = useCallback(
    (entryId: string) => {
      if (isMovePending) {
        return
      }
      setDragError(null)
      setDragStateSafe({ activeEntryId: entryId, overEntryId: null, overPosition: null })
    },
    [isMovePending, setDragStateSafe],
  )

  const handleDragHover = useCallback(
    (entryId: string, position: DragPosition) => {
      if (!dragStateRef.current.activeEntryId) {
        return
      }
      if (dragStateRef.current.activeEntryId === entryId) {
        setDragStateSafe((prev) =>
          prev.overEntryId ? { ...prev, overEntryId: null, overPosition: null } : prev,
        )
        return
      }
      setDragStateSafe((prev) => {
        if (prev.overEntryId === entryId && prev.overPosition === position) {
          return prev
        }
        return { ...prev, overEntryId: entryId, overPosition: position }
      })
    },
    [setDragStateSafe],
  )

  const handleDragEnd = useCallback(() => {
    const finalState = dragStateRef.current
    resetDragState()
    void finalizeDrag(finalState)
  }, [finalizeDrag, resetDragState])

  useEffect(() => {
    if (!dragState.activeEntryId) {
      return
    }
    const shouldLockTouch =
      typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
    const previousTouchAction = document.body.style.touchAction
    const previousUserSelect = document.body.style.userSelect
    if (shouldLockTouch) {
      document.body.style.touchAction = 'none'
    }
    document.body.style.userSelect = 'none'
    let rafId: number | null = null
    let lastPointer: { x: number; y: number } | null = null
    const handleGlobalPointerUp = () => {
      handleDragEnd()
    }
    const processPointerMove = () => {
      rafId = null
      if (!lastPointer) {
        return
      }
      const target = document.elementFromPoint(lastPointer.x, lastPointer.y)
      if (!target) {
        return
      }
      const entryElement = target.closest('[data-entry-id]')
      if (!entryElement) {
        setDragStateSafe((prev) =>
          prev.overEntryId ? { ...prev, overEntryId: null, overPosition: null } : prev,
        )
        return
      }
      const entryId = entryElement.getAttribute('data-entry-id')
      if (!entryId) {
        return
      }
      const rect = entryElement.getBoundingClientRect()
      const depthAttr = entryElement.getAttribute('data-entry-depth')
      const depth = depthAttr ? Number(depthAttr) : 1
      const isChildZone = depth < maxDepth && lastPointer.y < rect.top + rect.height * 0.8
      const position = isChildZone
        ? 'child'
        : lastPointer.y < rect.top + rect.height / 2
          ? 'before'
          : 'after'
      handleDragHover(entryId, position)
    }
    const handleGlobalPointerMove = (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY }
      if (rafId !== null) {
        return
      }
      rafId = window.requestAnimationFrame(processPointerMove)
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointercancel', handleGlobalPointerUp)
    window.addEventListener('pointermove', handleGlobalPointerMove)
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointercancel', handleGlobalPointerUp)
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      if (shouldLockTouch) {
        document.body.style.touchAction = previousTouchAction
      }
      document.body.style.userSelect = previousUserSelect
    }
  }, [dragState.activeEntryId, handleDragEnd, handleDragHover, maxDepth, setDragStateSafe])

  const renderDropIndex = useMemo(() => {
    const { activeEntryId, overEntryId, overPosition } = dragState
    if (!activeEntryId || !overEntryId || !overPosition) {
      return null
    }
    if (activeEntryId === overEntryId) {
      return null
    }
    const overIndex = orderedEntries.findIndex((entry) => entry.id === overEntryId)
    if (overIndex === -1) {
      return null
    }
    if (overPosition === 'child') {
      return overIndex + 1
    }
    return overPosition === 'before' ? overIndex : overIndex + 1
  }, [dragState, orderedEntries])

  const dropDepth = useMemo(() => {
    if (!dragState.overEntryId || dragState.overEntryId === dragState.activeEntryId) {
      return 1
    }
    const baseDepth = entryDepth.get(dragState.overEntryId) ?? 1
    return baseDepth + (dragState.overPosition === 'child' ? 1 : 0)
  }, [dragState.activeEntryId, dragState.overEntryId, dragState.overPosition, entryDepth])

  const renderDropIndicator = useCallback((depth: number, key: string) => {
    const indentPx = depth === 2 ? 24 : depth >= 3 ? 48 : 0
    return (
      <div key={key} className="pointer-events-none px-1">
        <div className="relative h-1">
          <div
            className="absolute h-1 rounded-full bg-[var(--theme-ink)]"
            style={{
              left: indentPx,
              right: 0,
            }}
          />
        </div>
      </div>
    )
  }, [])

  return {
    dragState,
    dragError,
    setDragError,
    handleDragStart,
    handleDragEnd,
    renderDropIndex,
    dropDepth,
    renderDropIndicator,
  }
}
