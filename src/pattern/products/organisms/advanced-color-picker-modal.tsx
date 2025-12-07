"use client"

import { useState } from "react"
import { create, useModal } from "@ebay/nice-modal-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ColorPicker, useColor, IColor } from "react-color-palette"
import { X, Plus } from "lucide-react"
import "react-color-palette/css"

interface ColorPickerResult {
    hex: string
    label: string
}

const AdvancedColorPickerModal = create<{ initialColor?: string }>(({ initialColor = "#A855F7" }) => {
    const { resolve, remove, visible } = useModal()
    const [color, setColor] = useColor(initialColor)
    const [opacity, setOpacity] = useState(100)
    const [colorHistory, setColorHistory] = useState<string[]>([
        "#000000",
        "#0000FF",
        "#00FF00",
        "#FFFF00",
        "#FF0000",
        "#A855F7",
    ])
    const [colorLabel, setColorLabel] = useState("")

    const handleSaveColor = () => {
        if (!colorHistory.includes(color.hex)) {
            setColorHistory([color.hex, ...colorHistory].slice(0, 12))
        }
    }

    const handleConfirm = () => {
        const label = colorLabel.trim() || `Custom ${color.hex}`
        resolve({ hex: color.hex, label } as ColorPickerResult)
        remove()
    }

    const handleClose = () => {
        resolve(null)
        remove()
    }

    const getColorWithOpacity = (hex: string, opacity: number) => {
        const alpha = Math.round((opacity / 100) * 255)
            .toString(16)
            .padStart(2, "0")
        return `${hex}${alpha}`
    }

    return (
        <Dialog open={visible} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[85vh] p-0 flex flex-col">
                <DialogHeader className="p-6 pb-4 flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">Colors</DialogTitle>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-6 pt-4 pb-4">
                    <Tabs defaultValue="grid" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="grid">Grid</TabsTrigger>
                            <TabsTrigger value="spectrum">Spectrum</TabsTrigger>
                            <TabsTrigger value="sliders">Sliders</TabsTrigger>
                        </TabsList>

                        {/* Grid Tab */}
                        <TabsContent value="grid" className="space-y-4">
                            <ColorGridPicker color={color} onChange={setColor} />
                        </TabsContent>

                        {/* Spectrum Tab */}
                        <TabsContent value="spectrum" className="space-y-4">
                            <div className="w-full">
                                <ColorPicker color={color} onChange={setColor} />
                            </div>
                        </TabsContent>

                        {/* Sliders Tab */}
                        <TabsContent value="sliders" className="space-y-4">
                            <ColorSliders color={color} onChange={setColor} />
                        </TabsContent>
                    </Tabs>

                    {/* Opacity Slider */}
                    <div className="mt-6 space-y-2">
                        <label className="text-sm font-medium">Opacity</label>
                        <div className="flex items-center gap-4">
                            <div
                                className="h-4 flex-1 rounded"
                                style={{
                                    background: `linear-gradient(to right,
                    repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px,
                    linear-gradient(to right, transparent, ${color.hex}))`,
                                }}
                            >
                                <Slider
                                    value={[opacity]}
                                    onValueChange={(value) => setOpacity(value[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="h-full"
                                />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{opacity}%</span>
                        </div>
                    </div>

                    {/* Current Color Display */}
                    <div className="mt-6 flex items-center gap-4">
                        <div
                            className="w-20 h-20 rounded-lg border-2 border-border"
                            style={{ backgroundColor: getColorWithOpacity(color.hex, opacity) }}
                        />
                        <div className="flex-1 space-y-2">
                            <Input
                                value={colorLabel}
                                onChange={(e) => setColorLabel(e.target.value)}
                                placeholder="Color name (optional)"
                                className="bg-accent border-border-input"
                            />
                            <div className="text-xs text-muted-foreground">
                                HEX: {color.hex} | RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                            </div>
                        </div>
                    </div>

                    {/* Color History */}
                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Recent Colors</label>
                            <button
                                onClick={handleSaveColor}
                                className="text-xs flex items-center gap-1 hover:bg-accent px-2 py-1 rounded"
                            >
                                <Plus className="w-3 h-3" />
                                Save
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {colorHistory.map((historyColor, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const rgb = {
                                            r: parseInt(historyColor.slice(1, 3), 16),
                                            g: parseInt(historyColor.slice(3, 5), 16),
                                            b: parseInt(historyColor.slice(5, 7), 16)
                                        }
                                        const r = rgb.r / 255
                                        const g = rgb.g / 255
                                        const b = rgb.b / 255
                                        const max = Math.max(r, g, b)
                                        const min = Math.min(r, g, b)
                                        const diff = max - min
                                        let h = 0
                                        if (diff !== 0) {
                                            if (max === r) h = 60 * (((g - b) / diff) % 6)
                                            else if (max === g) h = 60 * ((b - r) / diff + 2)
                                            else h = 60 * ((r - g) / diff + 4)
                                        }
                                        if (h < 0) h += 360
                                        const s = max === 0 ? 0 : (diff / max) * 100
                                        const v = max * 100
                                        setColor({ hex: historyColor, rgb, hsv: { h, s, v } } as IColor)
                                    }}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                                        historyColor === color.hex ? "border-primary ring-2 ring-primary/20" : "border-border"
                                    }`}
                                    style={{ backgroundColor: historyColor }}
                                />
                            ))}
                        </div>
                    </div>
                    </div>
                </ScrollArea>

                {/* Action Buttons */}
                <div className="p-6 pt-4 flex gap-2 border-t flex-shrink-0">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} className="flex-1 bg-primary hover:bg-primary/90">
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
})

export default AdvancedColorPickerModal

// Color Grid Picker Component
function ColorGridPicker({ color, onChange }: { color: IColor; onChange: (color: IColor) => void }) {
    // Generate color grid
    const generateColorGrid = () => {
        const colors: string[] = []
        const hueSteps = 12
        const satSteps = 8

        // Add grayscale
        for (let i = 0; i <= 8; i++) {
            const value = Math.round((i / 8) * 255)
            colors.push(`rgb(${value}, ${value}, ${value})`)
        }

        // Add color grid
        for (let sat = satSteps; sat >= 0; sat--) {
            for (let hue = 0; hue < hueSteps; hue++) {
                const h = (hue / hueSteps) * 360
                const s = (sat / satSteps) * 100
                const l = 50
                colors.push(`hsl(${h}, ${s}%, ${l}%)`)
            }
        }

        return colors
    }

    const colors = generateColorGrid()

    const convertToHex = (colorValue: string): string => {
        const temp = document.createElement("div")
        temp.style.color = colorValue
        document.body.appendChild(temp)
        const rgb = window.getComputedStyle(temp).color
        document.body.removeChild(temp)

        const match = rgb.match(/\d+/g)
        if (match) {
            return (
                "#" +
                match
                    .slice(0, 3)
                    .map((x) => parseInt(x).toString(16).padStart(2, "0"))
                    .join("")
            )
        }
        return "#000000"
    }

    const hexToRgb = (hex: string) => {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        }
    }

    const rgbToHsv = (r: number, g: number, b: number) => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const diff = max - min

        let h = 0
        if (diff !== 0) {
            if (max === r) h = 60 * (((g - b) / diff) % 6)
            else if (max === g) h = 60 * ((b - r) / diff + 2)
            else h = 60 * ((r - g) / diff + 4)
        }
        if (h < 0) h += 360

        const s = max === 0 ? 0 : (diff / max) * 100
        const v = max * 100

        return { h, s, v }
    }

    const handleColorClick = (colorValue: string) => {
        const hex = convertToHex(colorValue)
        const rgb = hexToRgb(hex)
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)

        onChange({
            hex,
            rgb,
            hsv,
        } as IColor)
    }

    return (
        <div className="grid grid-cols-12 gap-1">
            {colors.map((colorValue, idx) => (
                <button
                    key={idx}
                    onClick={() => handleColorClick(colorValue)}
                    className="w-full h-8 rounded border border-border/50 hover:scale-110 transition-transform"
                    style={{ backgroundColor: colorValue }}
                />
            ))}
        </div>
    )
}

// Color Sliders Component
function ColorSliders({ color, onChange }: { color: IColor; onChange: (color: IColor) => void }) {
    const rgbToHsv = (r: number, g: number, b: number) => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const diff = max - min

        let h = 0
        if (diff !== 0) {
            if (max === r) h = 60 * (((g - b) / diff) % 6)
            else if (max === g) h = 60 * ((b - r) / diff + 2)
            else h = 60 * ((r - g) / diff + 4)
        }
        if (h < 0) h += 360

        const s = max === 0 ? 0 : (diff / max) * 100
        const v = max * 100

        return { h, s, v }
    }

    const handleRGBChange = (channel: "r" | "g" | "b", value: number) => {
        const newRgb = { ...color.rgb, [channel]: value }
        const hex =
            "#" +
            Object.values(newRgb)
                .map((x) => x.toString(16).padStart(2, "0"))
                .join("")
        const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
        onChange({ hex, rgb: newRgb, hsv } as IColor)
    }

    const handleHSVChange = (channel: "h" | "s" | "v", value: number) => {
        const newHsv = { ...color.hsv, [channel]: value }

        // Convert HSV to RGB
        const h = newHsv.h
        const s = newHsv.s / 100
        const v = newHsv.v / 100

        const c = v * s
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
        const m = v - c

        let r = 0, g = 0, b = 0
        if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
        else if (h >= 300 && h < 360) { r = c; g = 0; b = x }

        const rgb = {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        }

        const hex =
            "#" +
            Object.values(rgb)
                .map((x) => x.toString(16).padStart(2, "0"))
                .join("")
        onChange({ hex, rgb, hsv: newHsv } as IColor)
    }

    return (
        <div className="space-y-4">
            {/* RGB Sliders */}
            <div className="space-y-3">
                <label className="text-sm font-medium">RGB</label>

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">R</span>
                        <Slider
                            value={[color.rgb.r]}
                            onValueChange={(value) => handleRGBChange("r", value[0])}
                            min={0}
                            max={255}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{color.rgb.r}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">G</span>
                        <Slider
                            value={[color.rgb.g]}
                            onValueChange={(value) => handleRGBChange("g", value[0])}
                            min={0}
                            max={255}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{color.rgb.g}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">B</span>
                        <Slider
                            value={[color.rgb.b]}
                            onValueChange={(value) => handleRGBChange("b", value[0])}
                            min={0}
                            max={255}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{color.rgb.b}</span>
                    </div>
                </div>
            </div>

            {/* HSV Sliders */}
            <div className="space-y-3">
                <label className="text-sm font-medium">HSV</label>

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">H</span>
                        <Slider
                            value={[color.hsv.h]}
                            onValueChange={(value) => handleHSVChange("h", value[0])}
                            min={0}
                            max={360}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{Math.round(color.hsv.h)}°</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">S</span>
                        <Slider
                            value={[color.hsv.s]}
                            onValueChange={(value) => handleHSVChange("s", value[0])}
                            min={0}
                            max={100}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{Math.round(color.hsv.s)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs w-4">V</span>
                        <Slider
                            value={[color.hsv.v]}
                            onValueChange={(value) => handleHSVChange("v", value[0])}
                            min={0}
                            max={100}
                            className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{Math.round(color.hsv.v)}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
