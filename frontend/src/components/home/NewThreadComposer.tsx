import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uiTokens } from '../../lib/uiTokens'
import { AutosizeTextarea } from '../common/AutosizeTextarea'
import { useDebouncedValue } from '../../lib/useDebouncedValue'

type NewThreadComposerProps = {
    value: string
    onChange: (value: string) => void
    onSubmit: (value: string) => void
    isSubmitting: boolean
}

export function NewThreadComposer({
    value: initialValue,
    onChange,
    onSubmit,
    isSubmitting,
}: NewThreadComposerProps) {
    const { t } = useTranslation()
    const [localValue, setLocalValue] = useState(initialValue)
    const debouncedValue = useDebouncedValue(localValue, 500)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // Sync from prop to local if prop changes meaningfully (e.g. clear after submit)
    // We need to be careful not to overwrite user input if the prop lag updates.
    // But typically initialValue (state.threadBody) will only NOT match localValue if:
    // 1. User is typing (local is newer).
    // 2. Submission cleared it (prop is '').
    // We can track the "last known prop" to detect external updates.
    const lastPropRef = useRef(initialValue)

    if (initialValue !== lastPropRef.current) {
        if (initialValue === '') {
            // External clear
            if (localValue !== '') { // Only set if not already empty to avoid loops/renders
                setLocalValue('')
            }
        }
        lastPropRef.current = initialValue
    }

    // Sync local to parent (debounced)
    useEffect(() => {
        // Only invoke onChange if it differs from what parent likely has
        // But parent has 'value'. 
        // Actually, simply calling onChange(debouncedValue) is safe because parent update won't cycle back 
        // immediately to overwrite local due to the check above (initialValue !== lastPropRef.current).
        // HOWEVER, if parent persistence assumes real-time, 500ms delay might be ok.
        onChange(debouncedValue)
    }, [debouncedValue, onChange])

    return (
        <form
            className="mt-2 space-y-2 sm:mt-3"
            onSubmit={(event) => {
                event.preventDefault()
                if (!localValue.trim()) {
                    return
                }
                onSubmit(localValue)
            }}
        >
            <AutosizeTextarea
                className="min-h-[96px] w-full resize-none overflow-y-hidden rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)] placeholder:opacity-60"
                placeholder={t('home.threadBodyPlaceholder')}
                value={localValue}
                onChange={setLocalValue}
                inputRef={(element) => {
                    textareaRef.current = element
                }}
            />
            <button
                className={uiTokens.button.primaryMd}
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? t('common.loading') : t('home.createThread')}
            </button>
        </form>
    )
}
