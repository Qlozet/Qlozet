import { Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { DarkModeIcon } from '../atoms/nav-icons/dark-mode-icon'

export const ThemeToggle = () => {
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
        <>
            <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg cursor-pointer transition-colors"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <DarkModeIcon className="w-5 h-5" />}
                <span className="text-sm font-normal">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
        </>
    )
}