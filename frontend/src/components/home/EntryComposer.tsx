import { useCallback, useRef, useState } from 'react'
import { MilkdownEditor } from '../common/MilkdownEditor'
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
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const { localValue, setLocalValue, reset } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSubmitting,
  })
  const [editorSeed, setEditorSeed] = useState(0)

  const focusElement = useCallback(() => {
    const element = editorContainerRef.current?.querySelector<HTMLElement>('.editor')
    element?.focus()
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
        setEditorSeed((prev) => prev + 1)
      }}
    >
      <MilkdownEditor
        minHeightClass="min-h-[72px]"
        placeholder={placeholder}
        initialValue={localValue}
        valueForPlaceholder={localValue}
        onChange={setLocalValue}
        isDisabled={isSubmitting}
        resetKey={editorSeed}
        containerRef={(element) => {
          editorContainerRef.current = element
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
