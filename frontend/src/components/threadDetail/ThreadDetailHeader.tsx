import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { Tooltip } from '../common/Tooltip'

type ThreadDetailHeaderProps = {
  onBack: () => void
  lastActivityAt?: string | null
}

export function ThreadDetailHeader({ onBack, lastActivityAt }: ThreadDetailHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between">
      <button
        className="text-sm text-[var(--theme-muted)]"
        type="button"
        onClick={onBack}
      >
        {t('thread.back')}
      </button>
      {lastActivityAt && (
        <div className="text-xs text-[var(--theme-muted)]">
          <Tooltip content={new Date(lastActivityAt).toLocaleString()}>
            <span className="opacity-50">
              {t('thread.lastActivity', {
                time: formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true }),
              })}
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
