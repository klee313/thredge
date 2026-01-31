import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'

type UseEntryPressDragOptions = {
  entryId: string
  isEditing: boolean
  isEntryMovePending: boolean
  isDragActive: boolean
  onDragStart?: (entryId: string) => void
  onDragEnd?: () => void
}

export const useEntryPressDrag = ({
  entryId,
  isEditing,
  isEntryMovePending,
  isDragActive,
  onDragStart,
  onDragEnd,
}: UseEntryPressDragOptions) => {
  const pressTimerRef = useRef<number | null>(null)
  const pressStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const pointerTargetRef = useRef<HTMLDivElement | null>(null)
  const isLongPressActiveRef = useRef(false)

  const handleTouchMove = (e: TouchEvent) => {
    if (isLongPressActiveRef.current && e.cancelable) {
      e.preventDefault()
    }
  }

  const cleanupDrag = useCallback(() => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    const target = pointerTargetRef.current
    if (target) {
      target.removeEventListener('touchmove', handleTouchMove)
      const pointerId = pointerIdRef.current
      if (pointerId !== null) {
        try {
          target.releasePointerCapture(pointerId)
        } catch {
          // Ignore release failures.
        }
      }
    }
    pressStartRef.current = null
    pointerTargetRef.current = null
    pointerIdRef.current = null
    isLongPressActiveRef.current = false
  }, [])

  useEffect(() => () => cleanupDrag(), [cleanupDrag])

  const shouldIgnorePress = (eventTarget: EventTarget | null) => {
    let target = eventTarget as Node | null
    if (target?.nodeType === 3) {
      target = target.parentElement
    }
    if (!target || !(target instanceof HTMLElement)) {
      return false
    }
    return Boolean(
      target.closest('button, input, textarea, a') || target.closest('[data-no-drag]'),
    )
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.button !== 0 ||
      isEditing ||
      isEntryMovePending ||
      shouldIgnorePress(event.target)
    ) {
      return
    }
    pointerIdRef.current = event.pointerId
    pointerTargetRef.current = event.currentTarget
    pressStartRef.current = { x: event.clientX, y: event.clientY }
    isLongPressActiveRef.current = false

    event.currentTarget.addEventListener('touchmove', handleTouchMove, { passive: false })

    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current)
    }
    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null
      isLongPressActiveRef.current = true
      const target = pointerTargetRef.current
      const pointerId = pointerIdRef.current
      if (target && pointerId !== null) {
        try {
          target.setPointerCapture(pointerId)
        } catch {
          // Pointer capture can fail if the pointer is no longer active.
        }
      }
      onDragStart?.(entryId)
    }, 320)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pressStartRef.current) {
      return
    }
    const distance = Math.hypot(
      event.clientX - pressStartRef.current.x,
      event.clientY - pressStartRef.current.y,
    )
    if (distance > 6 && !isLongPressActiveRef.current) {
      cleanupDrag()
      if (isDragActive) {
        onDragEnd?.()
      }
    }
  }

  const handlePointerUp = () => {
    cleanupDrag()
    if (isDragActive) {
      onDragEnd?.()
    }
  }

  const handlePointerCancel = () => {
    cleanupDrag()
    if (isDragActive) {
      onDragEnd?.()
    }
  }

  const handlePointerLeave = () => {
    if (isDragActive) {
      return
    }
    cleanupDrag()
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerLeave,
  }
}
