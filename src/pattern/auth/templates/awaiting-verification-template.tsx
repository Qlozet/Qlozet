import React from 'react';
import { AuthMessageCard } from '../molecules/auth-message-card';

const AwaitingVerificationTemplate = () => {
    return (
        <AuthMessageCard
            title='Account created successfully'
            description="Your Qlozet account has been successfully set up, and we've received your information. Our team will thoroughly review the details and documents provided. Your account verification status will be communicated to you via the email you provided within the next 48 hours."
        />
    );
};

export default AwaitingVerificationTemplate;