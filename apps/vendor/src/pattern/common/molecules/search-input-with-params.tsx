'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { LinearSearchNormal } from '@/pattern/common/atoms/linear-search-normal'
import useCreateSearchQuery from '@/lib/hooks/useCreateSearchQuery'
import { cn } from '@/lib/utils'
import { ClearSearchIcon } from '../atoms/clear-search-icon'

interface SearchInputWithParamsProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  debounceMs?: number
  paramName?: string
  onSearchChange?: (value: string) => void
}

export const SearchInputWithParams: React.FC<SearchInputWithParamsProps> = ({
  placeholder = 'Search',
  className,
  inputClassName,
  debounceMs = 500,
  paramName = 'search',
  onSearchChange,
}) => {
  const { searchParams, createSearchParams, deleteSearchParams } = useCreateSearchQuery()
  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get(paramName) || ''
  )
  const isTypingRef = useRef(false)
  const initialLoadRef = useRef(true)

  // Debounce search and update URL params
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedValue = searchValue.trim()

      if (trimmedValue) {
        createSearchParams({
          param: { name: paramName, value: trimmedValue },
          replaceUrl: true,
        })
      } else if (!initialLoadRef.current) {
        deleteSearchParams({ name: paramName })
      }

      // Call the callback if provided
      if (onSearchChange && !initialLoadRef.current) {
        onSearchChange(trimmedValue)
      }

      isTypingRef.current = false
      initialLoadRef.current = false
    }, debounceMs)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, paramName, debounceMs])

  // Sync with URL params only on mount
  useEffect(() => {
    const urlSearchValue = searchParams.get(paramName)
    if (urlSearchValue && initialLoadRef.current) {
      setSearchValue(urlSearchValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true
    setSearchValue(e.target.value)
  }

  const handleClear = () => {
    setSearchValue('')
    deleteSearchParams({ name: paramName })
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
        <LinearSearchNormal />
      </div>
      <Input
        type='text'
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className={cn('bg-transparent border-border-input px-10 rounded-[12px]!', inputClassName)}
      />
      {searchValue && (
        <button
          type='button'
          onClick={handleClear}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
          aria-label='Clear search'
        >
          <ClearSearchIcon />
        </button>
      )}
    </div>
  )
}
