type ErrorNoticeProps = {
  message: string
  className?: string
}

export function ErrorNotice({ message, className = '' }: ErrorNoticeProps) {
  return (
    <div
      className={`rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${className}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
