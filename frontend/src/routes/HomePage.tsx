import { useOutletContext } from 'react-router-dom'
import { HomeFeed } from '../components/home/HomeFeed'
import type { AppOutletContext } from '../App'
import { AuthPanel } from '../components/auth/AuthPanel'

export function HomePage() {
  const { authQuery } = useOutletContext<AppOutletContext>()

  return (
    <div className="space-y-2 sm:space-y-3">
      {!authQuery.data ? (
        <AuthPanel authQuery={authQuery} />
      ) : (
        <HomeFeed
          username={authQuery.data.username}
          displayName={authQuery.data.name || authQuery.data.username}
        />
      )}
    </div>
  )
}
