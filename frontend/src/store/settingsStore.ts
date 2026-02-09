import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SupportedLanguage } from '../lib/languages'

export type SettingsState = {
  uiLanguage: SupportedLanguage
  themePreset: string
  themeCustomColor: string
  pinchZoomEnabled: boolean
  showTodoPanel: boolean
  profileImageUrl: string | null
  setAll: (next: Omit<SettingsState, 'setAll' | 'setPartial'>) => void
  setPartial: (next: Partial<Omit<SettingsState, 'setAll' | 'setPartial'>>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      uiLanguage: 'ko',
      themePreset: 'graphite',
      themeCustomColor: '#111827',
      pinchZoomEnabled: true,
      showTodoPanel: true,
      profileImageUrl: null,
      setAll: (next) => set(next),
      setPartial: (next) => set((prev) => ({ ...prev, ...next })),
    }),
    { name: 'thredge-settings-v1' },
  ),
)
