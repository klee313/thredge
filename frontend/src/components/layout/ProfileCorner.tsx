import { useMemo } from 'react'

type ProfileCornerProps = {
  displayName: string
  username: string
  imageUrl: string | null
  imageAlt: string
}

export function ProfileCorner({
  displayName,
  username,
  imageUrl,
  imageAlt,
}: ProfileCornerProps) {
  const initial = useMemo(
    () => displayName.trim().charAt(0).toUpperCase() || '?',
    [displayName],
  )

  return (
    <div className="fixed bottom-8 left-8 z-40 hidden items-center gap-5 text-sm text-[var(--theme-ink)] md:flex">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-14 w-14 rounded-full border border-[var(--theme-border)] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-soft)] text-base font-semibold text-[var(--theme-ink)]">
          {initial}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-base font-normal">{displayName}</span>
        <span className="text-xs text-[var(--theme-muted)]">@{username}</span>
      </div>
    </div>
  )
}
