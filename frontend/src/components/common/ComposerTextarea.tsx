import { AutosizeTextarea } from './AutosizeTextarea'

type ComposerTextareaProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  minHeightClass: string
  inputRef?: (element: HTMLTextAreaElement | null) => void
}

const baseClass =
  'w-full resize-none overflow-y-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)] placeholder:opacity-60'

export function ComposerTextarea({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minHeightClass,
  inputRef,
}: ComposerTextareaProps) {
  return (
    <AutosizeTextarea
      className={`${minHeightClass} ${baseClass}`}
      placeholder={placeholder}
      ariaLabel={ariaLabel ?? placeholder ?? 'Input'}
      value={value}
      onChange={onChange}
      inputRef={inputRef}
    />
  )
}
