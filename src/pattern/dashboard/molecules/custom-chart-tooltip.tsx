interface TooltipPayload {
    name: string;
    value: number;
    color: string;
    payload: {
        label: string;
        male: number;
        female: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
}

export const CustomChartTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white font-poppins p-2 border border-gray-200 rounded shadow">
                <p className="text-sm font-medium">{payload[0].payload.label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-xs capitalize">
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};