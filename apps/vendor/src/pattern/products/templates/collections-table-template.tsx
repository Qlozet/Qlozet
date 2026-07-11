'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaginationState } from '@tanstack/react-table'
import { show } from '@ebay/nice-modal-react'
import {
    Collection,
    useGetVendorCollectionsWithProductsQuery,
    useDeleteCollectionMutation,
    useUpdateCollectionMutation,
} from '@/redux/services/collections/collections.api-slice'
import { APP_ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LinearImportIcon } from '@/pattern/common/atoms/linear-import-icon'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { DataTable } from '@/pattern/common/organisms/table/data-table'
import { CollectionsTableColumns } from '../molecules/collections-table-column'
import { formatCondition } from '../molecules/collections-table-column'
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu'

const COLLECTION_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'All Collections' }
]

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

    const [deleteCollection] = useDeleteCollectionMutation()
    const [updateCollection] = useUpdateCollectionMutation()

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

    const handleEditCollection = (collectionId: string) => {
        router.push(`${APP_ROUTES.productsCollectionsCreate}?edit=${collectionId}`)
    }

    // Toggle a collection's active state via PATCH /collections/{id}.
    const setActive = async (collectionId: string, is_active: boolean) => {
        try {
            await updateCollection({ collectionId, is_active }).unwrap()
            toast.success(
                is_active ? 'Collection activated.' : 'Collection deactivated.'
            )
        } catch (err) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ||
                'Could not update the collection. Please try again.'
            toast.error(message)
        }
    }

    const handleActivateCollection = (collectionId: string) =>
        setActive(collectionId, true)

    const handleDeactivateCollection = (collectionId: string) =>
        setActive(collectionId, false)

    const handleDeleteCollection = (collectionId: string) => {
        show(DeleteProductConfirmationModal, {
            title: 'Are you sure you want to delete this collection?',
            description:
                'Removing this collection will erase all stored information about it from your dashboard.',
            actionText: 'Delete Collection',
        }).then(() => {
            deleteCollection(collectionId)
                .unwrap()
                .then(() => toast.success('Collection deleted successfully.'))
                .catch((err) => {
                    toast.error(
                        err?.data?.message || 'Failed to delete collection.'
                    )
                })
        })
    }

    // No backend endpoint for these yet — honest stubs.
    const handleSelectCollection = (collectionId: string) => {
        toast.info('Select collection feature coming soon')
    }

    const handleScheduleActivation = (collectionId: string) => {
        toast.info('Schedule activation feature coming soon')
    }

    const handleArchiveCollection = (collectionId: string) => {
        toast.info('Archive collection feature coming soon')
    }

    const collectionColumns = useMemo(
        () =>
            CollectionsTableColumns({
                onEdit: handleEditCollection,
                onSelect: handleSelectCollection,
                onActivate: handleActivateCollection,
                onScheduleActivation: handleScheduleActivation,
                onArchive: handleArchiveCollection,
                onDeactivate: handleDeactivateCollection,
                onDelete: handleDeleteCollection,
            }),
        [handleEditCollection, handleSelectCollection, handleActivateCollection, handleScheduleActivation, handleArchiveCollection, handleDeactivateCollection, handleDeleteCollection]
    )

    return (
        <div className='w-full bg-background'>
            {/* Header Section */}
            <div className='w-full flex justify-end gap-4 mb-[21px]'>
                <div className='flex items-center gap-2 flex-wrap justify-end'>
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
                    onExport={handleExport}
                    filterControl={
                        <FilterMenu
                            options={COLLECTION_OPTIONS}
                            value='all'
                            onChange={() => toast.info('Filter coming soon')}
                        />
                    }
                />
                <DataTable
                    columns={collectionColumns}
                    data={collections}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    isError={isError}
                    error={error}
                    pagination={pagination}
                    setPagination={setPagination}
                    emptyMessage='Collections will show up here once you create one.'
                />
            </div>
        </div>
    )
}

export default CollectionsTableTemplate
