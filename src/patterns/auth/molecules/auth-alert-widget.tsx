import React, { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'
import { If } from '@/patterns/common/atoms/If';

export interface AuthAlertWidgetProps {
    isError?: boolean;
    alertTitle?: string;
    alertDescription?: string;
}

export const AuthAlertWidget: FC<AuthAlertWidgetProps> = ({ isError, alertTitle, alertDescription }) => {
    return (
        <>
            <Alert variant="destructive" className='flex flex-row items-center gap-x-4'>
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