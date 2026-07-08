"use client";

import Loader from '@/components/Loader';
import React, { FC, ReactNode, Suspense } from 'react'

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return (
        <>
            <Suspense fallback={<Loader />}>
                <div className='bg-accent dark:bg-background w-full min-w-0'>
                    {children}
                </div>
            </Suspense>
        </>
    )
}

export default AuthLayout