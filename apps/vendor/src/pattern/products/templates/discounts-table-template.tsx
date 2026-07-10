'use client'

import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { show } from '@ebay/nice-modal-react'
import {
  Discount,
  useGetDiscountsQuery,
  useDeleteDiscountMutation,
  useUpdateDiscountMutation,
} from '@/redux/services/discounts/discounts.api-slice'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { DataTable } from '@/pattern/common/organisms/table/data-table'
import { DiscountsTableColumns } from '../molecules/discounts-table-columns'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/lib/routes'
import { formatCondition } from '../molecules/discounts-table-columns'
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu'

const TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'store_wide', label: 'Store-Wide' },
  { value: 'flash', label: 'Flash Sales' },
  { value: 'category_specific', label: 'Category' },
]

const DiscountsTableTemplate = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const router = useRouter()

  // API
  const {
    data: discountsResponse,
    isLoading,
    error,
    isError,
    isSuccess,
    isFetching,
  } = useGetDiscountsQuery()

  const [deleteDiscount] = useDeleteDiscountMutation()
  const [updateDiscount] = useUpdateDiscountMutation()

  // Flatten the response — handle both array and paginated envelope shapes
  const allDiscounts = useMemo<Discount[]>(() => {
    const d = discountsResponse?.data
    if (!d) return []
    if (Array.isArray(d)) return d
    if (Array.isArray((d as any).data)) return (d as any).data
    return []
  }, [discountsResponse])

  // Client-side search + type filter
  const discounts = useMemo(() => {
    let filtered = allDiscounts

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((d) => {
        if (typeFilter === 'flash') return d.type?.startsWith('flash_')
        return d.type === typeFilter
      })
    }

    // Search
    const term = searchQuery.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((d) => {
        const inTitle = (d.title ?? '').toLowerCase().includes(term)
        const inConditions = (d.conditions ?? []).some((c) =>
          formatCondition(c).toLowerCase().includes(term)
        )
        return inTitle || inConditions
      })
    }

    return filtered
  }, [allDiscounts, searchQuery, typeFilter])

  // ─── Handlers ───────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleCreateDiscount = () => {
    router.push(APP_ROUTES.productsDiscountsCreate)
  }

  const handleEditDiscount = (discountId: string) => {
    router.push(`${APP_ROUTES.productsDiscountsEdit}?id=${discountId}`)
  }

  const setActive = async (discountId: string, is_active: boolean) => {
    try {
      await updateDiscount({ id: discountId, is_active }).unwrap()
      toast.success(is_active ? 'Discount activated.' : 'Discount deactivated.')
    } catch (err) {
      toast.error((err as any)?.data?.message || 'Could not update discount.')
    }
  }

  const handleActivateDiscount = (discountId: string) => setActive(discountId, true)
  const handleDeactivateDiscount = (discountId: string) => setActive(discountId, false)

  const handleDeleteDiscount = (discountId: string) => {
    show(DeleteProductConfirmationModal, {
      title: 'Are you sure you want to delete this discount?',
      description:
        'This will permanently remove the discount and clear discounted prices from all affected products.',
      actionText: 'Delete Discount',
    }).then(() => {
      deleteDiscount(discountId)
        .unwrap()
        .then(() => toast.success('Discount deleted successfully.'))
        .catch((err) => toast.error(err?.data?.message || 'Failed to delete discount.'))
    })
  }

  const handleExport = () => {
    toast.info('Export feature coming soon')
  }

  const discountColumns = useMemo(
    () =>
      DiscountsTableColumns({
        onEdit: handleEditDiscount,
        onActivate: handleActivateDiscount,
        onDeactivate: handleDeactivateDiscount,
        onDelete: handleDeleteDiscount,
      }),
    [handleEditDiscount, handleActivateDiscount, handleDeactivateDiscount, handleDeleteDiscount]
  )

  return (
    <div className='w-full bg-background'>
      {/* Header */}
      <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
        <div className='flex items-center gap-2 flex-wrap'>


          {/* Create Discount */}
          <Button
            variant='default'
            size='default'
            onClick={handleCreateDiscount}
            className='gap-[10px] text-xs! font-medium'
          >
            <span>Create Discount</span>
            <LinearAddSquareIcon className='size-[18px]' />
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-card w-full rounded-[10px] shadow-md'>
        <TableToolbar
          title='Discount'
          search={searchQuery}
          onSearchChange={handleSearchChange}
          onExport={handleExport}
          filterControl={
            <FilterMenu
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            />
          }
        />
        <DataTable
          columns={discountColumns}
          data={discounts}
          isLoading={isLoading}
          isFetching={isFetching}
          isSuccess={isSuccess}
          isError={isError}
          error={error}
          pagination={pagination}
          setPagination={setPagination}
          emptyMessage='Discounts will show up here once you create one.'
        />
      </div>

      {/* Sheet removed - now using page routing */}
    </div>
  )
}

export default DiscountsTableTemplate
