import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uiTokens } from '../../lib/uiTokens'
import { MilkdownEditor } from '../common/MilkdownEditor'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import { ThreadCategorySelector } from './ThreadCategorySelector'
import { useSettingsStore } from '../../store/settingsStore'

type CategorySelectorProps = {
  categories: { id: string; name: string }[]
  selectedCategories: string[]
  isCreateCategoryPending: boolean
  onToggleCategory: (name: string) => void
  onCategorySubmit: (value: string) => void
  labels: {
    categorySearchPlaceholder: string
    loadMore: string
    addCategory: string
    cancelCategory: string
  }
}

type NewThreadComposerProps = {
  title: string
  displayName: string
  username: string
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isSubmitting: boolean
  categorySelector?: CategorySelectorProps
}

export function NewThreadComposer({
  title,
  displayName,
  username,
  value: initialValue,
  onChange,
  onSubmit,
  isSubmitting,
  categorySelector,
}: NewThreadComposerProps) {
  const { t } = useTranslation()
  const profileImageUrl = useSettingsStore((state) => state.profileImageUrl)
  const profileInitial = useMemo(
    () => displayName.trim().charAt(0).toUpperCase() || '?',
    [displayName],
  )
  const { localValue, setLocalValue, reset } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSubmitting,
  })
  const [editorSeed, setEditorSeed] = useState(0)
  const [showSending, setShowSending] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')
  const showCategorySelector = Boolean(categorySelector)

  useEffect(() => {
    if (!showCategorySelector) {
      setCategoryInput('')
    }
  }, [showCategorySelector])

  useEffect(() => {
    if (!showSending || isSubmitting) {
      return
    }
    const timeout = window.setTimeout(() => {
      setShowSending(false)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [isSubmitting, showSending])

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        setShowSending(true)
        onSubmit(localValue)
        reset('')
        setEditorSeed((prev) => prev + 1)
      }}
    >
      <div className="px-2 text-xs font-semibold tracking-wide text-[var(--theme-muted)] sm:px-1">
        {title}
      </div>
      <div className="flex items-center gap-3 px-1">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={t('settings.profileImageAlt')}
            className="h-10 w-10 rounded-full border border-[var(--theme-border)] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-base)] text-sm font-semibold text-[var(--theme-ink)]">
            {profileInitial}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--theme-ink)]">{displayName}</div>
          <div className="text-xs text-[var(--theme-muted)]">@{username}</div>
        </div>
      </div>
      <MilkdownEditor
        minHeightClass="min-h-[96px]"
        placeholder={t('home.threadBodyPlaceholder')}
        initialValue={localValue}
        valueForPlaceholder={localValue}
        onChange={setLocalValue}
        isDisabled={isSubmitting}
        resetKey={editorSeed}
      />
      {(isSubmitting || showSending) && (
        <div className="text-xs text-[var(--theme-muted)]" role="status" aria-live="polite">
          {t('home.threadSending')}
        </div>
      )}
      {showCategorySelector && categorySelector && (
        <ThreadCategorySelector
          categories={categorySelector.categories}
          selectedCategories={categorySelector.selectedCategories}
          editingCategoryInput={categoryInput}
          isCreateCategoryPending={categorySelector.isCreateCategoryPending}
          onToggleCategory={categorySelector.onToggleCategory}
          onCategoryInputChange={setCategoryInput}
          onCategoryCancel={() => setCategoryInput('')}
          onCategorySubmit={(value) => {
            categorySelector.onCategorySubmit(value)
            setCategoryInput('')
          }}
          labels={categorySelector.labels}
        />
      )}
      <button className={uiTokens.button.primaryMd} type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('common.loading') : t('home.createThread')}
      </button>
    </form>
  )
}
