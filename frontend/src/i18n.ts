import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ko from './locales/ko.json'
import tr from './locales/tr.json'
import { supportedLanguages, type SupportedLanguage } from './lib/languages'

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  tr: { translation: tr },
} as const

const SETTINGS_STORAGE_KEY = 'thredge-settings-v1'

type PersistedSettings = {
  state?: {
    uiLanguage?: SupportedLanguage
  }
  uiLanguage?: SupportedLanguage
}

const readPreferredLanguage = (): SupportedLanguage | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as PersistedSettings
    const candidate = parsed?.state?.uiLanguage ?? parsed?.uiLanguage
    if (candidate && supportedLanguages.includes(candidate)) {
      return candidate
    }
  } catch {
    return null
  }
  return null
}

const preferredLanguage = readPreferredLanguage()

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'en',
    lng: preferredLanguage ?? undefined,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
