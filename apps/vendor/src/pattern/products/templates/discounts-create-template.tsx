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
import { useProductConditions } from '../hooks/use-product-conditions'
import { ConditionsCard } from '../organisms/conditions-card'
import { ProductPreviewCard } from '../organisms/product-preview-card'
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

const cardClass = 'rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'

// ─── Helpers ─────────────────────────────────────────────────────────

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'store_wide', label: 'Store-Wide' },
  { value: 'category_specific', label: 'Category Specific' },
]

// Client-side condition evaluation logic has been moved to useProductConditions hook

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

  // Local state for product preview has been moved to useProductConditions

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
    if (d.manual_includes?.length || d.manual_excludes?.length) {
      conditionState.syncInitialState(
        d.manual_includes || [],
        d.manual_excludes || []
      )
    }
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
  const conditionState = useProductConditions({
    watchedConditions,
    watchedConditionMatch,
    alwaysMatchAll:
      watchedType === 'store_wide' &&
      (!watchedConditions?.length ||
        watchedConditions.every((c: any) => !c.field && !c.value)),
  })
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
        manual_includes: Array.from(conditionState.manualIncludes as Set<string>),
        manual_excludes: Array.from(conditionState.manualExcludes as Set<string>),
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Go Back */}
      <div className="mb-6">
        <GoBackButton />
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
                      <Label className="text-sm font-medium text-grey-black dark:text-gray-200">
                        Discount Title
                      </Label>
                      <FormControl>
                        <Input
                          placeholder="e.g. Summer Sale 20% Off"
                          className="h-11 bg-muted/40 dark:border-white/10"
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
                        <Label className="text-sm font-medium text-grey-black dark:text-gray-200">
                          Discount Type
                        </Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-muted/40 dark:border-white/10">
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
                        <Label className="text-sm font-medium text-grey-black dark:text-gray-200">
                          Discount Value
                        </Label>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-11 pr-12 bg-muted/40 dark:border-white/10"
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
                        <Label className="text-sm font-medium text-grey-black dark:text-gray-200">
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
                              className="cursor-pointer text-sm text-grey-black dark:text-gray-200"
                            >
                              Percentage
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="fixed" id="vt-fixed" />
                            <Label
                              htmlFor="vt-fixed"
                              className="cursor-pointer text-sm text-grey-black dark:text-gray-200"
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
            <ConditionsCard
              control={form.control as any}
              form={form as any}
              taxonomyTree={taxonomyTree}
            />

            {/* Product Preview Card */}
            <ProductPreviewCard
              conditionState={conditionState}
              className="flex flex-col h-fit"
            />
          </div>

          {/* RIGHT COLUMN: Configuration */}
          <div className="lg:col-span-1">
            {/* Timings & Status Card */}
            <div className={cn(cardClass, 'sticky top-6')}>
              <h3 className="text-base font-medium mb-6 text-grey-black dark:text-gray-200">Configuration</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border/60 dark:border-white/10 p-4">
                  <div>
                    <p className="text-sm font-medium text-grey-black dark:text-gray-200">Flash Sale</p>
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
                  <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg">
                    <FormField
                      control={form.control as any}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs font-medium text-grey-black dark:text-gray-200">
                            Start Date
                          </Label>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-10 text-sm bg-muted/40 dark:border-white/10"
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
                          <Label className="text-xs font-medium text-grey-black dark:text-gray-200">
                            End Date
                          </Label>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-10 text-sm bg-muted/40 dark:border-white/10"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 dark:border-white/10 p-4">
                    <div>
                      <p className="text-sm font-medium text-grey-black dark:text-gray-200">Required Discount</p>
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
                  <div className="flex items-center justify-between rounded-lg border border-border/60 dark:border-white/10 p-4">
                    <div>
                      <p className="text-sm font-medium text-grey-black dark:text-gray-200">Active Status</p>
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
