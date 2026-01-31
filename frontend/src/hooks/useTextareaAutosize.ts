import { useCallback, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

type Options = {
  maxHeight?: number
}

export const useTextareaAutosize = (options: Options = {}) => {
  const { maxHeight = 800 } = options
  const rafRef = useRef<number | null>(null)
  const resizeTextarea = useCallback(
    (element: HTMLTextAreaElement | null) => {
      if (!element) {
        return
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = window.requestAnimationFrame(() => {
        element.style.height = 'auto'
        const nextHeight = Math.min(element.scrollHeight, maxHeight)
        const nextHeightValue = `${nextHeight}px`
        if (element.style.height !== nextHeightValue) {
          element.style.height = nextHeightValue
        }
        element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
      })
    },
    [maxHeight],
  )

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const handleTextareaInput = useCallback(
    (event: FormEvent<HTMLTextAreaElement>) => {
      resizeTextarea(event.currentTarget)
    },
    [resizeTextarea],
  )

  return { handleTextareaInput, resizeTextarea }
}
