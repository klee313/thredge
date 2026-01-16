import { useTranslation } from 'react-i18next'
import { uiTokens } from '../../lib/uiTokens'
import { InlineIcon } from '../common/InlineIcon'
import xIcon from '../../assets/x.svg?raw'

type SearchFormProps = {
    value: string
    onChange: (value: string) => void
    onSearch: (query: string) => void
    onClear: () => void
}

export function SearchForm({ value, onChange, onSearch, onClear }: SearchFormProps) {
    const { t } = useTranslation()

    return (
        <form
            className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
            onSubmit={(event) => {
                event.preventDefault()
                onSearch(value)
            }}
        >
            <div className="relative w-full max-w-sm">
                <input
                    className={`${uiTokens.input.base} ${uiTokens.input.paddingMdWide} pr-12`}
                    placeholder={t('home.searchPlaceholder')}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                {value && (
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--theme-muted)] hover:opacity-80"
                        type="button"
                        onClick={() => {
                            onChange('')
                            onClear()
                        }}
                        aria-label="Clear search"
                    >
                        <InlineIcon svg={xIcon} className="[&>svg]:h-3 [&>svg]:w-3" />
                    </button>
                )}
            </div>
            <button
                className={`w-full sm:w-auto ${uiTokens.button.secondaryMd}`}
                type="submit"
            >
                {t('home.searchTab')}
            </button>
        </form>
    )
}
