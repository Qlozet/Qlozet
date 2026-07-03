'use client'

// Create Collection page — a rule-based collection builder. Title/About +
// "Conditions must match" rules (field / operator / value) map to the backend
// CreateCollectionDto (POST /collections). Status maps to `is_active`.
// Value dropdowns are populated dynamically from the taxonomy API.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
    ChevronDown,
    ChevronUp,
    Plus,
    Search,
    Trash2,
    Loader2,
    ImageIcon,
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
            return value == expected
        case 'not_equal_to':
            return value != expected
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

    const { fields, append, remove, swap } = useFieldArray({
        control: form.control,
        name: 'conditions',
    })

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
                    // Standard audience values
                    return [
                        { value: 'Men', label: 'Men' },
                        { value: 'Women', label: 'Women' },
                        { value: 'Unisex', label: 'Unisex' },
                        { value: 'Kids', label: 'Kids' },
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

    // Watch conditions reactively for live product preview
    const watchedConditions = form.watch('conditions')
    const watchedConditionMatch = form.watch('condition_match')

    // All raw vendor products from the API (before the transformResponse flattening)
    const allRawProducts = useMemo(() => {
        return vendorProductsResponse?.data?.data ?? []
    }, [vendorProductsResponse])

    // Live-evaluate conditions against all vendor products
    const matchingProducts = useMemo(() => {
        if (!allRawProducts.length || !watchedConditions?.length) return []
        return allRawProducts.filter((product: any) =>
            evaluateProductAgainstConditions(product, watchedConditions, watchedConditionMatch)
        )
    }, [allRawProducts, watchedConditions, watchedConditionMatch])

    // Apply search filter on top of matched products
    const filteredProducts = useMemo(() => {
        const term = productSearch.trim().toLowerCase()
        if (!term) return matchingProducts
        return matchingProducts.filter((p: any) => {
            const productName = p.name || p.clothing?.name || p.fabric?.name || p.accessory?.name || ''
            return productName.toLowerCase().includes(term)
        })
    }, [matchingProducts, productSearch])

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
                                            className='flex flex-wrap items-start gap-2 sm:flex-nowrap'
                                        >
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
                                                                // Reset the value when the field changes so a
                                                                // stale value from another field isn't kept.
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

                                            {/* Reorder */}
                                            <div className='flex h-12 flex-col items-center justify-center rounded-lg border'>
                                                <button
                                                    type='button'
                                                    aria-label='Move condition up'
                                                    disabled={index === 0}
                                                    onClick={() => swap(index, index - 1)}
                                                    className='px-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30'
                                                >
                                                    <ChevronUp className='size-3.5' />
                                                </button>
                                                <button
                                                    type='button'
                                                    aria-label='Move condition down'
                                                    disabled={index === fields.length - 1}
                                                    onClick={() => swap(index, index + 1)}
                                                    className='px-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30'
                                                >
                                                    <ChevronDown className='size-3.5' />
                                                </button>
                                            </div>

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

                        {/* Products preview — live matching */}
                        <div className={cardClass}>
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='text-base font-medium text-grey-black'>
                                    Products
                                </h3>
                                {matchingProducts.length > 0 && (
                                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                                        {matchingProducts.length} matching
                                    </span>
                                )}
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

                            <div className='space-y-3 max-h-[400px] overflow-y-auto'>
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
                                        const productType = inner.type === 'customize' ? 'Customizable' : inner.type === 'non_customize' ? 'Non-customizable' : kind || ''
                                        const productStatus = product.status || 'draft'

                                        return (
                                            <div
                                                key={product._id}
                                                className='flex items-center gap-4 rounded-lg bg-muted/30 p-3'
                                            >
                                                <div className='relative size-12 shrink-0 overflow-hidden rounded-lg bg-white'>
                                                    {safeImageUrl ? (
                                                        <Image
                                                            src={safeImageUrl}
                                                            alt={productName}
                                                            fill
                                                            sizes='48px'
                                                            className='object-cover'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-[10px] text-gray-400'>
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-grey-black truncate'>
                                                        {productName}
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {formatCurrency(productPrice, 'NGN')}
                                                    </p>
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm text-grey-black capitalize'>
                                                        {productType}
                                                    </p>
                                                    <span className={cn(
                                                        'mt-1 inline-flex rounded-md px-2 py-0.5 text-xs',
                                                        productStatus === 'active'
                                                            ? 'bg-green-50 text-green-700'
                                                            : productStatus === 'draft'
                                                              ? 'bg-yellow-50 text-yellow-700'
                                                              : 'bg-gray-100 text-gray-600'
                                                    )}>
                                                        {productStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
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
