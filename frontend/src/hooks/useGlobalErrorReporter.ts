import { useEffect } from 'react'
import { useGlobalErrorStore } from '../store/globalErrorStore'

const shouldReportSource = (source: string, allowlist?: string[]) => {
  if (!allowlist || allowlist.length === 0) {
    return true
  }
  return allowlist.includes(source)
}

type GlobalErrorReporter = (entry: {
  userMessage: string
  devMessage?: string
  source: string
  at: number
}) => void

type GlobalErrorReporterOptions = {
  sources?: string[]
}

export const useGlobalErrorReporter = (
  reporter: GlobalErrorReporter,
  options: GlobalErrorReporterOptions = {},
) => {
  const lastError = useGlobalErrorStore((state) => state.lastError)

  useEffect(() => {
    if (!lastError) {
      return
    }
    if (!shouldReportSource(lastError.source, options.sources)) {
      return
    }
    reporter(lastError)
  }, [lastError, options.sources, reporter])
}
