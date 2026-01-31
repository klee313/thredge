import type { FormEventHandler } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { uiTokens } from '../../lib/uiTokens'
import { ErrorNotice } from '../common/ErrorNotice'
import type { PasswordChangeFormValues } from '../../routes/SettingsPage'

type SettingsPasswordSectionProps = {
  onSubmit: FormEventHandler<HTMLFormElement>
  registerPassword: UseFormRegister<PasswordChangeFormValues>
  errors: FieldErrors<PasswordChangeFormValues>
  isPending: boolean
  savedAt: number | null
  labels: {
    title: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
    changeButton: string
    saving: string
    saved: string
    error: string
  }
}

export function SettingsPasswordSection({
  onSubmit,
  registerPassword,
  errors,
  isPending,
  savedAt,
  labels,
}: SettingsPasswordSectionProps) {
  return (
    <div className={uiTokens.card.surface}>
      <div className="text-sm font-semibold">{labels.title}</div>
      <form className="mt-2 space-y-3 sm:mt-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <input
            type="password"
            placeholder={labels.currentPassword}
            className={`${uiTokens.input.base} ${uiTokens.input.paddingMd} w-full`}
            aria-label={labels.currentPassword}
            autoComplete="current-password"
            {...registerPassword('currentPassword')}
          />
          {errors.currentPassword && (
            <div className="text-xs text-red-600">{errors.currentPassword.message}</div>
          )}
        </div>
        <div className="space-y-1">
          <input
            type="password"
            placeholder={labels.newPassword}
            className={`${uiTokens.input.base} ${uiTokens.input.paddingMd} w-full`}
            aria-label={labels.newPassword}
            autoComplete="new-password"
            {...registerPassword('newPassword')}
          />
          {errors.newPassword && (
            <div className="text-xs text-red-600">{errors.newPassword.message}</div>
          )}
        </div>
        <div className="space-y-1">
          <input
            type="password"
            placeholder={labels.confirmNewPassword}
            className={`${uiTokens.input.base} ${uiTokens.input.paddingMd} w-full`}
            aria-label={labels.confirmNewPassword}
            autoComplete="new-password"
            {...registerPassword('confirmNewPassword')}
          />
          {errors.confirmNewPassword && (
            <div className="text-xs text-red-600">{errors.confirmNewPassword.message}</div>
          )}
        </div>

        {errors.root && <ErrorNotice message={errors.root.message ?? labels.error} />}

        <div className="flex items-center gap-2">
          <button type="submit" className={uiTokens.button.primaryMd} disabled={isPending}>
            {isPending ? labels.saving : labels.changeButton}
          </button>
          <div className="min-h-[1rem]" role="status" aria-live="polite">
            {savedAt && (
              <span className="text-xs font-semibold text-emerald-600">{labels.saved}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
