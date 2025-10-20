import Logo from '@/components/Logo'
import React from 'react'

const AwaitingVerificationTemplate = () => {
    return (
        <>
            <main className="bg-inherit w-full min-h-screen flex flex-col items-center justify-center p-4">
                {/* Logo */}
                <div className="mb-12">
                    <Logo />
                </div>

                {/* Success Card */}
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm">
                    {/* Heading */}
                    <h2 className="text-xl md:text-2xl font-medium font-poppins text-slate-900 text-center px-4 pt-4 pb-3 md:px-8 md:pt-8 md:">Account created successfully</h2>

                    {/* Divider */}
                    <div className="h-px bg-accent mb-8"></div>

                    {/* Message */}
                    <p className="text-center text-slate-700 text-base leading-relaxed px-3 pb-3 md:px-8 md:pb-8">
                        Your Qlozet account has been successfully set up, and we've received your information. Our team will
                        thoroughly review the details and documents provided. Your account verification status will be communicated to
                        you via the email you provided within the next 48 hours.
                    </p>
                </div>
            </main>
        </>
    )
}

export default AwaitingVerificationTemplate