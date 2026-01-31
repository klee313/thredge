import { cloneElement, isValidElement, useId, type ReactNode } from 'react'

type TooltipProps = {
  content: string
  children: ReactNode
  className?: string
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const tooltipId = useId()
  const isFocusableChild =
    isValidElement(children) &&
    typeof children.type === 'string' &&
    (['button', 'a', 'input', 'textarea', 'select'].includes(children.type) ||
      children.props.tabIndex >= 0 ||
      Boolean(children.props.href))
  const renderedChild = isFocusableChild
    ? cloneElement(children, {
        'aria-describedby': children.props['aria-describedby']
          ? `${children.props['aria-describedby']} ${tooltipId}`
          : tooltipId,
      })
    : children
  return (
    <span
      className={`group relative inline-block ${className}`}
      aria-describedby={isFocusableChild ? undefined : tooltipId}
      tabIndex={isFocusableChild ? undefined : 0}
    >
      {renderedChild}
      <span
        id={tooltipId}
        className="pointer-events-none absolute bottom-full left-1/2 z-[9999] mb-1 max-w-[240px] -translate-x-1/2 whitespace-normal rounded bg-gray-900 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-0 group-hover:opacity-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}
