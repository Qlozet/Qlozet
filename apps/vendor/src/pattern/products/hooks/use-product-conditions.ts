import { useMemo, useState, useCallback } from 'react'
import { useGetProductsByVendorQuery } from '@/redux/services/products/products.api-slice'

// ─── Shared Condition Evaluation Logic ──────────────────────────────────────

const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (Array.isArray(current)) {
      current = current.map((item) => item?.[key]).filter((v) => v !== undefined)
      if (current.length === 0) return undefined
      if (current.length === 1) current = current[0]
    } else {
      current = current?.[key]
      if (current === undefined) return undefined
    }
  }
  return current
}

const evaluateOperator = (value: any, operator: string, expected: any): boolean => {
  switch (operator) {
    case 'is_equal_to': return String(value).toLowerCase() === String(expected).toLowerCase()
    case 'not_equal_to': return String(value).toLowerCase() !== String(expected).toLowerCase()
    case 'greater_than': return Number(value) > Number(expected)
    case 'less_than': return Number(value) < Number(expected)
    case 'contains': return String(value).toLowerCase().includes(String(expected).toLowerCase())
    case 'starts_with': return String(value).toLowerCase().startsWith(String(expected).toLowerCase())
    case 'ends_with': return String(value).toLowerCase().endsWith(String(expected).toLowerCase())
    default: return false
  }
}

export const evaluateProductAgainstConditions = (
  product: any,
  conditions: { field: string; operator: string; value: string }[],
  conditionMatch: 'all' | 'any'
): boolean => {
  const valid = conditions.filter((c) => c.field && c.operator && c.value)
  if (!valid.length) return false
  const results = valid.map((cond) => {
    const pv = getNestedValue(product, cond.field)
    if (Array.isArray(pv)) return pv.some((v) => evaluateOperator(v, cond.operator, cond.value))
    return evaluateOperator(pv, cond.operator, cond.value)
  })
  return conditionMatch === 'all' ? results.every((r) => r) : results.some((r) => r)
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseProductConditionsProps {
  watchedConditions: { field: string; operator: string; value: string }[]
  watchedConditionMatch: 'all' | 'any'
  /** If true, bypasses condition evaluation and matches all products (e.g., store_wide discounts with no conditions) */
  alwaysMatchAll?: boolean
  initialManualIncludes?: string[]
  initialManualExcludes?: string[]
}

export const useProductConditions = ({
  watchedConditions,
  watchedConditionMatch,
  alwaysMatchAll = false,
  initialManualIncludes = [],
  initialManualExcludes = [],
}: UseProductConditionsProps) => {
  const { data: vendorProductsResponse, isLoading } = useGetProductsByVendorQuery({ size: 200 })

  const [manualIncludes, setManualIncludes] = useState<Set<string>>(new Set(initialManualIncludes))
  const [manualExcludes, setManualExcludes] = useState<Set<string>>(new Set(initialManualExcludes))

  // Sync initial state if provided later (e.g. from API response on edit)
  const syncInitialState = useCallback((includes: string[], excludes: string[]) => {
    setManualIncludes(new Set(includes.map(String)))
    setManualExcludes(new Set(excludes.map(String)))
  }, [])

  const conditionsKey = JSON.stringify(watchedConditions) + watchedConditionMatch
  const allRawProducts = useMemo(() => vendorProductsResponse?.data?.data ?? [], [vendorProductsResponse])

  const conditionMatchedProducts = useMemo(() => {
    if (!allRawProducts.length) return []
    if (alwaysMatchAll) return allRawProducts
    if (!watchedConditions?.length) return []

    return allRawProducts.filter((product: any) =>
      evaluateProductAgainstConditions(product, watchedConditions, watchedConditionMatch)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRawProducts, conditionsKey, alwaysMatchAll])

  const matchingProducts = useMemo(() => {
    const afterExcludes = conditionMatchedProducts.filter((p: any) => !manualExcludes.has(p._id))
    const matchedIds = new Set(afterExcludes.map((p: any) => p._id))
    const manuallyIncluded = allRawProducts.filter((p: any) => manualIncludes.has(p._id) && !matchedIds.has(p._id))
    return [...afterExcludes, ...manuallyIncluded]
  }, [conditionMatchedProducts, manualIncludes, manualExcludes, allRawProducts])

  const handleExclude = useCallback((productId: string) => {
    setManualExcludes((prev) => new Set([...prev, productId]))
    setManualIncludes((prev) => { const n = new Set(prev); n.delete(productId); return n })
  }, [])

  const handleInclude = useCallback((productId: string) => {
    setManualIncludes((prev) => new Set([...prev, productId]))
    setManualExcludes((prev) => { const n = new Set(prev); n.delete(productId); return n })
  }, [])

  const handleUndoExclude = useCallback((productId: string) => {
    setManualExcludes((prev) => { const n = new Set(prev); n.delete(productId); return n })
  }, [])

  const handleRemoveInclude = useCallback((productId: string) => {
    setManualIncludes((prev) => { const n = new Set(prev); n.delete(productId); return n })
  }, [])

  return {
    allRawProducts,
    matchingProducts,
    manualIncludes,
    manualExcludes,
    handleExclude,
    handleInclude,
    handleUndoExclude,
    handleRemoveInclude,
    syncInitialState,
    isLoading,
  }
}
