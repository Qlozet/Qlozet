'use client'

// Create Collection page — a rule-based collection builder. Title/About +
// "Conditions must match" rules (field / operator / value) map to the backend
// CreateCollectionDto (POST /collections). Status maps to `is_active`.
// Value dropdowns are populated dynamically from the taxonomy API.

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
    GripVertical,
    Plus,
    Search,
    Trash2,
    Loader2,
    ImageIcon,
    X,
    Undo2,
    UserPlus,
} from 'lucide-react'
import { GoBackButton } from '@/pattern/common/atoms/go-back-button'
import {
    useCreateCollectionMutation,
    useUpdateCollectionMutation,
    useGetCollectionQuery,
    type CollectionConditionOperator,
} from '@/redux/services/collections/collections.api-slice'
import { useUploadProductImageMutation } from '@/redux/services/uploads/uploads.api-slice'
import { useGetTaxonomyTreeQuery } from '@/redux/services/taxonomy/taxonomy.api-slice'
import { useGetProductsByVendorQuery } from '@/redux/services/products/products.api-slice'
import { APP_ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn, formatCurrency } from '@/lib/utils'
import {
    CONDITION_FIELD_OPTIONS,
    CONDITION_OPERATOR_OPTIONS,
    TAXONOMY_FIELD_CONFIG,
    STATIC_VALUE_OPTIONS,
    FREE_TEXT_FIELDS,
} from '../lib/collection-condition-options'

const conditionSchema = z.object({
    field: z.string().min(1, 'Select a field'),
    operator: z.string().min(1, 'Select an operator'),
    value: z.string().min(1, 'Enter or select a value'),
})

const createCollectionSchema = z.object({
    title: z.string().min(1, 'Enter a title'),
    description: z.string().optional(),
    condition_match: z.enum(['all', 'any']),
    is_active: z.boolean(),
    conditions: z.array(conditionSchema).min(1, 'Add at least one condition'),
})

type CreateCollectionForm = z.infer<typeof createCollectionSchema>

const cardClass = 'rounded-[10px] bg-card p-6 custom-card-shadow'

// ─── Client-side condition evaluation (mirrors backend getNestedValue + evaluateOperator) ───
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
        case 'is_equal_to':
            return String(value).toLowerCase() === String(expected).toLowerCase()
        case 'not_equal_to':
            return String(value).toLowerCase() !== String(expected).toLowerCase()
        case 'greater_than':
            return Number(value) > Number(expected)
        case 'less_than':
            return Number(value) < Number(expected)
        case 'contains':
            return String(value).toLowerCase().includes(String(expected).toLowerCase())
        case 'starts_with':
            return String(value).toLowerCase().startsWith(String(expected).toLowerCase())
        case 'ends_with':
            return String(value).toLowerCase().endsWith(String(expected).toLowerCase())
        default:
            return false
    }
}

const evaluateProductAgainstConditions = (
    product: any,
    conditions: { field: string; operator: string; value: string }[],
    conditionMatch: 'all' | 'any'
): boolean => {
    if (!conditions.length) return false
    // Only evaluate conditions that are fully filled in
    const validConditions = conditions.filter((c) => c.field && c.operator && c.value)
    if (!validConditions.length) return false

    const results = validConditions.map((cond) => {
        const productValue = getNestedValue(product, cond.field)
        if (Array.isArray(productValue)) {
            return productValue.some((v) => evaluateOperator(v, cond.operator, cond.value))
        }
        return evaluateOperator(productValue, cond.operator, cond.value)
    })

    return conditionMatch === 'all' ? results.every((r) => r) : results.some((r) => r)
}

export const CollectionsCreateTemplate = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')
    const isEditing = Boolean(editId)

    const [createCollection, { isLoading: isCreating }] =
        useCreateCollectionMutation()
    const [updateCollection, { isLoading: isUpdating }] =
        useUpdateCollectionMutation()
    const { data: collectionResponse, isLoading: isLoadingCollection } =
        useGetCollectionQuery(editId as string, { skip: !editId })
    const [uploadImage, { isLoading: isUploading }] =
        useUploadProductImageMutation()

    // Fetch taxonomy tree for all kinds to populate dynamic dropdowns
    const { data: taxonomyTree } = useGetTaxonomyTreeQuery()

    // Fetch all vendor products for live preview (large page to get all)
    const { data: vendorProductsResponse } = useGetProductsByVendorQuery({ size: 200 })

    const isLoading = isCreating || isUpdating || isUploading

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [productSearch, setProductSearch] = useState('')
    const [manualPickerSearch, setManualPickerSearch] = useState('')
    const [showManualPicker, setShowManualPicker] = useState(false)
    const [manualIncludes, setManualIncludes] = useState<Set<string>>(new Set())
    const [manualExcludes, setManualExcludes] = useState<Set<string>>(new Set())
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<CreateCollectionForm>({
        resolver: zodResolver(createCollectionSchema),
        defaultValues: {
            title: '',
            description: '',
            condition_match: 'all',
            is_active: true,
            conditions: [{ field: 'clothing.taxonomy.product_type', operator: 'is_equal_to', value: '' }],
        },
    })

    const { fields, append, remove, swap, move } = useFieldArray({
        control: form.control,
        name: 'conditions',
    })

    // ─── Native drag-and-drop state for condition reordering ───
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

    const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        if (dragIndex !== null && dragIndex !== targetIndex) {
            move(dragIndex, targetIndex)
        }
        setDragIndex(null)
        setDragOverIndex(null)
    }, [dragIndex, move])

    const handleDragEnd = useCallback(() => {
        setDragIndex(null)
        setDragOverIndex(null)
    }, [])
    // Build dynamic value options from taxonomy tree
    const getTaxonomyValues = useMemo(() => {
        if (!taxonomyTree) return () => []

        return (fieldPath: string): { value: string; label: string }[] => {
            const config = TAXONOMY_FIELD_CONFIG[fieldPath]
            if (!config) return []

            const kindData = taxonomyTree[config.kind]
            if (!kindData?.product_types) return []

            switch (config.type) {
                case 'product_type':
                    return kindData.product_types.map((pt) => ({
                        value: pt.name,
                        label: pt.name,
                    }))
                case 'categories': {
                    // Aggregate all categories across all product types for this kind
                    const allCategories = new Set<string>()
                    kindData.product_types.forEach((pt) => {
                        pt.categories?.forEach((cat) => allCategories.add(cat))
                    })
                    return Array.from(allCategories)
                        .sort()
                        .map((cat) => ({ value: cat, label: cat }))
                }
                case 'audience':
                    // Values must be lowercase to match what products store
                    return [
                        { value: 'men', label: 'Men' },
                        { value: 'women', label: 'Women' },
                        { value: 'unisex', label: 'Unisex' },
                        { value: 'kids', label: 'Kids' },
                    ]
                case 'attributes': {
                    // Aggregate all attributes across all product types for this kind
                    const allAttributes = new Set<string>()
                    kindData.product_types.forEach((pt) => {
                        pt.attributes?.forEach((attr) => allAttributes.add(attr))
                    })
                    return Array.from(allAttributes)
                        .sort()
                        .map((attr) => ({ value: attr, label: attr }))
                }
                default:
                    return []
            }
        }
    }, [taxonomyTree])

    // Prefill the form when editing an existing collection.
    useEffect(() => {
        const collection = collectionResponse?.data
        if (!collection) return
        form.reset({
            title: collection.title ?? '',
            description: collection.description ?? '',
            condition_match: collection.condition_match ?? 'all',
            is_active: collection.is_active ?? true,
            conditions:
                collection.conditions && collection.conditions.length > 0
                    ? collection.conditions.map((c) => ({
                          field: c.field,
                          operator: c.operator,
                          value: c.value,
                      }))
                    : [{ field: 'clothing.taxonomy.product_type', operator: 'is_equal_to', value: '' }],
        })
        const cover = collection.cover_image as string | undefined
        if (cover) setImagePreview(cover)
        // Load manual overrides
        if (collection.manual_includes?.length) {
            setManualIncludes(new Set(collection.manual_includes.map((id: any) => typeof id === 'string' ? id : id.toString())))
        }
        if (collection.manual_excludes?.length) {
            setManualExcludes(new Set(collection.manual_excludes.map((id: any) => typeof id === 'string' ? id : id.toString())))
        }
    }, [collectionResponse, form])

    const handleGoBack = () => router.push(APP_ROUTES.productsCollections)

    const handleImageEdit = () => fileInputRef.current?.click()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    // Watch conditions reactively for live product preview.
    // useWatch returns new references on every change (unlike form.watch which
    // can return the same mutated array reference), so useMemo detects updates.
    const watchedConditions = useWatch({ control: form.control, name: 'conditions' })
    const watchedConditionMatch = useWatch({ control: form.control, name: 'condition_match' })

    // Serialize conditions to a string so useMemo re-evaluates when any
    // individual field / operator / value changes inside a condition row.
    const conditionsKey = JSON.stringify(watchedConditions) + watchedConditionMatch

    // All raw vendor products from the API (before the transformResponse flattening)
    const allRawProducts = useMemo(() => {
        return vendorProductsResponse?.data?.data ?? []
    }, [vendorProductsResponse])

    // Live-evaluate conditions against all vendor products
    const conditionMatchedProducts = useMemo(() => {
        if (!allRawProducts.length || !watchedConditions?.length) return []
        return allRawProducts.filter((product: any) =>
            evaluateProductAgainstConditions(product, watchedConditions, watchedConditionMatch)
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRawProducts, conditionsKey])

    // Build the final product list accounting for manual overrides:
    // 1. Start with condition-matched products
    // 2. Remove manually excluded ones
    // 3. Add manually included ones (that aren't already matched)
    const matchingProducts = useMemo(() => {
        const afterExcludes = conditionMatchedProducts.filter(
            (p: any) => !manualExcludes.has(p._id)
        )
        // Add manually included products not already in the list
        const matchedIds = new Set(afterExcludes.map((p: any) => p._id))
        const manuallyIncludedProducts = allRawProducts.filter(
            (p: any) => manualIncludes.has(p._id) && !matchedIds.has(p._id)
        )
        return [...afterExcludes, ...manuallyIncludedProducts]
    }, [conditionMatchedProducts, manualIncludes, manualExcludes, allRawProducts])

    // Products that have been manually excluded
    const excludedProducts = useMemo(() => {
        return allRawProducts.filter((p: any) => manualExcludes.has(p._id))
    }, [allRawProducts, manualExcludes])

    // Apply search filter on top of matched products
    const filteredProducts = useMemo(() => {
        const term = productSearch.trim().toLowerCase()
        if (!term) return matchingProducts
        return matchingProducts.filter((p: any) => {
            const productName = p.name || p.clothing?.name || p.fabric?.name || p.accessory?.name || ''
            return productName.toLowerCase().includes(term)
        })
    }, [matchingProducts, productSearch])

    // Products available for manual include (not already matched or included)
    const availableForInclude = useMemo(() => {
        const matchedIds = new Set(matchingProducts.map((p: any) => p._id))
        const term = manualPickerSearch.trim().toLowerCase()
        return allRawProducts.filter((p: any) => {
            if (matchedIds.has(p._id)) return false
            if (manualExcludes.has(p._id)) return false
            if (!term) return true
            const name = p.name || p.clothing?.name || p.fabric?.name || p.accessory?.name || ''
            return name.toLowerCase().includes(term)
        })
    }, [allRawProducts, matchingProducts, manualExcludes, manualPickerSearch])

    // Handlers for manual overrides
    const handleExclude = (productId: string) => {
        setManualExcludes(prev => new Set([...prev, productId]))
        setManualIncludes(prev => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
    }

    const handleInclude = (productId: string) => {
        setManualIncludes(prev => new Set([...prev, productId]))
        setManualExcludes(prev => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
    }

    const handleUndoExclude = (productId: string) => {
        setManualExcludes(prev => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
    }

    const handleRemoveInclude = (productId: string) => {
        setManualIncludes(prev => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
    }

    const onSubmit = async (values: CreateCollectionForm) => {
        try {
            // 1. Upload image if a new file was selected
            let coverImageUrl: string | undefined
            if (imageFile) {
                const uploadResult = await uploadImage(imageFile).unwrap()
                coverImageUrl = uploadResult?.data?.url
            }

            const payload = {
                title: values.title,
                description: values.description || undefined,
                condition_match: values.condition_match,
                is_active: values.is_active,
                conditions: values.conditions.map((c) => ({
                    field: c.field,
                    operator: c.operator as CollectionConditionOperator,
                    value: c.value,
                })),
                manual_includes: [...manualIncludes],
                manual_excludes: [...manualExcludes],
            }

            if (isEditing && editId) {
                // For edits, include cover_image in the PATCH payload directly
                await updateCollection({
                    collectionId: editId,
                    ...payload,
                    ...(coverImageUrl ? { cover_image: coverImageUrl } : {}),
                }).unwrap()
                toast.success('Collection updated successfully.')
            } else {
                // Create first, then PATCH the cover image if we have one
                const created = await createCollection(payload).unwrap()
                if (coverImageUrl && created?.data?._id) {
                    await updateCollection({
                        collectionId: created.data._id,
                        cover_image: coverImageUrl,
                    }).unwrap()
                }
                toast.success('Collection created successfully.')
            }
            router.push(APP_ROUTES.productsCollections)
        } catch (err) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ||
                `Could not ${isEditing ? 'update' : 'create'} the collection. Please try again.`
            toast.error(message)
        }
    }

    const isActive = form.watch('is_active')

    if (isEditing && isLoadingCollection) {
        return (
            <div className='w-full min-h-screen h-fit pb-10'>
                <div className='mx-auto max-w-7xl space-y-6'>
                    <div className='mb-6'>
                        <GoBackButton href={APP_ROUTES.productsCollections} />
                    </div>
                    <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
                        Loading collection…
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full min-h-screen h-fit pb-10'>
            <div className='mx-auto max-w-7xl space-y-6'>
            {/* Go Back */}
            <div className='mb-6'>
                <GoBackButton href={APP_ROUTES.productsCollections} />
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='grid grid-cols-1 gap-6 lg:grid-cols-3'
                >
                    {/* Left column */}
                    <div className='space-y-6 lg:col-span-2'>
                        {/* Title + About */}
                        <div className={cardClass}>
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='title'
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className='mb-1.5 block text-sm text-grey-black'>
                                                Title
                                            </Label>
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter collection title'
                                                    className='h-12 rounded-lg bg-muted/40'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className='mb-1.5 block text-sm text-grey-black'>
                                                About
                                            </Label>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='Short bio here'
                                                    className='min-h-[120px] rounded-lg bg-muted/40'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className={cardClass}>
                            <FormField
                                control={form.control}
                                name='condition_match'
                                render={({ field }) => (
                                    <FormItem className='mb-6'>
                                        <div className='flex flex-wrap items-center gap-6'>
                                            <span className='text-sm font-medium text-grey-black'>
                                                Conditions must match:
                                            </span>
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className='flex items-center gap-6'
                                            >
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='all' id='match-all' />
                                                    <Label htmlFor='match-all' className='cursor-pointer text-sm font-normal'>
                                                        All conditions
                                                    </Label>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <RadioGroupItem value='any' id='match-any' />
                                                    <Label htmlFor='match-any' className='cursor-pointer text-sm font-normal'>
                                                        Any condition
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className='space-y-3'>
                                {fields.map((row, index) => {
                                    const selectedField = form.watch(`conditions.${index}.field`)
                                    const isFreeText = FREE_TEXT_FIELDS.has(selectedField)
                                    const isTaxonomyField = selectedField in TAXONOMY_FIELD_CONFIG
                                    const isStaticField = selectedField in STATIC_VALUE_OPTIONS

                                    // Determine value options
                                    let valueOptions: { value: string; label: string }[] = []
                                    if (isTaxonomyField) {
                                        valueOptions = getTaxonomyValues(selectedField)
                                    } else if (isStaticField) {
                                        valueOptions = STATIC_VALUE_OPTIONS[selectedField]
                                    }

                                    return (
                                        <div
                                            key={row.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                'flex flex-wrap items-start gap-2 sm:flex-nowrap rounded-xl p-2 -mx-2 transition-all duration-200',
                                                dragIndex === index && 'opacity-40 scale-[0.98]',
                                                dragOverIndex === index && dragIndex !== index && 'border-2 border-primary/40 bg-primary/5',
                                                dragIndex !== null && dragOverIndex !== index && dragIndex !== index && 'opacity-80',
                                            )}
                                        >
                                            {/* Drag Handle */}
                                            <div
                                                className={cn(
                                                    'flex h-12 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg border transition-all duration-200 active:cursor-grabbing',
                                                    dragIndex === index
                                                        ? 'bg-primary border-primary text-white shadow-md'
                                                        : 'border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary'
                                                )}
                                                title="Drag to reorder"
                                            >
                                                <GripVertical className='size-4' />
                                            </div>

                                            {/* Field */}
                                            <FormField
                                                control={form.control}
                                                name={`conditions.${index}.field`}
                                                render={({ field }) => (
                                                    <FormItem className='flex-1 min-w-[140px]'>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(next) => {
                                                                field.onChange(next)
                                                                form.setValue(
                                                                    `conditions.${index}.value`,
                                                                    ''
                                                                )
                                                            }}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className='h-12 rounded-lg'>
                                                                    <SelectValue placeholder='Select field' />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {CONDITION_FIELD_OPTIONS.map((opt) => (
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

                                            {/* Operator */}
                                            <FormField
                                                control={form.control}
                                                name={`conditions.${index}.operator`}
                                                render={({ field }) => (
                                                    <FormItem className='flex-1 min-w-[140px]'>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className='h-12 rounded-lg'>
                                                                    <SelectValue placeholder='Operator' />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {CONDITION_OPERATOR_OPTIONS.map((opt) => (
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

                                            {/* Value — dynamic based on field type */}
                                            <FormField
                                                control={form.control}
                                                name={`conditions.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className='flex-1 min-w-[140px]'>
                                                        {isFreeText ? (
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={
                                                                        selectedField === 'base_price'
                                                                            ? 'Enter price (e.g. 5000)'
                                                                            : 'Enter value'
                                                                    }
                                                                    className='h-12 rounded-lg'
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        ) : (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className='h-12 rounded-lg'>
                                                                        <SelectValue placeholder='Select value' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {valueOptions.length > 0 ? (
                                                                        valueOptions.map((opt) => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <SelectItem value='__loading' disabled>
                                                                            {isTaxonomyField
                                                                                ? 'Loading from taxonomy…'
                                                                                : 'Select a field first'}
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Delete */}
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='icon'
                                                aria-label='Remove condition'
                                                disabled={fields.length === 1}
                                                onClick={() => remove(index)}
                                                className='h-12 w-12 shrink-0 rounded-lg text-muted-foreground hover:text-red-600'
                                            >
                                                <Trash2 className='size-4' />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>

                            {typeof form.formState.errors.conditions?.message === 'string' && (
                                <p className='mt-2 text-sm text-destructive'>
                                    {form.formState.errors.conditions.message}
                                </p>
                            )}

                            <button
                                type='button'
                                onClick={() =>
                                    append({
                                        field: 'clothing.taxonomy.product_type',
                                        operator: 'is_equal_to',
                                        value: '',
                                    })
                                }
                                className='mt-4 flex items-center gap-2 text-sm font-medium text-grey-black transition-colors hover:text-primary cursor-pointer'
                            >
                                <Plus className='size-4 -mt-0.5' />
                                Add Condition
                            </button>
                        </div>

                        {/* Products preview — live matching + manual overrides */}
                        <div className={cardClass}>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='text-base font-medium text-grey-black'>
                                    Products
                                </h3>
                                <div className='flex items-center gap-2'>
                                    {manualIncludes.size > 0 && (
                                        <span className='rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
                                            +{manualIncludes.size} included
                                        </span>
                                    )}
                                    {manualExcludes.size > 0 && (
                                        <span className='rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'>
                                            −{manualExcludes.size} excluded
                                        </span>
                                    )}
                                    {matchingProducts.length > 0 && (
                                        <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
                                            {matchingProducts.length} total
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className='relative mb-4'>
                                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
                                <Input
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder='Search matched products'
                                    className='h-12 rounded-lg pl-9'
                                />
                            </div>

                            {/* Matched + manually included products */}
                            <div className='space-y-2 max-h-[350px] overflow-y-auto'>
                                {filteredProducts.length === 0 ? (
                                    <p className='py-6 text-center text-sm text-muted-foreground'>
                                        {watchedConditions?.some((c: any) => c.field && c.operator && c.value)
                                            ? 'No products match your conditions.'
                                            : 'Fill in conditions above to see matching products.'}
                                    </p>
                                ) : (
                                    filteredProducts.map((product: any) => {
                                        const kind = product.kind
                                        const inner = product[kind] || {}
                                        const productName = product.name || inner.name || 'Untitled'
                                        const productImages = product.images || inner.images || inner.color_variants?.[0]?.images || []
                                        const firstImage = productImages[0]
                                        const imageUrl = typeof firstImage === 'string'
                                            ? firstImage
                                            : firstImage?.url
                                        const safeImageUrl = imageUrl?.replace(/^http:\/\//i, 'https://')
                                        const productPrice = product.price || product.base_price || 0
                                        const isManuallyIncluded = manualIncludes.has(product._id)

                                        return (
                                            <div
                                                key={product._id}
                                                className='flex items-center gap-3 rounded-lg bg-muted/30 p-2.5'
                                            >
                                                <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-white'>
                                                    {safeImageUrl ? (
                                                        <Image
                                                            src={safeImageUrl}
                                                            alt={productName}
                                                            fill
                                                            sizes='40px'
                                                            className='object-cover'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-[9px] text-gray-400'>
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-1.5'>
                                                        <p className='text-sm font-medium text-grey-black truncate'>
                                                            {productName}
                                                        </p>
                                                        {isManuallyIncluded && (
                                                            <span className='shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700'>
                                                                Manual
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className='text-xs text-muted-foreground'>
                                                        {formatCurrency(productPrice, 'NGN')}
                                                    </p>
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
                            </div>

                            {/* Excluded products section */}
                            {excludedProducts.length > 0 && (
                                <div className='mt-4 border-t pt-4'>
                                    <h4 className='mb-2 text-sm font-medium text-muted-foreground'>
                                        Excluded ({excludedProducts.length})
                                    </h4>
                                    <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                                        {excludedProducts.map((product: any) => {
                                            const kind = product.kind
                                            const inner = product[kind] || {}
                                            const productName = product.name || inner.name || 'Untitled'
                                            const productImages = product.images || inner.images || inner.color_variants?.[0]?.images || []
                                            const firstImage = productImages[0]
                                            const imageUrl = typeof firstImage === 'string'
                                                ? firstImage
                                                : firstImage?.url
                                            const safeImageUrl = imageUrl?.replace(/^http:\/\//i, 'https://')

                                            return (
                                                <div
                                                    key={product._id}
                                                    className='flex items-center gap-3 rounded-lg bg-red-50/50 p-2.5 opacity-60'
                                                >
                                                    <div className='relative size-10 shrink-0 overflow-hidden rounded-md bg-white'>
                                                        {safeImageUrl ? (
                                                            <Image
                                                                src={safeImageUrl}
                                                                alt={productName}
                                                                fill
                                                                sizes='40px'
                                                                className='object-cover'
                                                            />
                                                        ) : (
                                                            <div className='flex h-full w-full items-center justify-center text-[9px] text-gray-400'>
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm text-grey-black truncate line-through'>
                                                            {productName}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleUndoExclude(product._id)}
                                                        className='shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-green-50 hover:text-green-600'
                                                        title='Undo exclude'
                                                    >
                                                        <Undo2 className='size-3.5' />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Manual include picker */}
                            <div className='mt-4 border-t pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setShowManualPicker(!showManualPicker)}
                                    className='flex items-center gap-2 text-sm font-medium text-grey-black transition-colors hover:text-primary cursor-pointer'
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
                                                availableForInclude.slice(0, 20).map((product: any) => {
                                                    const kind = product.kind
                                                    const inner = product[kind] || {}
                                                    const productName = product.name || inner.name || 'Untitled'
                                                    const productImages = product.images || inner.images || inner.color_variants?.[0]?.images || []
                                                    const firstImage = productImages[0]
                                                    const imageUrl = typeof firstImage === 'string'
                                                        ? firstImage
                                                        : firstImage?.url
                                                    const safeImageUrl = imageUrl?.replace(/^http:\/\//i, 'https://')
                                                    const productPrice = product.price || product.base_price || 0

                                                    return (
                                                        <div
                                                            key={product._id}
                                                            className='flex items-center gap-3 rounded-lg border border-dashed p-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5'
                                                        >
                                                            <div className='relative size-9 shrink-0 overflow-hidden rounded-md bg-white'>
                                                                {safeImageUrl ? (
                                                                    <Image
                                                                        src={safeImageUrl}
                                                                        alt={productName}
                                                                        fill
                                                                        sizes='36px'
                                                                        className='object-cover'
                                                                    />
                                                                ) : (
                                                                    <div className='flex h-full w-full items-center justify-center text-[8px] text-gray-400'>
                                                                        No img
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className='flex-1 min-w-0'>
                                                                <p className='text-sm text-grey-black truncate'>
                                                                    {productName}
                                                                </p>
                                                                <p className='text-xs text-muted-foreground'>
                                                                    {formatCurrency(productPrice, 'NGN')}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => handleInclude(product._id)}
                                                                className='shrink-0 h-7 px-2.5 text-xs'
                                                            >
                                                                <Plus className='size-3 mr-1' />
                                                                Include
                                                            </Button>
                                                        </div>
                                                    )
                                                })
                                            )}
                                            {availableForInclude.length > 20 && (
                                                <p className='py-2 text-center text-xs text-muted-foreground'>
                                                    Showing 20 of {availableForInclude.length} — use search to narrow down.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className='space-y-6'>
                        {/* Status */}
                        <div className={cardClass}>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='text-base font-medium text-grey-black'>
                                    Status
                                </h3>
                                <span className='flex items-center gap-2 text-sm text-grey-black'>
                                    {isActive ? 'Active' : 'Inactive'}
                                    <span
                                        className={cn(
                                            'size-2.5 rounded-full',
                                            isActive ? 'bg-green-500' : 'bg-gray-400'
                                        )}
                                    />
                                </span>
                            </div>
                            <FormField
                                control={form.control}
                                name='is_active'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            value={field.value ? 'active' : 'inactive'}
                                            onValueChange={(v) => field.onChange(v === 'active')}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='h-12 rounded-lg'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='active'>Active</SelectItem>
                                                <SelectItem value='inactive'>Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Image — uploads via POST /uploads/product, then PATCHes cover_image */}
                        <div className={cardClass}>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='text-base font-medium text-grey-black'>
                                    Image
                                </h3>
                                <button
                                    type='button'
                                    onClick={handleImageEdit}
                                    className='text-sm font-medium text-primary transition-colors hover:underline'
                                >
                                    Edit
                                </button>
                            </div>
                            <button
                                type='button'
                                onClick={handleImageEdit}
                                className='relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30'
                            >
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt='Collection cover'
                                        fill
                                        sizes='320px'
                                        className='object-contain'
                                    />
                                ) : (
                                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                                        <ImageIcon className='size-8' />
                                        <span className='text-sm'>
                                            Click to upload an image
                                        </span>
                                    </div>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className='hidden'
                            />
                        </div>

                        {/* Actions */}
                        <div className='flex flex-col gap-3'>
                            <Button type='submit' className='h-12' disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className='size-4 animate-spin' />
                                        {isUploading
                                            ? 'Uploading image…'
                                            : isEditing
                                              ? 'Saving…'
                                              : 'Creating…'}
                                    </>
                                ) : isEditing ? (
                                    'Save Changes'
                                ) : (
                                    'Create Collection'
                                )}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='h-12'
                                onClick={handleGoBack}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
            </div>
        </div>
    )
}

export default CollectionsCreateTemplate
