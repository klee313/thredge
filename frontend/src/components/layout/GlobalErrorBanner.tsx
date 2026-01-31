type GlobalErrorBannerProps = {
  message: string
  dismissLabel: string
  onDismiss: () => void
}

export function GlobalErrorBanner({
  message,
  dismissLabel,
  onDismiss,
}: GlobalErrorBannerProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="flex w-full items-center justify-between gap-3 px-2 py-2 text-xs sm:mx-auto sm:max-w-3xl sm:px-4">
        <div role="status" aria-live="polite">
          {message}
        </div>
        <button
          className="rounded-md border border-amber-200 px-2 py-1 text-[10px] font-semibold"
          type="button"
          onClick={onDismiss}
        >
          {dismissLabel}
        </button>
      </div>
    </div>
  )
}
