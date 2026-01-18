import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const ChartSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
            </CardHeader>
            <CardContent>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
        </Card>
    )
}
