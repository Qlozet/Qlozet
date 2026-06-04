"use client"

import { useEffect, useState } from "react"
import { Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { DarkModeIcon } from "../atoms/nav-icons/dark-mode-icon"

export const ThemeToggleSwitch = () => {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check if dark mode is already enabled
        const isDark = document.documentElement.classList.contains("dark")
        setIsDarkMode(isDark)
    }, [])

    const toggleDarkMode = () => {
        const html = document.documentElement
        const newDarkMode = !isDarkMode

        if (newDarkMode) {
            html.classList.add("dark")
        } else {
            html.classList.remove("dark")
        }

        setIsDarkMode(newDarkMode)
        // Persist preference
        localStorage.setItem("darkMode", newDarkMode ? "true" : "false")
    }

    if (!mounted) return null

    return (
        <button
            onClick={toggleDarkMode}
            className={cn("relative inline-flex h-6 w-[45.47px] items-center rounded-full transition-colors duration-300 cursor-pointer", isDarkMode ? "bg-primary" : "bg-[#ACB5BD]"
            )}
            aria-label="Toggle theme"
        >
            {/* Toggle circle */}
            <div
                className={cn("absolute flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300", isDarkMode ? "translate-x-[23px]" : "translate-x-1"
                )}
            >
                {isDarkMode ? (
                    <DarkModeIcon className="h-10 w-10 text-gray-500" />
                ) : (
                    <Sun className="h-10 w-10 text-gray-500" />
                )}
            </div>
        </button>
    )
}
