import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Ported from the vendor app so both dashboards share one loading shape.
export const ChartSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="mb-2 h-6 w-40 rounded bg-gray-300" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="h-64 rounded bg-gray-200" />
      </CardContent>
    </Card>
  );
};
