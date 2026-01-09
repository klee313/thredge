import type { ReactNode } from 'react'

type TooltipProps = {
    content: string
    children: ReactNode
    className?: string
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
    return (
        <span className={`group relative inline-block ${className}`}>
            {children}
            <span
                className="pointer-events-none absolute bottom-full left-1/2 z-[9999] mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-0 group-hover:opacity-100"
                role="tooltip"
            >
                {content}
            </span>
        </span>
    )
}
