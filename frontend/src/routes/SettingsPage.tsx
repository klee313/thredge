import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { supportedLanguages } from '../lib/languages'
import { useSettingsStore } from '../store/settingsStore'
import i18n from '../i18n'

const schema = z.object({
  uiLanguage: z.enum(supportedLanguages),
  nativeLanguage: z.enum(supportedLanguages),
  targetLanguage: z.enum(supportedLanguages),
  correctionEnabled: z.boolean(),
  coachTone: z.enum(['warm', 'neutral', 'strict']),
})

type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      uiLanguage: settings.uiLanguage,
      nativeLanguage: settings.nativeLanguage,
      targetLanguage: settings.targetLanguage,
      correctionEnabled: settings.correctionEnabled,
      coachTone: settings.coachTone,
    },
  })

  useEffect(() => {
    reset({
      uiLanguage: settings.uiLanguage,
      nativeLanguage: settings.nativeLanguage,
      targetLanguage: settings.targetLanguage,
      correctionEnabled: settings.correctionEnabled,
      coachTone: settings.coachTone,
    })
  }, [reset, settings])

  const selectedUiLanguage = useWatch({ control, name: 'uiLanguage' })
  useEffect(() => {
    void i18n.changeLanguage(selectedUiLanguage)
  }, [selectedUiLanguage])

  const onSubmit = (values: FormValues) => {
    settings.setAll(values)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('settings.title')}</h1>

      <form
        className="space-y-4 rounded-lg border bg-white p-4 text-gray-900"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-1">
          <label className="text-sm text-gray-700">{t('settings.uiLanguage')}</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            {...register('uiLanguage')}
          >
            <option value="ko">ko</option>
            <option value="en">en</option>
            <option value="tr">tr</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-700">
            {t('settings.nativeLanguage')}
          </label>
          <select
            className="w-full rounded-md border px-3 py-2"
            {...register('nativeLanguage')}
          >
            <option value="ko">ko</option>
            <option value="en">en</option>
            <option value="tr">tr</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-700">
            {t('settings.targetLanguage')}
          </label>
          <select
            className="w-full rounded-md border px-3 py-2"
            {...register('targetLanguage')}
          >
            <option value="ko">ko</option>
            <option value="en">en</option>
            <option value="tr">tr</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('correctionEnabled')} />
          <span className="text-sm text-gray-700">
            {t('settings.correctionEnabled')}
          </span>
        </label>

        <div className="space-y-1">
          <label className="text-sm text-gray-700">{t('settings.coachTone')}</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            {...register('coachTone')}
          >
            <option value="warm">{t('coachTone.warm')}</option>
            <option value="neutral">{t('coachTone.neutral')}</option>
            <option value="strict">{t('coachTone.strict')}</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('settings.save')}
        </button>
      </form>
    </div>
  )
}
