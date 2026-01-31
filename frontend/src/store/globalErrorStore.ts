import { create } from 'zustand'

type GlobalErrorEntry = {
  userMessage: string
  devMessage?: string
  source: string
  at: number
}

type GlobalErrorState = {
  message: string | null
  lastMessage: string | null
  lastAt: number
  autoDismissMs: number
  dedupeWindowMs: number
  maxMessageLength: number
  lastError: GlobalErrorEntry | null
  setError: (
    message: string,
    meta?: { devMessage?: string; source?: string }
  ) => void
  clearError: () => void
  setAutoDismissMs: (value: number) => void
  setDedupeWindowMs: (value: number) => void
  setMaxMessageLength: (value: number) => void
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  message: null,
  lastMessage: null,
  lastAt: 0,
  autoDismissMs: 4000,
  dedupeWindowMs: 2000,
  maxMessageLength: 160,
  lastError: null,
  setError: (message, meta) =>
    set((state) => {
      const now = Date.now()
      const limit = state.maxMessageLength
      const normalized =
        limit > 0 && message.length > limit
          ? `${message.slice(0, Math.max(0, limit - 1))}…`
          : message
      const isDuplicate =
        state.lastMessage === normalized && now - state.lastAt < state.dedupeWindowMs
      if (isDuplicate) {
        return state
      }
      return {
        message: normalized,
        lastMessage: normalized,
        lastAt: now,
        lastError: {
          userMessage: normalized,
          devMessage: meta?.devMessage,
          source: meta?.source ?? 'unknown',
          at: now,
        },
      }
    }),
  clearError: () => set({ message: null }),
  setAutoDismissMs: (value) => set({ autoDismissMs: value }),
  setDedupeWindowMs: (value) => set({ dedupeWindowMs: value }),
  setMaxMessageLength: (value) => set({ maxMessageLength: value }),
}))
