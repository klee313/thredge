import { uiTokens } from '../../lib/uiTokens'
import { ErrorNotice } from '../common/ErrorNotice'

export type SettingsCategory = {
  id: string
  name: string
}

type SettingsCategoriesSectionProps = {
  title: string
  placeholder: string
  addLabel: string
  saveLabel: string
  cancelLabel: string
  editLabel: string
  deleteLabel: string
  loadingLabel: string
  errorLabel: string
  emptyLabel: string
  categories?: SettingsCategory[]
  isLoading: boolean
  isError: boolean
  newCategory: string
  isCreatePending: boolean
  onNewCategoryChange: (value: string) => void
  onCreateCategory: () => void
  editingCategoryId: string | null
  editingCategoryName: string
  isUpdatePending: boolean
  onEditStart: (id: string, name: string) => void
  onEditChange: (value: string) => void
  onEditCancel: () => void
  onEditSubmit: () => void
  isDeletePending: boolean
  onDeleteCategory: (id: string, name: string) => void
}

export function SettingsCategoriesSection({
  title,
  placeholder,
  addLabel,
  saveLabel,
  cancelLabel,
  editLabel,
  deleteLabel,
  loadingLabel,
  errorLabel,
  emptyLabel,
  categories,
  isLoading,
  isError,
  newCategory,
  isCreatePending,
  onNewCategoryChange,
  onCreateCategory,
  editingCategoryId,
  editingCategoryName,
  isUpdatePending,
  onEditStart,
  onEditChange,
  onEditCancel,
  onEditSubmit,
  isDeletePending,
  onDeleteCategory,
}: SettingsCategoriesSectionProps) {
  return (
    <div className={uiTokens.card.surface}>
      <div className="text-sm font-semibold">{title}</div>
      <form
        className="mt-2 flex gap-2 sm:mt-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!newCategory.trim()) {
            return
          }
          onCreateCategory()
        }}
      >
        <input
          className={`flex-1 ${uiTokens.input.base} ${uiTokens.input.paddingMd}`}
          placeholder={placeholder}
          value={newCategory}
          onChange={(event) => onNewCategoryChange(event.target.value)}
        />
        <button className={uiTokens.button.primaryMd} type="submit" disabled={isCreatePending}>
          {isCreatePending ? saveLabel : addLabel}
        </button>
      </form>
      <div className="mt-2 space-y-2 sm:mt-3">
        {isLoading && <div className="text-sm text-[var(--theme-muted)]">{loadingLabel}</div>}
        {isError && <ErrorNotice message={errorLabel} />}
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-1.5 py-1 sm:px-3 sm:py-2"
          >
            {editingCategoryId === category.id ? (
              <form
                className="flex w-full items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!editingCategoryName.trim()) {
                    return
                  }
                  onEditSubmit()
                }}
              >
                <input
                  className={`flex-1 ${uiTokens.input.base} px-3 py-1`}
                  value={editingCategoryName}
                  onChange={(event) => onEditChange(event.target.value)}
                />
                <button className={uiTokens.button.primarySm} type="submit" disabled={isUpdatePending}>
                  {saveLabel}
                </button>
                <button className={uiTokens.button.secondarySm} type="button" onClick={onEditCancel}>
                  {cancelLabel}
                </button>
              </form>
            ) : (
              <>
                <div className="text-sm text-[var(--theme-ink)]">{category.name}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-[var(--theme-muted)] hover:opacity-90 hover:underline"
                    type="button"
                    onClick={() => onEditStart(category.id, category.name)}
                  >
                    {editLabel}
                  </button>
                  <button
                    className="text-xs text-[var(--theme-muted)] hover:opacity-90 hover:underline"
                    type="button"
                    onClick={() => onDeleteCategory(category.id, category.name)}
                    disabled={isDeletePending}
                  >
                    {deleteLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {!isLoading && !isError && (categories?.length ?? 0) === 0 && (
          <div className="text-sm text-[var(--theme-muted)]">{emptyLabel}</div>
        )}
      </div>
    </div>
  )
}
