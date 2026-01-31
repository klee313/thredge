type InlineIconProps = {
  svg: string
  className?: string
}

// NOTE: `svg` must be a trusted, static asset string (do not pass user input).
export function InlineIcon({ svg, className }: InlineIconProps) {
  return (
    <span
      className={['inline-flex', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
