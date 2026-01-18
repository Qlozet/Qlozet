"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import BrandLogo from "../molecules/brand-logo"

interface NotFoundWidgetProps {
    showLogo?: boolean
}

const NotFoundWidget = ({ showLogo = true }: NotFoundWidgetProps) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-12 bg-background">
            {showLogo && (
                <div className="mb-6 md:mb-8">
                    <BrandLogo height="100" width="100" />
                </div>
            )}

            <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-10 rounded-lg md:rounded-2xl relative overflow-hidden">
                <div className="w-full max-w-2xl text-center relative z-10">
                    {/* 404 Illustration */}
                    <div className="mb-6 md:mb-8 relative">
                        <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-muted-foreground/20 mb-4">404</div>
                    </div>

                    {/* Main message */}
                    <div className="mb-6 md:mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 md:mb-4 px-2">
                            Page Not Found
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto px-4">
                            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 md:mb-8 px-4">
                        <Link href="/">
                            <Button variant="outline" className="w-full sm:w-auto gap-2">
                                <Home className="w-4 h-4" />
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto gap-2 bg-transparent"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    </div>

                    {/* Helpful message */}
                    <div className="border-t border-border pt-6 md:pt-8 px-4">
                        <p className="text-sm text-muted-foreground">
                            If you believe this is a mistake, please contact our support team.
                        </p>
                    </div>
                </div>

                {/* Decorative elements - hidden on mobile for better performance */}
                <div className="hidden md:block absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
                <div
                    className="hidden md:block absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="hidden md:block absolute top-1/2 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                ></div>
            </div>
        </div>
    )
}

export { NotFoundWidget }
