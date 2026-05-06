"use client"

import { Clock } from "lucide-react"
import BrandLogo from "../molecules/brand-logo"
import { DotLoader } from "react-spinners";

interface LoadingWidgetProps {
    message?: string
    subMessage?: string
    showLogo?: boolean
}

const LoadingWidget = ({
    message = "Loading...",
    subMessage = "Please wait while we prepare everything for you.",
    showLogo = true,
}: LoadingWidgetProps) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 md:!py-12">
            {showLogo && (
                <div className="mb-6 md:mb-8">
                    <BrandLogo />
                </div>
            )}

            <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:!p-6 md:!p-10 rounded-lg md:!rounded-[8px] relative overflow-hidden">
                <div className="w-full max-w-2xl text-center relative z-10">
                    {/* Animated loading illustration */}
                    <div className="mb-6 md:!mb-8 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 sm:!w-24 sm:!h-24 md:!w-32 md:!h-32 rounded-full flex items-center justify-center">
                                <DotLoader color="#9C857870" className="w-8 h-8 sm:!w-12 sm:!h-12 md:!w-16 md:!h-16 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Main message */}
                    <div className="mb-6 md:mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:!text-3xl md:!text-4xl lg:!text-5xl font-bold text-brown3 mb-3 md:!mb-4 px-2">
                            {message}
                        </h1>
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto px-4">{subMessage}</p>
                    </div>

                    {/* Loading progress indicator */}
                    <div className="flex flex-col items-center gap-4 mb-6 md:!mb-8 px-4">
                        <div className="w-full max-w-xs bg-brown1 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[#3E1C01]/50 rounded-full animate-pulse bg-gradient-to-r from-[#3E1C01]/50 to-[#3E1C01]/20"></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>This usually takes just a moment</span>
                        </div>
                    </div>

                    {/* Helpful message */}
                    <div className="border-t border-slate-200 pt-6 md:!pt-8 px-4">
                        <p className="text-sm text-slate-500">Thank you for your patience while we get things ready.</p>
                    </div>
                </div>

                {/* Decorative elements - hidden on mobile for better performance */}
                <div className="hidden md:!block absolute top-10 left-10 w-20 h-20 bg-stone-600/30 rounded-full blur-xl animate-pulse"></div>
                <div className="hidden md:!block absolute bottom-10 right-10 w-32 h-32 bg-stone-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="hidden md:!block absolute top-1/2 left-1/4 w-16 h-16 bg-stone-600/20 rounded-full blur-lg animate-pulse delay-500"></div>
            </div>
        </div>
    )
}

export { LoadingWidget }