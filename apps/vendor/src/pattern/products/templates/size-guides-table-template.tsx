'use client'

import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { show } from '@ebay/nice-modal-react'
import {
  SizeGuide,
  useGetSizeGuidesQuery,
  useDeleteSizeGuideMutation,
  useUpdateSizeGuideMutation,
} from '@/redux/services/size-guides/size-guides.api-slice'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { SizeGuidesTable } from '../organisms/size-guides-table'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/lib/routes'
import { formatCondition } from '../molecules/size-guides-table-columns'

const SizeGuidesTableTemplate = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unitFilter, setUnitFilter] = useState<string>('all')

  const router = useRouter()

  // API
  const {
    data: sizeGuidesResponse,
    isLoading,
    error,
    isError,
    isSuccess,
    isFetching,
  } = useGetSizeGuidesQuery()

  const [deleteSizeGuide] = useDeleteSizeGuideMutation()
  const [updateSizeGuide] = useUpdateSizeGuideMutation()

  // Flatten the response — handle both array and paginated envelope shapes
  const allSizeGuides = useMemo<SizeGuide[]>(() => {
    const d = sizeGuidesResponse?.data
    if (!d) return []
    if (Array.isArray(d)) return d
    if (Array.isArray((d as any).data)) return (d as any).data
    return []
  }, [sizeGuidesResponse])

  // Client-side search + unit filter
  const sizeGuides = useMemo(() => {
    let filtered = allSizeGuides

    // Unit filter
    if (unitFilter !== 'all') {
      filtered = filtered.filter((g) => g.unit === unitFilter)
    }

    // Search
    const term = searchQuery.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((g) => {
        const inTitle = (g.title ?? '').toLowerCase().includes(term)
        const inConditions = (g.conditions ?? []).some((c) =>
          formatCondition(c).toLowerCase().includes(term)
        )
        const inSizes = (g.sizes ?? []).some((s) =>
          s.label.toLowerCase().includes(term)
        )
        return inTitle || inConditions || inSizes
      })
    }

    return filtered
  }, [allSizeGuides, searchQuery, unitFilter])

  // ─── Handlers ───────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleCreateSizeGuide = () => {
    router.push(APP_ROUTES.productsSizeGuidesCreate)
  }

  const handleEditSizeGuide = (guideId: string) => {
    router.push(`${APP_ROUTES.productsSizeGuidesEdit}?id=${guideId}`)
  }

  const setActive = async (guideId: string, is_active: boolean) => {
    try {
      await updateSizeGuide({ id: guideId, is_active }).unwrap()
      toast.success(is_active ? 'Size guide activated.' : 'Size guide deactivated.')
    } catch (err) {
      toast.error((err as any)?.data?.message || 'Could not update size guide.')
    }
  }

  const handleActivateSizeGuide = (guideId: string) => setActive(guideId, true)
  const handleDeactivateSizeGuide = (guideId: string) => setActive(guideId, false)

  const handleDeleteSizeGuide = (guideId: string) => {
    show(DeleteProductConfirmationModal, {
      title: 'Are you sure you want to delete this size guide?',
      description:
        'This will permanently remove the size guide from all associated products.',
      actionText: 'Delete Size Guide',
    }).then(() => {
      deleteSizeGuide(guideId)
        .unwrap()
        .then(() => toast.success('Size guide deleted successfully.'))
        .catch((err) => toast.error(err?.data?.message || 'Failed to delete size guide.'))
    })
  }

  const handleExport = () => {
    toast.info('Export feature coming soon')
  }

  return (
    <div className='w-full bg-background'>
      {/* Header */}
      <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Create Size Guide */}
          <Button
            variant='default'
            size='default'
            onClick={handleCreateSizeGuide}
            className='gap-[10px] text-xs! font-medium'
          >
            <span>Create Size Guide</span>
            <LinearAddSquareIcon className='size-[18px]' />
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-card w-full rounded-[10px] shadow-md'>
        <TableToolbar
          title='Size Guides'
          search={searchQuery}
          onSearchChange={handleSearchChange}
          onExport={handleExport}
          filterControl={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter By :</span>
              <select
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
                className='h-10 rounded-lg border border-input bg-transparent dark:bg-transparent dark:border-gray-500 dark:text-foreground px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='all'>All Units</option>
                <option value='cm'>Centimeters (cm)</option>
                <option value='inch'>Inches (inch)</option>
              </select>
            </div>
          }
        />
        <SizeGuidesTable
          data={sizeGuides}
          isLoading={isLoading}
          error={error}
          isError={isError}
          isSuccess={isSuccess}
          isFetching={isFetching}
          pagination={pagination}
          setPagination={setPagination}
          onEdit={handleEditSizeGuide}
          onActivate={handleActivateSizeGuide}
          onDeactivate={handleDeactivateSizeGuide}
          onDelete={handleDeleteSizeGuide}
        />
      </div>
    </div>
  )
}

export default SizeGuidesTableTemplate
