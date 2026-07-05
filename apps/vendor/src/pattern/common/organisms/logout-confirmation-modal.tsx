"use client";

import React from 'react'
import { create, useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
            <DialogContent className="w-full lg:w-[35%] lg:ml-[130px] min-h-[383px] h-fit flex flex-col justify-center items-center py-[42px] px-[33px] overflow-y-auto rounded-[12px]">
                <QuestionMarkIcon />

                <div className='w-full flex flex-col items-center gap-y-[24px] mt-[38px]'>
                    <h1 className='text-black text-lg text-center font-bold font-poppins'>
                        Are you sure you want to logout?
                    </h1>
                    <Button onClick={handleLogoutClick} variant="destructive" size="lg" className='w-full max-w-[327px]'>Logout</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
});

export default LogoutConfirmationModal