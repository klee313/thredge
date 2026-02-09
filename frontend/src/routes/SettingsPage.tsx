import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { z } from 'zod'
import { supportedLanguages } from '../lib/languages'
import { useSettingsStore } from '../store/settingsStore'
import i18n from '../i18n'
import { changePassword, fetchAiSettings, updateAiSettings, updateDisplayName } from '../lib/api'
import { uiTokens } from '../lib/uiTokens'
import {
  CUSTOM_THEME_ID,
  applyTheme,
  buildThemeFromPrimary,
  normalizeThemeHex,
  resolveTheme,
  uiThemePresets,
} from '../lib/uiTheme'
import type { AppOutletContext } from '../App'
import { useGlobalErrorStore } from '../store/globalErrorStore'
import { SettingsPasswordSection } from '../components/settings/SettingsPasswordSection'
import { queryKeys } from '../lib/queryKeys'

const schema = z.object({
  uiLanguage: z.enum(supportedLanguages),
  themePreset: z.string(),
  themeCustomColor: z.string(),
  pinchZoomEnabled: z.boolean(),
  showTodoPanel: z.boolean(),
  profileImageUrl: z.string().nullable(),
})

const buildPasswordChangeSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(1, t('settings.passwordCurrentRequired')),
      newPassword: z.string().min(4, t('settings.passwordMinLength')),
      confirmNewPassword: z.string().min(4, t('settings.passwordMinLength')),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('settings.passwordMismatch'),
      path: ['confirmNewPassword'],
    })

export type PasswordChangeFormValues = z.infer<ReturnType<typeof buildPasswordChangeSchema>>
type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const { authQuery } = useOutletContext<AppOutletContext>()
  const queryClient = useQueryClient()
  const { setError: setGlobalError } = useGlobalErrorStore()
  const [uiSavedAt, setUiSavedAt] = useState<number | null>(null)
  const [profileSavedAt, setProfileSavedAt] = useState<number | null>(null)
  const [passwordSavedAt, setPasswordSavedAt] = useState<number | null>(null)
  const [displayNameSavedAt, setDisplayNameSavedAt] = useState<number | null>(null)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [isProfileEditing, setIsProfileEditing] = useState(false)
  const uiSavedAtRef = useRef<number | null>(null)
  const profileSavedAtRef = useRef<number | null>(null)
  const displayNameInputRef = useRef<HTMLInputElement | null>(null)
  const { control, register, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      uiLanguage: settings.uiLanguage,
      themePreset: settings.themePreset,
      themeCustomColor: settings.themeCustomColor,
      pinchZoomEnabled: settings.pinchZoomEnabled,
      showTodoPanel: settings.showTodoPanel,
      profileImageUrl: settings.profileImageUrl,
    },
  })
  const aiProviders = useMemo(() => [{ id: 'openai', label: 'OpenAI' }], [])
  const [aiProvider, setAiProvider] = useState('openai')
  const [aiApiKey, setAiApiKey] = useState('')
  const [aiSavedAt, setAiSavedAt] = useState<number | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const aiSettingsQuery = useQuery({
    queryKey: queryKeys.ai.settings,
    queryFn: ({ signal }) => fetchAiSettings({ signal }),
    enabled: Boolean(authQuery.data),
    meta: { suppressGlobalError: true },
  })
  const aiSettingsMutation = useMutation({
    mutationFn: () => updateAiSettings(aiProvider, aiApiKey.trim()),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.ai.settings, data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.settings })
      setAiSavedAt((prev) => (prev ?? 0) + 1)
      setAiError(null)
      setAiApiKey('')
    },
    onError: (error: Error) => {
      setAiError(error.message)
      setGlobalError(error.message, { source: 'auth', devMessage: error.stack })
    },
  })

  useEffect(() => {
    reset({
      uiLanguage: settings.uiLanguage,
      themePreset: settings.themePreset,
      themeCustomColor: settings.themeCustomColor,
      pinchZoomEnabled: settings.pinchZoomEnabled,
      showTodoPanel: settings.showTodoPanel,
      profileImageUrl: settings.profileImageUrl,
    })
  }, [reset, settings])

  useEffect(() => {
    if (!aiSettingsQuery.data?.provider) {
      return
    }
    setAiProvider(aiSettingsQuery.data.provider)
  }, [aiSettingsQuery.data?.provider])

  useEffect(() => {
    if (!authQuery.data) {
      return
    }
    const fallbackName = authQuery.data.name || authQuery.data.username
    setDisplayName(fallbackName)
  }, [authQuery.data?.name, authQuery.data?.username, authQuery.data])

  const selectedUiLanguage = useWatch({ control, name: 'uiLanguage' })
  const selectedThemePreset = useWatch({ control, name: 'themePreset' })
  const selectedThemeCustomColor = useWatch({ control, name: 'themeCustomColor' })
  const selectedPinchZoomEnabled = useWatch({ control, name: 'pinchZoomEnabled' })
  const selectedShowTodoPanel = useWatch({ control, name: 'showTodoPanel' })
  const selectedProfileImageUrl = useWatch({ control, name: 'profileImageUrl' })
  useEffect(() => {
    void i18n.changeLanguage(selectedUiLanguage)
  }, [selectedUiLanguage])

  useEffect(() => {
    applyTheme(resolveTheme(selectedThemePreset, selectedThemeCustomColor))
  }, [selectedThemePreset, selectedThemeCustomColor])

  useEffect(() => {
    if (!uiSavedAt) {
      return
    }
    const timeoutId = window.setTimeout(() => setUiSavedAt(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [uiSavedAt])

  useEffect(() => {
    if (!aiSavedAt) {
      return
    }
    const timeoutId = window.setTimeout(() => setAiSavedAt(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [aiSavedAt])

  useEffect(() => {
    if (!profileSavedAt) {
      return
    }
    const timeoutId = window.setTimeout(() => setProfileSavedAt(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [profileSavedAt])

  useEffect(() => {
    if (!passwordSavedAt) {
      return
    }
    const timeoutId = window.setTimeout(() => setPasswordSavedAt(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [passwordSavedAt])

  useEffect(() => {
    if (!displayNameSavedAt) {
      return
    }
    const timeoutId = window.setTimeout(() => setDisplayNameSavedAt(null), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [displayNameSavedAt])

  useEffect(() => {
    uiSavedAtRef.current = uiSavedAt
  }, [uiSavedAt])

  useEffect(() => {
    profileSavedAtRef.current = profileSavedAt
  }, [profileSavedAt])

  useEffect(() => {
    if (displayNameSavedAt) {
      setDisplayNameSavedAt(null)
    }
    if (displayNameError) {
      setDisplayNameError(null)
    }
  }, [displayName])

  useEffect(() => {
    if (aiError) {
      setAiError(null)
    }
  }, [aiApiKey, aiProvider])

  useEffect(() => {
    if (!isProfileEditing) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      displayNameInputRef.current?.focus()
      displayNameInputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [isProfileEditing])

  useEffect(() => {
    if (uiSavedAtRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUiSavedAt(null)
    }
  }, [
    selectedUiLanguage,
    selectedThemePreset,
    selectedThemeCustomColor,
    selectedPinchZoomEnabled,
    selectedShowTodoPanel,
  ])

  useEffect(() => {
    if (profileSavedAtRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileSavedAt(null)
    }
  }, [selectedProfileImageUrl])

  const customColorValue =
    normalizeThemeHex(selectedThemeCustomColor) ?? settings.themeCustomColor
  const customTheme = useMemo(
    () => buildThemeFromPrimary(customColorValue),
    [customColorValue],
  )
  const profileInitial = useMemo(() => {
    if (displayName.trim()) {
      return displayName.trim().charAt(0).toUpperCase()
    }
    if (authQuery.data?.username) {
      return authQuery.data.username.charAt(0).toUpperCase()
    }
    return '?'
  }, [authQuery.data?.username, displayName])

  const onUiSubmit = (values: FormValues) => {
    const normalizedCustomColor =
      normalizeThemeHex(values.themeCustomColor) ?? settings.themeCustomColor
    settings.setPartial({
      uiLanguage: values.uiLanguage,
      themePreset: values.themePreset,
      themeCustomColor: normalizedCustomColor,
      pinchZoomEnabled: values.pinchZoomEnabled,
      showTodoPanel: values.showTodoPanel,
    })
    setUiSavedAt((prev) => (prev ?? 0) + 1)
  }

  const onProfileSubmit = (values: FormValues) => {
    settings.setPartial({
      profileImageUrl: values.profileImageUrl,
    })
    setProfileSavedAt((prev) => (prev ?? 0) + 1)
  }

  const profileImageInputRef = useRef<HTMLInputElement | null>(null)
  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      setGlobalError(t('settings.profileImageInvalidType'), { source: 'ui' })
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = ''
      }
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (!result) {
        setGlobalError(t('settings.profileImageLoadError'), { source: 'ui' })
        return
      }
      setValue('profileImageUrl', result, { shouldDirty: true })
    }
    reader.onerror = () => {
      setGlobalError(t('settings.profileImageLoadError'), { source: 'ui' })
    }
    reader.readAsDataURL(file)
  }

  const handleProfileImageClear = () => {
    setValue('profileImageUrl', null, { shouldDirty: true })
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
  }

  const displayNameMutation = useMutation({
    mutationFn: (value: string) => updateDisplayName(value),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      setDisplayNameSavedAt((prev) => (prev ?? 0) + 1)
      setDisplayNameError(null)
      setIsProfileEditing(false)
    },
    onError: (error: Error) => {
      setDisplayNameError(error.message)
      setGlobalError(error.message, { source: 'auth', devMessage: error.stack })
    },
  })

  const passwordChangeSchema = useMemo(() => buildPasswordChangeSchema(t), [t])
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (values: PasswordChangeFormValues) =>
      changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      resetPassword()
      setPasswordSavedAt((prev) => (prev ?? 0) + 1)
    },
    onError: (error: Error) => {
      setPasswordError('root', { message: error.message })
      setGlobalError(error.message, { source: 'auth', devMessage: error.stack })
    },
  })

  const onPasswordSubmit = (values: PasswordChangeFormValues) => {
    changePasswordMutation.mutate(values)
  }

  const handleDisplayNameSubmit = () => {
    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setDisplayNameError(t('settings.displayNameRequired'))
      displayNameInputRef.current?.focus()
      return
    }
    if (trimmedName.length > 40) {
      setDisplayNameError(t('settings.displayNameTooLong'))
      displayNameInputRef.current?.focus()
      return
    }
    if (trimmedName !== displayName) {
      setDisplayName(trimmedName)
    }
    displayNameMutation.mutate(trimmedName)
  }

  const handleAiSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!aiProvider) {
      setAiError(t('settings.aiProviderRequired'))
      return
    }
    if (!aiApiKey.trim() && !aiSettingsQuery.data?.hasApiKey) {
      setAiError(t('settings.aiKeyRequired'))
      return
    }
    aiSettingsMutation.mutate()
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
      <div className="text-xs text-[var(--theme-muted)]">{t('settings.previewNote')}</div>

      {authQuery.data && (
        <form
          className={`${uiTokens.card.surface}`}
          onSubmit={(event) => {
            void handleSubmit(onProfileSubmit)(event)
          }}
        >
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-[240px] items-center gap-3">
                <button
                  type="button"
                  className="relative"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  {selectedProfileImageUrl ? (
                    <img
                      src={selectedProfileImageUrl}
                      alt={t('settings.profileImageAlt')}
                      className="h-16 w-16 rounded-full border-2 border-[var(--theme-border)] object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[var(--theme-border)] text-sm font-semibold text-[var(--theme-muted)]">
                      {profileInitial}
                    </div>
                  )}
                </button>
                <div className="space-y-1 text-left">
                  {isProfileEditing ? (
                    <input
                      ref={displayNameInputRef}
                      className="w-full border-b border-transparent bg-transparent pb-0.5 text-sm font-semibold text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-primary)] focus:outline-none"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      onBlur={() => {
                        if (!displayName.trim()) {
                          handleDisplayNameSubmit()
                          return
                        }
                        handleDisplayNameSubmit()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleDisplayNameSubmit()
                        }
                        if (event.key === 'Escape') {
                          const fallbackName =
                            authQuery.data?.name || authQuery.data?.username || ''
                          setDisplayName(fallbackName)
                          setDisplayNameError(null)
                          setIsProfileEditing(false)
                        }
                      }}
                      maxLength={40}
                      placeholder={t('settings.displayNamePlaceholder')}
                    />
                  ) : (
                    <button
                      type="button"
                      className="text-sm font-semibold"
                      onClick={() => setIsProfileEditing(true)}
                    >
                      {displayName || authQuery.data?.username || ''}
                    </button>
                  )}
                  <div className="text-xs text-[var(--theme-muted)]">
                    @{authQuery.data?.username ?? ''}
                  </div>
                </div>
              </div>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                aria-label={t('settings.profileImageUpload')}
                className="sr-only"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`${uiTokens.button.secondarySm} disabled:cursor-not-allowed disabled:opacity-50`}
                onClick={handleProfileImageClear}
                disabled={!selectedProfileImageUrl}
              >
                {t('settings.profileImageRemove')}
              </button>
              <button type="submit" className={uiTokens.button.primarySm}>
                {t('settings.save')}
              </button>
              <div className="min-h-[1rem]" role="status" aria-live="polite">
                {profileSavedAt && (
                  <span className="text-xs font-semibold text-emerald-600">
                    {t('settings.saved')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      <form
        className={`space-y-4 ${uiTokens.card.surface} sm:space-y-5`}
        onSubmit={(event) => {
          void handleSubmit(onUiSubmit)(event)
        }}
      >
        <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-4">
          <div className="space-y-1">
            <label className="text-sm text-[var(--theme-muted)]">
              {t('settings.uiLanguage')}
            </label>
            <select
              className={`${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
              {...register('uiLanguage')}
            >
              <option value="ko">{t('settings.languageKo')}</option>
              <option value="en">{t('settings.languageEn')}</option>
              <option value="tr">{t('settings.languageTr')}</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">{t('settings.themeTitle')}</div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {uiThemePresets.map((preset) => {
                const theme = buildThemeFromPrimary(preset.primary)
                const isActive = selectedThemePreset === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`rounded-md border bg-[var(--theme-surface)] p-1 text-left transition ${
                      isActive ? 'border-[var(--theme-primary)]' : 'border-[var(--theme-border)]'
                    }`}
                    onClick={() => setValue('themePreset', preset.id, { shouldDirty: true })}
                    aria-pressed={isActive}
                  >
                    <div className="flex h-8 w-full overflow-hidden rounded-sm">
                      <span
                        className="w-2/3"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span
                        className="w-1/3"
                        style={{ backgroundColor: theme.soft }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-[var(--theme-muted)]">
                      {preset.name}
                    </div>
                  </button>
                )
              })}
              <button
                type="button"
                className={`rounded-md border bg-[var(--theme-surface)] p-1 text-left transition ${
                  selectedThemePreset === CUSTOM_THEME_ID
                    ? 'border-[var(--theme-primary)]'
                    : 'border-[var(--theme-border)]'
                }`}
                onClick={() => setValue('themePreset', CUSTOM_THEME_ID, { shouldDirty: true })}
                aria-pressed={selectedThemePreset === CUSTOM_THEME_ID}
              >
                <div className="flex h-8 w-full overflow-hidden rounded-sm">
                  <span className="w-2/3" style={{ backgroundColor: customTheme.primary }} />
                  <span className="w-1/3" style={{ backgroundColor: customTheme.soft }} />
                </div>
                <div className="mt-1 text-[10px] text-[var(--theme-muted)]">
                  {t('settings.themeCustom')}
                </div>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-[var(--theme-muted)]">
                {t('settings.themeCustomColor')}
              </label>
              <input
                type="color"
                value={customColorValue}
                onChange={(event) => {
                  setValue('themePreset', CUSTOM_THEME_ID, { shouldDirty: true })
                  setValue('themeCustomColor', event.target.value, { shouldDirty: true })
                }}
                aria-label={t('settings.themeCustomColor')}
              />
              <input
                className={`${uiTokens.input.base} px-2 py-1 text-xs`}
                value={selectedThemeCustomColor}
                placeholder={t('settings.themeCustomPlaceholder')}
                onChange={(event) => {
                  setValue('themePreset', CUSTOM_THEME_ID, { shouldDirty: true })
                  setValue('themeCustomColor', event.target.value, { shouldDirty: true })
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">{t('settings.pinchZoomTitle')}</div>
            <div className="text-xs text-[var(--theme-muted)]">
              {t('settings.pinchZoomDescription')}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-[var(--theme-muted)]">
                {selectedPinchZoomEnabled
                  ? t('settings.pinchZoomEnabled')
                  : t('settings.pinchZoomDisabled')}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={selectedPinchZoomEnabled}
                onClick={() =>
                  setValue('pinchZoomEnabled', !selectedPinchZoomEnabled, { shouldDirty: true })
                }
                className={`relative h-6 w-11 rounded-full border transition ${
                  selectedPinchZoomEnabled
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'
                }`}
              >
                <span
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--theme-on-primary)] transition ${
                    selectedPinchZoomEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">{t('settings.todoPanelTitle')}</div>
            <div className="text-xs text-[var(--theme-muted)]">
              {t('settings.todoPanelDescription')}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-[var(--theme-muted)]">
                {selectedShowTodoPanel
                  ? t('settings.todoPanelShown')
                  : t('settings.todoPanelHidden')}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={selectedShowTodoPanel}
                onClick={() =>
                  setValue('showTodoPanel', !selectedShowTodoPanel, { shouldDirty: true })
                }
                className={`relative h-6 w-11 rounded-full border transition ${
                  selectedShowTodoPanel
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'
                }`}
              >
                <span
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--theme-on-primary)] transition ${
                    selectedShowTodoPanel ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className={uiTokens.button.primaryMd}
          >
            {t('settings.save')}
          </button>
          <div
            className="min-h-[1rem]"
            role="status"
            aria-live="polite"
          >
            {uiSavedAt && (
              <span className="text-xs font-semibold text-emerald-600">
                {t('settings.saved')}
              </span>
            )}
          </div>
        </div>
      </form>

      {authQuery.data && (
        <>
          <form
            className={`space-y-3 ${uiTokens.card.surface}`}
            onSubmit={handleAiSettingsSubmit}
          >
            <div className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-base)] p-3 sm:p-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">{t('settings.aiTitle')}</div>
                <div className="text-xs text-[var(--theme-muted)]">
                  {t('settings.aiDescription')}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-[var(--theme-muted)]">
                    <span>{t('settings.aiProviderLabel')}</span>
                    <select
                      className={`${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
                      value={aiProvider}
                      onChange={(event) => setAiProvider(event.target.value)}
                    >
                      {aiProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs text-[var(--theme-muted)]">
                    <span>{t('settings.aiKeyLabel')}</span>
                    <input
                      type="password"
                      className={`${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
                      value={aiApiKey}
                      placeholder={
                        aiSettingsQuery.data?.hasApiKey
                          ? t('settings.aiKeySavedPlaceholder')
                          : t('settings.aiKeyPlaceholder')
                      }
                      onChange={(event) => setAiApiKey(event.target.value)}
                    />
                  </label>
                </div>
                {aiError && (
                  <div className="text-xs font-semibold text-rose-600">{aiError}</div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className={uiTokens.button.primarySm}
                    disabled={aiSettingsMutation.isPending}
                  >
                    {aiSettingsMutation.isPending ? t('settings.saving') : t('settings.save')}
                  </button>
                  <div className="min-h-[1rem]" role="status" aria-live="polite">
                    {aiSavedAt && (
                      <span className="text-xs font-semibold text-emerald-600">
                        {t('settings.saved')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
          <SettingsPasswordSection
            onSubmit={(event) => {
              void handleSubmitPassword(onPasswordSubmit)(event)
            }}
            registerPassword={registerPassword}
            errors={passwordErrors}
            isPending={changePasswordMutation.isPending}
            savedAt={passwordSavedAt}
            labels={{
              title: t('settings.changePassword'),
              currentPassword: t('settings.currentPassword'),
              newPassword: t('settings.newPassword'),
              confirmNewPassword: t('settings.confirmNewPassword'),
              changeButton: t('settings.changePasswordButton'),
              saving: t('settings.saving'),
              saved: t('settings.passwordChanged'),
              error: t('settings.error'),
            }}
          />

        </>
      )}
    </div>
  )
}
