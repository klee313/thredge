
import { useTranslation } from 'react-i18next'
import { useHomeFeedController } from '../../hooks/useHomeFeedController'
import { HomeFeedView } from './HomeFeedView'

type HomeFeedProps = {
  username: string
  displayName: string
}

export function HomeFeed({ username, displayName }: HomeFeedProps) {
  const { i18n } = useTranslation()
  const controller = useHomeFeedController(username, i18n.language)

  return (
    <HomeFeedView
      controller={controller}
      displayName={displayName}
      username={username}
    />
  )
}
