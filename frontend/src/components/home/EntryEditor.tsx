import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { ComposerTextarea } from '../common/ComposerTextarea'
import { uiTokens } from '../../lib/uiTokens'

type EntryEditorProps = {
  value: string
  onChange: (value: string) => void
  onSave: (value: string) => void
  onCancel: () => void
  onComplete: (value: string) => void
  isSaving: boolean
  isCompletePending?: boolean
  ariaLabel: string
  labels: {
    save: string
    cancel: string
    complete: string
  }
}

export function EntryEditor({
  value: initialValue,
  onChange,
  onSave,
  onCancel,
  onComplete,
  isSaving,
  isCompletePending,
  ariaLabel,
  labels,
}: EntryEditorProps) {
  const { localValue, setLocalValue, reset } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSaving,
  })

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        onSave(localValue)
      }}
    >
      <ComposerTextarea
        minHeightClass="min-h-[72px]"
        ariaLabel={ariaLabel}
        value={localValue}
        onChange={setLocalValue}
      />
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
          onClick={() => onComplete(localValue)}
          disabled={isCompletePending || isSaving}
        >
          {labels.complete}
        </button>
        <button
          className={uiTokens.button.secondaryXs}
          type="button"
          onClick={() => {
            reset(initialValue)
            onCancel()
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
