import { useCallback, useRef, useState } from 'react'
import { MilkdownEditor } from '../common/MilkdownEditor'
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
      <MilkdownEditor
        minHeightClass="min-h-[64px]"
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
            setEditorSeed((prev) => prev + 1)
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
