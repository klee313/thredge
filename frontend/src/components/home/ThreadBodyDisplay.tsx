import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { highlightMatches } from '../../lib/highlightMatches'
import { MarkdownContent } from '../common/MarkdownContent'

type ThreadBodyDisplayProps = {
  displayTitle?: string | null
  bodyText?: string | null
  isMuted: boolean
  bodySpacingClass: string
  hasHtmlLineBreaks?: boolean
  highlightQuery: string
  linkTo?: string
  isMarkdown?: boolean
}

const renderTitleContent = (title: string, highlightQuery: string) => (
  <span>
    {highlightMatches(title, highlightQuery, { disableLinks: true })}
  </span>
)

const renderBodyContent = (bodyText: string, highlightQuery: string): ReactNode =>
  highlightMatches(bodyText, highlightQuery)

export function ThreadBodyDisplay({
  displayTitle,
  bodyText,
  isMuted,
  bodySpacingClass,
  hasHtmlLineBreaks = false,
  highlightQuery,
  linkTo,
  isMarkdown = false,
}: ThreadBodyDisplayProps) {
  const mutedClass = isMuted
    ? 'text-[var(--theme-muted)] opacity-50 line-through'
    : 'text-[var(--theme-ink)]'
  const whitespaceClass = isMarkdown
    ? 'whitespace-normal'
    : hasHtmlLineBreaks
      ? 'whitespace-normal'
      : 'whitespace-pre-wrap'

  return (
    <>
      {displayTitle && (
        <div className="mt-8 pl-3 text-sm font-semibold">
          {linkTo ? (
            <Link
              className={`hover:underline ${mutedClass}`}
              to={linkTo}
            >
              {renderTitleContent(displayTitle, highlightQuery)}
            </Link>
          ) : (
            <span className={mutedClass}>
              {renderTitleContent(displayTitle, highlightQuery)}
            </span>
          )}
        </div>
      )}
      {bodyText && (
        <div
          className={`${bodySpacingClass} ${whitespaceClass} text-sm ${mutedClass}`}
        >
          {isMarkdown ? (
            <MarkdownContent value={bodyText} className="markdown-body" />
          ) : (
            renderBodyContent(bodyText, highlightQuery)
          )}
        </div>
      )}
    </>
  )
}
