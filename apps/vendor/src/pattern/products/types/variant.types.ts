export interface ColorOption {
    value: string
    label: string
    hex: string
}

export interface SizeOption {
    value: string
    label: string
}

export interface VariantSizeDetail {
    size: string
    stock: number
    yardsPerOrder: number
    price: number
    sku: string
    images: string[]
}

export interface VariantRow {
    id: string
    color: ColorOption
    sizes: VariantSizeDetail[]
    isExpanded: boolean
}

export const AVAILABLE_COLORS: ColorOption[] = [
    { value: "black", label: "Black", hex: "#000000" },
    { value: "red", label: "Red", hex: "#991B1B" },
    { value: "purple", label: "Purple", hex: "#7E22CE" },
    { value: "cyan", label: "Cyan", hex: "#67E8F9" },
    { value: "lime", label: "Lime Green", hex: "#A3E635" },
]

export const AVAILABLE_SIZES: SizeOption[] = [
    { value: "xs", label: "Extra small" },
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
]
5
export const ALL_SIZES = ["S", "M", "L", "XL", "XXL"]
