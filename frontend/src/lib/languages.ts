export const supportedLanguages = ['ko', 'en', 'tr'] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]

