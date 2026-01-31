import { useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import type { AppOutletContext } from '../App'
import { AuthPanel } from '../components/auth/AuthPanel'

export function LoginPage() {
  const { authQuery } = useOutletContext<AppOutletContext>()
  const navigate = useNavigate()

  useEffect(() => {
    if (authQuery.data) {
      navigate('/', { replace: true })
    }
  }, [authQuery.data, navigate])

  return (
    <AuthPanel
      authQuery={authQuery}
      onAuthSuccess={() => navigate('/', { replace: true })}
    />
  )
}
