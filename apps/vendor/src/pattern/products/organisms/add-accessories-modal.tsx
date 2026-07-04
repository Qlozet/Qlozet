"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InfoIcon, Trash2Icon, UploadIcon, PlusIcon, FlagIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import NiceModal, { create, useModal } from "@ebay/nice-modal-react"
import { VariantSelectOptions } from "./variant-select-options"
import { AVAILABLE_COLORS, ColorOption } from "../types/variant.types"
import { SetVariantsTable, VariantRow, makeSizeDetail } from "../organisms/set-variants-table"
import { useCreateAccessoryMutation, useGetProductQuery } from "@/redux/services/products/products.api-slice"
import { useUploadProductImageMutation } from "@/redux/services/uploads/uploads.api-slice"
import { toast } from "sonner"
import { AUDIENCE_OPTIONS, type Audience } from "./clothing-organization-section"
import { TagComboInput } from "../molecules/tag-combo-input"
import {
    useGetProductTypesQuery,
    useGetCategoriesForTypeQuery,
    useGetVendorTagsQuery,
    type ProductTag,
} from "@/redux/services/taxonomy/taxonomy.api-slice"
import { uploadSequentially } from "@/lib/utils"

export const AddAccessoryModal = create(({ editId }: { editId?: string }) => {
    const { resolve, remove, visible } = useModal();
    const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(editId as string, {
        skip: !editId,
    })

    const handleCloseModal = () => {
        remove();
    };
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [variants, setVariants] = useState<VariantRow[]>([])
    const [customColors, setCustomColors] = useState<ColorOption[]>([])
    const [accessoryName, setAccessoryName] = useState("")
    const [description, setDescription] = useState("")
    const [productType, setProductType] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [audience, setAudience] = useState<Audience | ''>('')
    const [productTags, setProductTags] = useState<ProductTag[]>([])
    const [price, setPrice] = useState("100000")
    
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [existingImage, setExistingImage] = useState<{ url: string, public_id: string } | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")

    const [createAccessory, { isLoading: isCreating }] = useCreateAccessoryMutation()
    const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation()
    const isLoading = isCreating || isUploading || isLoadingProduct

    useEffect(() => {
        if (productData) {
            const rawProduct = (productData as any)?.data || productData
            const inner = rawProduct?.kind ? rawProduct[rawProduct.kind] : rawProduct
            
            setAccessoryName(inner?.name || rawProduct?.name || "")
            setDescription(inner?.description || rawProduct?.description || "")
            
            // Map taxonomy fields
            const taxonomy = inner?.taxonomy || rawProduct?.taxonomy || {}
            setProductType(taxonomy.product_type || '')
            setSelectedCategories(taxonomy.categories || [])
            setAudience((taxonomy.audience || '') as Audience)
            
            // Map tags
            const rawTags = rawProduct?.tags || []
            setProductTags(rawTags.map((t: any) => ({
                name: t.name || t,
                slug: t.slug || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '-') : ''),
                type: (t.type as 'system' | 'custom') || 'system',
            })))
            
            setPrice(String(inner?.price || rawProduct?.base_price || ""))
            
            const pImages = inner?.images || rawProduct?.images || []
            if (pImages && pImages.length > 0) {
                const imgObj = typeof pImages[0] === "string" ? { url: pImages[0], public_id: "unknown" } : pImages[0]
                setPreviewUrl(imgObj.url)
                setExistingImage(imgObj)
            }
        }
    }, [productData])

    const isSaving = isCreating || isUploading

    // Taxonomy hooks
    const { data: accessoryTypes, isLoading: isLoadingTypes } = useGetProductTypesQuery('accessory')
    // Skip categories query if product_type isn't a real taxonomy type (e.g. generic 'accessory')
    const isValidProductType = Boolean(productType && productType !== 'accessory')
    const { data: categoryData, isLoading: isLoadingCategories } = useGetCategoriesForTypeQuery(
        { kind: 'accessory', product_type: productType },
        { skip: !isValidProductType }
    )
    const { data: vendorTags, isLoading: isLoadingTags } = useGetVendorTagsQuery()

    const availableSizes = ["Extra small", "Small", "Medium", "Large", "Extra large"]

    const handleColorToggle = (colorValue: string) => {
        setSelectedColors((prev) => (prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]))
    }

    const handleSizeToggle = (sizeValue: string) => {
        setSelectedSizes((prev) => (prev.includes(sizeValue) ? prev.filter((s) => s !== sizeValue) : [...prev, sizeValue]))
    }

    const handleAddCustomColor = (color: ColorOption) => {
        // Add to custom colors list if not already there
        if (!customColors.find((c) => c.value === color.value)) {
            setCustomColors((prev) => [...prev, color])
        }
        // Auto-select the new color
        if (!selectedColors.includes(color.value)) {
            setSelectedColors((prev) => [...prev, color.value])
        }
    }

    const handleAddVariants = () => {
        // Combine available colors with custom colors
        const allColors = [...AVAILABLE_COLORS, ...customColors]

        // Get colors that don't already have variants
        const existingColorValues = variants?.map((v) => {
            const colorOption = allColors.find(c => c.hex === v.colorHex);
            return colorOption ? colorOption.value : null;
        }).filter(Boolean)
        const newColorValues = selectedColors.filter((colorValue) => !existingColorValues.includes(colorValue))

        // Only create variants for new colors
        if (newColorValues?.length === 0) {
            return // No new colors to add
        }

        const newVariants: VariantRow[] = newColorValues?.map((colorValue) => {
            const color = allColors.find((c) => c.value === colorValue)!

            const sizeMap: Record<string, string> = {
                xs: "S",
                s: "M",
                m: "L",
                l: "XL",
            }

            const availableSizes = selectedSizes?.map((sizeValue) => sizeMap[sizeValue] || sizeValue.toUpperCase()) || [];
            const details: Record<string, any> = {};
            availableSizes.forEach(s => {
                details[s] = makeSizeDetail();
            });

            return {
                id: `${colorValue}-${Date.now()}-${Math.random()}`,
                colorHex: color.hex,
                label: color.label,
                availableSizes,
                details,
                images: [],
                expanded: false,
                selected: false,
            }
        })

        setVariants((prev) => [...prev, ...newVariants])
    }

    const handleSubmit = async (isDraft = false) => {
        if (!accessoryName.trim() || !price) {
            toast.error("Please enter a name and price.")
            return
        }

        try {
            let finalImageUrl = existingImage?.url || ""
            let finalPublicId = existingImage?.public_id || "unknown"
            if (imageFile) {
                const res = await uploadImage(imageFile).unwrap()
                if (res.data?.url) {
                    finalImageUrl = res.data.url
                    finalPublicId = res.data.public_id || "unknown"
                }
            }

            const variantsToSubmit = await Promise.all(
                variants.flatMap(async (v) => {
                    let uploadedVariantImages: { url: string; public_id: string }[] = [];
                    if (v.imageFiles && v.imageFiles.length > 0) {
                        const res = await uploadSequentially(v.imageFiles, file => uploadImage(file).unwrap());
                        uploadedVariantImages = res.map(r => ({ url: r.data?.url || '', public_id: r.data?.public_id || 'unknown' })).filter(img => Boolean(img.url));
                    }
                    
                    const finalVariantImages = [
                        ...v.images.filter(url => !url.startsWith('blob:')).map((url) => ({ url, public_id: 'unknown' })),
                        ...uploadedVariantImages,
                    ];

                    return Promise.all(v.availableSizes.map(async (size) => {
                        const sizeDetail = v.details[size] || makeSizeDetail();
                        return {
                            color: { name: v.label || v.colorHex, hex: v.colorHex },
                            size: size,
                            stock: sizeDetail.stock || 0,
                            price: sizeDetail.price || 0,
                            sku: sizeDetail.sku || undefined,
                            images: finalVariantImages
                        }
                    }))
                })
            ).then(res => res.flat());

            await createAccessory({
                ...(editId ? { product_id: editId } : {}),
                seo: { title: accessoryName.trim() },
                metafields: { base_price: price ? Number(price) : undefined, tags: productTags },
                status: isDraft ? 'draft' : 'active',
                accessory: {
                    name: accessoryName.trim(),
                    description: description.trim() || undefined,
                    price: Number(price),
                    taxonomy: {
                        product_type: productType || undefined,
                        categories: selectedCategories,
                        attributes: categoryData?.attributes?.length ? categoryData.attributes : (selectedCategories.length ? selectedCategories : [productType || 'accessory']),
                        audience: audience || 'unisex'
                    },
                    variants: variantsToSubmit.length > 0 ? variantsToSubmit : [],
                    images: finalImageUrl ? [{ url: finalImageUrl, public_id: finalPublicId }] : (existingImage ? [existingImage] : [])
                }
            }).unwrap()

            toast.success(editId ? "Accessory updated successfully!" : "Accessory created successfully!")
            handleCloseModal()
        } catch (error) {
            toast.error(editId ? "Failed to update accessory." : "Failed to create accessory.")
        }
    }

    return (
        <Dialog open={visible} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-6xl p-0 pr-2!">

                <div className="h-full w-full max-h-[85vh] grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 pr-1 overflow-y-auto">
                    {/* Left Column - Form */}
                    <div className="w-full gap-y-[26px] pl-[38px] mt-8">
                        <DialogTitle className="text-2xl font-semibold">{editId ? 'Edit' : 'Add'} Accessory</DialogTitle>
                        {isLoadingProduct ? (
                            <div className="flex flex-col gap-8 pt-7 w-full max-w-lg">
                                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-24 w-full" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                                </div>
                            </div>
                        ) : (
                        <div className="flex items-start justify-between gap-6 pt-7">
                            <div className="space-y-6">
                                {/* Accessory Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Accessory name</label>
                                    <Input
                                        value={accessoryName}
                                        onChange={(e) => setAccessoryName(e.target.value)}
                                        placeholder="Wide-leg pants"
                                    />
                                </div>

                                {/* Product Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add product description"
                                        className="min-h-24"
                                    />
                                </div>

                                {/* Product Type (from API) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Product Type
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    {isLoadingTypes ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select value={productType || undefined} onValueChange={(v) => { setProductType(v); setSelectedCategories([]); }}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select product type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accessoryTypes?.map((pt) => (
                                                    <SelectItem key={pt.name} value={pt.name}>
                                                        {pt.icon ? `${pt.icon} ${pt.name}` : pt.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Category (cascading from product type) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Category
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    {isLoadingCategories && isValidProductType ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : categoryData?.categories && categoryData.categories.length > 0 ? (
                                        <Select
                                            value={selectedCategories[0] || undefined}
                                            onValueChange={(v) => setSelectedCategories([v])}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryData.categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-accent px-3 text-sm text-muted-foreground">
                                            {productType ? 'No categories available' : 'Select a product type first'}
                                        </div>
                                    )}
                                </div>

                                {/* Audience */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Audience
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <Select value={audience || undefined} onValueChange={(v) => setAudience(v as Audience)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AUDIENCE_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags (combo input) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Tags
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <TagComboInput
                                        value={productTags}
                                        onChange={setProductTags}
                                        systemTags={vendorTags}
                                        isLoading={isLoadingTags}
                                        placeholder="Add tags..."
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Price
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-6" />
                                    </div>
                                </div>

                                {/* Set Variants Section */}
                                <div className="space-y-4">
                                    <SetVariantsTable variants={variants} onChange={setVariants} />

                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSaving} className="px-8 bg-transparent">
                                            {isSaving ? "Saving..." : "Save as Draft"}
                                        </Button>
                                        <Button onClick={() => handleSubmit(false)} disabled={isSaving} className="px-8">
                                            {isSaving ? "Publishing..." : "Publish Now"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <VariantSelectOptions
                                selectedColors={selectedColors}
                                selectedSizes={selectedSizes}
                                onColorToggle={handleColorToggle}
                                onSizeToggle={handleSizeToggle}
                                onAddVariants={handleAddVariants}
                                onAddCustomColor={handleAddCustomColor}
                                availableColors={customColors}
                                className="w-full! bg-transparent p-0.5! border-none!"
                            />
                        </div>
                        )}
                    </div>

                    {/* Preview section */}
                    <div className="bg-[#f1f1f1] space-y-3 p-7">
                        <h3 className="text-xl font-semibold">Preview</h3>

                        {isLoadingProduct ? (
                            <Skeleton className="w-full min-h-[300px] rounded-lg mt-12" />
                        ) : (
                        <>
                        <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2">
                            <div className="bg-amber-900 rounded-full size-8 flex items-center justify-center shrink-0">
                                <InfoIcon className="size-4 text-white" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Add a clear picture of the accessory in white background
                            </p>
                        </div>

                        <div 
                            onClick={() => document.getElementById('accessory-image')?.click()}
                            className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 min-h-[300px] cursor-pointer"
                        >
                            <input 
                                type="file" 
                                id="accessory-image" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0])
                                        setPreviewUrl(URL.createObjectURL(e.target.files[0]))
                                    }
                                }}
                            />
                            {previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <div className="bg-muted rounded-full size-12 flex items-center justify-center">
                                        <UploadIcon className="size-6 text-muted-foreground" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm text-foreground">Add or drop image or sketch</p>
                                    </div>
                                </>
                            )}
                        </div>
                        </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
})
