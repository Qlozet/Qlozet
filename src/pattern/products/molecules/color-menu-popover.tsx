"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PREDEFINED_COLORS, PredefinedColor } from "../constants/predefined-colors"
import { Palette } from "lucide-react"

interface ColorMenuPopoverProps {
    onSelectColor: (color: PredefinedColor) => void
    onOpenCustomPicker: () => void
    children: React.ReactNode
    selectedColors?: string[]
}

export function ColorMenuPopover({ onSelectColor, onOpenCustomPicker, children, selectedColors = [] }: ColorMenuPopoverProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleColorSelect = (color: PredefinedColor) => {
        onSelectColor(color)
        // Don't close the popover to allow multiple selections
    }

    const handleCustomPickerClick = async () => {
        setIsOpen(false) // Close popover before opening modal
        onOpenCustomPicker()
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-56 py-5 px-2.5 bg-white" align="start">
                <div className="space-y-3">
                    <h4 className="text-xs font-normal text-muted-foreground">Colour menu</h4>
                    <ScrollArea className="h-96">
                        <div className="w-full flex gap-x-2 gap-y-3 flex-wrap">
                            {/* Custom colour */}
                            <button
                                onClick={handleCustomPickerClick}
                                className="flex items-center gap-3 w-full px-2 py-1.5 hover:bg-gray-50 rounded transition-colors text-left cursor-pointer"
                            >
                                <div
                                    className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: "conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)",
                                    }}
                                >
                                    <Palette className="w-2.5 h-2.5 text-white drop-shadow-sm" />
                                </div>
                                <span className="text-sm text-gray-900">Custom</span>
                            </button>
                            {PREDEFINED_COLORS?.map((color) => {
                                const isSelected = selectedColors.includes(color.value)
                                return (
                                    <button
                                        key={color.value}
                                        onClick={() => handleColorSelect(color)}
                                        className={`flex items-center gap-1 w-fit px-2 py-1.5 hover:bg-gray-50 rounded-[6px] cursor-pointer transition-colors text-left ${isSelected ? "bg-blue-50" : "bg-[#f1f1f1]"
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-[6px] border border-[#00000033] flex-shrink-0 ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="text-xs text-gray-900">{color.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    )
}
