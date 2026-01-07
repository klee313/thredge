import type { ReactNode } from 'react'

// Internal helper for highlighting only
const applyHighlighting = (text: string, query: string): ReactNode => {
  if (!query) return text
  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  if (!normalizedQuery) return text

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

type HighlightOptions = {
  disableLinks?: boolean
}

export const highlightMatches = (
  text: string,
  query: string,
  options?: HighlightOptions,
): ReactNode => {
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(text)
  if (hasHtmlTags) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  if (options?.disableLinks) {
    return applyHighlighting(text, query)
  }

  // Split by URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  if (parts.length === 1) {
    return applyHighlighting(text, query)
  }

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {applyHighlighting(part, query)}
        </a>
      )
    }
    return <span key={index}>{applyHighlighting(part, query)}</span>
  })
}
