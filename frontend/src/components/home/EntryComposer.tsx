import type { FormEvent } from 'react'
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
  onSubmit: () => void
  isSubmitting: boolean
  labels: EntryComposerLabels
  className?: string
  handleTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void
  resizeTextarea: (element: HTMLTextAreaElement | null) => void
}

export function EntryComposer({
  value,
  placeholder,
  onChange,
  onSubmit,
  isSubmitting,
  labels,
  className = 'mt-2 space-y-2 sm:mt-4',
  handleTextareaInput,
  resizeTextarea,
}: EntryComposerProps) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        if (!value.trim()) {
          return
        }
        onSubmit()
      }}
    >
      <AutosizeTextarea
        className="min-h-[72px] w-full resize-none overflow-y-hidden rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        handleTextareaInput={handleTextareaInput}
        resizeTextarea={resizeTextarea}
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
