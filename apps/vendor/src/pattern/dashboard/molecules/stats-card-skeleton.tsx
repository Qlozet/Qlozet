import { Card, CardContent } from "@/components/ui/card"

export const StatsCardSkeleton = () => {
    return (
        <Card className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow animate-pulse">
            <CardContent className="h-full p-0">
                <div className="flex items-start justify-start gap-x-4">
                    <div className="shrink-0">
                        <div className="size-12 rounded-[10px] bg-gray-200 dark:bg-muted" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="space-y-2">
                            <div className="h-3.5 bg-gray-200 dark:bg-muted rounded w-24" />
                            <div className="h-7 bg-gray-200 dark:bg-muted rounded w-20" />
                        </div>
                        <div className="h-3.5 bg-gray-100 dark:bg-muted/50 rounded w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export const StatsCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 })?.map((_, i) => (
                <StatsCardSkeleton key={i} />
            ))}
        </div>
    )
}
