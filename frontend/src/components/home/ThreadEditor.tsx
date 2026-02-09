import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MilkdownEditor } from '../common/MilkdownEditor'
import { uiTokens } from '../../lib/uiTokens'
import { useDebouncedTextInput } from '../../hooks/useDebouncedTextInput'
import type { ThreadEditorProps } from './types'
import { ThreadCategorySelector } from './ThreadCategorySelector'

export function ThreadEditor({
  value: initialValue,
  onChange,
  onSave,
  onCancel,
  onComplete,
  initialIsMarkdown,
  categories,
  selectedCategories,
  editingCategoryInput: initialCategoryInput,
  isCreateCategoryPending,
  isSaving,
  buttonSize = 'sm',
  onToggleCategory,
  onCategoryInputChange,
  onCategoryCancel,
  onCategorySubmit,
  labels,
}: ThreadEditorProps) {
  const { localValue, setLocalValue } = useDebouncedTextInput({
    value: initialValue,
    onChange,
    delayMs: 500,
    isLocked: isSaving,
  })
  const [isMarkdown, setIsMarkdown] = useState(initialIsMarkdown)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const primaryButtonClass =
    buttonSize === 'md' ? uiTokens.button.primaryMd : uiTokens.button.primarySm
  const secondaryButtonClass =
    buttonSize === 'md' ? uiTokens.button.secondaryMd : uiTokens.button.secondarySm

  useEffect(() => {
    setIsMarkdown(initialIsMarkdown)
  }, [initialIsMarkdown])

  useLayoutEffect(() => {
    const element = textareaRef.current
    if (!element) {
      return
    }
    const resize = () => {
      element.style.height = '0px'
      element.style.height = `${element.scrollHeight}px`
    }
    resize()
    const rafId = requestAnimationFrame(resize)
    return () => cancelAnimationFrame(rafId)
  }, [localValue, isMarkdown])

  return (
    <form
      className="mt-2 space-y-2 sm:mt-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        // Ensure we save the latest local value
        onSave(localValue, isMarkdown)
      }}
    >
      <div className="mt-1 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[11px] text-[var(--theme-muted)]">
          <input
            type="checkbox"
            checked={isMarkdown}
            onChange={(event) => setIsMarkdown(event.target.checked)}
          />
          {labels.markdown}
        </label>
      </div>
      {isMarkdown ? (
        <MilkdownEditor
          minHeightClass="min-h-[96px]"
          initialValue={localValue}
          valueForPlaceholder={localValue}
          onChange={setLocalValue}
          isDisabled={isSaving}
        />
      ) : (
        <textarea
          ref={textareaRef}
          className="min-h-[96px] w-full resize-none overflow-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)]"
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          disabled={isSaving}
        />
      )}
      <ThreadCategorySelector
        categories={categories}
        selectedCategories={selectedCategories}
        editingCategoryInput={initialCategoryInput}
        isCreateCategoryPending={isCreateCategoryPending}
        onToggleCategory={onToggleCategory}
        onCategoryInputChange={onCategoryInputChange}
        onCategoryCancel={onCategoryCancel}
        onCategorySubmit={onCategorySubmit}
        labels={{
          categorySearchPlaceholder: labels.categorySearchPlaceholder,
          loadMore: labels.loadMore,
          addCategory: labels.addCategory,
          cancelCategory: labels.cancelCategory,
        }}
      />
      <div className="flex items-center gap-2">
        <button
          className={primaryButtonClass}
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? labels.saving ?? labels.save : labels.save}
        </button>
        <button
          className={secondaryButtonClass}
          type="button"
          onClick={() => onComplete(localValue.trim() ? localValue : initialValue, isMarkdown)}
          disabled={isSaving}
        >
          {labels.complete}
        </button>
        <button
          className={secondaryButtonClass}
          type="button"
          onClick={onCancel}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  )
}
