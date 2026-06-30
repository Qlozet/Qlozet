'use client'

import { useState, useEffect } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { Product, useGetProductsByVendorQuery, useDeleteProductMutation } from '@/redux/services/products/products.api-slice'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { clearProductId } from '@/lib/utils'
import { show } from '@ebay/nice-modal-react'
import { ProductDetailsModal } from '../organisms/product-details-modal'
import { toast } from 'sonner'
import { OutlinRulerIcon } from '@/pattern/common/atoms/outline-ruler-icon'
import { LinearImportIcon } from '@/pattern/common/atoms/linear-import-icon'
import { ClothingStylesIcon } from '@/pattern/common/atoms/clothing-styles-icon'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { AccessoriesTable } from '../organisms/accessories-table'
import { AddAccessoryModal } from '../organisms/add-accessories-modal'
import { ProductsStats } from './products-stats'
import { DonutDatum } from '@/pattern/dashboard/molecules/donut-chart'

const SALES_BY_CATEGORY_FALLBACK: DonutDatum[] = [
  { name: 'Watches', value: 30 },
  { name: 'Bags', value: 28 },
  { name: 'Shoes', value: 22 },
  { name: 'Jewelry', value: 20 },
];

interface ClothingTableTemplateProps {
    onExport?: () => void
}

const AccessoriesTableTemplate = ({ onExport }: ClothingTableTemplateProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const [pageCount, setPageCount] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [showSelect, setShowSelect] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'stock' | undefined>(undefined)
    const [order, setOrder] = useState<'asc' | 'desc'>('desc')

    // Get search query from URL params
    useEffect(() => {
        const urlSearch = searchParams.get('search')
        if (urlSearch) {
            setSearchQuery(urlSearch)
        }
    }, [searchParams])

    // Handle search change from the search component
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        // Reset to first page when searching
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }



    // Get Products API query for clothing category
    const {
        data: productsResponse,
        isLoading,
        error,
        isError,
        isSuccess,
        isFetching,
        refetch,
    } = useGetProductsByVendorQuery({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize, // API uses 'size' instead of 'limit'
        search: searchQuery || undefined, // Only send if not empty
        kind: 'accessory', // API uses 'kind' instead of 'category'
        sortBy: sortBy, // Add sortBy parameter
        order: order, // Add order parameter (asc/desc)
    })

    // Delete product mutation
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

    // Transform API products to match expected format
    const transformProduct = (apiProduct: any): Product => {
      const itemData = apiProduct.clothing || apiProduct.accessory || apiProduct.fabric || apiProduct
  
      let totalStock = 0;
      let totalVariants = 0;
  
      if (apiProduct.kind === 'clothing' && itemData?.color_variants) {
        itemData.color_variants.forEach((cv: any) => {
          if (cv.variants) {
            totalVariants += cv.variants.length;
            cv.variants.forEach((v: any) => {
               totalStock += (v.stock || 0);
            });
          }
        });
      } else if (apiProduct.kind === 'accessory' && itemData?.variants) {
        totalVariants = itemData.variants.length;
        itemData.variants.forEach((v: any) => {
          totalStock += (v.stock || 0);
        });
      }
  
      const tags = [...(itemData?.taxonomy?.attributes || [])];
      if (itemData?.taxonomy?.audience) tags.push(itemData.taxonomy.audience);
  
      return {
        _id: apiProduct._id,
        name: itemData?.name || 'Unnamed Product',
        description: itemData?.description || '',
        category: apiProduct.kind || 'clothing',
        price: apiProduct.base_price || itemData?.price || 0,
        stock: totalStock,
        status: apiProduct.status || 'draft',
        images: itemData?.images?.map((img: any) => img.url) || [],
        variants: Array.from({ length: totalVariants || 1 }),
        customizations: itemData?.styles || [],
        tags,
        createdAt: apiProduct.createdAt,
        updatedAt: apiProduct.updatedAt,
      }
    }

    // Handle different API response formats - Extract from nested data structure
    const rawProducts = (productsResponse?.data?.data || productsResponse?.products || []) as any[]
    const products = rawProducts?.map(transformProduct)
    const totalProducts = productsResponse?.data?.total_items || productsResponse?.totalCount || productsResponse?.total || 0
    const totalPagesFromAPI = productsResponse?.data?.total_pages || productsResponse?.totalPages || Math.ceil(totalProducts / pagination.pageSize) || 1

    useEffect(() => {
        if (productsResponse) {
            setPageCount(totalPagesFromAPI)
        }
    }, [productsResponse, totalPagesFromAPI])

    const handleAddAccessories = () => {
        show(AddAccessoryModal)
    }

    const handleImportProducts = () => {
        toast.info('Import products feature coming soon')
    }

    const handleExportProducts = () => {
        if (onExport) {
            onExport()
        } else {
            toast.info('Export products feature coming soon')
        }
    }

    const handleViewDetails = (productId: string) => {
        show(ProductDetailsModal, {
            productId,
            onProductUpdated: () => refetch(),
            onProductDeleted: () => refetch(),
            onEdit: (id: string) => {
                router.push(`/add?edit=${id}`)
            },
            onDuplicate: async (id: string) => {
                toast.success('Product duplication will be implemented')
            },
        })
    }

    const handleEditProduct = (productId: string) => {
        router.push(`/add?edit=${productId}`)
    }

    const handleDuplicateProduct = (productId: string) => {
        toast.success('Product duplication will be implemented')
    }

    const handleDeleteProduct = (productId: string) => {
        show(DeleteProductConfirmationModal, { title: "Are you sure you want to delete this product?", description: "Removing this product will erase all stored information about it from your dashboard.", actionText: "Delete Product" })
            .then(() => {
                deleteProduct(productId)
                    .unwrap()
                    .then(() => {
                        toast.success('Product deleted successfully')
                        refetch()
                    }).catch((error) => {
                        toast.error(error?.data?.message || 'Failed to delete product')
                        console.error('Error deleting product:', error)
                    })
            })
    }

    return (
        <div className='w-full bg-background'>
            {/* Header Section */}
            <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
                {/* Action Buttons */}
                <div className='flex items-center gap-2 flex-wrap'>
                    {/* Import Product */}
                    <Button
                        variant='outline'
                        size='default'
                        onClick={handleImportProducts}
                        className='gap-[10px] text-xs! font-medium'
                    >
                        <LinearImportIcon className='w-[18px] h-[18px]' />
                        <span className='hidden sm:inline'>Import Products</span>
                    </Button>
                    {/* Toggle Select Mode */}
                    <Button
                        variant='outline'
                        size='default'
                        onClick={() => setShowSelect(!showSelect)}
                        className='gap-[10px] text-xs! font-medium'
                    >
                        <span>{showSelect ? 'Cancel Selection' : 'Select Products'}</span>
                    </Button>

                    {/* Add new product */}
                    <Button
                        variant="default"
                        size='default'
                        onClick={handleAddAccessories}
                        className='gap-[10px] text-xs! font-medium'
                    >
                        <LinearAddSquareIcon className='size-[18px]' />
                        <span>Add new accessories</span>
                    </Button>
                </div>
            </div>

            {/* Summary metrics + sales donut */}
            <div className='mb-[21px]'>
              <ProductsStats
                totalProducts={totalProducts}
                achievedProducts={0}
                isLoading={isLoading}
                salesTitle="Sales By Product Category"
                salesFallback={SALES_BY_CATEGORY_FALLBACK}
                viewAllLink={'/products'}
              />
            </div>

            {/* Filter, Search, and Table Section */}
            <div className='bg-card w-full rounded-[10px] shadow-md'>
                <TableToolbar
                  title="Accessories"
                  search={searchQuery}
                  onSearchChange={handleSearchChange}
                  onFilterDate={() => toast.info('Filter coming soon')}
                  onExport={handleExportProducts}
                  filterLabel="Filter By :"
                  filterIcon={null}
                />
                <AccessoriesTable
                    data={products as Product[]}
                    isLoading={isLoading}
                    error={error}
                    isError={isError}
                    isSuccess={isSuccess}
                    isFetching={isFetching}
                    pageCount={pageCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditProduct}
                    onDuplicate={handleDuplicateProduct}
                    onDelete={handleDeleteProduct}
                    showSelect={showSelect}
                />
            </div>
        </div>
    )
}

export default AccessoriesTableTemplate
