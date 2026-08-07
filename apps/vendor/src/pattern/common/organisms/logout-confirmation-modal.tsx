'use client';

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { QuestionMarkIcon } from '../atoms/question-mark-icon';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { clearToken } from '@/lib/utils';

const LogoutConfirmationModal = create(() => {
  const { resolve, remove, visible } = useModal();

  const router = useRouter();

  const handleCloseModal = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleLogoutClick = () => {
    clearToken();
    handleCloseModal();
    router.push(AUTH_ROUTES.signIn);
  };
  return (
    <Dialog open={visible} onOpenChange={handleCloseModal}>
      <DialogContent className="w-[calc(100%-32px)] sm:w-full lg:w-[35%] min-h-95.75 h-fit flex flex-col justify-center items-center pt-10.5 px-8.25 overflow-y-auto rounded-[12px] bg-card">
        <QuestionMarkIcon />

        <div className="w-full flex flex-col items-center gap-y-6 mt-9.5">
          {/* The visible heading is the dialog's accessible name —
                        Radix warns if DialogContent has no DialogTitle. */}
          <DialogTitle className="text-black dark:text-foreground text-lg text-center font-bold font-poppins">
            Are you sure you want to logout?
          </DialogTitle>
          <Button
            onClick={handleLogoutClick}
            variant="destructive"
            size="lg"
            className="w-full max-w-81.75"
          >
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default LogoutConfirmationModal;
