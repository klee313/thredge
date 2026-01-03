export const isMutedText = (text?: string | null) =>
  Boolean(text && text.startsWith('~~') && text.endsWith('~~') && text.length > 4)

export const stripMutedText = (text: string) => text.slice(2, -2)

export const toggleMutedText = (text: string) =>
  isMutedText(text) ? stripMutedText(text) : `~~${text}~~`
