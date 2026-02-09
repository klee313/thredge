import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react'

type TooltipProps = {
  content: string
  children: ReactNode
  className?: string
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const tooltipId = useId()
  const element = isValidElement(children) ? (children as ReactElement<any>) : null
  let isFocusableChild = false
  if (element && typeof element.type === 'string') {
    const props = element.props ?? {}
    isFocusableChild =
      ['button', 'a', 'input', 'textarea', 'select'].includes(element.type) ||
      props.tabIndex >= 0 ||
      Boolean(props.href)
  }
  let renderedChild: ReactNode = children
  if (element && isFocusableChild) {
    renderedChild = cloneElement(element, {
      'aria-describedby': element.props?.['aria-describedby']
        ? `${element.props['aria-describedby']} ${tooltipId}`
        : tooltipId,
    })
  }
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
