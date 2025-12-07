"use client"

import { useState } from "react"
import { VariantSelectOptions } from "./variant-select-options"
import { VariantSetVariants } from "./variant-set-variants"
import { VariantRow, VariantSizeDetail, ColorOption, AVAILABLE_COLORS, AVAILABLE_SIZES } from "../types/variant.types"

export function ProductVariantManager() {
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [variants, setVariants] = useState<VariantRow[]>([])
    const [customColors, setCustomColors] = useState<ColorOption[]>([])

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
        <div className="space-y-6">
            <VariantSelectOptions
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                onColorToggle={handleColorToggle}
                onSizeToggle={handleSizeToggle}
                onAddVariants={handleAddVariants}
                onAddCustomColor={handleAddCustomColor}
                availableColors={customColors}
            />

            <VariantSetVariants
                variants={variants}
                onVariantUpdate={handleVariantUpdate}
                onVariantDelete={handleVariantDelete}
                onVariantToggle={handleVariantToggle}
            />
        </div>
    )
}
