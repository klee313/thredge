import { useCallback, useState } from 'react'

export const useComposerFocusState = () => {
  const [entryComposerFocusId, setEntryComposerFocusId] = useState<string | null>(null)
  const [replyComposerFocusId, setReplyComposerFocusId] = useState<string | null>(null)

  const clearEntryComposerFocus = useCallback(() => setEntryComposerFocusId(null), [])
  const clearReplyComposerFocus = useCallback(() => setReplyComposerFocusId(null), [])

  return {
    entryComposerFocusId,
    replyComposerFocusId,
    setEntryComposerFocusId,
    setReplyComposerFocusId,
    clearEntryComposerFocus,
    clearReplyComposerFocus,
  }
}
