import { useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatDateInput, parseDateInput } from '../lib/date'

export const useDateFilter = (locale: string) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const formatDateLabel = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)

  const selectedDate = useMemo(() => {
    const dateStr = searchParams.get('date')
    return dateStr ? parseDateInput(dateStr) : null
  }, [searchParams])

  useEffect(() => {
    const dateStr = searchParams.get('date')
    if (!dateStr) {
      return
    }
    if (parseDateInput(dateStr)) {
      return
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('date')
      return next
    }, { replace: true })
  }, [parseDateInput, searchParams, setSearchParams])

  const setSelectedDate = useCallback((date: Date | null) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      if (date) {
        newParams.set('date', formatDateInput(date))
      } else {
        newParams.delete('date')
      }
      return newParams
    }, { replace: true })
  }, [setSearchParams])

  const shiftDateByDays = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)

  const isSameCalendarDate = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()

  const selectedDateLabel = selectedDate ? formatDateLabel(selectedDate) : null

  const dateInputValue = selectedDate ? formatDateInput(selectedDate) : ''

  return {
    selectedDate,
    setSelectedDate,
    selectedDateLabel,
    dateInputValue,
    parseDateInput,
    shiftDateByDays,
    isSameCalendarDate,
  }
}
