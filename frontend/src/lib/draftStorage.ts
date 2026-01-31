type VersionedDraft<T> = {
  v: number
  data: T
}

const safeParseJson = <T>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const readDraft = <T>(keys: Array<string | null>) => {
  if (typeof window === 'undefined') {
    return null
  }
  for (const key of keys) {
    if (!key) {
      continue
    }
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      continue
    }
    const parsed = safeParseJson<T>(raw)
    return parsed ?? null
  }
  return null
}

export const readVersionedDraft = <T>(
  keys: Array<string | null>,
  version: number,
): T | null => {
  if (typeof window === 'undefined') {
    return null
  }
  for (const key of keys) {
    if (!key) {
      continue
    }
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      continue
    }
    const parsed = safeParseJson<VersionedDraft<T> | T>(raw)
    if (!parsed) {
      return null
    }
    if (typeof parsed === 'object' && parsed && 'v' in parsed && 'data' in parsed) {
      const typed = parsed as VersionedDraft<T>
      if (typed.v !== version) {
        return null
      }
      return typed.data
    }
    return parsed as T
  }
  return null
}

export const writeDraft = <T>(key: string | null, data: T) => {
  if (typeof window === 'undefined' || !key) {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(data))
}

export const writeVersionedDraft = <T>(key: string | null, version: number, data: T) => {
  if (typeof window === 'undefined' || !key) {
    return
  }
  const payload: VersionedDraft<T> = { v: version, data }
  window.localStorage.setItem(key, JSON.stringify(payload))
}

export const removeDraft = (key: string | null) => {
  if (typeof window === 'undefined' || !key) {
    return
  }
  window.localStorage.removeItem(key)
}
