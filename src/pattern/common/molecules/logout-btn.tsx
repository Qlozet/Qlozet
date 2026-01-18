"use client"

import React from 'react'
import LogoutIcon from '../atoms/nav-icons/logout-icon'
import { show } from '@ebay/nice-modal-react'
import LogoutConfirmationModal from '../organisms/logout-confirmation-modal'

const LogoutBtn = () => {
    const handleLogout = () => {
        show(LogoutConfirmationModal)
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