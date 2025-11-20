'use client'

import { useState, useEffect } from 'react'
import { ClothingTable } from '@/pattern/products/organisms/clothing-table'
import { PaginationState } from '@tanstack/react-table'
import { Product, useGetProductsQuery } from '@/redux/services/products/products.api-slice'
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
import { SearchInputWithParams } from '@/pattern/common/molecules/search-input-with-params'
import { ExcelIcon } from '@/pattern/common/atoms/excel-icon'
import { mockClothingProducts } from '@/lib/mocks'

interface ClothingTableTemplateProps {
  onExport?: () => void
}

const ClothingTableTemplate = ({ onExport }: ClothingTableTemplateProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [pageCount, setPageCount] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSelect, setShowSelect] = useState<boolean>(false)

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
  } = useGetProductsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchQuery,
    category: 'clothing', // Filter by clothing category
  })

  // Transform API products to match expected format
  const transformProduct = (apiProduct: any): Product => {
    const itemData = apiProduct.clothing || apiProduct.accessory || apiProduct.fabric

    return {
      _id: apiProduct._id,
      name: itemData?.name || 'Unnamed Product',
      description: itemData?.description || '',
      category: apiProduct.kind || 'clothing',
      price: apiProduct.base_price || itemData?.price || 0,
      stock: itemData?.stock || 0,
      status: itemData?.status || 'active',
      images: itemData?.images?.map((img: any) => img.url) || [],
      variants: itemData?.variants || [],
      customizations: itemData?.styles || [],
      tags: itemData?.taxonomy?.attributes || [],
      createdAt: apiProduct.createdAt,
      updatedAt: apiProduct.updatedAt,
    }
  }

  // Handle different API response formats - Extract from nested data structure
  const rawProducts = (productsResponse?.data?.data || productsResponse?.products || []) as any[]
  const products = rawProducts.length > 0 ? rawProducts.map(transformProduct) : mockClothingProducts
  const totalProducts = productsResponse?.data?.total_items || productsResponse?.totalCount || productsResponse?.total || mockClothingProducts.length
  const totalPagesFromAPI = productsResponse?.data?.total_pages || productsResponse?.totalPages || Math.ceil(totalProducts / pagination.pageSize) || 1

  useEffect(() => {
    if (productsResponse) {
      setPageCount(totalPagesFromAPI)
    }
  }, [productsResponse, totalPagesFromAPI])

  const handleAddProduct = () => {
    router.push('/products/add-product')
    clearProductId()
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

  const handleManageStyles = () => {
    toast.info('Manage styles feature coming soon')
  }

  const handleSizeGuide = () => {
    toast.info('Size guide feature coming soon')
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
    if (confirm('Are you sure you want to delete this product?')) {
      toast.success('Product deletion will be implemented')
    }
  }

  return (
    <div className='w-full bg-background'>
      {/* Header Section */}
      <div className='w-full h-[44px] flex flex-col sm:flex-row sm:items-end sm:justify-end gap-4 mb-[21px]'>
        {/* Action Buttons */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Size guide */}
          <Button
            variant='outline'
            size='default'
            onClick={handleSizeGuide}
            className='gap-0! text-xs! font-medium'
          >
            <OutlinRulerIcon className='w-[24px] h-[16.54px]' />
            <span className='hidden sm:inline'>Size guide</span>
          </Button>

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

          {/* Manage styles */}
          <Button
            variant='outline'
            size='default'
            onClick={handleManageStyles}
            className='gap-[10px] text-xs! font-medium'
          >
            <ClothingStylesIcon className='w-[18px] h-[20px]' />
            <span className='hidden sm:inline'>Manage Styles</span>
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
            onClick={handleAddProduct}
            className='gap-[10px] text-xs! font-medium'
          >
            <LinearAddSquareIcon className='size-[18px]' />
            <span>Add new product</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className='bg-card w-full h-[72px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 rounded-t-[10px] sadow-md'>
        <h3 className='text-base font-medium'>Clothing</h3>

        <div className='flex items-center gap-3'>
          {/* Filter Buttons */}
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='default' className='bg-transparent gap-2 text-sm! font-medium py-3 rounded-[12px]'>
              <span>Filter By :</span>
            </Button>
          </div>

          {/* Search Input */}
          <SearchInputWithParams
            placeholder='Search'
            className='w-full sm:w-80'
            inputClassName='h-10 rounded-[12px]'
            paramName='search'
            onSearchChange={handleSearchChange}
          />

          {/* Export */}
          <Button
          variant="default"
            size='default'
            onClick={handleExportProducts}
            className='gap-[10px] text-sm font-semibold'
          >
            <ExcelIcon />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-card'>
        <ClothingTable
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

        {/* Pagination Info */}
        {products.length > 0 && (
          <div className='mt-4 text-sm text-muted-foreground text-center'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} - 5 of {totalProducts}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClothingTableTemplate
