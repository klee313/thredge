import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import type { UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AuthUser } from './lib/api'
import { ApiError } from './lib/api'
import { fetchMe, logout } from './lib/api'
import { queryKeys } from './lib/queryKeys'
import { AppShell } from './components/layout/AppShell'
import { useGlobalErrorStore } from './store/globalErrorStore'

export type AppOutletContext = {
  authQuery: UseQueryResult<AuthUser | null, Error>
}

export default function App() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setError: setGlobalError } = useGlobalErrorStore()

  const authQuery = useQuery<AuthUser | null, Error>({
    queryKey: queryKeys.auth.me,
    queryFn: ({ signal }) => fetchMe({ signal }),
    retry: false,
    meta: { suppressGlobalError: true },
  })

  useEffect(() => {
    if (!authQuery.isError || !authQuery.error) {
      return
    }
    const error = authQuery.error
    const message =
      error instanceof ApiError
        ? error.label
        : error instanceof Error
          ? error.message
          : 'Auth check failed'
    setGlobalError(message, { source: 'auth' })
  }, [authQuery.error, authQuery.isError, setGlobalError])

  const logoutMutation = useMutation<void, unknown, void, { previousAuth?: AuthUser | null }>({
    mutationFn: logout,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.me })
      const previousAuth = queryClient.getQueryData<AuthUser | null | undefined>(
        queryKeys.auth.me,
      )
      queryClient.setQueryData(queryKeys.auth.me, null)
      return { previousAuth }
    },
    onError: (error, _variables, context) => {
      const previousAuth = context?.previousAuth
      const message =
        error instanceof ApiError
          ? error.label
          : error instanceof Error
            ? error.message
            : 'Logout failed'
      if (previousAuth) {
        queryClient.setQueryData(queryKeys.auth.me, previousAuth)
      }
      setGlobalError(message, { source: 'auth' })
    },
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.auth.me, null)
      navigate('/login', { replace: true })
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      await queryClient.invalidateQueries({ queryKey: queryKeys.threads.feed })
    },
  })

  return (
    <AppShell
      isAdmin={authQuery.data?.role === 'ADMIN'}
      isAuthenticated={Boolean(authQuery.data)}
      isAuthLoading={authQuery.isLoading}
      onLogout={() => logoutMutation.mutate()}
      isLogoutPending={logoutMutation.isPending}
      displayName={authQuery.data?.name ?? authQuery.data?.username ?? null}
      username={authQuery.data?.username ?? null}
    >
      <Outlet context={{ authQuery }} />
    </AppShell>
  )
}
