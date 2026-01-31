import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type AppHeaderProps = {
  isAdmin: boolean
  isAuthenticated: boolean
  isAuthLoading: boolean
  onLogout: () => void
  isLogoutPending: boolean
  headerSlot?: ReactNode
}

export function AppHeader({
  isAdmin,
  isAuthenticated,
  isAuthLoading,
  onLogout,
  isLogoutPending,
  headerSlot,
}: AppHeaderProps) {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  return (
    <header className="border-b border-[var(--theme-border)] bg-[var(--theme-surface)] sm:sticky sm:top-0 sm:z-50">
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-1 items-center gap-3 px-4 py-3 sm:px-6">
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
          <NavLink
            to="/"
            className="ml-1 font-semibold text-[var(--theme-primary)] sm:ml-2"
            aria-label={t('nav.home')}
          >
            {t('appName')}
          </NavLink>
        </div>
        {headerSlot && (
          <div className="relative z-20 col-start-2 row-start-1 flex min-w-0 justify-center">
            {headerSlot}
          </div>
        )}
        <div className="relative z-10 col-start-3 row-start-1 flex items-center justify-end gap-4 text-sm">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--theme-ink)] hover:opacity-80"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="Open menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 z-[60] mt-2 w-40 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] py-1 text-sm shadow-lg"
                role="menu"
              >
                <NavLink
                  to="/archive"
                  className={({ isActive }) =>
                    `block px-3 py-2 ${
                      isActive
                        ? 'font-semibold text-[var(--theme-primary)]'
                        : 'text-[var(--theme-ink)] hover:bg-[var(--theme-base)]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.archive')}
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `block px-3 py-2 ${
                      isActive
                        ? 'font-semibold text-[var(--theme-primary)]'
                        : 'text-[var(--theme-ink)] hover:bg-[var(--theme-base)]'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.settings')}
                </NavLink>
                <NavLink
                  to="/category-management"
                  className="block px-3 py-2 text-[var(--theme-ink)] hover:bg-[var(--theme-base)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.manageCategories')}
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `block px-3 py-2 ${
                        isActive
                          ? 'font-semibold text-[var(--theme-primary)]'
                          : 'text-[var(--theme-ink)] hover:bg-[var(--theme-base)]'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.admin')}
                  </NavLink>
                )}
                {isAuthenticated && (
                  <button
                    className="block w-full px-3 py-2 text-left text-[var(--theme-ink)] hover:bg-[var(--theme-base)]"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onLogout()
                    }}
                    disabled={isLogoutPending}
                  >
                    {t('nav.logout')}
                  </button>
                )}
              </div>
            )}
          </div>
          {isAuthLoading && (
            <span className="text-xs text-[var(--theme-muted)]">
              {t('common.loading')}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
