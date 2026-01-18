"use client"

import { useState } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FileUploadWidget } from "@/pattern/common/organisms/file-upload-widget"
import { RichTextEditor } from "@/pattern/common/organisms/rich-text-editor"
import { StatusIndicator } from "../atoms/status-indicator"
import { ProductAlertBanner } from "../molecules/product-alert-banner"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { ProductVariantPlaceholder } from "../molecules/product-variant-placeholder"
import { ProductOrganizationSection } from "../organisms/product-organization-section"
import { ProductPricingSection } from "../organisms/product-pricing-section"
import { ProductVariantManager } from "../organisms/product-variant-manager"
import { useRouter } from "next/navigation"

export default function AddProductTemplate() {
    const [title, setTitle] = useState("https://www.garnisland.com")
    const [description, setDescription] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const [status, setStatus] = useState("active")
    const [customization, setCustomization] = useState(true)
    const [measurementRequired, setMeasurementRequired] = useState(false)
    const [turnaroundDays, setTurnaroundDays] = useState("2")
    const [audience, setAudience] = useState<string[]>(["men"])
    const [category, setCategory] = useState<string[]>(["tops"])
    const [productType, setProductType] = useState<string[]>(["hoodies"])
    const [attributes, setAttributes] = useState<string[]>(["regular"])
    const [price, setPrice] = useState("100000")
    const [showAlert, setShowAlert] = useState(true)
    const [showVariantManager, setShowVariantManager] = useState(false)

    const { back } = useRouter()

    const handleDescriptionChange = (content: string) => {
        setDescription(content)
        // Simple word count
        const words = content
            .trim()
            .split(/\s+/)
            .filter((word) => word?.length > 0)
        setWordCount(words?.length)
    }

    const handleSave = () => {
        console.log("Saving product...", {
            title,
            description,
            status,
            customization,
            audience,
            category,
            productType,
            attributes,
            price,
        })
    }

    const audienceGroups = [
        {
            label: "Gender",
            tags: [
                { value: "men", label: "Men" },
                { value: "women", label: "Women" },
            ],
        },
    ]

    const categoryGroups = [
        {
            label: "Categories",
            tags: [
                { value: "tops", label: "Tops" },
                { value: "dresses", label: "Dresses" },
                { value: "bottoms", label: "Bottoms" },
                { value: "swimwear", label: "Swimwear" },
                { value: "formal", label: "Formal" },
                { value: "traditional", label: "Traditional" },
                { value: "one-piece", label: "One Piece" },
                { value: "outwear", label: "Outwear" },
                { value: "activewear", label: "Activewear" },
                { value: "jackets", label: "Jackets" },
            ],
        },
    ]

    const attributesGroups = [
        {
            label: "Fit",
            tags: [
                { value: "fit", label: "Fit" },
                { value: "regular", label: "Regular" },
                { value: "relaxed", label: "Relaxed" },
            ],
        },
        {
            label: "Occasion",
            tags: [
                { value: "casual", label: "Casual" },
                { value: "formal", label: "Formal" },
                { value: "minimalistic", label: "Minimalistic" },
            ],
        },
    ]

    const productTypeGroups = [
        {
            label: "Product Types",
            tags: [
                { value: "tops", label: "Tops" },
                { value: "t-shirt", label: "T-shirt" },
                { value: "shirts", label: "Shirts" },
                { value: "hoodies", label: "Hoodies" },
                { value: "sweat-shirts", label: "Sweat Shirts" },
                { value: "tank-top", label: "Tank Top" },
            ],
        },
    ]

    return (
        <div className="min-h-screen bg-accent">
            <div className="mx-auto max-w-7xl p-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={back}
                        className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
                    >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brown1">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Go Back</span>
                    </button>
                </div>

                {/* Alert */}
                {showAlert && (
                    <div className="mb-6">
                        <ProductAlertBanner
                            // className="max-w-[622px]"
                            message="Upload picture products with close to white background in high resolution and quality"
                            onDismiss={() => setShowAlert(false)}
                        />
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-card rounded-lg p-6">
                            <ProductFieldGroup>
                                <ProductFieldGroup.Label>Title</ProductFieldGroup.Label>
                                <ProductFieldGroup.Content>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-accent border-border-input" />
                                </ProductFieldGroup.Content>
                            </ProductFieldGroup>
                        </div>

                        {/* Description */}
                        <div className="bg-card rounded-lg p-6">
                            <ProductFieldGroup>
                                <ProductFieldGroup.Label tooltip="Enter product description">
                                    Description
                                </ProductFieldGroup.Label>
                                <ProductFieldGroup.Content>
                                    <RichTextEditor value={description} onChange={handleDescriptionChange} />
                                </ProductFieldGroup.Content>
                                <ProductFieldGroup.Footer>{wordCount} words</ProductFieldGroup.Footer>
                            </ProductFieldGroup>
                        </div>

                        {/* Upload Media */}
                        <div className="bg-card rounded-lg p-6">
                            <ProductFieldGroup>
                                <ProductFieldGroup.Label>Upload Media</ProductFieldGroup.Label>
                                <ProductFieldGroup.Content>
                                    <FileUploadWidget />
                                </ProductFieldGroup.Content>
                            </ProductFieldGroup>
                        </div>

                        {/* Add Variants */}
                        {!showVariantManager ? (
                            <div className="bg-card rounded-lg p-6">
                                <ProductVariantPlaceholder
                                    title="Add Colour/Fabric Variants"
                                    description="Orders will show up here once you add a customer orders from you."
                                    actionLabel="Add Variants"
                                    onAction={() => setShowVariantManager(true)}
                                    icon={Plus}
                                />
                            </div>
                        ) : (
                            <ProductVariantManager />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-card rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <StatusIndicator status="active" />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full bg-accent border-border-input">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Customization */}
                        <div className="bg-card rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-foreground">Customization</label>
                                <Switch checked={customization} onCheckedChange={setCustomization} />
                            </div>

                            {customization && (
                                <div className="space-y-4 pt-4 border-t border-border">
                                    {/* Measurement Required */}
                                    <ProductFieldGroup>
                                        <ProductFieldGroup.Label tooltip="Indicate if measurements are required for this product" className="text-sm font-normal">
                                            Measurement Required
                                        </ProductFieldGroup.Label>
                                        <ProductFieldGroup.Content>
                                            <Switch checked={measurementRequired} onCheckedChange={setMeasurementRequired} />
                                        </ProductFieldGroup.Content>
                                    </ProductFieldGroup>

                                    {/* Turnaround Days */}
                                    <ProductFieldGroup>
                                        <ProductFieldGroup.Label tooltip="Number of days required to complete customization" className="text-sm font-normal">
                                            Turnaround Days
                                        </ProductFieldGroup.Label>
                                        <ProductFieldGroup.Content>
                                            <Input
                                                type="number"
                                                value={turnaroundDays}
                                                onChange={(e) => setTurnaroundDays(e.target.value)}
                                                className="bg-accent border-border-input"
                                                min="1"
                                            />
                                        </ProductFieldGroup.Content>
                                    </ProductFieldGroup>
                                </div>
                            )}
                        </div>

                        {/* Product Organization */}
                        <ProductOrganizationSection
                            audience={audience}
                            onAudienceChange={setAudience}
                            audienceGroups={audienceGroups}
                            category={category}
                            onCategoryChange={setCategory}
                            categoryGroups={categoryGroups}
                            productType={productType}
                            onProductTypeChange={setProductType}
                            productTypeGroups={productTypeGroups}
                            attributes={attributes}
                            onAttributesChange={setAttributes}
                            attributesGroups={attributesGroups}
                        />

                        {/* Pricing */}
                        <ProductPricingSection price={price} onPriceChange={setPrice} />

                        <div className="w-full flex items-center justify-end">
                            {/* Save Button */}
                            <Button onClick={handleSave} className="w-[121px] bg-primary hover:bg-primary/90 text-primary-foreground">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
