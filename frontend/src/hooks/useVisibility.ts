import { useEffect, useRef, useState } from 'react'

type UseVisibilityOptions = {
  rootMargin?: string
}

export const useVisibility = ({ rootMargin = '200px 0px' }: UseVisibilityOptions = {}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (isVisible) {
      return
    }
    const target = ref.current
    if (!target || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [isVisible, rootMargin])

  return { ref, isVisible }
}
