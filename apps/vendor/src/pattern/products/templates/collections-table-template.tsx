'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaginationState } from '@tanstack/react-table'
import {
    Collection,
    useGetVendorCollectionsWithProductsQuery,
} from '@/redux/services/collections/collections.api-slice'
import { APP_ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LinearImportIcon } from '@/pattern/common/atoms/linear-import-icon'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { CollectionsTable } from '../organisms/collections-table'
import { formatCondition } from '../molecules/collections-table-column'

interface CollectionsTableTemplateProps {
    onExport?: () => void
}

const CollectionsTableTemplate = ({ onExport }: CollectionsTableTemplateProps) => {
    const router = useRouter()
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [searchQuery, setSearchQuery] = useState<string>('')

    // Vendor-scoped collections including their matched products (used for the
    // product count and cover image). The endpoint returns the full list, so
    // search + pagination are applied client-side below.
    const {
        data: collectionsResponse,
        isLoading,
        error,
        isError,
        isSuccess,
        isFetching,
    } = useGetVendorCollectionsWithProductsQuery()

    // The endpoint returns a paginated envelope, so the collections array lives
    // at response.data.data (not response.data).
    const allCollections = useMemo<Collection[]>(
        () => collectionsResponse?.data?.data ?? [],
        [collectionsResponse]
    )

    // Client-side search across the collection title and its condition text.
    const collections = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()
        if (!term) return allCollections
        return allCollections.filter((collection) => {
            const inTitle = (collection.title ?? '').toLowerCase().includes(term)
            const inConditions = (collection.conditions ?? []).some((condition) =>
                formatCondition(condition).toLowerCase().includes(term)
            )
            return inTitle || inConditions
        })
    }, [allCollections, searchQuery])

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }

    const handleImportCollections = () => {
        toast.info('Import collections feature coming soon')
    }

    const handleCreateCollection = () => {
        router.push(APP_ROUTES.productsCollectionsCreate)
    }

    const handleExport = () => {
        if (onExport) {
            onExport()
        } else {
            toast.info('Export collections feature coming soon')
        }
    }

    // The backend exposes no collection update/status/delete endpoints yet
    // (only GET + POST /collections), so the row actions are honest stubs until
    // those endpoints exist.
    const handleEditCollection = (collectionId: string) => {
        toast.info('Edit collection feature coming soon')
    }

    const handleSelectCollection = (collectionId: string) => {
        toast.info('Select collection feature coming soon')
    }

    const handleActivateCollection = (collectionId: string) => {
        toast.info('Activate collection feature coming soon')
    }

    const handleScheduleActivation = (collectionId: string) => {
        toast.info('Schedule activation feature coming soon')
    }

    const handleArchiveCollection = (collectionId: string) => {
        toast.info('Archive collection feature coming soon')
    }

    const handleDeactivateCollection = (collectionId: string) => {
        toast.info('Deactivate collection feature coming soon')
    }

    const handleDeleteCollection = (collectionId: string) => {
        toast.info('Delete collection feature coming soon')
    }

    return (
        <div className='w-full bg-background'>
            {/* Header Section */}
            <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
                <div className='flex items-center gap-2 flex-wrap'>
                    {/* Import Collections */}
                    <Button
                        variant='outline'
                        size='default'
                        onClick={handleImportCollections}
                        className='gap-[10px] text-xs! font-medium'
                    >
                        <span>Import Collections</span>
                        <LinearImportIcon className='w-[18px] h-[18px]' />
                    </Button>

                    {/* Create Collection */}
                    <Button
                        variant='default'
                        size='default'
                        onClick={handleCreateCollection}
                        className='gap-[10px] text-xs! font-medium'
                    >
                        <span>Create Collection</span>
                        <LinearAddSquareIcon className='size-[18px]' />
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className='bg-card w-full rounded-[10px] shadow-md'>
                <TableToolbar
                    title='Collection'
                    search={searchQuery}
                    onSearchChange={handleSearchChange}
                    onFilterDate={() => toast.info('Filter coming soon')}
                    onExport={handleExport}
                    filterLabel='Filter By :'
                    filterIcon={null}
                />
                <CollectionsTable
                    data={collections}
                    isLoading={isLoading}
                    error={error}
                    isError={isError}
                    isSuccess={isSuccess}
                    isFetching={isFetching}
                    pagination={pagination}
                    setPagination={setPagination}
                    onEdit={handleEditCollection}
                    onSelect={handleSelectCollection}
                    onActivate={handleActivateCollection}
                    onScheduleActivation={handleScheduleActivation}
                    onArchive={handleArchiveCollection}
                    onDeactivate={handleDeactivateCollection}
                    onDelete={handleDeleteCollection}
                />
            </div>
        </div>
    )
}

export default CollectionsTableTemplate
