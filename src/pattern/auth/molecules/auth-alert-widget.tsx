import React, { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'
import { If } from '@/pattern/common/atoms/If';
import { cn } from '@/lib/utils';

export interface AuthAlertWidgetProps {
    isError?: boolean;
    alertTitle?: string;
    alertDescription?: string;
    className?: string;
}

export const AuthAlertWidget: FC<AuthAlertWidgetProps> = ({ isError, alertTitle, alertDescription, className }) => {
    return (
        <>
            <Alert variant="destructive" className={cn('flex flex-row items-center justify-start gap-x-4 mb-6', className)}>
                <span>
                    <AlertTriangleIcon className='h-fit stroke-destructive' />
                </span>
                <div>
                    <If isTrue={!!alertTitle}>
                        <AlertTitle>{alertTitle}</AlertTitle>
                    </If>
                    <AlertDescription>
                        <p className='text-sm'>
                            {alertDescription ?? "Something went wrong."}
                        </p>
                    </AlertDescription>
                </div>
            </Alert>
        </>
    )
}