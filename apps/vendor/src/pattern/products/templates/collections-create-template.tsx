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
import { Loader2, ImageIcon } from 'lucide-react'
import { useProductConditions } from '../hooks/use-product-conditions'
import { ConditionsCard } from '../organisms/conditions-card'
import { ProductPreviewCard } from '../organisms/product-preview-card'
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

const cardClass = 'rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'

// Client-side condition evaluation logic has been moved to useProductConditions hook

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
  const { data: vendorProductsResponse } = useGetProductsByVendorQuery({
    size: 200,
  })

  const isLoading = isCreating || isUpdating || isUploading

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      title: '',
      description: '',
      condition_match: 'all',
      is_active: true,
      conditions: [
        {
          field: 'clothing.taxonomy.product_type',
          operator: 'is_equal_to',
          value: '',
        },
      ],
    },
  })

  const watchedConditions = useWatch({
    control: form.control,
    name: 'conditions',
  })
  const watchedConditionMatch = useWatch({
    control: form.control,
    name: 'condition_match',
  })

  const conditionState = useProductConditions({
    watchedConditions,
    watchedConditionMatch,
  })
  // Taxonomy logic has been moved to ConditionsCard.

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
          : [
              {
                field: 'clothing.taxonomy.product_type',
                operator: 'is_equal_to',
                value: '',
              },
            ],
    })
    const cover = collection.cover_image as string | undefined
    if (cover) setImagePreview(cover)
    // Load manual overrides
    if (
      collection.manual_includes?.length ||
      collection.manual_excludes?.length
    ) {
      conditionState.syncInitialState(
        collection.manual_includes || [],
        collection.manual_excludes || []
      )
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
        manual_includes: Array.from(conditionState.manualIncludes),
        manual_excludes: Array.from(conditionState.manualExcludes),
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
      <div className="w-full min-h-screen h-fit pb-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="mb-6">
            <GoBackButton href={APP_ROUTES.productsCollections} />
          </div>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Loading collection…
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Go Back */}
        <div className="mb-6">
          <GoBackButton href={APP_ROUTES.productsCollections} />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title + About */}
              <div className={cardClass}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="mb-1.5 block text-sm text-grey-black dark:text-gray-200">
                          Title
                        </Label>
                        <FormControl>
                          <Input
                            placeholder="Enter collection title"
                            className="h-12 rounded-lg bg-muted/40 dark:border-white/10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="mb-1.5 block text-sm text-grey-black dark:text-gray-200">
                          About
                        </Label>
                        <FormControl>
                          <Textarea
                            placeholder="Short bio here"
                            className="min-h-[120px] rounded-lg bg-muted/40 dark:border-white/10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <ConditionsCard
                control={form.control}
                form={form}
                taxonomyTree={taxonomyTree}
              />

              <ProductPreviewCard conditionState={conditionState} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Status */}
              <div className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-medium text-grey-black dark:text-gray-200">
                    Status
                  </h3>
                  <span className="flex items-center gap-2 text-sm text-grey-black dark:text-gray-200">
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value ? 'active' : 'inactive'}
                        onValueChange={(v) => field.onChange(v === 'active')}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-lg bg-muted/40 dark:bg-muted dark:border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Image — uploads via POST /uploads/product, then PATCHes cover_image */}
              <div className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-medium text-grey-black dark:text-gray-200">
                    Image
                  </h3>
                  <button
                    type="button"
                    onClick={handleImageEdit}
                    className="text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleImageEdit}
                  className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed dark:border-white/20 bg-muted/30"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Collection cover"
                      fill
                      sizes="320px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="size-8" />
                      <span className="text-sm">Click to upload an image</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="h-12" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
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
                  type="button"
                  variant="outline"
                  className="h-12"
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
