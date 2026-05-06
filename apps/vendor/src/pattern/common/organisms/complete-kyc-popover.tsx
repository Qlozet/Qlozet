import React, { FC } from 'react'
import Image from 'next/image'
import handIcon from '@/public/assets/svg/hand-tone.svg';
import { X } from 'lucide-react';

interface ICompleteKycPopoverProps {
    setShowKycPopUp: (show: boolean) => void;
}

const CompleteKycPopover: FC<ICompleteKycPopoverProps> = ({ setShowKycPopUp }) => {
    return (
        <div
            className='fixed bottom-4 left-4 z-[10000] bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-lg max-w-sm'
            role='alert'
            aria-live='polite'
        >
            <div className='flex items-start gap-3'>
                <button
                    className='flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'
                    aria-label='KYC notification icon'
                >
                    <Image
                        src={handIcon}
                        alt='Hand wave'
                        width={16}
                        height={16}
                        className='object-contain'
                    />
                </button>

                <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-gray-900 text-sm mb-1'>
                        Almost done!
                    </h4>
                    <p className='text-xs text-gray-600 leading-relaxed'>
                        Complete KYC registration of your business profile to start
                        work.
                    </p>
                </div>

                <button
                    className='flex-shrink-0 w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center hover:bg-orange-200 transition-colors'
                    onClick={() => setShowKycPopUp(false)}
                    aria-label='Close KYC notification'
                >
                    <X size={12} className='text-gray-500' />
                </button>
            </div>
        </div>
    )
}

export default CompleteKycPopover