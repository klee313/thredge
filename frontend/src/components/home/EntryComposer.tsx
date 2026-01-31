import { useCallback, useRef } from 'react'
import { ComposerTextarea } from '../common/ComposerTextarea'
import { uiTokens } from '../../lib/uiTokens'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { useComposerFocus } from '../../hooks/useComposerFocus'

type EntryComposerLabels = {
  submit: string
  submitting?: string
}

type EntryComposerProps = {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isSubmitting: boolean
  labels: EntryComposerLabels
  className?: string
  focusId?: string
  activeFocusId?: string | null
  onFocusHandled?: () => void
}

export function EntryComposer({
  value: initialValue,
  placeholder,
  onChange,
  onSubmit,
  isSubmitting,
  labels,
  className = 'mt-2 space-y-2 sm:mt-4',
  focusId,
  activeFocusId,
  onFocusHandled,
}: EntryComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { localValue, setLocalValue, reset } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSubmitting,
  })

  const focusElement = useCallback(() => {
    const element = textareaRef.current
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: 'center', inline: 'nearest' })
  }, [])

  useComposerFocus({
    focusId,
    activeFocusId,
    onFocusHandled,
    shouldFocus: !isSubmitting && !localValue.trim(),
    focusElement,
  })

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        onSubmit(localValue)
        reset('')
      }}
    >
      <ComposerTextarea
        minHeightClass="min-h-[72px]"
        placeholder={placeholder}
        ariaLabel={placeholder}
        value={localValue}
        onChange={setLocalValue}
        inputRef={(element) => {
          textareaRef.current = element
        }}
      />
      <button
        className={uiTokens.button.primaryMd}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? labels.submitting ?? labels.submit : labels.submit}
      </button>
    </form>
  )
}
