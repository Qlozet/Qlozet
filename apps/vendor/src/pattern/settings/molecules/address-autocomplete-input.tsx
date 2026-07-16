'use client'

// Address Autocomplete Input — Google Places powered address search
// Renders a text input with a prediction dropdown. On selection, calls
// getPlaceDetails() and fires onSelect() with structured address data.

import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  useGooglePlaces,
  type PlaceDetails,
} from '@/hooks/use-google-places'
import { cn } from '@/lib/utils'

interface AddressAutocompleteInputProps {
  /** Current address string (controlled) */
  value: string
  /** Called when the user types (for manual fallback) */
  onChange: (value: string) => void
  /** Called when the user selects a Google Place prediction */
  onSelect: (details: PlaceDetails) => void
  /** Input placeholder */
  placeholder?: string
  /** Additional className for the input */
  className?: string
  /** Restrict results to this country code (default: 'ng') */
  countryCode?: string
  /** Disable the input */
  disabled?: boolean
}

export const AddressAutocompleteInput: React.FC<
  AddressAutocompleteInputProps
> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for your business address...',
  className,
  countryCode = 'ng',
  disabled = false,
}) => {
  const {
    isLoaded,
    predictions,
    isSearching,
    search,
    getPlaceDetails,
    clearPredictions,
  } = useGooglePlaces(countryCode)

  const [isOpen, setIsOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    if (isLoaded && val.trim().length > 2) {
      search(val)
      setIsOpen(true)
    } else {
      clearPredictions()
      setIsOpen(false)
    }
  }

  const handleSelect = async (placeId: string, description: string) => {
    setIsResolving(true)
    onChange(description)
    setIsOpen(false)
    clearPredictions()

    try {
      const details = await getPlaceDetails(placeId)
      onSelect(details)
    } catch (err) {
      console.error('Failed to resolve place details:', err)
    } finally {
      setIsResolving(false)
    }
  }

  const handleClear = () => {
    onChange('')
    clearPredictions()
    setIsOpen(false)
  }

  const showDropdown = isOpen && (predictions.length > 0 || isSearching)

  return (
    <div ref={containerRef} className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true)
          }}
          placeholder={
            isLoaded ? placeholder : 'Enter your business address...'
          }
          className={cn(
            'pl-9 pr-9 bg-gray-50 dark:bg-muted border-gray-200 dark:border-white/10 dark:text-gray-200',
            className,
          )}
          disabled={disabled || isResolving}
          autoComplete='off'
        />
        {(isSearching || isResolving) && (
          <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin' />
        )}
        {!isSearching && !isResolving && value && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Google Places notice */}
      {!isLoaded && !process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY && (
        <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
          Google Places API key not configured. Enter address manually.
        </p>
      )}

      {/* Predictions dropdown */}
      {showDropdown && (
        <div className='absolute z-50 w-full mt-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg overflow-hidden'>
          {isSearching && predictions.length === 0 ? (
            <div className='flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Searching...
            </div>
          ) : (
            predictions.map((pred, i) => (
              <button
                key={pred.placeId}
                type='button'
                onClick={() =>
                  handleSelect(pred.placeId, pred.fullDescription)
                }
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  i < predictions.length - 1 &&
                    'border-b border-gray-100 dark:border-white/5',
                )}
              >
                <MapPin className='h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5' />
                <div className='flex flex-col min-w-0'>
                  <span className='text-sm font-medium text-foreground truncate'>
                    {pred.main}
                  </span>
                  <span className='text-xs text-muted-foreground truncate'>
                    {pred.sub}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
