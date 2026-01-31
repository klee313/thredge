import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '../lib/useDebouncedValue'

type DebouncedTextInputOptions = {
  value: string
  onChange: (value: string) => void
  delayMs?: number
  isLocked?: boolean
}

export const useDebouncedTextInput = ({
  value,
  onChange,
  delayMs = 500,
  isLocked = false,
}: DebouncedTextInputOptions) => {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebouncedValue(localValue, delayMs)
  const lastExternalValueRef = useRef(value)

  useEffect(() => {
    if (isLocked) {
      return
    }
    if (value !== lastExternalValueRef.current) {
      lastExternalValueRef.current = value
      if (value !== localValue) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(value)
      }
    }
  }, [isLocked, localValue, value])

  useEffect(() => {
    if (debouncedValue === localValue && debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, localValue, onChange, value])

  const reset = useCallback((nextValue: string = '') => {
    setLocalValue(nextValue)
    onChange(nextValue)
  }, [onChange])

  return {
    localValue,
    setLocalValue,
    reset,
  }
}
