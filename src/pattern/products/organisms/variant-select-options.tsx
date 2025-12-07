"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Palette, X } from "lucide-react"
import { useModal } from "@ebay/nice-modal-react"
import { AVAILABLE_COLORS, AVAILABLE_SIZES, ColorOption, SizeOption } from "../types/variant.types"
import { ColorMenuPopover } from "../molecules/color-menu-popover"
import { PredefinedColor } from "../constants/predefined-colors"
import AdvancedColorPickerModal from "./advanced-color-picker-modal"

interface VariantSelectOptionsProps {
    selectedColors: string[]
    selectedSizes: string[]
    onColorToggle: (colorValue: string) => void
    onSizeToggle: (sizeValue: string) => void
    onAddVariants: () => void
    onAddCustomColor: (color: ColorOption) => void
    availableColors?: ColorOption[]
}

export function VariantSelectOptions({
    selectedColors,
    selectedSizes,
    onColorToggle,
    onSizeToggle,
    onAddVariants,
    onAddCustomColor,
    availableColors = AVAILABLE_COLORS,
}: VariantSelectOptionsProps) {
    const colorPickerModal = useModal(AdvancedColorPickerModal)
    const displayColors = [...AVAILABLE_COLORS, ...availableColors.filter((c) => !AVAILABLE_COLORS.find((ac) => ac.value === c.value))]

    const handlePredefinedColorSelect = (color: PredefinedColor) => {
        const colorOption: ColorOption = {
            value: color.value,
            label: color.label,
            hex: color.hex,
        }
        // Check if color already exists in available colors, if not add it
        if (!displayColors.find((c) => c.value === color.value)) {
            onAddCustomColor(colorOption)
        }
        // Toggle the color selection
        onColorToggle(color.value)
    }

    const handleOpenCustomPicker = async () => {
        const result = (await colorPickerModal.show({ initialColor: "#A855F7" })) as { hex: string; label: string } | null
        if (result) {
            const customColor: ColorOption = {
                value: result.hex.replace("#", "").toLowerCase(),
                label: result.label,
                hex: result.hex,
            }
            onAddCustomColor(customColor)
            // Auto-select the custom color (already handled in onAddCustomColor)
        }
    }

    return (
        <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-sm font-medium text-foreground mb-4">Select Options (Variants)</h3>

            {/* Color Picker */}
            <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">Colour</label>
                <ColorMenuPopover
                    onSelectColor={handlePredefinedColorSelect}
                    onOpenCustomPicker={handleOpenCustomPicker}
                    selectedColors={selectedColors}
                >
                    <div className="min-h-[44px] flex items-center gap-2 flex-wrap px-3 py-2 border-2 border-border rounded-md cursor-pointer hover:border-border-input transition-colors bg-accent">
                        {selectedColors.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Select colors...</span>
                        ) : (
                            selectedColors.map((colorValue) => {
                                const color = displayColors.find((c) => c.value === colorValue)
                                if (!color) return null
                                return (
                                    <div
                                        key={color.value}
                                        className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1"
                                    >
                                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                                        <span className="text-xs text-foreground">{color.label}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onColorToggle(color.value)
                                            }}
                                            className="ml-1 hover:bg-accent rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                        <Palette className="w-4 h-4 text-muted-foreground ml-auto" />
                    </div>
                </ColorMenuPopover>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
                <div className="flex items-center gap-2 flex-wrap">
                    {AVAILABLE_SIZES.map((size) => {
                        const isSelected = selectedSizes.includes(size.value)
                        return (
                            <Button
                                key={size.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSizeToggle(size.value)}
                                className={
                                    isSelected
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "bg-accent border-border-input hover:bg-accent/80"
                                }
                            >
                                {size.label}
                            </Button>
                        )
                    })}
                    {/* <button className="px-3 py-1.5 rounded-md border-2 border-dashed border-border hover:border-border-input flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="px-4 py-1.5 rounded-md border-2 border-dashed border-border hover:border-border-input text-sm">
                        ▼
                    </button> */}
                </div>
            </div>

            {/* Add Variants Button */}
            <Button
                onClick={onAddVariants}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={selectedColors.length === 0 || selectedSizes.length === 0}
            >
                Add Variants
            </Button>

            {selectedColors.length === 0 || selectedSizes.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2 text-right">No color variant</p>
            ) : null}
        </div>
    )
}
