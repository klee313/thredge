import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uiTokens } from '../../lib/uiTokens'
import { InlineIcon } from '../common/InlineIcon'
import xIcon from '../../assets/x.svg?raw'
import searchIcon from '../../assets/search.svg?raw'
import { SearchDropdown, type SearchDropdownProps } from './SearchDropdown'

type SearchFormProps = {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  onClear: () => void
  dropdown?: SearchDropdownProps
}

export function SearchForm({
  value,
  onChange,
  onSearch,
  onClear,
  dropdown,
}: SearchFormProps) {
  const { t } = useTranslation()
  const isComposingRef = useRef(false)
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null)
  const [draftValue, setDraftValue] = useState(value)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownEnabled = Boolean(dropdown)
  const trimmedQuery = draftValue.trim()

  useEffect(() => {
    if (!isComposingRef.current) {
      setDraftValue(value)
    }
  }, [value])

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!trimmedQuery) {
          onClear()
          return
        }
        onSearch(trimmedQuery)
        if (dropdownEnabled) {
          setIsDropdownOpen(false)
        }
      }}
    >
      <div
        ref={dropdownContainerRef}
        className={`relative transition-[width] duration-150 ${
          dropdownEnabled && isDropdownOpen
            ? 'w-[calc(100vw-3rem)] -ml-6 sm:w-[min(28rem,70vw)] sm:ml-0'
            : 'w-[min(15rem,90vw)] sm:w-[min(20rem,70vw)]'
        }`}
        onFocusCapture={() => {
          if (dropdownEnabled) {
            setIsDropdownOpen(true)
          }
        }}
        onBlurCapture={(event) => {
          if (!dropdownEnabled) {
            return
          }
          const container = event.currentTarget
          window.setTimeout(() => {
            if (!container.contains(document.activeElement)) {
              setIsDropdownOpen(false)
            }
          }, 0)
        }}
      >
        <label className="sr-only" htmlFor="thread-search-input">
          {t('home.searchPlaceholder')}
        </label>
        <input
          id="thread-search-input"
          className={`${uiTokens.input.base} ${
            'px-3 py-1.5 text-xs'
          } pr-16 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]`}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          autoComplete="off"
          value={draftValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setDraftValue(nextValue)
            if (!isComposingRef.current) {
              onChange(nextValue)
            }
          }}
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onCompositionEnd={(event) => {
            isComposingRef.current = false
            const nextValue = event.currentTarget.value
            setDraftValue(nextValue)
            onChange(nextValue)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && dropdownEnabled) {
              setIsDropdownOpen(false)
            }
          }}
        />
        {draftValue && (
          <button
            className="absolute right-9 top-1/2 -translate-y-1/2 text-sm text-[var(--theme-muted)] hover:opacity-80"
            type="button"
            onClick={() => {
              setDraftValue('')
              onChange('')
              onClear()
            }}
            aria-label={t('common.clear')}
          >
            <InlineIcon svg={xIcon} className="[&>svg]:h-3 [&>svg]:w-3" />
          </button>
        )}
        <button
          className="absolute right-3 top-[55%] -translate-y-1/2 text-[var(--theme-muted)] hover:opacity-80 sm:top-1/2"
          type="button"
          aria-label={t('home.searchPlaceholder')}
          onClick={() => {
            if (!trimmedQuery) {
              return
            }
            onSearch(trimmedQuery)
            if (dropdownEnabled) {
              setIsDropdownOpen(false)
            }
          }}
        >
          <InlineIcon svg={searchIcon} className="[&>svg]:h-4 [&>svg]:w-4" />
        </button>
        {dropdownEnabled && isDropdownOpen && dropdown && (
          <SearchDropdown
            {...dropdown}
            query={draftValue}
            onQueryChange={(nextValue) => {
              setDraftValue(nextValue)
              onChange(nextValue)
            }}
            onSearch={(query) => {
              onSearch(query)
              setIsDropdownOpen(false)
            }}
            onRequestClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </form>
  )
}
