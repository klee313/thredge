import { API_BASE_URL } from './env'

export class ApiError extends Error {
  status: number
  label: string
  detail?: string

  constructor(label: string, status: number, detail?: string) {
    super(label)
    this.name = 'ApiError'
    this.status = status
    this.label = label
    this.detail = detail
  }
}

export type BackendHealth = { status: string }
export type AuthUser = { username: string; name: string; role: 'USER' | 'ADMIN' }
export type AdminUser = {
  id: string
  username: string
  name: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}
export type SignupPolicy = { enabled: boolean }
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
  orderIndex: number
  createdAt: string
  threadId?: string | null
  hidden?: boolean
  isHidden?: boolean
}
export type EntryMoveDirection = 'UP' | 'DOWN'
export type EntryMovePosition = 'BEFORE' | 'AFTER' | 'CHILD'
export type CategorySummary = {
  id: string
  name: string
}
export type CategoryCountSummary = {
  id: string
  count: number
}
export type CategoryCountsResponse = {
  counts: CategoryCountSummary[]
  uncategorizedCount: number
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
export type ThreadFeedItem = {
  id: string
  title: string
  body: string | null
  createdAt: string
  lastActivityAt: string
  categories: CategorySummary[]
  pinned: boolean
  entryCount: number
}
export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  hasNext: boolean
}

export const UNCATEGORIZED_TOKEN = '__uncategorized__'

export const THREAD_PAGE_SIZE = 20
export const ENTRY_PAGE_SIZE = 50

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return `${base}${path.replace(/^\/api/, '')}`
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

type RequestOptions = {
  signal?: AbortSignal
}

const buildPathWithParams = (
  path: string,
  params: Record<string, string | string[] | null | undefined>,
) => {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          searchParams.append(key, item)
        }
      })
      continue
    }
    searchParams.set(key, value)
  }
  const query = searchParams.toString()
  if (!query) {
    return path
  }
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${query}`
}

const extractErrorMessage = async (response: Response) => {
  let message = `${response.status}`
  try {
    const text = await response.text()
    if (!text) {
      return message
    }
    try {
      const data = JSON.parse(text) as { message?: string }
      if (data?.message) {
        return data.message
      }
    } catch {
      // Non-JSON body, use as-is.
    }
    message = text
  } catch {
    return message
  }
  return message
}

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  errorLabel: string,
  options?: { allowNonJson?: boolean },
): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...init,
  })
  if (!response.ok) {
    const message = await extractErrorMessage(response)
    throw new ApiError(errorLabel, response.status, message)
  }
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T
  }
  if (options?.allowNonJson) {
    const trimmed = text.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(text) as T
      } catch {
        return text as unknown as T
      }
    }
    if (import.meta.env?.DEV) {
      console.warn('[api] Non-JSON response received', {
        path,
        contentType,
      })
    }
    return text as unknown as T
  }
  throw new ApiError(
    errorLabel,
    response.status,
    `Expected JSON response but received ${contentType || 'unknown content-type'}`,
  )
}

const requestEmpty = async (path: string, init: RequestInit, errorLabel: string): Promise<void> => {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...init,
  })
  if (!response.ok) {
    const message = await extractErrorMessage(response)
    throw new ApiError(errorLabel, response.status, message)
  }
}

const buildPagedPath = (path: string, page: number, size: number) => {
  return buildPathWithParams(path, { page: String(page), size: String(size) })
}

export async function fetchBackendHealth(options?: RequestOptions): Promise<BackendHealth> {
  return requestJson('/api/health', { signal: options?.signal }, 'Backend health failed')
}

export async function fetchMe(options?: RequestOptions): Promise<AuthUser | null> {
  try {
    return await requestJson('/api/auth/me', { signal: options?.signal }, 'Auth check failed')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export async function login(username: string, password: string): Promise<AuthUser> {
  return requestJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }, 'Login failed')
}

export async function signup(username: string, password: string): Promise<AuthUser> {
  return requestJson('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }, 'Signup failed')
}

export async function fetchAdminUsers(options?: RequestOptions): Promise<AdminUser[]> {
  return requestJson('/api/admin/users', { signal: options?.signal }, 'Admin users fetch failed')
}

export async function deleteAdminUser(id: string): Promise<void> {
  return requestEmpty(`/api/admin/users/${id}`, {
    method: 'DELETE',
  }, 'Admin user delete failed')
}

export async function fetchSignupPolicy(options?: RequestOptions): Promise<SignupPolicy> {
  return requestJson(
    '/api/admin/signup-policy',
    { signal: options?.signal },
    'Signup policy fetch failed',
  )
}

export async function updateSignupPolicy(enabled: boolean): Promise<SignupPolicy> {
  return requestJson('/api/admin/signup-policy', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  }, 'Signup policy update failed')
}

export async function logout(): Promise<void> {
  return requestEmpty('/api/auth/logout', {
    method: 'POST',
  }, 'Logout failed')
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return requestEmpty('/api/auth/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  }, 'Password change failed')
}

export async function updateDisplayName(name: string): Promise<AuthUser> {
  return requestJson('/api/auth/name', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }, 'Display name update failed')
}

export async function fetchThreadsPage(
  page: number,
  size: number = THREAD_PAGE_SIZE,
  options?: RequestOptions,
): Promise<PageResponse<ThreadSummary>> {
  return requestJson(
    buildPagedPath('/api/threads', page, size),
    { signal: options?.signal },
    'Threads fetch failed',
  )
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

export async function fetchThread(
  id: string,
  options?: RequestOptions & { includeHidden?: boolean },
): Promise<ThreadDetail> {
  const includeHidden = options?.includeHidden ?? true
  return requestJson(
    `/api/threads/${id}?includeHidden=${includeHidden}`,
    { signal: options?.signal },
    'Thread fetch failed',
  )
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

export type FeedFilterOptions = {
  date?: string // YYYY-MM-DD format
  categoryIds?: string[]
}

export async function fetchThreadFeedPage(
  page: number,
  size: number = THREAD_PAGE_SIZE,
  filters?: FeedFilterOptions,
  options?: RequestOptions,
): Promise<PageResponse<ThreadFeedItem>> {
  const path = buildPathWithParams(
    buildPagedPath('/api/threads/feed', page, size),
    {
      date: filters?.date ?? null,
      categoryIds: filters?.categoryIds ?? null,
    },
  )
  return requestJson(path, { signal: options?.signal }, 'Thread feed fetch failed')
}

export async function fetchThreadEntries(
  threadId: string,
  options?: RequestOptions,
): Promise<EntryDetail[]> {
  return requestJson(
    `/api/threads/${threadId}/entries`,
    { signal: options?.signal },
    'Thread entries fetch failed',
  )
}

export async function searchThreadsPage(
  query: string,
  page: number,
  size: number = THREAD_PAGE_SIZE,
  categoryIds?: string[],
  date?: string,
  options?: RequestOptions,
): Promise<PageResponse<ThreadFeedItem>> {
  const path = buildPathWithParams(
    buildPagedPath('/api/threads/search', page, size),
    {
      query,
      date: date ?? null,
      categoryIds: categoryIds ?? null,
    },
  )
  return requestJson(path, { signal: options?.signal }, 'Thread search failed')
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

export async function moveEntry(
  id: string,
  direction: EntryMoveDirection,
): Promise<EntryDetail> {
  return requestJson(`/api/entries/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction }),
  }, 'Entry move failed')
}

export async function moveEntryTo(
  id: string,
  targetEntryId: string,
  position: EntryMovePosition,
): Promise<EntryDetail> {
  return requestJson(`/api/entries/${id}/move-to`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEntryId, position }),
  }, 'Entry move failed')
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

export async function fetchHiddenEntriesPage(
  page: number,
  size: number = ENTRY_PAGE_SIZE,
  options?: RequestOptions,
): Promise<PageResponse<EntryDetail>> {
  return requestJson(
    buildPagedPath('/api/entries/hidden', page, size),
    { signal: options?.signal },
    'Hidden entries fetch failed',
  )
}

export async function searchHiddenEntriesPage(
  query: string,
  page: number,
  size: number = ENTRY_PAGE_SIZE,
  options?: RequestOptions,
): Promise<PageResponse<EntryDetail>> {
  const path = buildPathWithParams(
    buildPagedPath('/api/entries/hidden/search', page, size),
    { query },
  )
  return requestJson(path, { signal: options?.signal }, 'Hidden entries search failed')
}

export async function fetchHiddenThreadsPage(
  page: number,
  size: number = THREAD_PAGE_SIZE,
  options?: RequestOptions,
): Promise<PageResponse<ThreadSummary>> {
  return requestJson(
    buildPagedPath('/api/threads/hidden', page, size),
    { signal: options?.signal },
    'Hidden threads fetch failed',
  )
}

export async function searchHiddenThreadsPage(
  query: string,
  page: number,
  size: number = THREAD_PAGE_SIZE,
  categoryIds?: string[],
  options?: RequestOptions,
): Promise<PageResponse<ThreadSummary>> {
  const path = buildPathWithParams(
    buildPagedPath('/api/threads/hidden/search', page, size),
    {
      query,
      categoryIds: categoryIds ?? null,
    },
  )
  return requestJson(path, { signal: options?.signal }, 'Hidden threads search failed')
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

export async function fetchCategories(options?: RequestOptions): Promise<CategorySummary[]> {
  return requestJson('/api/categories', { signal: options?.signal }, 'Categories fetch failed')
}

export async function fetchCategoryCounts(options?: RequestOptions): Promise<CategoryCountsResponse> {
  return requestJson(
    '/api/categories/counts',
    { signal: options?.signal },
    'Category counts fetch failed',
  )
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
