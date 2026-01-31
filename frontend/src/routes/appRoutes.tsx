import { Suspense, lazy, type ReactElement } from 'react'
import App from '../App'
import { RouteErrorPage } from './RouteErrorPage'
import { RouteLoading } from './RouteLoading'

const LazyHomePage = lazy(() => import('./HomePage').then((m) => ({ default: m.HomePage })))
const LazyLoginPage = lazy(() => import('./LoginPage').then((m) => ({ default: m.LoginPage })))
const LazySettingsPage = lazy(() =>
  import('./SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const LazyCategoryManagementPage = lazy(() =>
  import('./CategoryManagementPage').then((m) => ({ default: m.CategoryManagementPage })),
)
const LazyThreadDetailPage = lazy(() =>
  import('./ThreadDetailPage').then((m) => ({ default: m.ThreadDetailPage })),
)
const LazyArchivePage = lazy(() =>
  import('./ArchivePage').then((m) => ({ default: m.ArchivePage })),
)
const LazyAdminRoute = lazy(() =>
  import('./AdminRoute').then((m) => ({ default: m.AdminRoute })),
)
const LazyNotFoundPage = lazy(() =>
  import('./NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const LazyComponentLabPage = lazy(() =>
  import('../dev/ComponentLabPage').then((m) => ({ default: m.ComponentLabPage })),
)

const withRouteFallback = (node: ReactElement) => (
  <Suspense fallback={<RouteLoading />}>{node}</Suspense>
)

export const appRoutes = [
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: withRouteFallback(<LazyHomePage />) },
      { path: 'login', element: withRouteFallback(<LazyLoginPage />) },
      { path: 'categories/:categoryPath', element: withRouteFallback(<LazyHomePage />) },
      { path: 'settings', element: withRouteFallback(<LazySettingsPage />) },
      { path: 'category-management', element: withRouteFallback(<LazyCategoryManagementPage />) },
      { path: 'admin', element: withRouteFallback(<LazyAdminRoute />) },
      { path: 'threads/:id', element: withRouteFallback(<LazyThreadDetailPage />) },
      { path: 'archive', element: withRouteFallback(<LazyArchivePage />) },
      ...(import.meta.env.DEV
        ? [{ path: '__lab', element: withRouteFallback(<LazyComponentLabPage />) }]
        : []),
      { path: '*', element: withRouteFallback(<LazyNotFoundPage />) },
    ],
  },
]
