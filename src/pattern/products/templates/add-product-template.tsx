"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FileUploadWidget } from "@/pattern/common/organisms/file-upload-widget"
import { RichTextEditor } from "@/pattern/common/organisms/rich-text-editor"
import { ProductFormBackButton } from "../atoms/product-form-back-button"
import { ProductFormSection } from "../atoms/product-form-section"
import { StatusIndicator } from "../atoms/status-indicator"
import { ProductUploadAlert } from "../molecules/product-upload-alert"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { ProductVariantPlaceholder } from "../molecules/product-variant-placeholder"
import { ProductOrganizationSection } from "../organisms/product-organization-section"
import { ProductPricingSection } from "../organisms/product-pricing-section"

export default function AddProductTemplate() {
    const [title, setTitle] = useState("https://www.garnisland.com")
    const [description, setDescription] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const [status, setStatus] = useState("active")
    const [customization, setCustomization] = useState(true)
    const [audience, setAudience] = useState<string[]>(["men"])
    const [category, setCategory] = useState<string[]>(["tops"])
    const [productType, setProductType] = useState<string[]>(["hoodies"])
    const [attributes, setAttributes] = useState<string[]>(["regular"])
    const [price, setPrice] = useState("100000")
    const [showAlert, setShowAlert] = useState(true)

    const handleDescriptionChange = (content: string) => {
        setDescription(content)
        // Simple word count
        const words = content
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0)
        setWordCount(words.length)
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
                    <ProductFormBackButton />
                </div>

                {/* Alert */}
                {showAlert && (
                    <div className="mb-6">
                        <ProductUploadAlert
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
                        <ProductFormSection>
                            <ProductFieldGroup label="Title">
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-accent border-border-input" />
                            </ProductFieldGroup>
                        </ProductFormSection>

                        {/* Description */}
                        <ProductFormSection>
                            <ProductFieldGroup label="Description" showInfo wordCount={wordCount}>
                                <RichTextEditor value={description} onChange={handleDescriptionChange} />
                            </ProductFieldGroup>
                        </ProductFormSection>

                        {/* Upload Media */}
                        <ProductFormSection>
                            <ProductFieldGroup label="Upload Media">
                                <FileUploadWidget />
                            </ProductFieldGroup>
                        </ProductFormSection>

                        {/* Add Variants */}
                        <ProductFormSection>
                            <ProductVariantPlaceholder
                                title="Add Colour/Fabric Variants"
                                description="Orders will show up here once you add a customer orders from you."
                                actionLabel="Add Variants"
                                onAction={() => console.log("Add variants")}
                                icon={Plus}
                            />
                        </ProductFormSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Status */}
                        <ProductFormSection>
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
                        </ProductFormSection>

                        {/* Customization */}
                        <ProductFormSection>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">Customization</label>
                                <Switch checked={customization} onCheckedChange={setCustomization} />
                            </div>
                        </ProductFormSection>

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

                        {/* Save Button */}
                        <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
