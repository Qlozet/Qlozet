import { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import handIcon from '@/public/assets/svg/hand-tone.svg';
import { X, ChevronRight } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';

interface ICompleteKycPopoverProps {
    /** Dismiss the popover (snoozes it — see the layout). */
    onDismiss: () => void;
}

const CompleteKycPopover: FC<ICompleteKycPopoverProps> = ({ onDismiss }) => {
    return (
        <div
            className='fixed bottom-4 left-4 z-[10000] bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-lg max-w-sm'
            role='alert'
            aria-live='polite'
        >
            <div className='flex items-start gap-3'>
                <span
                    className='flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'
                    aria-hidden='true'
                >
                    <Image
                        src={handIcon}
                        alt=''
                        width={16}
                        height={16}
                        className='object-contain'
                    />
                </span>

                <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-gray-900 text-sm mb-1'>
                        Almost done!
                    </h4>
                    <p className='text-xs text-gray-600 leading-relaxed'>
                        Complete KYC registration of your business profile to start
                        work.
                    </p>
                    <Link
                        href={APP_ROUTES.settings}
                        onClick={() => onDismiss()}
                        className='mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-orange-700 hover:text-orange-800 transition-colors'
                    >
                        Complete now
                        <ChevronRight size={13} />
                    </Link>
                </div>

                <button
                    className='flex-shrink-0 w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center hover:bg-orange-200 transition-colors'
                    onClick={() => onDismiss()}
                    aria-label='Dismiss KYC reminder'
                >
                    <X size={12} className='text-gray-500' />
                </button>
            </div>
        </div>
    )
}

export default CompleteKycPopover
