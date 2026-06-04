import { Card, CardContent } from "@/components/ui/card"

export const StatsCardSkeleton = () => {
    return (
        <Card className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow animate-pulse">
            <CardContent className="h-full p-0">
                <div className="flex items-start justify-start gap-x-4">
                    <div className="size-12 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                    <div className="flex-1 space-y-3">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export const StatsCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 })?.map((_, i) => (
                <StatsCardSkeleton key={i} />
            ))}
        </div>
    )
}
