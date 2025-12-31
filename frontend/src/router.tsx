import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { HomePage } from './routes/HomePage'
import { SettingsPage } from './routes/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

