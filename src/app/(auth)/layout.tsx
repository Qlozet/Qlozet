"use client";

import Loader from '@/components/Loader';
import React, { FC, ReactNode, Suspense } from 'react'

interface IProps {
    children: ReactNode;
}

const AuthLayout: FC<IProps> = ({ children }) => {
    return (
        <>
            <Suspense fallback={<Loader />}>
                <div className='bg-white flex min-h-screen items-center justify-center'>
                    {children}
                </div>
            </Suspense>
        </>
    )
}

export default AuthLayout