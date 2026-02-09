import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
})

const renderMarkdown = (value: string) => {
  const html = md.render(value)
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}

type MarkdownContentProps = {
  value: string
  className?: string
}

export function MarkdownContent({ value, className }: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(value), [value])

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
