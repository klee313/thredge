import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'
import { useGlobalErrorStore } from '../store/globalErrorStore'

const reportGlobalError = (error: unknown) => {
  const store = useGlobalErrorStore.getState()
  if (error instanceof ApiError) {
    const detail = error.detail ? `: ${error.detail}` : ''
    const status = error.status ? ` (HTTP ${error.status})` : ''
    const userMessage = error.label
    const devMessage = `${error.label}${detail}${status}`
    console.error(devMessage)
    store.setError(userMessage, { devMessage, source: 'api' })
    return
  }
  if (error instanceof Error) {
    console.error(error)
    store.setError(error.message, { devMessage: error.stack, source: 'runtime' })
    return
  }
  console.error('Unexpected error', error)
  store.setError('Unexpected error', { source: 'unknown' })
}

export const createAppQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query?.meta && (query.meta as { suppressGlobalError?: boolean }).suppressGlobalError) {
          return
        }
        console.error('Query error', error)
        reportGlobalError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (
          mutation?.meta &&
          (mutation.meta as { suppressGlobalError?: boolean }).suppressGlobalError
        ) {
          return
        }
        console.error('Mutation error', error)
        reportGlobalError(error)
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })
