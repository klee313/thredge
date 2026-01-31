import { useEffect } from 'react'

type UseComposerFocusOptions = {
  focusId?: string
  activeFocusId?: string | null
  onFocusHandled?: () => void
  shouldFocus?: boolean
  focusElement: () => void
}

export const useComposerFocus = ({
  focusId,
  activeFocusId,
  onFocusHandled,
  shouldFocus = true,
  focusElement,
}: UseComposerFocusOptions) => {
  useEffect(() => {
    if (!shouldFocus || !focusId || focusId !== activeFocusId) {
      return
    }
    focusElement()
    onFocusHandled?.()
  }, [activeFocusId, focusElement, focusId, onFocusHandled, shouldFocus])
}
