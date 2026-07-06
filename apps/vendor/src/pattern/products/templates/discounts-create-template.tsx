'use client'

// Create Discount page — a rule-based discount builder. Title/Type/Value +
// "Conditions must match" rules (field / operator / value) map to the backend
// CreateDiscountRequest. Value dropdowns are populated dynamically from taxonomy.
// Features a live product preview and manual include/exclude lists.

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  GripVertical,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
  Undo2,
  UserPlus,
} from 'lucide-react'
import { GoBackButton } from '@/pattern/common/atoms/go-back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/lib/routes'
import {
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetDiscountQuery,
  type DiscountType,
} from '@/redux/services/discounts/discounts.api-slice'
import { useGetProductsByVendorQuery } from '@/redux/services/products/products.api-slice'
import { useGetTaxonomyTreeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice'
import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  TAXONOMY_FIELD_CONFIG,
  STATIC_VALUE_OPTIONS,
  FREE_TEXT_FIELDS,
} from '../lib/collection-condition-options'

// ─── Schema ──────────────────────────────────────────────────────────

const conditionSchema = z.object({
  field: z.string().min(1, 'Select a field'),
  operator: z.string().min(1, 'Select an operator'),
  value: z.string().min(1, 'Enter or select a value'),
})

const discountFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum([
    'percentage',
    'fixed',
    'store_wide',
    'flash_percentage',
    'flash_fixed',
    'category_specific',
  ]),
  value: z.coerce.number().min(0.01, 'Value must be > 0'),
  value_type: z.enum(['percentage', 'fixed']).optional(),
  condition_match: z.enum(['all', 'any']),
  conditions: z.array(conditionSchema).min(1, 'Add at least one condition'),
  required_discount: z.boolean(),
  is_active: z.boolean(),
  is_flash: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type DiscountForm = z.infer<typeof discountFormSchema>

const cardClass = 'rounded-[10px] bg-card p-6 custom-card-shadow'

// ─── Helpers ─────────────────────────────────────────────────────────

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'store_wide', label: 'Store-Wide' },
  { value: 'category_specific', label: 'Category Specific' },
]

// Client-side condition evaluation (same logic as backend)
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (Array.isArray(current)) {
      current = current
        .map((item) => item?.[key])
        .filter((v) => v !== undefined)
      if (current.length === 0) return undefined
      if (current.length === 1) current = current[0]
    } else {
      current = current?.[key]
      if (current === undefined) return undefined
    }
  }
  return current
}

const evaluateOperator = (
  value: any,
  operator: string,
  expected: any
): boolean => {
  switch (operator) {
    case 'is_equal_to':
      return String(value).toLowerCase() === String(expected).toLowerCase()
    case 'not_equal_to':
      return String(value).toLowerCase() !== String(expected).toLowerCase()
    case 'greater_than':
      return Number(value) > Number(expected)
    case 'less_than':
      return Number(value) < Number(expected)
    case 'contains':
      return String(value)
        .toLowerCase()
        .includes(String(expected).toLowerCase())
    case 'starts_with':
      return String(value)
        .toLowerCase()
        .startsWith(String(expected).toLowerCase())
    case 'ends_with':
      return String(value)
        .toLowerCase()
        .endsWith(String(expected).toLowerCase())
    default:
      return false
  }
}

const evaluateProductAgainstConditions = (
  product: any,
  conditions: { field: string; operator: string; value: string }[],
  conditionMatch: 'all' | 'any'
): boolean => {
  const valid = conditions.filter((c) => c.field && c.operator && c.value)
  if (!valid.length) return false
  const results = valid.map((cond) => {
    const pv = getNestedValue(product, cond.field)
    if (Array.isArray(pv))
      return pv.some((v) => evaluateOperator(v, cond.operator, cond.value))
    return evaluateOperator(pv, cond.operator, cond.value)
  })
  return conditionMatch === 'all'
    ? results.every((r) => r)
    : results.some((r) => r)
}

const getProductName = (p: any): string =>
  p.name ||
  p.clothing?.name ||
  p.fabric?.name ||
  p.accessory?.name ||
  'Untitled'

const getProductImage = (p: any): string | undefined => {
  const inner = p?.[p?.kind] ?? p
  const img = inner?.images?.[0]
  return typeof img === 'string' ? img : img?.url
}

const getProductPrice = (p: any): number | undefined => p.base_price ?? p.price

// ─── Component ───────────────────────────────────────────────────────

export const DiscountsCreateTemplate = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') // We expect ?id=... when editing
  const isEditing = Boolean(editId)

  // ─── API hooks ────────────────────────────────────────────────
  const [createDiscount, { isLoading: isCreating }] =
    useCreateDiscountMutation()
  const [updateDiscount, { isLoading: isUpdating }] =
    useUpdateDiscountMutation()
  const [deleteDiscount, { isLoading: isDeleting }] =
    useDeleteDiscountMutation()
  const { data: discountResponse, isLoading: isLoadingDiscount } =
    useGetDiscountQuery(editId as string, { skip: !editId })
  const { data: taxonomyTree } = useGetTaxonomyTreeQuery()
  const { data: vendorProductsResponse } = useGetProductsByVendorQuery({
    size: 200,
  })

  const isSaving = isCreating || isUpdating

  // ─── Local state ──────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState('')
  const [manualPickerSearch, setManualPickerSearch] = useState('')
  const [showManualPicker, setShowManualPicker] = useState(false)
  const [manualIncludes, setManualIncludes] = useState<Set<string>>(new Set())
  const [manualExcludes, setManualExcludes] = useState<Set<string>>(new Set())

  // ─── Form ─────────────────────────────────────────────────────
  const form = useForm<DiscountForm>({
    resolver: zodResolver(discountFormSchema) as any,
    defaultValues: {
      title: '',
      type: 'percentage',
      value: 0,
      value_type: undefined,
      condition_match: 'all',
      conditions: [
        {
          field: 'clothing.taxonomy.product_type',
          operator: 'is_equal_to',
          value: '',
        },
      ],
      required_discount: false,
      is_active: true,
      is_flash: false,
      start_date: '',
      end_date: '',
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control as any,
    name: 'conditions',
  })

  // ─── Drag-and-drop state ──────────────────────────────────────
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])
  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault()
      if (dragIndex !== null && dragIndex !== targetIndex)
        move(dragIndex, targetIndex)
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [dragIndex, move]
  )
  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  // ─── Taxonomy-driven value dropdowns ──────────────────────────
  const getTaxonomyValues = useMemo(() => {
    if (!taxonomyTree) return () => []
    return (fieldPath: string): { value: string; label: string }[] => {
      const config = TAXONOMY_FIELD_CONFIG[fieldPath]
      if (!config) return []
      const kindData = taxonomyTree[config.kind]
      if (!kindData?.product_types) return []
      switch (config.type) {
        case 'product_type':
          return kindData.product_types.map((pt: any) => ({
            value: pt.name,
            label: pt.name,
          }))
        case 'categories': {
          const all = new Set<string>()
          kindData.product_types.forEach((pt: any) =>
            pt.categories?.forEach((c: string) => all.add(c))
          )
          return Array.from(all)
            .sort()
            .map((c) => ({ value: c, label: c }))
        }
        case 'audience':
          return [
            { value: 'men', label: 'Men' },
            { value: 'women', label: 'Women' },
            { value: 'unisex', label: 'Unisex' },
            { value: 'kids', label: 'Kids' },
          ]
        case 'attributes': {
          const all = new Set<string>()
          kindData.product_types.forEach((pt: any) =>
            pt.attributes?.forEach((a: string) => all.add(a))
          )
          return Array.from(all)
            .sort()
            .map((a) => ({ value: a, label: a }))
        }
        default:
          return []
      }
    }
  }, [taxonomyTree])

  // ─── Pre-fill on edit ─────────────────────────────────────────
  useEffect(() => {
    const d = discountResponse?.data
    if (!d || !isEditing) return
    const isFlash = d.type?.startsWith('flash_') ?? false
    const baseType = isFlash
      ? d.type === 'flash_percentage'
        ? 'percentage'
        : 'fixed'
      : (d.type ?? 'percentage')
    form.reset({
      title: d.title ?? '',
      type: baseType as any,
      value: d.value ?? 0,
      value_type: d.value_type,
      condition_match: d.condition_match ?? 'all',
      conditions: d.conditions?.length
        ? d.conditions.map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          }))
        : [
            {
              field: 'clothing.taxonomy.product_type',
              operator: 'is_equal_to',
              value: '',
            },
          ],
      required_discount: d.required_discount ?? false,
      is_active: d.is_active ?? true,
      is_flash: isFlash,
      start_date: d.start_date
        ? new Date(d.start_date).toISOString().slice(0, 16)
        : '',
      end_date: d.end_date
        ? new Date(d.end_date).toISOString().slice(0, 16)
        : '',
    })
    if (d.manual_includes?.length)
      setManualIncludes(new Set(d.manual_includes.map(String)))
    if (d.manual_excludes?.length)
      setManualExcludes(new Set(d.manual_excludes.map(String)))
  }, [discountResponse, isEditing, form])

  // ─── Watched values ───────────────────────────────────────────
  const watchedType = useWatch({ control: form.control as any, name: 'type' })
  const watchedIsFlash = useWatch({
    control: form.control as any,
    name: 'is_flash',
  })
  const watchedConditions = useWatch({
    control: form.control as any,
    name: 'conditions',
  })
  const watchedConditionMatch = useWatch({
    control: form.control as any,
    name: 'condition_match',
  })

  const showValueType =
    watchedType === 'store_wide' || watchedType === 'category_specific'
  const isPercentType =
    watchedType === 'percentage' || watchedType === 'flash_percentage'
  const watchedValueType = useWatch({
    control: form.control as any,
    name: 'value_type',
  })
  const isPercentValue = showValueType
    ? watchedValueType === 'percentage'
    : isPercentType

  // ─── Product preview ──────────────────────────────────────────
  const conditionsKey =
    JSON.stringify(watchedConditions) + watchedConditionMatch
  const allRawProducts = useMemo(
    () => vendorProductsResponse?.data?.data ?? [],
    [vendorProductsResponse]
  )

  const conditionMatchedProducts = useMemo(() => {
    if (!allRawProducts.length || !watchedConditions?.length) return []
    // Store-wide with no conditions matches everything
    if (
      watchedType === 'store_wide' &&
      (!watchedConditions.length ||
        watchedConditions.every((c: any) => !c.field && !c.value))
    ) {
      return allRawProducts
    }
    return allRawProducts.filter((product: any) =>
      evaluateProductAgainstConditions(
        product,
        watchedConditions,
        watchedConditionMatch
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRawProducts, conditionsKey, watchedType])

  const matchingProducts = useMemo(() => {
    const afterExcludes = conditionMatchedProducts.filter(
      (p: any) => !manualExcludes.has(p._id)
    )
    const matchedIds = new Set(afterExcludes.map((p: any) => p._id))
    const manuallyIncluded = allRawProducts.filter(
      (p: any) => manualIncludes.has(p._id) && !matchedIds.has(p._id)
    )
    return [...afterExcludes, ...manuallyIncluded]
  }, [conditionMatchedProducts, manualIncludes, manualExcludes, allRawProducts])

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return matchingProducts
    return matchingProducts.filter((p: any) =>
      getProductName(p).toLowerCase().includes(term)
    )
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

  // ─── Manual overrides ─────────────────────────────────────────
  const handleExclude = (productId: string) => {
    setManualExcludes((prev) => new Set([...prev, productId]))
    setManualIncludes((prev) => {
      const n = new Set(prev)
      n.delete(productId)
      return n
    })
  }
  const handleInclude = (productId: string) => {
    setManualIncludes((prev) => new Set([...prev, productId]))
    setManualExcludes((prev) => {
      const n = new Set(prev)
      n.delete(productId)
      return n
    })
  }
  const handleUndoExclude = (productId: string) => {
    setManualExcludes((prev) => {
      const n = new Set(prev)
      n.delete(productId)
      return n
    })
  }
  const handleRemoveInclude = (productId: string) => {
    setManualIncludes((prev) => {
      const n = new Set(prev)
      n.delete(productId)
      return n
    })
  }

  // ─── Submit ───────────────────────────────────────────────────
  const onSubmit = async (values: DiscountForm) => {
    try {
      let apiType: DiscountType = values.type
      if (values.is_flash) {
        apiType = values.type === 'fixed' ? 'flash_fixed' : 'flash_percentage'
      }

      const payload = {
        title: values.title,
        type: apiType,
        value: Number(values.value),
        value_type: showValueType
          ? values.value_type
          : apiType.includes('fixed')
            ? 'fixed'
            : 'percentage',
        condition_match: values.condition_match as 'all' | 'any',
        conditions: values.conditions
          .filter((c) => c.field && c.operator && c.value)
          .map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
        required_discount: values.required_discount,
        is_active: values.is_active,
        start_date:
          values.is_flash && values.start_date
            ? new Date(values.start_date).toISOString()
            : undefined,
        end_date:
          values.is_flash && values.end_date
            ? new Date(values.end_date).toISOString()
            : undefined,
        manual_includes: [...manualIncludes],
        manual_excludes: [...manualExcludes],
      }

      if (isEditing && editId) {
        await updateDiscount({ id: editId, ...payload }).unwrap()
        toast.success('Discount updated successfully.')
      } else {
        await createDiscount(payload).unwrap()
        toast.success('Discount created successfully.')
      }
      router.push(APP_ROUTES.productsDiscounts)
    } catch (err) {
      console.error('Submit error:', err)
      const data = (err as any)?.data
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message ||
          JSON.stringify(data) ||
          `Could not ${isEditing ? 'update' : 'create'} the discount.`
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    try {
      await deleteDiscount(editId).unwrap()
      toast.success('Discount deleted.')
      router.push(APP_ROUTES.productsDiscounts)
    } catch (err) {
      toast.error((err as any)?.data?.message || 'Failed to delete discount.')
    }
  }

  if (isEditing && isLoadingDiscount) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <GoBackButton />
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit Discount' : 'Create Discount'}
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT COLUMN: Main Form & Conditions */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className={cardClass}>
              <h3 className="text-base font-medium mb-6">Discount Details</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">
                        Discount Title
                      </Label>
                      <FormControl>
                        <Input
                          placeholder="e.g. Summer Sale 20% Off"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-medium">
                          Discount Type
                        </Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-medium">
                          Discount Value
                        </Label>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-11 pr-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber || 0)
                              }
                            />
                          </FormControl>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                            {isPercentValue ? '%' : '₦'}
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {showValueType && (
                  <FormField
                    control={form.control as any}
                    name="value_type"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-medium">
                          Value Type
                        </Label>
                        <RadioGroup
                          value={field.value ?? 'percentage'}
                          onValueChange={field.onChange}
                          className="flex items-center gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="percentage" id="vt-pct" />
                            <Label
                              htmlFor="vt-pct"
                              className="cursor-pointer text-sm"
                            >
                              Percentage
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="fixed" id="vt-fixed" />
                            <Label
                              htmlFor="vt-fixed"
                              className="cursor-pointer text-sm"
                            >
                              Fixed Amount
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Conditions Card */}
            <div className={cardClass}>
              <h3 className="text-base font-medium mb-2">Conditions</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Products must match these rules for the discount to apply.
              </p>

              <div className="space-y-6">
                <FormField
                  control={form.control as any}
                  name="condition_match"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium">
                          Products must match:
                        </span>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex items-center gap-4"
                        >
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="all" id="d-match-all" />
                            <Label
                              htmlFor="d-match-all"
                              className="cursor-pointer text-sm"
                            >
                              All conditions
                            </Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="any" id="d-match-any" />
                            <Label
                              htmlFor="d-match-any"
                              className="cursor-pointer text-sm"
                            >
                              Any condition
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  {fields.map((row, index) => {
                    const selectedField = form.watch(
                      `conditions.${index}.field`
                    )
                    const isFreeText = FREE_TEXT_FIELDS.has(selectedField)
                    const isTaxonomyField =
                      selectedField in TAXONOMY_FIELD_CONFIG
                    const isStaticField = selectedField in STATIC_VALUE_OPTIONS
                    let valueOptions: { value: string; label: string }[] = []
                    if (isTaxonomyField)
                      valueOptions = getTaxonomyValues(selectedField)
                    else if (isStaticField)
                      valueOptions = STATIC_VALUE_OPTIONS[selectedField]

                    return (
                      <div
                        key={row.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'flex flex-wrap items-start gap-3 sm:flex-nowrap rounded-lg p-3 border border-border/50 transition-all duration-200 bg-background',
                          dragIndex === index && 'opacity-40 scale-[0.98]',
                          dragOverIndex === index &&
                            dragIndex !== index &&
                            'border-2 border-primary/40 bg-primary/5'
                        )}
                      >
                        {/* Drag Handle */}
                        <div
                          className={cn(
                            'flex h-11 w-8 shrink-0 cursor-grab items-center justify-center rounded-md border transition-all active:cursor-grabbing',
                            dragIndex === index
                              ? 'bg-primary border-primary text-white'
                              : 'border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30'
                          )}
                          title="Drag to reorder"
                        >
                          <GripVertical className="size-4" />
                        </div>

                        {/* Field */}
                        <FormField
                          control={form.control as any}
                          name={`conditions.${index}.field`}
                          render={({ field }) => (
                            <FormItem className="flex-1 min-w-[150px]">
                              <Select
                                value={field.value}
                                onValueChange={(next) => {
                                  field.onChange(next)
                                  form.setValue(`conditions.${index}.value`, '')
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select field..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CONDITION_FIELD_OPTIONS.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Operator */}
                        <FormField
                          control={form.control as any}
                          name={`conditions.${index}.operator`}
                          render={({ field }) => (
                            <FormItem className="flex-[0.8] min-w-[130px]">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Operator..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CONDITION_OPERATOR_OPTIONS.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Value */}
                        <FormField
                          control={form.control as any}
                          name={`conditions.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1 min-w-[150px]">
                              {isFreeText ? (
                                <FormControl>
                                  <Input
                                    placeholder={
                                      selectedField === 'base_price'
                                        ? 'Price value...'
                                        : 'Value...'
                                    }
                                    className="h-11"
                                    {...field}
                                  />
                                </FormControl>
                              ) : (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select value..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {valueOptions.length > 0 ? (
                                      valueOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="__loading" disabled>
                                        {isTaxonomyField
                                          ? 'Loading...'
                                          : 'Select field first'}
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </FormItem>
                          )}
                        />

                        {/* Delete */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                          className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      field: 'clothing.taxonomy.product_type',
                      operator: 'is_equal_to',
                      value: '',
                    })
                  }
                  className="w-full border-dashed py-6 text-muted-foreground hover:text-primary hover:border-primary/50"
                >
                  <Plus className="mr-2 size-4" />
                  Add Another Condition
                </Button>
              </div>
            </div>
            <div className={cn(cardClass, 'flex flex-col h-[600px]')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Product Preview</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {matchingProducts.length} matching
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                These products currently match your conditions and will receive
                this discount.
              </p>

              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search matching products..."
                  className="h-10 pl-9 text-sm"
                />
              </div>

              {/* Product list */}
              <ScrollArea className="flex-1 border rounded-lg bg-background/50 p-2">
                {filteredProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Search className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {matchingProducts.length === 0
                        ? 'Try adjusting your conditions.'
                        : 'No products match your search.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pr-3">
                    {filteredProducts.slice(0, 100).map((product: any) => {
                      const img = getProductImage(product)
                      const name = getProductName(product)
                      const price = getProductPrice(product)
                      const isManuallyIncluded = manualIncludes.has(product._id)
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors border border-transparent hover:border-border/50"
                        >
                          <div className="relative size-10 shrink-0 rounded-md overflow-hidden border bg-muted">
                            {img ? (
                              <Image
                                src={img}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground text-center leading-none">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground/90">
                              {name}
                            </p>
                            {price != null && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ₦{price.toLocaleString()}
                              </p>
                            )}
                          </div>
                          {isManuallyIncluded && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 font-medium">
                              Added
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              isManuallyIncluded
                                ? handleRemoveInclude(product._id)
                                : handleExclude(product._id)
                            }
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title={
                              isManuallyIncluded
                                ? 'Remove from includes'
                                : 'Exclude product manually'
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )
                    })}
                    {filteredProducts.length > 100 && (
                      <p className="text-center text-xs text-muted-foreground py-4">
                        Showing 100 of {filteredProducts.length}
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Manual include picker */}
              <div className="mt-4 pt-4 border-t">
                {!showManualPicker ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualPicker(true)}
                    className="w-full text-sm"
                  >
                    <UserPlus className="mr-2 size-4" />
                    Manually Include Products
                  </Button>
                ) : (
                  <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Include Overrides
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowManualPicker(false)}
                        className="h-7 w-7 hover:bg-muted"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={manualPickerSearch}
                        onChange={(e) => setManualPickerSearch(e.target.value)}
                        placeholder="Search products to include..."
                        className="h-9 pl-8 text-xs"
                      />
                    </div>
                    <ScrollArea className="h-[180px]">
                      <div className="space-y-1 pr-3">
                        {availableForInclude.slice(0, 30).map((p: any) => (
                          <div
                            key={p._id}
                            className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleInclude(p._id)}
                          >
                            <div className="relative size-8 shrink-0 rounded overflow-hidden border bg-background">
                              {getProductImage(p) ? (
                                <Image
                                  src={getProductImage(p)!}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              ) : null}
                            </div>
                            <span className="text-xs font-medium truncate flex-1">
                              {getProductName(p)}
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Plus className="size-3" />
                            </div>
                          </div>
                        ))}
                        {availableForInclude.length === 0 && (
                          <p className="text-center text-xs text-muted-foreground py-6">
                            No more products available to include.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Excluded products */}
              {manualExcludes.size > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    Excluded Overrides ({manualExcludes.size})
                  </span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-2">
                    {allRawProducts
                      .filter((p: any) => manualExcludes.has(p._id))
                      .map((p: any) => (
                        <div
                          key={p._id}
                          className="flex items-center gap-2.5 rounded-md p-1.5 bg-destructive/5 border border-destructive/10"
                        >
                          <div className="relative size-8 shrink-0 rounded overflow-hidden border bg-background">
                            {getProductImage(p) ? (
                              <Image
                                src={getProductImage(p)!}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            ) : null}
                          </div>
                          <span className="text-xs font-medium truncate flex-1 text-destructive/80 line-through">
                            {getProductName(p)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUndoExclude(p._id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            title="Restore to discount"
                          >
                            <Undo2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Configuration */}
          <div className="lg:col-span-1">
            {/* Timings & Status Card */}
            <div className={cn(cardClass, 'sticky top-6')}>
              <h3 className="text-base font-medium mb-6">Configuration</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Flash Sale</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Time-limited discount with auto start/end
                    </p>
                  </div>
                  <FormField
                    control={form.control as any}
                    name="is_flash"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {watchedIsFlash && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <FormField
                      control={form.control as any}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs font-medium">
                            Start Date
                          </Label>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-10 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs font-medium">
                            End Date
                          </Label>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-10 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                    <div>
                      <p className="text-sm font-medium">Required Discount</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be applied if conditions match
                      </p>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="required_discount"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                    <div>
                      <p className="text-sm font-medium">Active Status</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Discount is live and applied
                      </p>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="is_active"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="lg:col-span-3 sticky bottom-0 z-10 -mx-6 bg-background/80 backdrop-blur-md border-t p-6 mt-6 flex items-center justify-end gap-4">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive border-destructive/20 hover:bg-destructive/5 mr-auto"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Delete Discount
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(APP_ROUTES.productsDiscounts)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-[140px]">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
