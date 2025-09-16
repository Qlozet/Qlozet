'use client'

import { ReactNode } from 'react'
import {
    persistor,
    store
} from './store'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { Toaster as HotToaster } from "react-hot-toast";
import NiceModal from '@ebay/nice-modal-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PersistGate } from 'redux-persist/integration/react'

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Provider store={store}>
                <Toaster position='top-center' richColors />
                <HotToaster
                    position="top-right"
                    toastOptions={{
                        duration: 5000,
                        style: {
                            padding: "0",
                            borderRadius: "8px",
                            margin: "8px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            background: "transparent",
                        },
                        success: {
                            iconTheme: {
                                primary: "#10b981",
                                secondary: "#ffffff",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#ef4444",
                                secondary: "#ffffff",
                            },
                        },
                    }}
                />
                <NiceModal.Provider>
                    <PersistGate persistor={persistor}>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                    </PersistGate>
                </NiceModal.Provider>
            </Provider>
        </>
    )
}
