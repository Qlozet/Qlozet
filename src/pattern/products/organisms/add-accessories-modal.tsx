"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InfoIcon, Trash2Icon, UploadIcon, PlusIcon, FlagIcon } from "lucide-react"
import { create, useModal } from "@ebay/nice-modal-react"
import { VariantSelectOptions } from "./variant-select-options"
import { AVAILABLE_COLORS, ColorOption, VariantRow, VariantSizeDetail } from "../types/variant.types"

export const AddAccessoryModal = create(() => {
    const { resolve, remove, visible } = useModal();

    const handleCloseModal = () => {
        remove();
    };
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [variants, setVariants] = useState<VariantRow[]>([])
    const [customColors, setCustomColors] = useState<ColorOption[]>([])
    const [accessoryName, setAccessoryName] = useState("Wide-leg pants")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("Belts")
    const [subCategory, setSubCategory] = useState("Leather belt")
    const [tags, setTags] = useState("Men")
    const [price, setPrice] = useState("100000")

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
        // Get colors that don't already have variants
        const existingColorValues = variants.map((v) => v.color.value)
        const newColorValues = selectedColors.filter((colorValue) => !existingColorValues.includes(colorValue))

        // Only create variants for new colors
        if (newColorValues.length === 0) {
            return // No new colors to add
        }

        // Combine available colors with custom colors
        const allColors = [...AVAILABLE_COLORS, ...customColors]

        const newVariants: VariantRow[] = newColorValues.map((colorValue) => {
            const color = allColors.find((c) => c.value === colorValue)!

            // Map selected sizes to ALL_SIZES format
            const sizeMap: Record<string, string> = {
                xs: "S",
                s: "M",
                m: "L",
                l: "XL",
            }

            const sizes: VariantSizeDetail[] = selectedSizes.map((sizeValue) => ({
                size: sizeMap[sizeValue] || sizeValue.toUpperCase(),
                stock: 0,
                yardsPerOrder: 0,
                price: 0,
                sku: "",
                images: [],
            }))

            return {
                id: `${colorValue}-${Date.now()}-${Math.random()}`,
                color,
                sizes,
                isExpanded: false,
            }
        })

        setVariants((prev) => [...prev, ...newVariants])
    }

    const handleVariantUpdate = (variantId: string, sizes: VariantSizeDetail[]) => {
        setVariants((prev) => prev.map((v) => (v.id === variantId ? { ...v, sizes } : v)))
    }

    const handleVariantDelete = (variantId: string) => {
        setVariants((prev) => prev.filter((v) => v.id !== variantId))
    }

    const handleVariantToggle = (variantId: string) => {
        setVariants((prev) => prev.map((v) => (v.id === variantId ? { ...v, isExpanded: !v.isExpanded } : v)))
    }

    return (
        <Dialog open={visible} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-6xl p-0 pr-2!">

                <div className="h-full w-full max-h-[85vh] grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 pr-1 overflow-y-auto">
                    {/* Left Column - Form */}
                    <div className="w-full gap-y-[26px] pl-[38px] mt-8">
                        <DialogTitle className="text-2xl font-semibold">Add Accessory</DialogTitle>
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

                                {/* Categories */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Categories
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Belts">Belts</SelectItem>
                                            <SelectItem value="Hats">Hats</SelectItem>
                                            <SelectItem value="Bags">Bags</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sub-categories */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Sub-categories
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <Select value={subCategory} onValueChange={setSubCategory}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select sub-category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Leather belt">Leather belt</SelectItem>
                                            <SelectItem value="Fabric belt">Fabric belt</SelectItem>
                                            <SelectItem value="Chain belt">Chain belt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Tags
                                        <InfoIcon className="size-3.5 text-muted-foreground" />
                                    </label>
                                    <Select value={tags} onValueChange={setTags}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select tags" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Men">Men</SelectItem>
                                            <SelectItem value="Women">Women</SelectItem>
                                            <SelectItem value="Unisex">Unisex</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <h3 className="text-base font-semibold">Set variants</h3>

                                    <div className="bg-muted/30 rounded-lg">
                                        <Tabs defaultValue="colours" className="w-full">
                                            <div className="flex items-center justify-between border-b px-4">
                                                <TabsList className="bg-transparent p-0 h-auto">
                                                    <TabsTrigger
                                                        value="colours"
                                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                                                    >
                                                        Colours
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="sizes"
                                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                                                    >
                                                        Sizes
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="images"
                                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                                                    >
                                                        Add product images
                                                    </TabsTrigger>
                                                </TabsList>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2Icon className="size-4" />
                                                </Button>
                                            </div>

                                            <TabsContent value="colours" className="p-6">
                                                <p className="text-sm text-muted-foreground text-center">No variant added yet</p>
                                            </TabsContent>
                                            <TabsContent value="sizes" className="p-6">
                                                <p className="text-sm text-muted-foreground text-center">No variant added yet</p>
                                            </TabsContent>
                                            <TabsContent value="images" className="p-6">
                                                <p className="text-sm text-muted-foreground text-center">No variant added yet</p>
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    <Button variant="secondary" className="w-fit">
                                        Upload Fabric
                                    </Button>
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
                    </div>

                    {/* Preview section */}
                    <div className="bg-[#f1f1f1] space-y-3 p-7">
                        <h3 className="text-xl font-semibold">Preview</h3>

                        <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2">
                            <div className="bg-amber-900 rounded-full size-8 flex items-center justify-center shrink-0">
                                <InfoIcon className="size-4 text-white" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Add a clear picture of the accessory in white background
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                            <div className="bg-muted rounded-full size-12 flex items-center justify-center">
                                <UploadIcon className="size-6 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm text-foreground">Add or drop image or sketch</p>
                                <button className="text-sm text-blue-600 hover:underline">Add from URL</button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
})
