import type { ReactNode } from 'react'

export const highlightMatches = (text: string, query: string): ReactNode => {
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(text)
  if (hasHtmlTags) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }
  if (!query) {
    return text
  }
  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  if (!normalizedQuery) {
    return text
  }
  const parts: ReactNode[] = []
  let startIndex = 0
  let matchIndex = normalizedText.indexOf(normalizedQuery, startIndex)
  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      parts.push(text.slice(startIndex, matchIndex))
    }
    const matchText = text.slice(matchIndex, matchIndex + normalizedQuery.length)
    parts.push(
      <mark key={`${startIndex}-${matchIndex}`} className="rounded bg-yellow-200 px-0.5">
        {matchText}
      </mark>,
    )
    startIndex = matchIndex + normalizedQuery.length
    matchIndex = normalizedText.indexOf(normalizedQuery, startIndex)
  }
  if (startIndex < text.length) {
    parts.push(text.slice(startIndex))
  }
  return parts
}
