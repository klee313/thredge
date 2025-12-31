import { API_BASE_URL } from './env'

export type BackendHealth = { status: string }

export async function fetchBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Backend health failed: ${response.status}`)
  }
  return (await response.json()) as BackendHealth
}

