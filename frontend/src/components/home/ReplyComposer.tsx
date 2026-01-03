import type { FormEvent } from 'react'

type ReplyComposerProps = {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  labels: {
    submit: string
    cancel: string
  }
  handleTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void
  resizeTextarea: (element: HTMLTextAreaElement | null) => void
}

export function ReplyComposer({
  value,
  placeholder,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  labels,
  handleTextareaInput,
  resizeTextarea,
}: ReplyComposerProps) {
  return (
    <form
      className="mt-1 space-y-2 sm:mt-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!value.trim()) {
          return
        }
        onSubmit()
      }}
    >
      <textarea
        className="min-h-[64px] w-full resize-none overflow-y-hidden rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder={placeholder}
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
          disabled={isSubmitting}
        >
          {labels.submit}
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
