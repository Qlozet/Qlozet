'use client';

import React from 'react';
import AwaitingVerificationTemplate from '@/patterns/auth/templates/awaiting-verification-template';

const Verification: React.FC = () => {
    return (
        <div className='w-full min-h-screen'>
            <AwaitingVerificationTemplate />
        </div>
    )
};

export default Verification;
