'use client';

import { ReactNode } from 'react';
import { store } from './store';
import { Provider } from 'react-redux';
import NiceModal from '@ebay/nice-modal-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Provider store={store}>
        <Toaster position='top-center' richColors duration={5000} />
        <NiceModal.Provider>
          {/* <PersistGate persistor={persistor}> */}
          <TooltipProvider>{children}</TooltipProvider>
          {/* </PersistGate> */}
        </NiceModal.Provider>
      </Provider>
    </>
  );
};
