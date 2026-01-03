import type { FormEvent } from 'react'

type EntryEditorProps = {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  labels: {
    save: string
    cancel: string
  }
  handleTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void
  resizeTextarea: (element: HTMLTextAreaElement | null) => void
}

export function EntryEditor({
  value,
  onChange,
  onSave,
  onCancel,
  isSaving,
  labels,
  handleTextareaInput,
  resizeTextarea,
}: EntryEditorProps) {
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!value.trim()) {
          return
        }
        onSave()
      }}
    >
      <textarea
        className="min-h-[72px] w-full resize-none overflow-y-hidden rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInput={handleTextareaInput}
        data-autoresize="true"
        ref={(element) => resizeTextarea(element)}
      />
      <div className="flex items-center gap-2">
        <button
          className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
          type="submit"
          disabled={isSaving}
        >
          {labels.save}
        </button>
        <button
          className="rounded-md border border-gray-300 px-2 py-1 text-[10px] text-gray-700"
          type="button"
          onClick={onCancel}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
