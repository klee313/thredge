import { useCallback, useEffect, useRef } from 'react'
import { readVersionedDraft, removeDraft, writeVersionedDraft } from '../lib/draftStorage'

export type DraftPersistenceOptions<T, O = void> = {
  storageKey: string | null
  legacyKeys?: Array<string | null>
  version: number
  debounceMs?: number
  buildPayload: (overrides?: O) => T | null
  hasDrafts: (payload: T) => boolean
  onRestore: (payload: T | null) => void
}

export const useDraftPersistence = <T, O = void>({
  storageKey,
  legacyKeys = [],
  version,
  debounceMs = 800,
  buildPayload,
  hasDrafts,
  onRestore,
}: DraftPersistenceOptions<T, O>) => {
  const restoredKeyRef = useRef<string | null>(null)
  const lastSavedRef = useRef<string | null>(null)

  const persistDraftsNow = useCallback(
    (overrides?: O) => {
      const payload = buildPayload(overrides)
      if (!payload || typeof window === 'undefined' || !storageKey) {
        return
      }
      if (!hasDrafts(payload)) {
        removeDraft(storageKey)
        lastSavedRef.current = null
        return
      }
      const serialized = JSON.stringify({ v: version, data: payload })
      if (serialized === lastSavedRef.current) {
        return
      }
      lastSavedRef.current = serialized
      writeVersionedDraft(storageKey, version, payload)
    },
    [buildPayload, hasDrafts, storageKey, version],
  )

  useEffect(() => {
    if (!storageKey) {
      return
    }
    if (restoredKeyRef.current === storageKey) {
      return
    }
    restoredKeyRef.current = storageKey
    const stored = readVersionedDraft<T>([storageKey, ...legacyKeys], version)
    onRestore(stored)
  }, [legacyKeys, onRestore, storageKey, version])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) {
      return
    }
    const timer = window.setTimeout(() => {
      persistDraftsNow()
    }, debounceMs)
    return () => window.clearTimeout(timer)
  }, [debounceMs, persistDraftsNow, storageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) {
      return
    }
    const handleBeforeUnload = () => {
      persistDraftsNow()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [persistDraftsNow, storageKey])

  return { persistDraftsNow }
}
