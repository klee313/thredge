import { useMemo } from 'react'
import type { CategorySummary, ThreadFeedItem, EntryMovePosition } from '../lib/api'
import type { useHomeFeedController } from './useHomeFeedController'
import type { ThreadCardActions, ThreadCardData, ThreadCardUi } from '../components/home/types'
import { toggleMutedText } from '../lib/mutedText'

type UseThreadCardAdapterParams = {
  controller: ReturnType<typeof useHomeFeedController>
  thread: ThreadFeedItem
  categories: CategorySummary[]
}

export const useThreadCardAdapter = ({
  controller,
  thread,
  categories,
}: UseThreadCardAdapterParams): {
  data: ThreadCardData
  ui: ThreadCardUi
  actions: ThreadCardActions
} => {
  const {
    state,
    actions,
    mutations,
    normalizedSearchQuery,
    ui,
  } = controller
  const {
    entryDrafts,
    replyDrafts,
    activeReplyId,
    editingThreadId,
    editingThreadBody,
    editingThreadCategories,
    editingCategoryInput,
    editingEntryId,
    editingEntryBody,
  } = state
  const {
    threadActions,
    entryActions,
    replyActions,
    setEntryComposerFocusId,
    setReplyComposerFocusId,
    clearEntryComposerFocus,
    clearReplyComposerFocus,
    submitEditingCategory,
  } = actions
  const {
    createCategoryMutation,
    createEntryMutation,
    createReplyMutation,
    moveEntryToMutation,
    updateThreadMutation,
    toggleThreadMuteMutation,
    hideThreadMutation,
    pinThreadMutation,
    unpinThreadMutation,
    updateEntryMutation,
    toggleEntryMuteMutation,
    hideEntryMutation,
  } = mutations

  const theme = useMemo(
    () => ({
      card: `border-[var(--theme-border)] ${thread.pinned ? 'bg-[var(--theme-base)]' : 'bg-[var(--theme-surface)]'}`,
      entry: 'border-[var(--theme-border)] bg-[var(--theme-soft)]',
    }),
    [thread.pinned],
  )
  const isEditing = editingThreadId === thread.id

  const data = useMemo<ThreadCardData>(
    () => ({
      thread,
      theme,
      categories,
      normalizedSearchQuery,
      linkTo: `/threads/${thread.id}`,
    }),
    [categories, normalizedSearchQuery, theme, thread],
  )

  const uiProps = useMemo<ThreadCardUi>(
    () => ({
      isEditing,
      editingThreadBody,
      editingThreadCategories,
      editingCategoryInput,
      editingEntryId,
      editingEntryBody,
      activeReplyId,
      replyDrafts,
      newEntryDraft: entryDrafts[thread.id] ?? '',
      isUpdateThreadPending: updateThreadMutation.isPending,
      isCreateCategoryPending: createCategoryMutation.isPending,
      isPinPending: pinThreadMutation.isPending,
      isUnpinPending: unpinThreadMutation.isPending,
      isHidePending: hideThreadMutation.isPending,
      isEntryUpdatePending: updateEntryMutation.isPending,
      isEntryHidePending: hideEntryMutation.isPending,
      isEntryToggleMutePending: toggleEntryMuteMutation.isPending,
      isEntryMovePending: moveEntryToMutation.isPending,
      isReplyPending: createReplyMutation.isPending,
      isAddEntryPending: createEntryMutation.isPending,
      entryComposerFocusId: ui.entryComposerFocusId,
      onEntryComposerFocusHandled: clearEntryComposerFocus,
      replyComposerFocusId: ui.replyComposerFocusId,
      onReplyComposerFocusHandled: clearReplyComposerFocus,
    }),
    [
      activeReplyId,
      clearEntryComposerFocus,
      clearReplyComposerFocus,
      createCategoryMutation.isPending,
      createEntryMutation.isPending,
      createReplyMutation.isPending,
      editingCategoryInput,
      editingEntryBody,
      editingEntryId,
      editingThreadBody,
      editingThreadCategories,
      entryDrafts,
      hideEntryMutation.isPending,
      hideThreadMutation.isPending,
      isEditing,
      moveEntryToMutation.isPending,
      pinThreadMutation.isPending,
      replyDrafts,
      thread.id,
      toggleEntryMuteMutation.isPending,
      unpinThreadMutation.isPending,
      updateEntryMutation.isPending,
      updateThreadMutation.isPending,
      ui.entryComposerFocusId,
      ui.replyComposerFocusId,
    ],
  )

  const cardActions = useMemo<ThreadCardActions>(
    () => ({
      onStartEdit: () => threadActions.startEditThread(thread),
      onCancelEdit: threadActions.cancelEditThread,
      onEditingThreadBodyChange: threadActions.setEditingThreadBody,
      onEditingCategoryToggle: threadActions.toggleEditingCategory,
      onEditingCategoryInputChange: threadActions.setEditingCategoryInput,
      onEditingCategoryCancel: () => {
        threadActions.setEditingCategoryInput('')
        threadActions.setIsAddingEditingCategory(false)
      },
      onEditingCategorySubmit: submitEditingCategory,
      onSaveEdit: (value: string) => {
        updateThreadMutation.mutate({
          threadId: thread.id,
          body: value,
          categoryNames: editingThreadCategories,
        })
      },
      onTogglePin: () => {
        if (thread.pinned) {
          unpinThreadMutation.mutate(thread.id)
        } else {
          pinThreadMutation.mutate(thread.id)
        }
      },
      onToggleMute: (value: string) => {
        if (!value.trim()) {
          return
        }
        toggleThreadMuteMutation.mutate({
          threadId: thread.id,
          body: toggleMutedText(value),
          categoryNames: thread.categories.map((item) => item.name),
        })
      },
      onHide: () => hideThreadMutation.mutate(thread.id),
      onEntryEditStart: (entryId: string, body: string) =>
        entryActions.startEntryEdit({ id: entryId, body }),
      onEntryEditChange: entryActions.setEditingEntryBody,
      onEntryEditCancel: entryActions.cancelEntryEdit,
      onEntryEditSave: (entryId: string, value?: string) => {
        const body = value ?? editingEntryBody
        updateEntryMutation.mutate({ entryId, body, threadId: thread.id })
      },
      onEntryToggleMute: (entryId: string, body: string) => {
        toggleEntryMuteMutation.mutate({ entryId, body, threadId: thread.id })
      },
      onEntryHide: (entryId: string) => hideEntryMutation.mutate({ entryId, threadId: thread.id }),
      onEntryMoveTo: async (
        entryId: string,
        targetEntryId: string,
        position: EntryMovePosition,
      ) => {
        await moveEntryToMutation.mutateAsync({
          entryId,
          targetEntryId,
          position,
          threadId: thread.id,
        })
      },
      onReplyStart: (entryId: string) => {
        setReplyComposerFocusId(`reply:${entryId}`)
        replyActions.startReply(entryId)
      },
      onReplyChange: (entryId: string, value: string) =>
        replyActions.updateReplyDraft(entryId, value),
      onReplyCancel: replyActions.cancelReply,
      onReplySubmit: (entryId: string, value: string) => {
        if (!value.trim()) {
          return
        }
        createReplyMutation.mutate({
          body: value,
          parentEntryId: entryId,
          threadId: thread.id,
        })
      },
      onNewEntryChange: (value: string) => entryActions.updateEntryDraft(thread.id, value),
      onNewEntrySubmit: (value: string) =>
        createEntryMutation.mutate({ body: value, threadId: thread.id }),
    }),
    [
      createEntryMutation,
      createReplyMutation,
      editingEntryBody,
      editingThreadCategories,
      entryActions,
      hideEntryMutation,
      hideThreadMutation,
      moveEntryToMutation,
      pinThreadMutation,
      replyActions,
      setReplyComposerFocusId,
      submitEditingCategory,
      thread,
      threadActions,
      toggleEntryMuteMutation,
      toggleThreadMuteMutation,
      unpinThreadMutation,
      updateEntryMutation,
      updateThreadMutation,
    ],
  )

  return {
    data,
    ui: uiProps,
    actions: cardActions,
  }
}
