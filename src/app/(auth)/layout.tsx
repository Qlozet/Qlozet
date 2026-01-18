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
                <div className='bg-accent flex w-full min-h-screen items-center justify-center'>
                    {children}
                </div>
            </Suspense>
        </>
    )
}

export default AuthLayout