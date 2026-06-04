"use client"

import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { Construction, X } from "lucide-react"

export const WorkInProgressModal = NiceModal.create(() => {
    const modal = useModal()

    if (!modal.visible) return null

    const handleClose = () => {
        modal.remove()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="wip-title"
                className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
            >
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
                >
                    <X className="size-4" />
                </button>

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Construction className="size-8 text-primary" />
                    </div>

                    <h2 id="wip-title" className="text-lg font-semibold text-foreground">
                        Work in Progress
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        This page is currently being built. Please check back soon.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
})
