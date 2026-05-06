"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
    password: string
}

interface StrengthCriteria {
    label: string
    met: boolean
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const [strength, setStrength] = useState(0)
    const [criteria, setCriteria] = useState<StrengthCriteria[]>([])

    useEffect(() => {
        const newCriteria: StrengthCriteria[] = [
            { label: "At least 8 characters", met: password?.length >= 8 },
            { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
            { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
            { label: "Contains number", met: /\d/.test(password) },
            { label: "Contains special character", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
        ]

        setCriteria(newCriteria)

        const metCount = newCriteria.filter((c) => c.met)?.length
        setStrength(metCount)
    }, [password])

    const getStrengthLabel = () => {
        if (strength === 0) return "No password"
        if (strength <= 1) return "Very weak"
        if (strength <= 2) return "Weak"
        if (strength <= 3) return "Fair"
        if (strength <= 4) return "Good"
        return "Strong"
    }

    const getStrengthColor = () => {
        if (strength === 0) return "bg-secondary"
        if (strength <= 1) return "bg-destructive"
        if (strength <= 2) return "bg-orange-500"
        if (strength <= 3) return "bg-yellow-500"
        if (strength <= 4) return "bg-blue-500"
        return "bg-green-500"
    }

    const strengthPercentage = (strength / 5) * 100

    return (
        <div className="mt-4 space-y-3">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Password strength</label>
                    <span className="text-xs font-medium text-foreground">{getStrengthLabel()}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                        className={`${getStrengthColor()} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${strengthPercentage}%` }}
                    />
                </div>
            </div>

            {password && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                    <div className="space-y-1">
                        {criteria?.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {item.met ? (
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                    <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span
                                    className={`text-xs ${item.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
