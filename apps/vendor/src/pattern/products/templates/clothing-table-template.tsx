'use client'

import { useState, useEffect } from 'react'
import { ClothingTable } from '@/pattern/products/organisms/clothing-table'
import { PaginationState } from '@tanstack/react-table'
import { Product, useGetProductsQuery, useDeleteProductMutation } from '@/redux/services/products/products.api-slice'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, ChevronDown, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'

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
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'stock' | undefined>(undefined)
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<string>('relevance')

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

  // Handle filter change
  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType)

    // Map filter types to sortBy and order
    switch (filterType) {
      case 'date-newest':
        setSortBy('createdAt')
        setOrder('desc')
        break
      case 'date-oldest':
        setSortBy('createdAt')
        setOrder('asc')
        break
      case 'rating-high':
        setSortBy('price') // You can change this to rating when available in API
        setOrder('desc')
        break
      case 'rating-low':
        setSortBy('price') // You can change this to rating when available in API
        setOrder('asc')
        break
      case 'price-high':
        setSortBy('price')
        setOrder('desc')
        break
      case 'price-low':
        setSortBy('price')
        setOrder('asc')
        break
      case 'relevance':
      default:
        setSortBy(undefined)
        setOrder('desc')
        break
    }

    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setFilterOpen(false)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilter('relevance')
    setSortBy(undefined)
    setOrder('desc')
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
    setFilterOpen(false)
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
    size: pagination.pageSize, // API uses 'size' instead of 'limit'
    search: searchQuery || undefined, // Only send if not empty
    kind: 'clothing', // API uses 'kind' instead of 'category'
    sortBy: sortBy, // Add sortBy parameter
    order: order, // Add order parameter (asc/desc)
  })

  // Delete product mutation
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

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
  const products = rawProducts?.length > 0 ? rawProducts?.map(transformProduct) : mockClothingProducts
  const totalProducts = productsResponse?.data?.total_items || productsResponse?.totalCount || productsResponse?.total || mockClothingProducts?.length
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
          {/* Filter Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='default'
                className='bg-transparent gap-2 text-sm! font-medium py-3 rounded-[12px] relative'
              >
                <Filter className='w-4 h-4' />
                <span>Filter By:</span>
                {activeFilter !== 'relevance' && (
                  <span className='ml-1 font-semibold capitalize'>
                    {activeFilter.replace('-', ' ')}
                  </span>
                )}
                <ChevronDown className='w-4 h-4 ml-1' />
                {activeFilter !== 'relevance' && (
                  <div className='absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full' />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0' align='start'>
              <div className='p-4 space-y-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-sm'>Filter Products</h4>
                  {activeFilter !== 'relevance' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearFilters}
                      className='h-auto p-1 text-xs text-muted-foreground hover:text-foreground'
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Relevance */}
                <div className='space-y-3'>
                  <h5 className='text-xs font-medium text-muted-foreground uppercase'>Relevance</h5>
                  <RadioGroup value={activeFilter} onValueChange={handleFilterChange}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='relevance' id='relevance' />
                      <Label htmlFor='relevance' className='text-sm font-normal cursor-pointer'>
                        Most Relevant
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Date */}
                <div className='space-y-3'>
                  <h5 className='text-xs font-medium text-muted-foreground uppercase'>Date Added</h5>
                  <RadioGroup value={activeFilter} onValueChange={handleFilterChange}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='date-newest' id='date-newest' />
                      <Label htmlFor='date-newest' className='text-sm font-normal cursor-pointer'>
                        Newest First
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='date-oldest' id='date-oldest' />
                      <Label htmlFor='date-oldest' className='text-sm font-normal cursor-pointer'>
                        Oldest First
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Price */}
                <div className='space-y-3'>
                  <h5 className='text-xs font-medium text-muted-foreground uppercase'>Price</h5>
                  <RadioGroup value={activeFilter} onValueChange={handleFilterChange}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='price-high' id='price-high' />
                      <Label htmlFor='price-high' className='text-sm font-normal cursor-pointer'>
                        Highest to Lowest
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='price-low' id='price-low' />
                      <Label htmlFor='price-low' className='text-sm font-normal cursor-pointer'>
                        Lowest to Highest
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Rating (placeholder for future) */}
                <div className='space-y-3'>
                  <h5 className='text-xs font-medium text-muted-foreground uppercase'>Rating</h5>
                  <RadioGroup value={activeFilter} onValueChange={handleFilterChange}>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='rating-high' id='rating-high' />
                      <Label htmlFor='rating-high' className='text-sm font-normal cursor-pointer'>
                        Highest Rated
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='rating-low' id='rating-low' />
                      <Label htmlFor='rating-low' className='text-sm font-normal cursor-pointer'>
                        Lowest Rated
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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
      </div>
    </div>
  )
}

export default ClothingTableTemplate
