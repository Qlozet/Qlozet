"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Minus, Plus, Trash2, Upload } from "lucide-react"
import { VariantRow, VariantSizeDetail, ALL_SIZES } from "../types/variant.types"

interface VariantSetVariantsProps {
    variants: VariantRow[]
    onVariantUpdate: (variantId: string, sizes: VariantSizeDetail[]) => void
    onVariantDelete: (variantId: string) => void
    onVariantToggle: (variantId: string) => void
}

export function VariantSetVariants({ variants, onVariantUpdate, onVariantDelete, onVariantToggle }: VariantSetVariantsProps) {
    return (
        <div className="bg-card rounded-lg p-6 border border-border mt-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Set Variants</h3>

            {variants?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No variants created yet. Select colors and sizes above, then click "Add Variants".</p>
                </div>
            ) : (
                <>
                    {/* Header Row */}
                    <div className="flex gap-4 mb-2 text-sm font-medium text-muted-foreground">
                        <div className="w-[16.67%]">Colours</div>
                        <div className="w-[50%]">Available Sizes</div>
                        <div className="w-[25%]">Add Product Images</div>
                        <div className="w-[8.33%]"></div>
                    </div>

                    {/* Variant Rows */}
                    <div className="space-y-2">
                        {variants.map((variant) => (
                            <VariantRowComponent
                                key={variant.id}
                                variant={variant}
                                onUpdate={(sizes) => onVariantUpdate(variant.id, sizes)}
                                onDelete={() => onVariantDelete(variant.id)}
                                onToggle={() => onVariantToggle(variant.id)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

interface VariantRowComponentProps {
    variant: VariantRow
    onUpdate: (sizes: VariantSizeDetail[]) => void
    onDelete: () => void
    onToggle: () => void
}

function VariantRowComponent({ variant, onUpdate, onDelete, onToggle }: VariantRowComponentProps) {
    const handleSizeUpdate = (sizeIndex: number, field: keyof VariantSizeDetail, value: any) => {
        const updatedSizes = [...variant.sizes]
        updatedSizes[sizeIndex] = {
            ...updatedSizes[sizeIndex],
            [field]: value,
        }
        onUpdate(updatedSizes)
    }

    const incrementValue = (sizeIndex: number, field: "stock" | "yardsPerOrder") => {
        const currentValue = variant.sizes[sizeIndex][field]
        handleSizeUpdate(sizeIndex, field, currentValue + 1)
    }

    const decrementValue = (sizeIndex: number, field: "stock" | "yardsPerOrder") => {
        const currentValue = variant.sizes[sizeIndex][field]
        if (currentValue > 0) {
            handleSizeUpdate(sizeIndex, field, currentValue - 1)
        }
    }

    const handleSizeToggle = (size: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering the row toggle

        const hasSizeIndex = variant.sizes.findIndex((s) => s.size === size)

        if (hasSizeIndex >= 0) {
            // Remove the size
            const updatedSizes = variant.sizes.filter((s) => s.size !== size)
            onUpdate(updatedSizes)
        } else {
            // Add the size with default values
            const newSize: VariantSizeDetail = {
                size,
                stock: 0,
                yardsPerOrder: 0,
                price: 0,
                sku: "",
                images: [],
            }
            const updatedSizes = [...variant.sizes, newSize]
            onUpdate(updatedSizes)
        }
    }

    const handleSizeRemove = (sizeIndex: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const updatedSizes = variant.sizes.filter((_, index) => index !== sizeIndex)
        onUpdate(updatedSizes)
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Collapsed Row */}
            <div className="flex gap-4 p-4 items-center bg-accent cursor-pointer hover:bg-accent/80" onClick={onToggle}>
                <div className="w-[16.67%] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: variant.color.hex }} />
                    <button className="p-1 cursor-pointer">
                        {variant.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
                <div className="w-[50%] flex gap-2">
                    {ALL_SIZES?.map((size) => {
                        const hasSize = variant.sizes?.some((s) => s.size === size)
                        return (
                            <button
                                key={size}
                                onClick={(e) => handleSizeToggle(size, e)}
                                className={`w-10 h-8 rounded text-xs font-medium border transition-all ${
                                    hasSize
                                        ? "bg-card border-border text-foreground hover:bg-destructive/10"
                                        : "bg-muted border-border text-muted-foreground opacity-50 hover:opacity-100 hover:bg-accent"
                                }`}
                            >
                                {size}
                            </button>
                        )
                    })}
                </div>
                <div className="w-[25%] flex gap-2">
                    {variant.sizes.slice(0, 5)?.map((_, idx) => (
                        <div key={idx} className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-orange-600" />
                        </div>
                    ))}
                    {variant.sizes?.length > 5 && (
                        <button className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="w-[8.33%] flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="p-1 hover:bg-destructive/10 rounded"
                    >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {variant.isExpanded && (
                <div className="border-t border-border bg-card">
                    {/* Table Header */}
                    <div className="flex gap-6 p-4 bg-muted/30 text-xs font-medium text-muted-foreground">
                        <div className="w-[16%]">Size</div>
                        <div className="w-[16%] flex items-center gap-1">
                            Stock
                            <InfoIcon />
                        </div>
                        <div className="w-[16%] flex items-center gap-1">
                            Yards/order
                            <InfoIcon />
                        </div>
                        <div className="w-[16%] flex items-center gap-1">
                            Price
                            <InfoIcon />
                        </div>
                        <div className="w-[28%] flex items-center gap-1">
                            SKU
                            <InfoIcon />
                        </div>
                        <div className="w-[8%] flex justify-end">
                            {/* Header - no action needed */}
                        </div>
                    </div>

                    {/* Size Rows */}
                    {variant.sizes?.map((sizeDetail, sizeIndex) => (
                        <div key={sizeDetail?.size} className="flex gap-4 p-4 border-b border-border last:border-b-0">
                            <div className="w-[16%]">
                                <div className="w-10 h-8 rounded bg-accent border border-border flex items-center justify-center text-sm font-medium">
                                    {sizeDetail?.size}
                                </div>
                            </div>
                            <div className="w-[16%]">
                                <div className="flex items-center border border-border-input rounded overflow-hidden bg-accent h-8">
                                    <button
                                        onClick={() => decrementValue(sizeIndex, "stock")}
                                        className="px-1.5 h-full hover:bg-muted flex items-center justify-center shrink-0"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                        type="number"
                                        value={sizeDetail?.stock}
                                        onChange={(e) => handleSizeUpdate(sizeIndex, "stock", parseInt(e.target.value) || 0)}
                                        className="flex-1 text-center bg-transparent border-none focus:outline-none text-sm h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                                    />
                                    <button
                                        onClick={() => incrementValue(sizeIndex, "stock")}
                                        className="px-1.5 h-full hover:bg-muted flex items-center justify-center shrink-0"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="w-[16%]">
                                <div className="flex items-center border border-border-input rounded overflow-hidden bg-accent h-8">
                                    <button
                                        onClick={() => decrementValue(sizeIndex, "yardsPerOrder")}
                                        className="px-1.5 h-full hover:bg-muted flex items-center justify-center shrink-0"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                        type="number"
                                        value={sizeDetail.yardsPerOrder}
                                        onChange={(e) =>
                                            handleSizeUpdate(sizeIndex, "yardsPerOrder", parseInt(e.target.value) || 0)
                                        }
                                        className="flex-1 text-center bg-transparent border-none focus:outline-none text-sm h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                                    />
                                    <button
                                        onClick={() => incrementValue(sizeIndex, "yardsPerOrder")}
                                        className="px-1.5 h-full hover:bg-muted flex items-center justify-center shrink-0"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="w-[16%]">
                                <div className="flex items-center border border-border-input rounded overflow-hidden bg-accent h-8">
                                    <span className="px-2 text-sm text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        value={sizeDetail.price}
                                        onChange={(e) => handleSizeUpdate(sizeIndex, "price", parseInt(e.target.value) || 0)}
                                        className="flex-1 px-2 bg-transparent border-none focus:outline-none text-sm h-full"
                                    />
                                </div>
                            </div>
                            <div className="w-[28%]">
                                <Input
                                    value={sizeDetail.sku}
                                    onChange={(e) => handleSizeUpdate(sizeIndex, "sku", e.target.value)}
                                    className="bg-accent border-border-input text-sm h-8"
                                    placeholder="SKU"
                                />
                            </div>
                            <div className="w-[8%] flex justify-end">
                                <button
                                    onClick={(e) => handleSizeRemove(sizeIndex, e)}
                                    className="p-1 hover:bg-destructive/10 rounded"
                                    title="Remove this size"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function InfoIcon() {
    return (
        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}
