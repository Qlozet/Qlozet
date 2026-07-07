import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, UserPlus, X, Undo2, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UseProductConditionsProps } from '../hooks/use-product-conditions'

// Helper functions (mirrored from templates)
const getProductName = (p: any): string =>
  p.name || p.clothing?.name || p.fabric?.name || p.accessory?.name || 'Untitled'

const getProductImage = (p: any): string | undefined => {
  const inner = p?.[p?.kind] ?? p
  const img = inner?.images?.[0]
  return typeof img === 'string' ? img : img?.url
}

const getProductPrice = (p: any): number | undefined => p.base_price ?? p.price

export interface ProductPreviewCardProps {
  /** The return object of useProductConditions */
  conditionState: ReturnType<typeof import('../hooks/use-product-conditions').useProductConditions>
  /** Optional layout className for the container (e.g. for sticky positioning or fixed height) */
  className?: string
  /** Subtitle description for the card */
  description?: string
}

export const ProductPreviewCard = ({
  conditionState,
  className,
  description = 'These products currently match your conditions.',
}: ProductPreviewCardProps) => {
  const {
    allRawProducts,
    matchingProducts,
    manualIncludes,
    manualExcludes,
    handleExclude,
    handleInclude,
    handleUndoExclude,
    handleRemoveInclude,
  } = conditionState

  const [productSearch, setProductSearch] = useState('')
  const [manualPickerSearch, setManualPickerSearch] = useState('')
  const [showManualPicker, setShowManualPicker] = useState(false)

  // ─── Filtered lists for rendering ───────────────────────────────
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return matchingProducts
    return matchingProducts.filter((p: any) => getProductName(p).toLowerCase().includes(term))
  }, [matchingProducts, productSearch])

  const availableForInclude = useMemo(() => {
    const matchedIds = new Set(matchingProducts.map((p: any) => p._id))
    const term = manualPickerSearch.trim().toLowerCase()
    return allRawProducts.filter((p: any) => {
      if (matchedIds.has(p._id) || manualExcludes.has(p._id)) return false
      if (!term) return true
      return getProductName(p).toLowerCase().includes(term)
    })
  }, [allRawProducts, matchingProducts, manualExcludes, manualPickerSearch])

  return (
    <div className={cn('rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10 flex flex-col', className)}>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-base font-medium'>Product Preview</h3>
        <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
          {matchingProducts.length} matching
        </span>
      </div>

      <p className='text-xs text-muted-foreground mb-4'>{description}</p>

      <div className='relative mb-4'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
        <Input
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder='Search matched products'
          className='h-12 rounded-lg pl-9'
        />
      </div>

      {/* Product list */}
      <div className='space-y-2 max-h-[350px] overflow-y-auto'>
        {filteredProducts.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No products match your conditions.
          </p>
        ) : (
          filteredProducts.slice(0, 100).map((product: any) => {
            const img = getProductImage(product)
            const name = getProductName(product)
            const price = getProductPrice(product)
            const isManuallyIncluded = manualIncludes.has(product._id)
            return (
              <div
                key={product._id}
                className='flex items-center gap-3 rounded-lg bg-muted/30 p-2.5'
              >
                <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-white dark:bg-muted'>
                  {img ? (
                    <Image src={img} alt={name} fill sizes='40px' className='object-cover' />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-[9px] text-gray-400'>
                      No img
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <p className='text-sm font-medium text-grey-black dark:text-gray-200 truncate'>
                      {name}
                    </p>
                    {isManuallyIncluded && (
                      <span className='shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700'>
                        Manual
                      </span>
                    )}
                  </div>
                  {price != null && (
                    <p className='text-xs text-muted-foreground'>
                      ₦{price.toLocaleString()}
                    </p>
                  )}
                </div>
                {isManuallyIncluded ? (
                  <button
                    type='button'
                    onClick={() => handleRemoveInclude(product._id)}
                    className='shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600'
                    title='Remove manual include'
                  >
                    <X className='size-3.5' />
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={() => handleExclude(product._id)}
                    className='shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600'
                    title='Exclude from collection'
                  >
                    <X className='size-3.5' />
                  </button>
                )}
              </div>
            )
          })
        )}
        {filteredProducts.length > 100 && (
          <p className='text-center text-xs text-muted-foreground py-4'>
            Showing 100 of {filteredProducts.length}
          </p>
        )}
      </div>

      {/* Manual include picker */}
      <div className='mt-4 border-t pt-4'>
        <button
          type='button'
          onClick={() => setShowManualPicker(!showManualPicker)}
          className='flex items-center gap-2 text-sm font-medium text-grey-black dark:text-gray-200 transition-colors hover:text-primary cursor-pointer'
        >
          <UserPlus className='size-4' />
          Add Products Manually
          <ChevronDown className={cn(
            'size-3.5 transition-transform',
            showManualPicker && 'rotate-180'
          )} />
        </button>

        {showManualPicker && (
          <div className='mt-3 space-y-2'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
              <Input
                value={manualPickerSearch}
                onChange={(e) => setManualPickerSearch(e.target.value)}
                placeholder='Search products to include...'
                className='h-10 rounded-lg pl-9 text-sm'
              />
            </div>
            <div className='space-y-1.5 max-h-[250px] overflow-y-auto'>
              {availableForInclude.length === 0 ? (
                <p className='py-4 text-center text-xs text-muted-foreground'>
                  {manualPickerSearch
                    ? 'No matching products found.'
                    : 'All products are already in this collection.'}
                </p>
              ) : (
                availableForInclude.slice(0, 20).map((product: any) => (
                  <div
                    key={product._id}
                    className='flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors'
                  >
                    <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-white dark:bg-muted border'>
                      {getProductImage(product) ? (
                        <Image src={getProductImage(product)!} alt='' fill className='object-cover' sizes='40px' />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-[9px] text-gray-400'>
                          No img
                        </div>
                      )}
                    </div>
                    <p className='text-sm font-medium text-grey-black dark:text-gray-200 truncate flex-1'>{getProductName(product)}</p>
                    <button
                      type='button'
                      onClick={() => handleInclude(product._id)}
                      className='shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                      title='Include in collection'
                    >
                      <Plus className='size-4' />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Excluded products */}
      {manualExcludes.size > 0 && (
        <div className='mt-4 border-t pt-4'>
          <h4 className='mb-2 text-sm font-medium text-muted-foreground'>
            Excluded ({manualExcludes.size})
          </h4>
          <div className='space-y-2 max-h-[200px] overflow-y-auto'>
            {allRawProducts
              .filter((p: any) => manualExcludes.has(p._id))
              .map((p: any) => (
                <div
                  key={p._id}
                  className='flex items-center gap-3 rounded-lg bg-red-50/50 p-2.5 opacity-60'
                >
                  <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-white dark:bg-muted'>
                    {getProductImage(p) ? (
                      <Image src={getProductImage(p)!} alt='' fill className='object-cover' sizes='40px' />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-[9px] text-gray-400'>
                        No img
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-grey-black dark:text-gray-200 truncate line-through'>
                      {getProductName(p)}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleUndoExclude(p._id)}
                    className='shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-green-50 hover:text-green-600'
                    title='Undo exclude'
                  >
                    <Undo2 className='size-3.5' />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
