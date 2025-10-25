import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const RecentOrdersSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <CardTitle>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
