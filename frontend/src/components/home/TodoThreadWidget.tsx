import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TodoItem, TodoPriority } from '../../lib/api'
import {
  createTodo,
  fetchAiSettings,
  requestBlockerRecommendations,
  updateTodo,
} from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'
import { uiTokens } from '../../lib/uiTokens'
import dotBlueIcon from '../../assets/dot-blue.svg?raw'
import dotGreenIcon from '../../assets/dot-green.svg?raw'
import dotRedIcon from '../../assets/dot-red.svg?raw'
import dotYellowIcon from '../../assets/dot-yellow.svg?raw'
import xIcon from '../../assets/x.svg?raw'
import { InlineIcon } from '../common/InlineIcon'

type TodoThreadWidgetProps = {
  todos: TodoItem[]
  isLoading: boolean
  isError: boolean
}

type RowNoteMap = Record<number, string | null>

type MissingFieldKey = 'task' | 'deadline' | 'priority' | 'blocker'

type TodoDraft = {
  priority: TodoPriority
  deadline: string
}

const DEFAULT_VISIBLE_TODO_COUNT = 5

const priorityOptions: { value: TodoPriority; label: string; icon: string }[] = [
  { value: 'BLUE', label: '파', icon: dotBlueIcon },
  { value: 'GREEN', label: '초', icon: dotGreenIcon },
  { value: 'YELLOW', label: '노', icon: dotYellowIcon },
  { value: 'RED', label: '빨', icon: dotRedIcon },
]

const getPriorityLabel = (value: TodoPriority) =>
  priorityOptions.find((option) => option.value === value)?.label ?? value

const getPriorityIcon = (value: TodoPriority) =>
  priorityOptions.find((option) => option.value === value)?.icon ?? dotBlueIcon

const getNextPriority = (value: TodoPriority) => {
  const index = priorityOptions.findIndex((option) => option.value === value)
  const nextIndex = index < 0 ? 0 : (index + 1) % priorityOptions.length
  return priorityOptions[nextIndex].value
}

export function TodoThreadWidget({ todos, isLoading, isError }: TodoThreadWidgetProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [rowNotes, setRowNotes] = useState<RowNoteMap>({})
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [showAllTodos, setShowAllTodos] = useState(false)
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null)
  const [draftTask, setDraftTask] = useState('')
  const [draftDeadline, setDraftDeadline] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
  })
  const [draftPriority, setDraftPriority] = useState<TodoPriority>('BLUE')
  const [draftBlocker, setDraftBlocker] = useState('')
  const [todoDrafts, setTodoDrafts] = useState<Record<string, TodoDraft>>({})
  const debounceTimersRef = useRef<Record<string, number>>({})
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const blockerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const visibleTodos = todos.filter((todo) => !todo.done)
  const hiddenTodoCount = Math.max(visibleTodos.length - DEFAULT_VISIBLE_TODO_COUNT, 0)
  const isShowingAllTodos = showAllTodos && hiddenTodoCount > 0
  const displayedTodos = isShowingAllTodos
    ? visibleTodos
    : visibleTodos.slice(0, DEFAULT_VISIBLE_TODO_COUNT)
  const visibleTodosById = new Map(visibleTodos.map((todo) => [todo.id, todo]))

  const aiSettingsQuery = useQuery({
    queryKey: queryKeys.ai.settings,
    queryFn: ({ signal }) => fetchAiSettings({ signal }),
  })

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TodoItem> }) =>
      updateTodo(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.todos.list, (old: TodoItem[] | undefined) => {
        if (!old) return old
        const next = old.map((item) => (item.id === updated.id ? updated : item))
        return next.sort((a, b) => a.deadline.localeCompare(b.deadline))
      })
    },
  })

  const recommendMutation = useMutation({
    mutationFn: requestBlockerRecommendations,
    onError: (error: Error) => {
      const message = error.message || t('todo.aiFailed')
      setRowNotes((prev) => ({ ...prev, [activeRowIndex ?? -1]: message }))
    },
    onSettled: () => {
      setActiveRowIndex(null)
    },
  })

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (created) => {
      setDraftTask('')
      const date = new Date()
      date.setDate(date.getDate() + 7)
      setDraftDeadline(date.toISOString().slice(0, 10))
      setDraftPriority('BLUE')
      setDraftBlocker('')
      setIsAddingTodo(false)
      queryClient.setQueryData(queryKeys.todos.list, (old: TodoItem[] | undefined) => {
        const next = [...(old ?? []), created]
        return next.sort((a, b) => a.deadline.localeCompare(b.deadline))
      })
    },
  })

  const formatDeadline = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return t('todo.emptyValue')
    }
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
      return trimmed
    }
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfTarget = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    const diffDays = Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / 86400000)
    if (diffDays > 0) {
      return `D-${diffDays}`
    }
    if (diffDays === 0) {
      return 'D-0'
    }
    return `D+${Math.abs(diffDays)}`
  }

  const renderSolutionText = (value: string) =>
    value.split(/\n|<br\s*\/?>/gi).map((part, idx, arr) => (
      <Fragment key={`solution-line-${idx}`}>
        {part}
        {idx < arr.length - 1 && <br />}
      </Fragment>
    ))

  const getMissingFields = (row: TodoItem): MissingFieldKey[] => {
    const missing: MissingFieldKey[] = []
    if (!row.task.trim()) missing.push('task')
    if (!row.deadline.trim()) missing.push('deadline')
    if (!row.priority.trim()) missing.push('priority')
    if (!row.blocker.trim()) missing.push('blocker')
    return missing
  }

  const formatMissingFields = (missing: MissingFieldKey[]) => {
    const labels = missing.map((key) => t(`todo.field.${key}`))
    return t('todo.missingFields', { fields: labels.join(', ') })
  }

  const handleAiClick = (row: TodoItem, rowIndex: number) => {
    setRowNotes((prev) => ({ ...prev, [rowIndex]: null }))
    if (!aiSettingsQuery.data?.hasApiKey) {
      setRowNotes((prev) => ({ ...prev, [rowIndex]: t('todo.aiKeyRequired') }))
      return
    }
    const missing = getMissingFields(row)
    if (missing.length > 0) {
      setRowNotes((prev) => ({ ...prev, [rowIndex]: formatMissingFields(missing) }))
      return
    }
    setActiveRowIndex(rowIndex)
    recommendMutation.mutate(
      {
        task: row.task,
        deadline: row.deadline,
        priority: getPriorityLabel(row.priority),
        blocker: row.blocker,
        currentSolution: row.solution,
      },
      {
        onSuccess: (data) => {
          const formatted = data.content.replace(/\r?\n/g, '<br>')
          updateTodoMutation.mutate({
            id: row.id,
            payload: { solution: formatted },
          })
          setRowNotes((prev) => ({ ...prev, [rowIndex]: t('todo.aiApplied') }))
        },
      },
    )
  }

  const handleToggleDone = (row: TodoItem) => {
    updateTodoMutation.mutate({ id: row.id, payload: { done: !row.done } })
  }

  const scheduleTodoUpdate = (id: string, payload: Partial<TodoItem>) => {
    const timerKey = `${id}:${Object.keys(payload).sort().join(',')}`
    const existing = debounceTimersRef.current[timerKey]
    if (existing) {
      window.clearTimeout(existing)
    }
    debounceTimersRef.current[timerKey] = window.setTimeout(() => {
      updateTodoMutation.mutate({ id, payload })
      delete debounceTimersRef.current[timerKey]
    }, 1000)
  }

  const getTodoDraft = (todo: TodoItem): TodoDraft => {
    const draft = todoDrafts[todo.id]
    if (draft) {
      return draft
    }
    return {
      priority: todo.priority,
      deadline: todo.deadline,
    }
  }

  const updateTodoDraft = (id: string, next: Partial<TodoDraft>) => {
    const base = visibleTodosById.get(id)
    setTodoDrafts((prev) => {
      const current = prev[id] ?? {
        priority: base?.priority ?? 'BLUE',
        deadline: base?.deadline ?? '',
      }
      return {
        ...prev,
        [id]: { ...current, ...next },
      }
    })
  }

  const handleEditableKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    ;(event.currentTarget as HTMLElement).blur()
  }

  const handleDateKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    event.currentTarget.blur()
  }

  const handleRowToggle = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('button,input,textarea,select,[contenteditable="true"]')) {
      return
    }
    setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  useEffect(() => {
    visibleTodos.forEach((todo) => {
      const taskEl = taskRefs.current[todo.id]
      if (taskEl && document.activeElement !== taskEl) {
        const next = todo.task || ''
        if (taskEl.textContent !== next) {
          taskEl.textContent = next
        }
      }
      const blockerEl = blockerRefs.current[todo.id]
      if (blockerEl && document.activeElement !== blockerEl) {
        const next = todo.blocker || ''
        if (blockerEl.textContent !== next) {
          blockerEl.textContent = next
        }
      }
    })
  }, [visibleTodos])

  const handleAddTodo = () => {
    const task = draftTask.trim()
    const deadline = draftDeadline.trim()
    if (!task || !deadline) {
      return
    }
    createTodoMutation.mutate({
      task,
      deadline,
      priority: draftPriority,
      blocker: draftBlocker.trim(),
    })
  }

  if (isLoading) {
    return (
      <div className={`${uiTokens.card.surface} text-sm text-[var(--theme-muted)]`}>
        {t('common.loading')}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`${uiTokens.card.surface} text-sm text-[var(--theme-muted)]`}>
        {t('todo.loadFailed')}
      </div>
    )
  }

  return (
    <div className={`${uiTokens.card.surface} space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="pl-2 pt-2 text-sm font-semibold leading-none sm:pl-0">{t('todo.title')}</div>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-muted)]"
          onClick={() => setIsAddingTodo((prev) => !prev)}
          aria-label={isAddingTodo ? t('common.cancel') : t('todo.add')}
        >
          <InlineIcon
            svg={xIcon}
            className={`${isAddingTodo ? '' : 'rotate-45'} [&>svg]:h-2.5 [&>svg]:w-2.5`}
          />
        </button>
      </div>
      {isAddingTodo ? (
        <div className="space-y-2 rounded-md border border-dashed border-[var(--theme-border)] bg-[var(--theme-base)] p-3 text-xs">
          <div className="text-[11px] font-semibold text-[var(--theme-muted)]">
            {t('todo.addTitle')}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--theme-border)] text-[var(--theme-muted)]"
              onClick={() => setDraftPriority((prev) => getNextPriority(prev))}
              aria-label={t('todo.field.priority')}
            >
              <InlineIcon svg={getPriorityIcon(draftPriority)} className="[&>svg]:h-3 [&>svg]:w-3" />
            </button>
            <input
              type="text"
              className={`${uiTokens.input.base} px-2 py-1 text-xs`}
              placeholder={t('todo.field.task')}
              value={draftTask}
              onChange={(event) => setDraftTask(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className={`${uiTokens.input.base} w-[200px] px-2 py-1 text-xs`}
              value={draftDeadline}
              onChange={(event) => setDraftDeadline(event.target.value)}
            />
            <div className="text-[11px] text-[var(--theme-muted)]">
              {draftDeadline ? formatDeadline(draftDeadline) : t('todo.emptyValue')}
            </div>
          </div>
        <input
          type="text"
          className={`${uiTokens.input.base} px-2 py-1 text-xs`}
          placeholder={t('todo.field.blocker')}
          value={draftBlocker}
          onChange={(event) => setDraftBlocker(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') {
              return
            }
            event.preventDefault()
            handleAddTodo()
          }}
        />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={uiTokens.button.primaryXs}
              onClick={handleAddTodo}
              disabled={createTodoMutation.isPending}
            >
              {t('todo.add')}
            </button>
          </div>
        </div>
      ) : null}
      {visibleTodos.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--theme-border)] bg-[var(--theme-base)] p-3 text-xs text-[var(--theme-muted)]">
          {t('todo.empty')}
        </div>
      ) : (
        <>
          <div
            className="max-h-[400px] space-y-0.5 overflow-y-auto pr-1 scrollbar-hidden mask-scroll"
          >
            {displayedTodos.map((row, index) => {
              const isDone = row.done
              const note = rowNotes[index]
              const isAiLoading = activeRowIndex === index && recommendMutation.isPending
              const draft = getTodoDraft(row)
              const priority = priorityOptions.find((option) => option.value === draft.priority)
              const isEditingDeadline = editingDeadlineId === row.id
              const isExpanded = Boolean(expandedRows[row.id])
              const rowToneClass = isDone
                ? 'border-emerald-200 bg-emerald-50'
                : isExpanded
                  ? 'border-[color:rgb(188_193_200_/_0.82)] bg-[var(--theme-surface)]'
                  : 'border-[var(--theme-border)] bg-[var(--theme-base)]'
              return (
                <div
                  key={`todo-row-${index}`}
                  className={`cursor-pointer rounded-lg border text-xs ${rowToneClass} ${isExpanded ? 'p-3' : 'px-1.5 py-1.5 hover:bg-[color:rgb(236_237_238_/_0.28)]'}`}
                  onClick={(event) => handleRowToggle(event, row.id)}
                >
                  <div className={`flex items-start ${isExpanded ? 'gap-2' : 'gap-1'}`}>
                    {priority && (
                      <button
                        type="button"
                        className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-[var(--theme-muted)]"
                        onClick={() => {
                          const next = getNextPriority(draft.priority)
                          updateTodoDraft(row.id, { priority: next })
                          scheduleTodoUpdate(row.id, { priority: next })
                        }}
                        aria-label={t('todo.field.priority')}
                      >
                        <InlineIcon svg={priority.icon} className="[&>svg]:h-3 [&>svg]:w-3" />
                      </button>
                    )}
                    <div
                      role="textbox"
                      contentEditable={isExpanded}
                      suppressContentEditableWarning
                      className={`flex-1 rounded-md outline-none ${isDone ? 'line-through' : ''} ${isExpanded ? 'min-h-[20px] px-2 py-1 text-xs font-semibold text-[var(--theme-ink)]' : 'min-h-[16px] px-0.5 py-0 text-[13px] font-normal leading-[1.25] text-[color:rgb(11_15_24_/_0.88)]'}`}
                      ref={(el) => {
                        taskRefs.current[row.id] = el
                      }}
                      onInput={(event) => {
                        const next = event.currentTarget.textContent ?? ''
                        scheduleTodoUpdate(row.id, { task: next })
                      }}
                      onKeyDown={handleEditableKeyDown}
                      aria-label={t('todo.field.task')}
                    />
                    <div
                      className={`flex w-[8ch] shrink-0 items-center justify-end text-[11px] text-[color:rgb(47_59_74_/_0.82)] tabular-nums ${isExpanded ? 'gap-1.5 pl-1' : 'gap-0.5 pl-0'}`}
                    >
                      {isEditingDeadline ? (
                        <input
                          type="date"
                          className={`${uiTokens.input.base} w-[140px] px-2 py-0.5 text-[11px]`}
                          value={draft.deadline}
                          onChange={(event) => {
                            const next = event.target.value
                            updateTodoDraft(row.id, { deadline: next })
                            scheduleTodoUpdate(row.id, { deadline: next })
                          }}
                          onBlur={() => setEditingDeadlineId(null)}
                          onKeyDown={handleDateKeyDown}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="font-medium text-[color:rgb(47_59_74_/_0.82)] leading-none"
                          onClick={() => setEditingDeadlineId(row.id)}
                          aria-label={t('todo.field.deadline')}
                        >
                          {formatDeadline(draft.deadline)}
                        </button>
                      )}
                      <button
                        type="button"
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none ${
                          isDone
                            ? 'bg-[color:rgb(16_185_129_/_0.16)] text-[color:rgb(21_128_61_/_0.92)]'
                            : 'text-[color:rgb(88_93_104_/_0.78)] hover:text-[color:rgb(88_93_104_/_0.95)]'
                        }`}
                        onClick={() => handleToggleDone(row)}
                        disabled={updateTodoMutation.isPending}
                        aria-label={isDone ? t('todo.undo') : t('todo.complete')}
                      >
                        <span aria-hidden="true">✓</span>
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="pt-[2px] font-medium text-[color:rgb(88_93_104_/_0.92)]">
                          {t('todo.field.blocker')}
                        </div>
                        <div
                          role="textbox"
                          contentEditable
                          suppressContentEditableWarning
                          className="min-h-[20px] flex-1 rounded-md px-2 py-1 text-xs outline-none"
                          ref={(el) => {
                            blockerRefs.current[row.id] = el
                          }}
                          onInput={(event) => {
                            const next = event.currentTarget.textContent ?? ''
                            scheduleTodoUpdate(row.id, { blocker: next })
                          }}
                          onKeyDown={handleEditableKeyDown}
                          aria-label={t('todo.field.blocker')}
                        />
                      </div>
                      <div className="mt-1 pl-[1px]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-start gap-2">
                            <div className="font-medium text-[color:rgb(88_93_104_/_0.92)]">
                              {t('todo.field.solution')}
                            </div>
                            {(() => {
                              const rawValue = row.solution || ''
                              return (
                                <div className="whitespace-pre-wrap text-left text-[11px]">
                                  {renderSolutionText(rawValue)}
                                </div>
                              )
                            })()}
                          </div>
                          <button
                            type="button"
                            className={`${uiTokens.button.secondaryXs} ${isAiLoading ? 'opacity-70' : ''}`}
                            onClick={() => handleAiClick(row, index)}
                            disabled={isAiLoading}
                          >
                            {isAiLoading ? t('todo.aiLoading') : t('todo.aiButton')}
                          </button>
                        </div>
                        {note && <div className="mt-2 text-[11px] text-[var(--theme-muted)]">{note}</div>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {hiddenTodoCount > 0 && (
            <button
              type="button"
              className="flex h-6 w-full items-center justify-center rounded-md text-[10px] text-[color:rgb(88_93_104_/_0.92)] hover:bg-[color:rgb(236_237_238_/_0.28)]"
              onClick={() => setShowAllTodos((prev) => !prev)}
            >
              {isShowingAllTodos ? t('thread.hide') : `${t('common.more')} +${hiddenTodoCount}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
