"use client";

import React from 'react'
import { create, useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuestionMarkIcon } from '../atoms/question-mark-icon';

interface IDeleteConfirmationModalprops {
    title: string;
    description?: string
    actionText?: string
}

export const DeleteProductConfirmationModal = create(({ title, description }: IDeleteConfirmationModalprops) => {
    const { resolve, remove, visible } = useModal();

    const handleCloseModal = () => {
        remove();
    };

    const handleDelete = () => {
        resolve({ resolved: true });
    }
    return (
        <Dialog open={visible} onOpenChange={handleCloseModal}>
            <DialogContent className="w-full lg:w-[35%] min-h-[383px] h-fit flex flex-col justify-center items-center py-[42px] px-[33px] overflow-y-auto rounded-[12px]">
                <QuestionMarkIcon />

                <div className='w-full flex flex-col items-center gap-y-[24px] mt-[38px]'>
                    <div className='w-full space-y-[14px]'>
                        <h1 className='text-foreground text-lg text-center font-bold font-poppins'>
                            {title}
                        </h1>
                        {description ? <p className='text-foreground text-xs font-normal'>{description}</p> : ""}
                    </div>
                    <Button variant="destructive" size="lg" onClick={handleDelete} className='w-full max-w-[327px]'>Logout</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
});