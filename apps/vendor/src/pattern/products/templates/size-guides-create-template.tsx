'use client'

// Size Guide Create/Edit Template — two-column layout with a form on the left
// (details, size chart builder, fit types, conditions, product preview) and a
// sticky configuration sidebar on the right (active toggle, body parts picker).
// Mirrors the discounts-create-template pattern exactly.

import React, { useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useWatch, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { GoBackButton } from '@/pattern/common/atoms/go-back-button'
import { useProductConditions } from '../hooks/use-product-conditions'
import { ConditionsCard } from '../organisms/conditions-card'
import { ProductPreviewCard } from '../organisms/product-preview-card'
import { SizeChartBuilder } from '../organisms/size-chart-builder'
import { FitTypesBuilder } from '../organisms/fit-types-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  useCreateSizeGuideMutation,
  useUpdateSizeGuideMutation,
  useDeleteSizeGuideMutation,
  useGetSizeGuideQuery,
  useGetBodyPartsQuery,
} from '@/redux/services/size-guides/size-guides.api-slice'
import { useGetTaxonomyTreeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice'

// ─── Schema ──────────────────────────────────────────────────────────

const conditionSchema = z.object({
  field: z.string().min(1, 'Select a field'),
  operator: z.string().min(1, 'Select an operator'),
  value: z.string().min(1, 'Enter or select a value'),
})

const sizeGuideFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  unit: z.enum(['cm', 'inch']),
  body_parts: z.array(z.string()).min(1, 'Select at least one body part'),
  sizes: z
    .array(
      z.object({
        label: z.string().min(1, 'Size label is required'),
        sort_order: z.number(),
        measurements: z.array(
          z.object({
            body_part: z.string(),
            min: z.coerce.number().min(0),
            max: z.coerce.number().min(0),
          })
        ),
      })
    )
    .min(1, 'Add at least one size'),
  fit_types: z
    .array(
      z.object({
        name: z.string().min(1),
        label: z.string().min(1),
        description: z.string().optional(),
        allowances: z.array(
          z.object({
            body_part: z.string(),
            value: z.coerce.number().min(0),
          })
        ),
      })
    )
    .optional()
    .default([]),
  condition_match: z.enum(['all', 'any']),
  conditions: z.array(conditionSchema).min(1, 'Add at least one condition'),
  is_active: z.boolean(),
})

type SizeGuideForm = z.infer<typeof sizeGuideFormSchema>

const cardClass =
  'rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'

const humanizeBodyPart = (part: string): string =>
  part
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

// ─── Component ───────────────────────────────────────────────────────

export const SizeGuidesCreateTemplate = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEditing = Boolean(editId)

  // ─── API hooks ────────────────────────────────────────────────
  const [createSizeGuide, { isLoading: isCreating }] =
    useCreateSizeGuideMutation()
  const [updateSizeGuide, { isLoading: isUpdating }] =
    useUpdateSizeGuideMutation()
  const [deleteSizeGuide, { isLoading: isDeleting }] =
    useDeleteSizeGuideMutation()
  const { data: sizeGuideResponse, isLoading: isLoadingGuide } =
    useGetSizeGuideQuery(editId as string, { skip: !editId })
  const { data: taxonomyTree } = useGetTaxonomyTreeQuery()
  const { data: bodyPartsResponse } = useGetBodyPartsQuery()

  const isSaving = isCreating || isUpdating

  // Available body parts from the API (fallback to common defaults)
  const availableBodyParts = useMemo<string[]>(() => {
    const bp = bodyPartsResponse?.data?.body_parts
    if (Array.isArray(bp) && bp.length > 0) return bp
    // Fallback if endpoint hasn't been deployed yet
    return [
      'chest',
      'waist',
      'hip',
      'shoulder_breadth',
      'sleeve_length',
      'back_length',
      'inseam',
      'outseam',
      'thigh',
      'calf',
      'bicep',
      'forearm',
      'neck',
      'height',
    ]
  }, [bodyPartsResponse])

  // ─── Form ─────────────────────────────────────────────────────
  const form = useForm<SizeGuideForm>({
    resolver: zodResolver(sizeGuideFormSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      unit: 'cm',
      body_parts: [],
      sizes: [
        {
          label: '',
          sort_order: 0,
          measurements: [],
        },
      ],
      fit_types: [],
      condition_match: 'all',
      conditions: [
        {
          field: 'clothing.taxonomy.product_type',
          operator: 'is_equal_to',
          value: '',
        },
      ],
      is_active: true,
    },
  })

  // ─── Watched values ───────────────────────────────────────────
  const watchedBodyParts = useWatch({
    control: form.control as any,
    name: 'body_parts',
  }) as string[]
  const watchedConditions = useWatch({
    control: form.control as any,
    name: 'conditions',
  })
  const watchedConditionMatch = useWatch({
    control: form.control as any,
    name: 'condition_match',
  })
  const watchedUnit = useWatch({
    control: form.control as any,
    name: 'unit',
  }) as 'cm' | 'inch'

  // ─── Sync measurements/allowances when body_parts change ──────
  const prevBodyPartsRef = useRef<string[]>([])

  useEffect(() => {
    const prev = prevBodyPartsRef.current
    const next = watchedBodyParts ?? []

    // Only run if body_parts actually changed
    if (JSON.stringify(prev) === JSON.stringify(next)) return
    prevBodyPartsRef.current = next

    if (next.length === 0) return

    // Sync sizes measurements
    const currentSizes = form.getValues('sizes') ?? []
    const updatedSizes = currentSizes.map((size, idx) => {
      const existingMeasurements = size.measurements ?? []
      const newMeasurements = next.map((bp) => {
        const existing = existingMeasurements.find((m) => m.body_part === bp)
        return existing ?? { body_part: bp, min: 0, max: 0 }
      })
      return { ...size, sort_order: idx, measurements: newMeasurements }
    })
    form.setValue('sizes', updatedSizes, { shouldDirty: true })

    // Sync fit_types allowances
    const currentFitTypes = form.getValues('fit_types') ?? []
    const updatedFitTypes = currentFitTypes.map((ft) => {
      const existingAllowances = ft.allowances ?? []
      const newAllowances = next.map((bp) => {
        const existing = existingAllowances.find((a) => a.body_part === bp)
        return existing ?? { body_part: bp, value: 0 }
      })
      return { ...ft, allowances: newAllowances }
    })
    form.setValue('fit_types', updatedFitTypes, { shouldDirty: true })
  }, [watchedBodyParts, form])

  // ─── Pre-fill on edit ─────────────────────────────────────────
  useEffect(() => {
    const g = sizeGuideResponse?.data
    if (!g || !isEditing) return
    form.reset({
      title: g.title ?? '',
      description: g.description ?? '',
      unit: g.unit ?? 'cm',
      body_parts: g.body_parts ?? [],
      sizes: g.sizes?.length
        ? g.sizes.map((s, idx) => ({
            label: s.label,
            sort_order: s.sort_order ?? idx,
            measurements: s.measurements ?? [],
          }))
        : [{ label: '', sort_order: 0, measurements: [] }],
      fit_types: g.fit_types ?? [],
      condition_match: g.condition_match ?? 'all',
      conditions: g.conditions?.length
        ? g.conditions.map((c) => ({
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
      is_active: g.is_active ?? true,
    })
    prevBodyPartsRef.current = g.body_parts ?? []
    if (g.manual_includes?.length || g.manual_excludes?.length) {
      conditionState.syncInitialState(
        g.manual_includes || [],
        g.manual_excludes || []
      )
    }
  }, [sizeGuideResponse, isEditing, form])

  // ─── Product preview ──────────────────────────────────────────
  const conditionState = useProductConditions({
    watchedConditions,
    watchedConditionMatch,
  })

  // ─── Submit ───────────────────────────────────────────────────
  const onSubmit = async (values: SizeGuideForm) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        unit: values.unit,
        body_parts: values.body_parts,
        sizes: values.sizes.map((s, idx) => ({
          label: s.label,
          sort_order: idx,
          measurements: s.measurements.filter((m) =>
            values.body_parts.includes(m.body_part)
          ),
        })),
        fit_types: (values.fit_types ?? []).map((ft) => ({
          name: ft.name,
          label: ft.label,
          description: ft.description || undefined,
          allowances: ft.allowances.filter((a) =>
            values.body_parts.includes(a.body_part)
          ),
        })),
        condition_match: values.condition_match as 'all' | 'any',
        conditions: values.conditions
          .filter((c) => c.field && c.operator && c.value)
          .map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
        is_active: values.is_active,
        manual_includes: Array.from(
          conditionState.manualIncludes as Set<string>
        ),
        manual_excludes: Array.from(
          conditionState.manualExcludes as Set<string>
        ),
      }

      if (isEditing && editId) {
        await updateSizeGuide({ id: editId, ...payload }).unwrap()
        toast.success('Size guide updated successfully.')
      } else {
        await createSizeGuide(payload).unwrap()
        toast.success('Size guide created successfully.')
      }
      router.push(APP_ROUTES.productsSizeGuides)
    } catch (err) {
      console.error('Submit error:', err)
      const data = (err as any)?.data
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message ||
          JSON.stringify(data) ||
          `Could not ${isEditing ? 'update' : 'create'} the size guide.`
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    try {
      await deleteSizeGuide(editId).unwrap()
      toast.success('Size guide deleted.')
      router.push(APP_ROUTES.productsSizeGuides)
    } catch (err) {
      toast.error(
        (err as any)?.data?.message || 'Failed to delete size guide.'
      )
    }
  }

  if (isEditing && isLoadingGuide) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-primary' />
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className='max-w-7xl mx-auto space-y-6 pb-20'>
      {/* Go Back */}
      <div className='mb-6'>
        <GoBackButton />
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className='grid grid-cols-1 lg:grid-cols-3 gap-6'
          >
            {/* LEFT COLUMN: Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* General Info Card */}
              <div className={cardClass}>
                <h3 className='text-base font-medium mb-6'>
                  Size Guide Details
                </h3>
                <div className='space-y-6'>
                  <FormField
                    control={form.control as any}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <Label className='text-sm font-medium text-grey-black dark:text-gray-200'>
                          Title
                        </Label>
                        <FormControl>
                          <Input
                            placeholder="e.g. Men's Traditional Wear Size Chart"
                            className='h-11 bg-muted/40 dark:border-white/10'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <Label className='text-sm font-medium text-grey-black dark:text-gray-200'>
                          Description (optional)
                        </Label>
                        <FormControl>
                          <Textarea
                            placeholder='Describe what this size guide covers...'
                            className='min-h-[80px] bg-muted/40 dark:border-white/10 resize-none'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name='unit'
                    render={({ field }) => (
                      <FormItem>
                        <Label className='text-sm font-medium text-grey-black dark:text-gray-200'>
                          Measurement Unit
                        </Label>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className='flex items-center gap-6'
                        >
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='cm' id='unit-cm' />
                            <Label
                              htmlFor='unit-cm'
                              className='cursor-pointer text-sm text-grey-black dark:text-gray-200'
                            >
                              Centimeters (cm)
                            </Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='inch' id='unit-inch' />
                            <Label
                              htmlFor='unit-inch'
                              className='cursor-pointer text-sm text-grey-black dark:text-gray-200'
                            >
                              Inches (in)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Size Chart Builder */}
              <SizeChartBuilder
                bodyParts={watchedBodyParts ?? []}
                unit={watchedUnit ?? 'cm'}
              />

              {/* Fit Types Builder */}
              <FitTypesBuilder
                bodyParts={watchedBodyParts ?? []}
                unit={watchedUnit ?? 'cm'}
              />

              {/* Conditions Card */}
              <ConditionsCard
                control={form.control as any}
                form={form as any}
                taxonomyTree={taxonomyTree}
              />

              {/* Product Preview Card */}
              <ProductPreviewCard
                conditionState={conditionState}
                className='flex flex-col h-fit'
              />
            </div>

            {/* RIGHT COLUMN: Configuration */}
            <div className='lg:col-span-1'>
              <div className='sticky top-6 space-y-6'>
                <div className={cardClass}>
                <h3 className='text-base font-medium mb-6 text-grey-black dark:text-gray-200'>
                  Configuration
                </h3>
                <div className='space-y-6'>
                  {/* Active toggle */}
                  <div className='flex items-center justify-between rounded-lg border border-border/60 dark:border-white/10 p-4'>
                    <div>
                      <p className='text-sm font-medium text-grey-black dark:text-gray-200'>
                        Active Status
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Size guide is live and visible
                      </p>
                    </div>
                    <FormField
                      control={form.control as any}
                      name='is_active'
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {/* Body Parts Picker */}
                  <div>
                    <Label className='text-sm font-medium text-grey-black dark:text-gray-200 mb-3 block'>
                      Body Parts
                    </Label>
                    <p className='text-xs text-muted-foreground mb-3'>
                      Select the body parts this size guide measures. These become columns in your size chart.
                    </p>
                    <FormField
                      control={form.control as any}
                      name='body_parts'
                      render={() => (
                        <FormItem>
                          <ScrollArea className='h-[320px] rounded-lg border border-border/60 dark:border-white/10'>
                            <div className='p-3 space-y-1'>
                              {availableBodyParts.map((bp) => {
                                const isChecked = (
                                  watchedBodyParts ?? []
                                ).includes(bp)
                                return (
                                  <label
                                    key={bp}
                                    className={cn(
                                      'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors',
                                      isChecked
                                        ? 'bg-primary/5 dark:bg-primary/10'
                                        : 'hover:bg-muted/40 dark:hover:bg-white/5'
                                    )}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const current =
                                          form.getValues('body_parts') ?? []
                                        if (checked) {
                                          form.setValue(
                                            'body_parts',
                                            [...current, bp],
                                            { shouldDirty: true, shouldValidate: true }
                                          )
                                        } else {
                                          form.setValue(
                                            'body_parts',
                                            current.filter((p) => p !== bp),
                                            { shouldDirty: true, shouldValidate: true }
                                          )
                                        }
                                      }}
                                    />
                                    <span className='text-sm text-grey-black dark:text-gray-200'>
                                      {humanizeBodyPart(bp)}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </ScrollArea>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(watchedBodyParts?.length ?? 0) > 0 && (
                      <p className='text-xs text-muted-foreground mt-2'>
                        {watchedBodyParts.length} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="h-12 w-full">
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Size Guide'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => router.push(APP_ROUTES.productsSizeGuides)}
                >
                  Cancel
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-12 w-full text-destructive border-destructive/20 hover:bg-destructive/5"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 size-4" />
                    )}
                    Delete Size Guide
                  </Button>
                )}
              </div>
            </div>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
