import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { MilkdownEditor } from '../common/MilkdownEditor'
import { uiTokens } from '../../lib/uiTokens'

type EntryEditorProps = {
  value: string
  onChange: (value: string) => void
  initialIsMarkdown: boolean
  onSave: (value: string, isMarkdown: boolean) => void
  onCancel: () => void
  onComplete: (value: string, isMarkdown: boolean) => void
  isSaving: boolean
  isCompletePending?: boolean
  labels: {
    save: string
    cancel: string
    complete: string
    markdown: string
  }
}

export function EntryEditor({
  value: initialValue,
  onChange,
  initialIsMarkdown,
  onSave,
  onCancel,
  onComplete,
  isSaving,
  isCompletePending,
  labels,
}: EntryEditorProps) {
  const { localValue, setLocalValue, reset } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSaving,
  })
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [editorSeed, setEditorSeed] = useState(0)
  const [isMarkdown, setIsMarkdown] = useState(initialIsMarkdown)

  useEffect(() => {
    setIsMarkdown(initialIsMarkdown)
  }, [initialIsMarkdown])

  useLayoutEffect(() => {
    const element = textareaRef.current
    if (!element) {
      return
    }
    const resize = () => {
      element.style.height = '0px'
      element.style.height = `${element.scrollHeight}px`
    }
    resize()
    const rafId = requestAnimationFrame(resize)
    return () => cancelAnimationFrame(rafId)
  }, [localValue, isMarkdown])

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        onSave(localValue, isMarkdown)
      }}
    >
      <div className="mt-1 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[11px] text-[var(--theme-muted)]">
          <input
            type="checkbox"
            checked={isMarkdown}
            onChange={(event) => setIsMarkdown(event.target.checked)}
          />
          {labels.markdown}
        </label>
      </div>
      {isMarkdown ? (
        <MilkdownEditor
          minHeightClass="min-h-[72px]"
          initialValue={localValue}
          valueForPlaceholder={localValue}
          onChange={setLocalValue}
          isDisabled={isSaving}
          resetKey={editorSeed}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className="min-h-[72px] w-full resize-none overflow-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)]"
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          disabled={isSaving}
        />
      )}
      <div className="flex items-center gap-2">
        <button
          className={uiTokens.button.primaryXs}
          type="submit"
          disabled={isSaving}
        >
          {labels.save}
        </button>
        <button
          className={uiTokens.button.secondaryXs}
          type="button"
          onClick={() => onComplete(localValue, isMarkdown)}
          disabled={isCompletePending || isSaving}
        >
          {labels.complete}
        </button>
        <button
          className={uiTokens.button.secondaryXs}
          type="button"
          onClick={() => {
            reset(initialValue)
            setEditorSeed((prev) => prev + 1)
            setIsMarkdown(initialIsMarkdown)
            onCancel()
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
