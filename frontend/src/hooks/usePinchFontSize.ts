import { useEffect, useRef } from 'react'

const MIN_FONT_SIZE_PERCENT = 80
const MAX_FONT_SIZE_PERCENT = 150
const DEFAULT_FONT_SIZE_PERCENT = 100
const FONT_SIZE_STORAGE_KEY = 'thredge-font-size'
const LEGACY_FONT_SIZE_STORAGE_KEY = 'app-font-size'

export function usePinchFontSize(enabled: boolean) {
  const initialDistanceRef = useRef<number | null>(null)
  const initialFontSizeRef = useRef<number>(DEFAULT_FONT_SIZE_PERCENT)

  const updateFontSize = (sizePercent: number) => {
    document.documentElement.style.fontSize = `${sizePercent}%`
  }
  const shouldUseNativeZoom = () => {
    if (typeof window === 'undefined') {
      return false
    }
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isMdUp = window.matchMedia('(min-width: 768px)').matches
    return isTouchDevice && isMdUp
  }
  const safeStorage = {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value)
      } catch {
        // Ignore storage failures.
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore storage failures.
      }
    },
  }

  useEffect(() => {
    if (!enabled) {
      updateFontSize(DEFAULT_FONT_SIZE_PERCENT)
      safeStorage.removeItem(FONT_SIZE_STORAGE_KEY)
      safeStorage.removeItem(LEGACY_FONT_SIZE_STORAGE_KEY)
      return
    }
    if (shouldUseNativeZoom()) {
      updateFontSize(DEFAULT_FONT_SIZE_PERCENT)
      safeStorage.removeItem(FONT_SIZE_STORAGE_KEY)
      safeStorage.removeItem(LEGACY_FONT_SIZE_STORAGE_KEY)
      return
    }

    // Load saved font size from local storage
    const savedFontSize =
      safeStorage.getItem(FONT_SIZE_STORAGE_KEY) ??
      safeStorage.getItem(LEGACY_FONT_SIZE_STORAGE_KEY)
    if (savedFontSize) {
      const parsed = parseFloat(savedFontSize)
      if (!isNaN(parsed)) {
        updateFontSize(parsed)
      }
    } else {
      updateFontSize(DEFAULT_FONT_SIZE_PERCENT)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (shouldUseNativeZoom()) {
        return
      }
      if (e.touches.length === 2) {
        // Calculate initial distance between two fingers
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const dist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        )
        initialDistanceRef.current = dist

        // Get current font size percentage
        const currentFontSizeStr = document.documentElement.style.fontSize
        let currentPercent = DEFAULT_FONT_SIZE_PERCENT
        if (currentFontSizeStr.endsWith('%')) {
          currentPercent = parseFloat(currentFontSizeStr)
        }
        initialFontSizeRef.current = currentPercent
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (shouldUseNativeZoom()) {
        return
      }
      if (e.touches.length === 2 && initialDistanceRef.current !== null) {
        e.preventDefault() // Prevent native page zoom

        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        )

        const scale = currentDist / initialDistanceRef.current
        let newFontSize = initialFontSizeRef.current * scale

        // Clamp values
        if (newFontSize < MIN_FONT_SIZE_PERCENT) newFontSize = MIN_FONT_SIZE_PERCENT
        if (newFontSize > MAX_FONT_SIZE_PERCENT) newFontSize = MAX_FONT_SIZE_PERCENT

        updateFontSize(newFontSize)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (shouldUseNativeZoom()) {
        return
      }
      if (e.touches.length < 2) {
        initialDistanceRef.current = null
        // Save current font size
        const currentFontSize = document.documentElement.style.fontSize
        if (currentFontSize) {
          safeStorage.setItem(
            FONT_SIZE_STORAGE_KEY,
            parseFloat(currentFontSize).toString(),
          )
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [enabled])
}
