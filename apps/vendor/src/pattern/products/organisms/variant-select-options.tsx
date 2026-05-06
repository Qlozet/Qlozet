"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Palette, X } from "lucide-react"
import { useModal } from "@ebay/nice-modal-react"
import { AVAILABLE_COLORS, AVAILABLE_SIZES, ColorOption, SizeOption } from "../types/variant.types"
import { ColorMenuPopover } from "../molecules/color-menu-popover"
import { PredefinedColor } from "../constants/predefined-colors"
import AdvancedColorPickerModal from "./advanced-color-picker-modal"
import { cn } from "@/lib/utils"
import { ProductFieldGroup } from "../molecules/product-field-group"
import { MultiSelectTagsDropdown } from "@/pattern/common/organisms/multi-select-tag-dropdown"

interface VariantSelectOptionsProps {
    selectedColors: string[]
    selectedSizes: string[]
    onColorToggle: (colorValue: string) => void
    onSizeToggle: (sizeValue: string) => void
    onAddVariants: () => void
    onAddCustomColor: (color: ColorOption) => void
    availableColors?: ColorOption[]
    children?: ReactNode
    className?: string
}

export function VariantSelectOptions({
    selectedColors,
    selectedSizes,
    onColorToggle,
    onSizeToggle,
    onAddVariants,
    onAddCustomColor,
    children,
    availableColors = AVAILABLE_COLORS,
    className
}: VariantSelectOptionsProps) {
    const colorPickerModal = useModal(AdvancedColorPickerModal)
    const displayColors = [...AVAILABLE_COLORS, ...availableColors.filter((c) => !AVAILABLE_COLORS.find((ac) => ac.value === c.value))]

    const [size, setSize] = useState<string[]>([""])

    const sizes = [
        {
            label: "Gender",
            tags: AVAILABLE_SIZES,
        },
    ]

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
        <div className={cn("bg-card rounded-lg p-6 border border-border", className)}>
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
                        {selectedColors?.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Select colors...</span>
                        ) : (
                            selectedColors?.map((colorValue) => {
                                const color = displayColors.find((c) => c.value === colorValue)
                                if (!color) return null
                                return (
                                    <div
                                        key={color?.value}
                                        className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1"
                                    >
                                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color?.hex }} />
                                        <span className="text-xs text-foreground">{color?.label}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onColorToggle(color?.value)
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

            <div className="w-full space-y-[20px]">
                {/* Size Selector */}
                <ProductFieldGroup>
                    <ProductFieldGroup.Label tooltip="Select sizes">
                        Size
                    </ProductFieldGroup.Label>
                    <ProductFieldGroup.Content>
                        <MultiSelectTagsDropdown placeholder="Size" groups={sizes} value={size} onChange={setSize} />
                    </ProductFieldGroup.Content>
                </ProductFieldGroup>

                {/* Add Variants Button */}
                <Button
                    onClick={onAddVariants}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={selectedColors?.length === 0 || selectedSizes?.length === 0}
                >
                    Add Variants
                </Button>

                {children}
            </div>
        </div>
    )
}

interface IVariantSelectFallbackProps {
    fallbackText?: string
    selectedColors: string[]
    selectedSizes: string[]
}

export const VariantSelectFallback = ({ fallbackText, selectedColors, selectedSizes }: IVariantSelectFallbackProps) => {
    return (
        <>
            {
                !selectedColors || !selectedSizes ? (
                    <p className="text-sm text-muted-foreground mt-2 text-right">{fallbackText ?? "No color variant"}</p>
                ) : null
            }
        </>
    )
}