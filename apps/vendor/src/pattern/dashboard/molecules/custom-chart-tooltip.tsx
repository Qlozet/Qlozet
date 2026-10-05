interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload: {
    label?: string;
    male?: number;
    female?: number;
    /** Donut slices may carry a formatted amount and a secondary figure. */
    valueLabel?: string;
    hint?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

export const CustomChartTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload?.length) {
    return (
      <div className="bg-white dark:bg-muted font-poppins p-2 border border-gray-200 dark:border-border rounded-xl shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {payload[0]?.payload?.label}
        </p>
        {payload?.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-xs capitalize"
          >
            {entry.name}: {entry.payload?.valueLabel ?? entry.value}
            {entry.payload?.hint ? ` · ${entry.payload.hint}` : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
