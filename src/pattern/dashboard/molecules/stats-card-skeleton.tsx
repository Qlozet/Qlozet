import { Card, CardContent } from "@/components/ui/card"

export const StatsCardSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                </div>
            </CardContent>
        </Card>
    )
}

export const StatsCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
            ))}
        </div>
    )
}
