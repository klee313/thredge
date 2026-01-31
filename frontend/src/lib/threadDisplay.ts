import { deriveTitleFromBody, getBodyWithoutTitle } from './threadText'
import { isMutedText, stripMutedText } from './mutedText'

type ThreadDisplay = {
  displayTitle: string | null
  bodyText: string | null
  isMuted: boolean
  hasDerivedTitle: boolean
  bodySpacingClass: string
  hasHtmlLineBreaks: boolean
}

export const getThreadDisplay = (
  body: string | null,
  fallbackTitle?: string | null,
): ThreadDisplay => {
  if (!body) {
    return {
      displayTitle: fallbackTitle ?? null,
      bodyText: null,
      isMuted: false,
      hasDerivedTitle: false,
      bodySpacingClass: 'mt-8',
      hasHtmlLineBreaks: false,
    }
  }

  const muted = isMutedText(body)
  const normalizedBody = muted ? stripMutedText(body) : body
  const derivedTitle = deriveTitleFromBody(normalizedBody)
  const displayTitle = derivedTitle ?? null
  const rawBody = derivedTitle
    ? getBodyWithoutTitle(derivedTitle, normalizedBody)
    : normalizedBody.trim()
  const hasHtmlLineBreaks = /<(p|br)\s*\/?>/i.test(rawBody)
  const bodyText = rawBody.trim() ? rawBody.trim() : null
  const hasDerivedTitle = Boolean(derivedTitle)
  return {
    displayTitle,
    bodyText,
    isMuted: muted,
    hasDerivedTitle,
    bodySpacingClass: hasDerivedTitle ? 'mt-2' : 'mt-8',
    hasHtmlLineBreaks,
  }
}
