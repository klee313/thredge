import pinIcon from '../../assets/pin.svg'
import pinFilledIcon from '../../assets/pin-filled.svg'
import eraserIcon from '../../assets/eraser.svg'
import type { ThreadDetail } from '../../lib/api'
import { isMutedText } from '../../lib/mutedText'

type ThreadCardHeaderProps = {
  thread: ThreadDetail
  isEditing: boolean
  editingThreadCategories: string[]
  isPinPending: boolean
  isUnpinPending: boolean
  isHidePending: boolean
  labels: {
    pin: string
    unpin: string
    edit: string
    archive: string
  }
  onTogglePin: () => void
  onStartEdit: () => void
  onToggleMute: () => void
  onHide: () => void
  onEditingCategoryToggle: (name: string) => void
}

export function ThreadCardHeader({
  thread,
  isEditing,
  editingThreadCategories,
  isPinPending,
  isUnpinPending,
  isHidePending,
  labels,
  onTogglePin,
  onStartEdit,
  onToggleMute,
  onHide,
  onEditingCategoryToggle,
}: ThreadCardHeaderProps) {
  return (
    <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            thread.pinned ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-400'
          }`}
          type="button"
          onClick={onTogglePin}
          disabled={isPinPending || isUnpinPending}
          aria-label={thread.pinned ? labels.unpin : labels.pin}
        >
          <img
            className="h-3.5 w-3.5"
            src={thread.pinned ? pinFilledIcon : pinIcon}
            alt=""
          />
        </button>
        {isEditing
          ? editingThreadCategories.map((categoryName) => (
              <button
                key={categoryName}
                className="inline-flex rounded-full border border-gray-900 bg-gray-900 px-2 py-0.5 text-xs font-normal text-white"
                type="button"
                onClick={() => onEditingCategoryToggle(categoryName)}
              >
                {categoryName}
              </button>
            ))
          : thread.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex rounded-full border border-gray-200 px-2 py-0.5 text-xs font-normal text-gray-600"
              >
                {category.name}
              </span>
            ))}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-500"
          type="button"
          onClick={onStartEdit}
          aria-label={labels.edit}
        >
          <img className="h-3.5 w-3.5" src={eraserIcon} alt="" />
        </button>
        <button
          className={`rounded-full border px-1 py-0 text-[9px] ${
            isMutedText(thread.body)
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-400'
          }`}
          type="button"
          onClick={onToggleMute}
          aria-label="Toggle strikethrough"
        >
          -
        </button>
        <button
          className="rounded-full border border-gray-200 px-1 py-0 text-[9px] text-gray-400"
          type="button"
          onClick={onHide}
          disabled={isHidePending}
          aria-label={labels.archive}
        >
          ×
        </button>
      </div>
    </div>
  )
}
