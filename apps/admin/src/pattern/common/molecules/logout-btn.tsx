"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import LogoutIcon from '../atoms/nav-icons/logout-icon'
import { AUTH_ROUTES } from '@/lib/routes'

const LogoutBtn = () => {
    const router = useRouter()

    const handleLogout = () => {
        // Clear any locally persisted admin session data, then return to sign in.
        if (typeof window !== 'undefined') {
            localStorage.removeItem('AltireuserDetails')
        }
        router.push(AUTH_ROUTES.signIn)
    }

    return (
        <>
            <button className="w-fit 2xl:w-full flex items-center gap-3 2xl:px-4 py-3 text-gray-700 hover:text-destructive rounded-lg cursor-pointer transition-colors" onClick={handleLogout}>
                <LogoutIcon className="w-[25.25] h-[24px] 2xl:w-5 2xl:h-5" />
                <span className="invisible hidden 2xl:visible 2xl:inline-block text-sm font-normal">Logout</span>
            </button>
        </>
    )
}

export default LogoutBtn
