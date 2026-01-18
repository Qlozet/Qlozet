"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const FileUploadWidget = ()=> {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
            const isImage = file.type.startsWith("image/")
            const isVideo = file.type === "video/mp4"
            return isImage || isVideo
        })

        setFiles((prev) => [...prev, ...droppedFiles])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...selectedFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                    isDragging ? "border-primary bg-accent" : "border-border-input bg-transparent hover:bg-accent/50",
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,video/mp4"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brown1 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground mb-1">Drag your images here</p>
                        <p className="text-xs text-muted-foreground">(Only *.jpeg, *.png, *.mp4 be accepted)</p>
                    </div>
                </div>
            </div>

            {/* File Preview */}
            {files?.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files?.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-accent rounded-lg border border-border-input"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-brown1 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(index)
                                }}
                                className="p-1 hover:bg-brown1 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-foreground" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
