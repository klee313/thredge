const rawApiBase =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : ''

export const API_BASE_URL = rawApiBase

const rawGoogleOAuthEnabled =
  typeof import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'string'
    ? import.meta.env.VITE_GOOGLE_OAUTH_ENABLED.trim().toLowerCase()
    : ''

export const GOOGLE_OAUTH_ENABLED = rawGoogleOAuthEnabled === 'true'
