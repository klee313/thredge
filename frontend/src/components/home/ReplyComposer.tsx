import { useCallback, useRef } from 'react'
import { ComposerTextarea } from '../common/ComposerTextarea'
import { uiTokens } from '../../lib/uiTokens'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { useComposerFocus } from '../../hooks/useComposerFocus'

type ReplyComposerProps = {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onCancel: () => void
  isSubmitting: boolean
  labels: {
    submit: string
    cancel: string
  }
  focusId?: string
  activeFocusId?: string | null
  onFocusHandled?: () => void
}

export function ReplyComposer({
  value: initialValue,
  placeholder,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  labels,
  focusId,
  activeFocusId,
  onFocusHandled,
}: ReplyComposerProps) {
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
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [])

  useComposerFocus({
    focusId,
    activeFocusId,
    onFocusHandled,
    focusElement,
  })

  return (
    <form
      className="mt-1 space-y-2 sm:mt-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        onSubmit(localValue)
      }}
    >
      <ComposerTextarea
        minHeightClass="min-h-[64px]"
        placeholder={placeholder}
        ariaLabel={placeholder}
        value={localValue}
        onChange={setLocalValue}
        inputRef={(element) => {
          textareaRef.current = element
        }}
      />
      <div className="flex items-center gap-2">
        <button
          className={uiTokens.button.primaryXs}
          type="submit"
          disabled={isSubmitting}
        >
          {labels.submit}
        </button>
        <button
          className={uiTokens.button.secondaryXs}
          type="button"
          onClick={() => {
            // Clear local explicitly on cancel if needed, or just let parent handle it
            onChange('')
            onCancel()
            reset('')
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
