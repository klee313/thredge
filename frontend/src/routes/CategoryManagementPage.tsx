import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../App'
import { SettingsCategoriesSection } from '../components/settings/SettingsCategoriesSection'
import { useCategoryMutations } from '../hooks/useCategoryMutations'
import { fetchCategories } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useGlobalErrorStore } from '../store/globalErrorStore'
import type { SettingsCategory } from '../components/settings/SettingsCategoriesSection'

export function CategoryManagementPage() {
  const { t } = useTranslation()
  const { authQuery } = useOutletContext<AppOutletContext>()
  const { setError: setGlobalError } = useGlobalErrorStore()
  const [newCategory, setNewCategory] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => fetchCategories({ signal }),
    enabled: Boolean(authQuery.data),
    meta: { suppressGlobalError: true },
  })

  const { createCategoryMutation, updateCategoryMutation, deleteCategoryMutation } =
    useCategoryMutations({
      invalidateThreadsFeed: true,
      onCreateSuccess: () => {
        setNewCategory('')
      },
      onUpdateSuccess: () => {
        setEditingCategoryId(null)
        setEditingCategoryName('')
      },
      onCreateError: (error) => {
        const message = error instanceof Error ? error.message : t('settings.error')
        setGlobalError(message, { source: 'ui' })
      },
      onUpdateError: (error) => {
        const message = error instanceof Error ? error.message : t('settings.error')
        setGlobalError(message, { source: 'ui' })
      },
      onDeleteError: (error) => {
        const message = error instanceof Error ? error.message : t('settings.error')
        setGlobalError(message, { source: 'ui' })
      },
    })

  return (
    <div className="space-y-2 sm:space-y-4">
      <h1 className="text-xl font-semibold">{t('nav.manageCategories')}</h1>
      {!authQuery.data && (
        <div className="text-sm text-[var(--theme-muted)]">
          {t('settings.categoriesLoginRequired')}
        </div>
      )}
      {authQuery.data && (
        <SettingsCategoriesSection
          title={t('settings.categories')}
          placeholder={t('settings.categoryPlaceholder')}
          addLabel={t('settings.add')}
          saveLabel={t('settings.save')}
          cancelLabel={t('settings.cancel')}
          editLabel={t('settings.edit')}
          deleteLabel={t('settings.delete')}
          loadingLabel={t('settings.loading')}
          errorLabel={t('settings.error')}
          emptyLabel={t('settings.noCategories')}
          categories={(categoriesQuery.data ?? []) as SettingsCategory[]}
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
          newCategory={newCategory}
          isCreatePending={createCategoryMutation.isPending}
          onNewCategoryChange={setNewCategory}
          onCreateCategory={() => createCategoryMutation.mutate({ name: newCategory })}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          isUpdatePending={updateCategoryMutation.isPending}
          onEditStart={(id, name) => {
            setEditingCategoryId(id)
            setEditingCategoryName(name)
          }}
          onEditChange={setEditingCategoryName}
          onEditCancel={() => {
            setEditingCategoryId(null)
            setEditingCategoryName('')
          }}
          onEditSubmit={() =>
            updateCategoryMutation.mutate({
              id: editingCategoryId ?? '',
              name: editingCategoryName,
            })
          }
          isDeletePending={deleteCategoryMutation.isPending}
          onDeleteCategory={(id, name) => {
            if (!window.confirm(t('settings.deleteCategoryConfirm', { name }))) {
              return
            }
            deleteCategoryMutation.mutate({ id })
          }}
        />
      )}
    </div>
  )
}
