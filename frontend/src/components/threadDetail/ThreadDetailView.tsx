import { useTranslation } from 'react-i18next'
import { ErrorNotice } from '../common/ErrorNotice'
import { ThreadCardHeader } from '../home/ThreadCardHeader'
import { ThreadEditor } from '../home/ThreadEditor'
import { ThreadBodyDisplay } from '../home/ThreadBodyDisplay'
import { ThreadDetailHeader } from './ThreadDetailHeader'
import { ThreadDetailEntries } from './ThreadDetailEntries'
import { createEntryListActions } from '../../hooks/useEntryListActions'
import { toggleMutedText } from '../../lib/mutedText'
import type { EntryDetail } from '../../lib/api'

type ThreadDetailViewProps = {
  controller: ReturnType<typeof import('../../hooks/useThreadDetailController').useThreadDetailController>
  onBack: () => void
}

export function ThreadDetailView({ controller, onBack }: ThreadDetailViewProps) {
  const { t } = useTranslation()
  const {
    threadId,
    threadQuery,
    categoriesQuery,
    createCategoryMutation,
    submitCategory,
    entryBody,
    replyDrafts,
    activeReplyId,
    editingEntryId,
    editingEntryBody,
    isEditingThread,
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
    entryComposerFocusId,
    replyComposerFocusId,
    setReplyComposerFocusId,
    clearEntryComposerFocus,
    clearReplyComposerFocus,
    createEntryMutation,
    createReplyMutation,
    moveEntryToMutation,
    entryError,
    clearEntryError,
    threadError,
    threadEntryError,
    clearThreadError,
    clearThreadEntryError,
    reportEntryError,
    updateThreadMutation,
    toggleThreadMuteMutation,
    hideThreadMutation,
    pinThreadMutation,
    unpinThreadMutation,
    updateEntryMutation,
    toggleEntryMuteMutation,
    hideEntryMutation,
    entryActions,
    threadActions,
    replyActions,
    dragState,
    dragError,
    handleDragStart,
    handleDragEnd,
    renderDropIndex,
    dropDepth,
    renderDropIndicator,
    entryDepth,
    orderedEntries,
    theme,
    threadDisplay,
  } = controller

  if (!threadId) {
    return (
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 text-[var(--theme-ink)]">
        {t('thread.missing')}
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      <ThreadDetailHeader
        onBack={onBack}
        lastActivityAt={threadQuery.data?.lastActivityAt}
      />

      <div
        className={`relative rounded-xl border pl-2 pr-1 pt-8 pb-1 shadow-sm sm:px-6 sm:py-5 ${theme.card}`}
      >
        <div className="pointer-events-none absolute left-0 top-0 h-0.5 w-full rounded-t-xl bg-[var(--theme-border)]" />
        {(threadError || threadEntryError || entryError) && (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <div>{t('common.actionFailed')}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <button
                className="rounded-md border border-amber-300 px-2 py-0.5"
                type="button"
                onClick={() => {
                  clearThreadError()
                  clearThreadEntryError()
                  clearEntryError()
                }}
              >
                {t('common.dismiss')}
              </button>
            </div>
          </div>
        )}
        {threadQuery.isLoading && <div>{t('common.loading')}</div>}
        {threadQuery.isError && <ErrorNotice message={t('thread.error')} />}
        {threadQuery.data && (
          <>
            <ThreadCardHeader
              thread={threadQuery.data}
              isEditing={isEditingThread}
              editingThreadCategories={editingThreadCategories}
              isPinPending={pinThreadMutation.isPending}
              isUnpinPending={unpinThreadMutation.isPending}
              isHidePending={hideThreadMutation.isPending}
              labels={{
                pin: t('home.pin'),
                unpin: t('home.unpin'),
                edit: t('common.edit'),
                archive: t('common.archive'),
              }}
              onTogglePin={() => {
                if (threadQuery.data.pinned) {
                  unpinThreadMutation.mutate(threadQuery.data.id)
                } else {
                  pinThreadMutation.mutate(threadQuery.data.id)
                }
              }}
              onStartEdit={() => threadActions.startEditThread(threadQuery.data)}
              onHide={() => hideThreadMutation.mutate(threadQuery.data.id)}
              onEditingCategoryToggle={threadActions.toggleEditingCategory}
            />
            {isEditingThread ? (
              <div
                className={(() => {
                  return threadDisplay.hasDerivedTitle ? '' : 'mt-6'
                })()}
              >
                <ThreadEditor
                  value={editingThreadBody}
                  onChange={threadActions.setEditingThreadBody}
                  onSave={() =>
                    updateThreadMutation.mutate({
                      threadId: threadQuery.data.id,
                      body: editingThreadBody,
                      categoryNames: editingThreadCategories,
                    })
                  }
                  onCancel={() => threadActions.cancelEditThread(threadQuery.data)}
                  onComplete={(value) => {
                    const base = value.trim() ? value : threadQuery.data.body
                    if (!base) {
                      return
                    }
                    toggleThreadMuteMutation.mutate({
                      threadId: threadQuery.data.id,
                      body: toggleMutedText(base),
                      categoryNames: threadQuery.data.categories.map((item) => item.name),
                    })
                  }}
                  categories={categoriesQuery.data ?? []}
                  selectedCategories={editingThreadCategories}
                  editingCategoryInput={editingCategoryInput}
                  isCreateCategoryPending={createCategoryMutation.isPending}
                  isSaving={updateThreadMutation.isPending}
                  buttonSize="md"
                  onToggleCategory={threadActions.toggleEditingCategory}
                  onCategoryInputChange={threadActions.setEditingCategoryInput}
                  onCategoryCancel={() => {
                    threadActions.setEditingCategoryInput('')
                    threadActions.setIsAddingEditingCategory(false)
                  }}
                  onCategorySubmit={submitCategory}
                  labels={{
                    save: t('common.save'),
                    saving: t('common.loading'),
                    cancel: t('common.cancel'),
                    complete: t('common.complete'),
                    categorySearchPlaceholder: t('home.categorySearchPlaceholder'),
                    addCategory: t('home.addCategory'),
                    cancelCategory: t('common.cancel'),
                    loadMore: t('home.loadMore'),
                  }}
                />
              </div>
            ) : (
              <ThreadBodyDisplay
                displayTitle={threadDisplay.displayTitle}
                bodyText={threadDisplay.bodyText ?? null}
                isMuted={threadDisplay.isMuted}
                bodySpacingClass={threadDisplay.bodySpacingClass}
                hasHtmlLineBreaks={threadDisplay.hasHtmlLineBreaks}
                highlightQuery=""
              />
            )}
            {dragError && <div className="mt-3 text-xs text-red-600">{dragError}</div>}
            <ThreadDetailEntries
              orderedEntries={orderedEntries}
              entryDepth={entryDepth}
              themeEntryClass={theme.entry}
              highlightQuery=""
              renderDropIndex={renderDropIndex}
              dropDepth={dropDepth}
              renderDropIndicator={renderDropIndicator}
              keyPrefix={`detail-${threadId ?? 'unknown'}`}
              isError={false}
              errorMessage={t('thread.error')}
              ui={{
                editingEntryId,
                editingEntryBody,
                activeReplyId,
                replyDrafts,
                isEntryUpdatePending: updateEntryMutation.isPending,
                isEntryHidePending: hideEntryMutation.isPending,
                isEntryToggleMutePending: toggleEntryMuteMutation.isPending,
                isEntryMovePending: moveEntryToMutation.isPending,
                isReplyPending: createReplyMutation.isPending,
                dragState,
                replyComposerFocusId,
                onReplyComposerFocusHandled: clearReplyComposerFocus,
              }}
              actions={createEntryListActions({
                onEditStart: (entry: EntryDetail) => entryActions.startEntryEdit(entry),
                onEditChange: (val) => {
                  entryActions.setEditingEntryBody(val)
                },
                onEditCancel: entryActions.cancelEntryEdit,
                onEditSave: (entry, val) => {
                  const bodyToSave = val ?? editingEntryBody
                  void updateEntryMutation
                    .mutateAsync({
                      entryId: entry.id,
                      body: bodyToSave,
                      threadId,
                    })
                    .then(() => {
                      entryActions.cancelEntryEdit()
                    })
                    .catch((error) => {
                      reportEntryError('updateEntry', error)
                    })
                },
                onToggleMute: (entry, nextBody) => {
                  void toggleEntryMuteMutation.mutateAsync({
                    entryId: entry.id,
                    body: nextBody,
                    threadId,
                  })
                },
                onHide: (entry) => hideEntryMutation.mutate({ entryId: entry.id }),
                onDragStart: handleDragStart,
                onDragEnd: handleDragEnd,
                onReplyStart: (entry) => {
                  setReplyComposerFocusId(`reply:${entry.id}`)
                  replyActions.startReply(entry.id)
                },
                onReplyChange: (entry, value) => replyActions.updateReplyDraft(entry.id, value),
                onReplyCancel: replyActions.cancelReply,
                onReplySubmit: (entry, value) => {
                  const body = value?.trim()
                  if (!body) {
                    return
                  }
                  createReplyMutation.mutate({
                    body,
                    parentEntryId: entry.id,
                  })
                },
              })}
              composer={{
                value: entryBody,
                placeholder: t('common.entryPlaceholder'),
                onChange: entryActions.setEntryBody,
                onSubmit: (value) =>
                  createEntryMutation.mutate({
                    body: value,
                  }),
                isSubmitting: createEntryMutation.isPending,
                labels: { submit: t('common.addEntry'), submitting: t('common.loading') },
                focusId: threadId ? `entry:${threadId}` : undefined,
                activeFocusId: entryComposerFocusId,
                onFocusHandled: clearEntryComposerFocus,
              }}
              lastActivityAt={threadQuery.data?.lastActivityAt}
              lastActivityLabel={(relative) => t('home.lastActivity', { time: relative })}
            />
          </>
        )}
      </div>
    </div>
  )
}
