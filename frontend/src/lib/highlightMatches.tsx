import type { ReactNode } from 'react'

// URL regex: stops before <, >, whitespace, or end of string
// Matches http(s) URLs or /threads/{uuid}
const URL_REGEX = /(https?:\/\/[^\s<>]+|\/threads\/[0-9a-fA-F-]{36})/g

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

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
  allowHtml?: boolean
}

const shouldAllowTrustedHtml = () => {
  if (!import.meta.env) {
    return true
  }
  const raw = import.meta.env.VITE_TRUSTED_HTML
  if (!raw) {
    return true
  }
  return raw === '1' || raw.toLowerCase() === 'true'
}

const highlightHtmlString = (html: string, query: string): string => {
  if (!query) {
    return html
  }
  const normalizedQuery = query.toLowerCase()
  if (!normalizedQuery) {
    return html
  }
  if (typeof DOMParser === 'undefined') {
    return html
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const container = document.body.firstElementChild
  if (!container) {
    return html
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((node) => {
    const text = node.nodeValue ?? ''
    const normalizedText = text.toLowerCase()
    let matchIndex = normalizedText.indexOf(normalizedQuery)
    if (matchIndex === -1) {
      return
    }

    const fragment = document.createDocumentFragment()
    let startIndex = 0

    while (matchIndex !== -1) {
      if (matchIndex > startIndex) {
        fragment.append(text.slice(startIndex, matchIndex))
      }
      const matchText = text.slice(matchIndex, matchIndex + normalizedQuery.length)
      const mark = document.createElement('mark')
      mark.className = 'rounded bg-yellow-200 px-0.5'
      mark.textContent = matchText
      fragment.append(mark)
      startIndex = matchIndex + normalizedQuery.length
      matchIndex = normalizedText.indexOf(normalizedQuery, startIndex)
    }

    if (startIndex < text.length) {
      fragment.append(text.slice(startIndex))
    }

    node.parentNode?.replaceChild(fragment, node)
  })

  return container.innerHTML
}

export const highlightMatches = (
  text: string,
  query: string,
  options?: HighlightOptions,
): ReactNode => {
  // NOTE: `text` is assumed to be trusted app-generated content.
  // If it can contain user-controlled HTML, sanitize or escape before innerHTML.
  // Linkify URLs that aren't already inside <a> tags
  const linkifiedText = options?.disableLinks
    ? text
    : text.replace(
        /(<a\s[^>]*>.*?<\/a>)|(https?:\/\/[^\s<>]+|\/threads\/[0-9a-fA-F-]{36})/gi,
        (_match: string, existingAnchor?: string, urlOrPath?: string) => {
          if (existingAnchor) {
            return existingAnchor // Already wrapped, keep as-is
          }
          const safeUrl = escapeHtmlAttribute(urlOrPath ?? '')
          return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all" onclick="event.stopPropagation()" aria-label="${safeUrl}">${safeUrl}</a>`
        },
      )

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(linkifiedText)
  const allowHtml = options?.allowHtml !== false && shouldAllowTrustedHtml()
  if (hasHtmlTags && allowHtml) {
    // WARNING: DO NOT remove or "sanitize away" this HTML rendering without a migration plan.
    // This app intentionally preserves trusted, server-provided HTML in thread/entry bodies
    // (e.g., previously stored markup and linkified content). Replacing this with plain-text
    // escaping will corrupt existing content and break user expectations. If the trust model
    // changes, you must introduce server-side sanitization + stored-content migration first,
    // then update the client to render sanitized markup. Until then, keep this as-is.
    // SECURITY: Keep this aligned with the server-side trust policy; do not loosen without review.
    const highlightedHtml = highlightHtmlString(linkifiedText, query)
    return <span dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
  }
  if (hasHtmlTags && !allowHtml) {
    if (import.meta.env?.DEV) {
      console.warn('[highlightMatches] HTML rendering disabled for content that contains tags.')
    }
    return applyHighlighting(text, query)
  }

  if (options?.disableLinks) {
    return applyHighlighting(text, query)
  }

  // For plain text without HTML, use React components for better highlighting
  const parts = text.split(URL_REGEX)

  if (parts.length === 1) {
    return applyHighlighting(text, query)
  }

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0 // Reset regex state
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {applyHighlighting(part, query)}
        </a>
      )
    }
    return <span key={index}>{applyHighlighting(part, query)}</span>
  })
}
