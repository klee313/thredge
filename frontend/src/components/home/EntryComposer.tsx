import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { AutosizeTextarea } from '../common/AutosizeTextarea'
import { uiTokens } from '../../lib/uiTokens'

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
  const [localValue, setLocalValue] = useState(initialValue)
  const debouncedValue = useDebouncedValue(localValue, 500)

  // Sync prop changes to local (in case of draft load)
  useEffect(() => {
    if (isSubmitting) {
      return
    }
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
    if (!localValue.trim()) {
      const element = textareaRef.current
      element?.focus({ preventScroll: true })
      element?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      onFocusHandled?.()
    }
  }, [activeFocusId, focusId, onFocusHandled, localValue])

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        onSubmit(localValue)
        setLocalValue('') // Clear local on submit
      }}
    >
      <AutosizeTextarea
        className="min-h-[72px] w-full resize-none overflow-y-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)] placeholder:opacity-60"
        placeholder={placeholder}
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
