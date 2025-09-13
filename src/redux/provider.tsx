'use client'

import { ReactNode } from 'react'
import {
  persistor,
  store
} from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'sonner'
import NiceModal from '@ebay/nice-modal-react'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Provider store={store}>
        <Toaster position='top-center' richColors />
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
