import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="font-semibold">{t('appName')}</div>
          <nav className="flex gap-3 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'font-semibold text-gray-900' : 'text-gray-600'
              }
              end
            >
              {t('nav.home')}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? 'font-semibold text-gray-900' : 'text-gray-600'
              }
            >
              {t('nav.settings')}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
