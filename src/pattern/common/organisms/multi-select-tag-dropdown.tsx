"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
    value: string
    label: string
}

interface TagGroup {
    label: string
    tags: Tag[]
}

interface MultiSelectTagsProps {
    placeholder?: string
    groups: TagGroup[]
    value: string[]
    onChange: (value: string[]) => void
    className?: string
}

export const MultiSelectTagsDropdown = ({
    placeholder = "Select...",
    groups,
    value,
    onChange,
    className,
}: MultiSelectTagsProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleTag = (tagValue: string) => {
        if (value.includes(tagValue)) {
            onChange(value.filter((v) => v !== tagValue))
        } else {
            onChange([...value, tagValue])
        }
    }

    const removeTag = (tagValue: string) => {
        onChange(value.filter((v) => v !== tagValue))
    }

    const getDisplayValue = () => {
        if (value.length === 0) return placeholder

        // Find all selected tag labels
        const selectedLabels: string[] = []
        groups.forEach((group) => {
            group.tags.forEach((tag) => {
                if (value.includes(tag.value)) {
                    selectedLabels.push(tag.label)
                }
            })
        })

        return selectedLabels.join(", ")
    }

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border-input bg-accent px-3 py-2 text-sm text-foreground hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <span className="truncate">{getDisplayValue()}</span>
                <ChevronDown className={cn("h-4 w-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card p-4 shadow-lg">
                    <div className="space-y-4">
                        {groups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <div className="mb-2 text-xs font-medium text-muted-foreground">{group.label}</div>
                                <div className="flex flex-wrap gap-2">
                                    {group.tags.map((tag) => {
                                        const isSelected = value.includes(tag.value)
                                        return (
                                            <button
                                                key={tag.value}
                                                type="button"
                                                onClick={() => toggleTag(tag.value)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "border border-border-input bg-card text-foreground hover:bg-accent",
                                                )}
                                            >
                                                {tag.label}
                                                {isSelected && (
                                                    <X
                                                        className="h-3 w-3"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeTag(tag.value)
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
