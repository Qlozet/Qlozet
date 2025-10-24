"use client"

import React from 'react'
import LogoutIcon from '../atoms/nav-icons/logout-icon'

const LogoutBtn = () => {
    return (
        <>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <LogoutIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
            </button>
        </>
    )
}

export default LogoutBtn