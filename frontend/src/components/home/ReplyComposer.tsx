import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { AutosizeTextarea } from '../common/AutosizeTextarea'
import { uiTokens } from '../../lib/uiTokens'

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
  const [localValue, setLocalValue] = useState(initialValue)
  const debouncedValue = useDebouncedValue(localValue, 500)

  // Sync prop changes to local (in case of draft load)
  useEffect(() => {
    if (isSubmitting) {
      return
    }
    // Only update if significantly different to avoid cursor jumps on slow sync
    if (initialValue !== debouncedValue && initialValue !== localValue) {
      setLocalValue(initialValue)
    }
  }, [initialValue, isSubmitting])

  // Sync to parent (debounced) - only when stable
  useEffect(() => {
    if (debouncedValue === localValue && debouncedValue !== initialValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, initialValue, localValue])

  useEffect(() => {
    if (!focusId || focusId !== activeFocusId) {
      return
    }
    const element = textareaRef.current
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    onFocusHandled?.()
  }, [activeFocusId, focusId, onFocusHandled])

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
      <AutosizeTextarea
        className="min-h-[64px] w-full resize-none overflow-y-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)] placeholder:opacity-60"
        placeholder={placeholder}
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
            onCancel()
            setLocalValue('')
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
