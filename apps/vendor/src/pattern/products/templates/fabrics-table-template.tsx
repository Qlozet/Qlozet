'use client'

import { useState, useEffect } from 'react'
import { FabricsTable } from '@/pattern/products/organisms/fabrics-table'
import { PaginationState } from '@tanstack/react-table'
import { Product, useGetProductsByVendorQuery, useDeleteProductMutation, useUpdateProductStatusMutation } from '@/redux/services/products/products.api-slice'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { clearProductId } from '@/lib/utils'
import { show } from '@ebay/nice-modal-react'
import { APP_ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import { OutlinRulerIcon } from '@/pattern/common/atoms/outline-ruler-icon'
import { LinearImportIcon } from '@/pattern/common/atoms/linear-import-icon'
import { ClothingStylesIcon } from '@/pattern/common/atoms/clothing-styles-icon'
import { LinearAddSquareIcon } from '@/pattern/common/atoms/linear-add-square-icon'
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar'
import { DeleteProductConfirmationModal } from '@/pattern/common/organisms/delete-confirmation-modal'
import { AddFabricModal } from '../organisms/add-fabric-modal'
import { ProductsStats } from './products-stats'
import { DonutDatum } from '@/pattern/dashboard/molecules/donut-chart'

const SALES_BY_CATEGORY_FALLBACK: DonutDatum[] = [
  { name: 'Cotton', value: 30 },
  { name: 'Silk', value: 28 },
  { name: 'Linen', value: 22 },
  { name: 'Wool', value: 20 },
];

interface ClothingTableTemplateProps {
  onExport?: () => void
}

const FabricsTableTemplate = ({ onExport }: ClothingTableTemplateProps) => {
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



  // Get Products API query for clothing category.
  // GET /products/by-vendor is scoped to the authenticated vendor and only
  // accepts kind + pagination — search/sortBy/order are applied client-side
  // (see filtering/sorting below).
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
    kind: 'fabric', // API uses 'kind' instead of 'category'
  })

  // Delete product mutation
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [updateProductStatus] = useUpdateProductStatusMutation()
  
  const handleStatusChange = (productId: string, newStatus: "active" | "draft" | "inactive" | "scheduled") => {
    const mappedStatus = (newStatus === 'inactive' || newStatus === 'scheduled') ? 'archived' : newStatus as 'active' | 'draft' | 'archived';
    updateProductStatus({ productId, status: mappedStatus })
      .unwrap()
      .then(() => {
        toast.success(`Product status updated successfully`)
        refetch()
      }).catch((error) => {
        toast.error(error?.data?.message || 'Failed to update product status')
        console.error('Error updating product status:', error)
      })
  }

  // Transform API products to match expected format
  const transformProduct = (apiProduct: any): any => {
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
    } else if (apiProduct.kind === 'fabric') {
      totalStock = itemData?.yard_length ?? itemData?.yardLength ?? itemData?.stock ?? itemData?.quantity ?? apiProduct.stock ?? apiProduct.quantity ?? 0;
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
      type: itemData?.type,
      pattern: itemData?.pattern || itemData?.fabric_details?.pattern || '',
      material: itemData?.product_type || itemData?.productType || itemData?.sub_category || itemData?.subCategory || itemData?.subcategory || itemData?.fabric_details?.sub_category || '',
      colour: apiProduct.metafields?.colour || apiProduct.metafields?.color || itemData?.colour || itemData?.color || itemData?.fabric_details?.color || (itemData?.colors && itemData.colors[0]) || '',
      pricePerYard: itemData?.price_per_yard || itemData?.fabric_details?.price_per_yard || apiProduct.base_price || 0,
      createdAt: apiProduct.createdAt,
      updatedAt: apiProduct.updatedAt,
    }
  }

  // Handle different API response formats - Extract from nested data structure
  const rawProducts = (productsResponse?.data?.data || productsResponse?.products || []) as any[]
  const mappedProducts = rawProducts.map(transformProduct)
  const totalProducts = productsResponse?.data?.total_items || productsResponse?.totalCount || productsResponse?.total || 0

  // /products/by-vendor has no server-side search/sort, so apply both to the
  // current page client-side to keep the search box and Filter menu working.
  const products = (() => {
    const term = searchQuery.trim().toLowerCase()
    let list = term
      ? mappedProducts.filter((p) => (p.name ?? '').toLowerCase().includes(term))
      : mappedProducts

    if (sortBy) {
      const dir = order === 'asc' ? 1 : -1
      list = [...list].sort((a, b) => {
        const av = a[sortBy as keyof Product]
        const bv = b[sortBy as keyof Product]
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av ?? '').localeCompare(String(bv ?? '')) * dir
      })
    }

    return list
  })()
  const totalPagesFromAPI = productsResponse?.data?.total_pages || productsResponse?.totalPages || Math.ceil(totalProducts / pagination.pageSize) || 1

  useEffect(() => {
    if (productsResponse) {
      setPageCount(totalPagesFromAPI)
    }
  }, [productsResponse, totalPagesFromAPI])

  const handleAddProduct = () => {
    show(AddFabricModal)
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
    router.push(`${APP_ROUTES.productDetails}?id=${productId}`)
  }

  const handleEditProduct = (productId: string) => {
    show(AddFabricModal, { editId: productId })
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
            className='gap-0! text-xs! font-medium dark:text-white dark:border-gray-500'
          >
            <OutlinRulerIcon className='w-[24px] h-[16.54px]' />
            <span className='hidden sm:inline'>Size guide</span>
          </Button>

          {/* Import Product */}
          <Button
            variant='outline'
            size='default'
            onClick={handleImportProducts}
            className='gap-[10px] text-xs! font-medium dark:text-white dark:border-gray-500'
          >
            <LinearImportIcon className='w-[18px] h-[18px]' />
            <span className='hidden sm:inline'>Import Products</span>
          </Button>

          {/* Manage styles */}
          <Button
            variant='outline'
            size='default'
            onClick={handleManageStyles}
            className='gap-[10px] text-xs! font-medium dark:text-white dark:border-gray-500'
          >
            <ClothingStylesIcon className='w-[18px] h-[20px]' />
            <span className='hidden sm:inline'>Manage Styles</span>
          </Button>

          {/* Toggle Select Mode */}
          <Button
            variant='outline'
            size='default'
            onClick={() => setShowSelect(!showSelect)}
            className='gap-[10px] text-xs! font-medium dark:text-white dark:border-gray-500'
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
            <span>Add new fabric</span>
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

      {/* Table Section */}
      <div className='bg-card w-full rounded-[10px] shadow-md'>
        <TableToolbar
          title="Fabrics"
          search={searchQuery}
          onSearchChange={handleSearchChange}
          onFilterDate={() => toast.info('Filter coming soon')}
          onExport={handleExportProducts}
          filterLabel="Filter By :"
          filterIcon={null}
        />
        <FabricsTable
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
          onStatusChange={handleStatusChange}
          showSelect={showSelect}
        />
      </div>
    </div>
  )
}

export default FabricsTableTemplate
