import { ComposerTextarea } from '../common/ComposerTextarea'
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
  const primaryButtonClass =
    buttonSize === 'md' ? uiTokens.button.primaryMd : uiTokens.button.primarySm
  const secondaryButtonClass =
    buttonSize === 'md' ? uiTokens.button.secondaryMd : uiTokens.button.secondarySm

  return (
    <form
      className="mt-2 space-y-2 sm:mt-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!localValue.trim()) {
          return
        }
        // Ensure we save the latest local value
        onSave(localValue)
      }}
    >
      <ComposerTextarea
        minHeightClass="min-h-[96px]"
        value={localValue}
        onChange={setLocalValue}
      />
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
          onClick={() => onComplete(localValue.trim() ? localValue : initialValue)}
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
