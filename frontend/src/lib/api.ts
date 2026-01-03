import { API_BASE_URL } from './env'

export type BackendHealth = { status: string }
export type AuthUser = { username: string }
export type ThreadSummary = {
  id: string
  title: string
  lastActivityAt: string
  categories: CategorySummary[]
  pinned: boolean
}
export type EntryDetail = {
  id: string
  body: string
  parentEntryId: string | null
  createdAt: string
  threadId?: string | null
}
export type CategorySummary = {
  id: string
  name: string
}
export type ThreadDetail = {
  id: string
  title: string
  body: string | null
  createdAt: string
  lastActivityAt: string
  categories: CategorySummary[]
  pinned: boolean
  entries: EntryDetail[]
}

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  errorLabel: string,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  })
  if (!response.ok) {
    throw new Error(`${errorLabel}: ${response.status}`)
  }
  return (await response.json()) as T
}

const requestEmpty = async (path: string, init: RequestInit, errorLabel: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  })
  if (!response.ok) {
    throw new Error(`${errorLabel}: ${response.status}`)
  }
}

export async function fetchBackendHealth(): Promise<BackendHealth> {
  return requestJson('/api/health', {}, 'Backend health failed')
}

export async function fetchMe(): Promise<AuthUser> {
  return requestJson('/api/auth/me', {}, 'Auth check failed')
}

export async function login(username: string, password: string): Promise<AuthUser> {
  return requestJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }, 'Login failed')
}

export async function logout(): Promise<void> {
  return requestEmpty('/api/auth/logout', {
    method: 'POST',
  }, 'Logout failed')
}

export async function fetchThreads(): Promise<ThreadSummary[]> {
  return requestJson('/api/threads', {}, 'Threads fetch failed')
}

export async function createThread(
  body?: string | null,
  categoryNames: string[] = [],
): Promise<ThreadSummary> {
  return requestJson('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, categoryNames }),
  }, 'Thread create failed')
}

export async function fetchThread(id: string): Promise<ThreadDetail> {
  return requestJson(`/api/threads/${id}?includeHidden=true`, {}, 'Thread fetch failed')
}

export async function addEntry(
  threadId: string,
  body: string,
  parentEntryId?: string,
): Promise<EntryDetail> {
  return requestJson(`/api/threads/${threadId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, parentEntryId }),
  }, 'Entry create failed')
}

export async function fetchThreadFeed(): Promise<ThreadDetail[]> {
  return requestJson('/api/threads/feed', {}, 'Thread feed fetch failed')
}

export async function searchThreads(query: string): Promise<ThreadDetail[]> {
  return requestJson(
    `/api/threads/search?query=${encodeURIComponent(query)}`,
    {},
    'Thread search failed',
  )
}

export async function updateThread(
  id: string,
  body: string | null,
  categoryNames: string[],
): Promise<ThreadSummary> {
  return requestJson(`/api/threads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, categoryNames }),
  }, 'Thread update failed')
}

export async function hideThread(id: string): Promise<void> {
  return requestEmpty(`/api/threads/${id}`, {
    method: 'DELETE',
  }, 'Thread hide failed')
}

export async function updateEntry(id: string, body: string): Promise<EntryDetail> {
  return requestJson(`/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  }, 'Entry update failed')
}

export async function hideEntry(id: string): Promise<void> {
  return requestEmpty(`/api/entries/${id}`, {
    method: 'DELETE',
  }, 'Entry hide failed')
}

export async function restoreEntry(id: string): Promise<EntryDetail> {
  return requestJson(`/api/entries/${id}/restore`, {
    method: 'PATCH',
  }, 'Entry restore failed')
}

export async function fetchHiddenEntries(): Promise<EntryDetail[]> {
  return requestJson('/api/entries/hidden', {}, 'Hidden entries fetch failed')
}

export async function searchHiddenEntries(query: string): Promise<EntryDetail[]> {
  return requestJson(
    `/api/entries/hidden/search?query=${encodeURIComponent(query)}`,
    {},
    'Hidden entries search failed',
  )
}

export async function fetchHiddenThreads(): Promise<ThreadSummary[]> {
  return requestJson('/api/threads/hidden', {}, 'Hidden threads fetch failed')
}

export async function searchHiddenThreads(query: string): Promise<ThreadSummary[]> {
  return requestJson(
    `/api/threads/hidden/search?query=${encodeURIComponent(query)}`,
    {},
    'Hidden threads search failed',
  )
}

export async function restoreThread(id: string): Promise<ThreadSummary> {
  return requestJson(`/api/threads/${id}/restore`, {
    method: 'POST',
  }, 'Thread restore failed')
}

export async function pinThread(id: string): Promise<ThreadSummary> {
  return requestJson(`/api/threads/${id}/pin`, {
    method: 'POST',
  }, 'Thread pin failed')
}

export async function unpinThread(id: string): Promise<ThreadSummary> {
  return requestJson(`/api/threads/${id}/unpin`, {
    method: 'POST',
  }, 'Thread unpin failed')
}

export async function fetchCategories(): Promise<CategorySummary[]> {
  return requestJson('/api/categories', {}, 'Categories fetch failed')
}

export async function createCategory(name: string): Promise<CategorySummary> {
  return requestJson('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }, 'Category create failed')
}

export async function updateCategory(id: string, name: string): Promise<CategorySummary> {
  return requestJson(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }, 'Category update failed')
}

export async function deleteCategory(id: string): Promise<void> {
  return requestEmpty(`/api/categories/${id}`, {
    method: 'DELETE',
  }, 'Category delete failed')
}
