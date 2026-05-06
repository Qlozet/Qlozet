interface CustomYAxisTickPayload {
    value: number;
}

interface CustomYAxisTickProps {
    x?: number;
    y?: number;
    payload?: CustomYAxisTickPayload;
}

export const CustomYAxisTick = ({ x = 0, y = 0, payload }: CustomYAxisTickProps) => {
    if (!payload) return null;
    const value = payload.value;
    if (value === 0) return <text x={x} y={y} textAnchor="end" fontSize={10} fill="#000">{value}</text>;
    return <text x={x} y={y} textAnchor="end" fontSize={10} fill="#000">{value / 1000}k</text>;
};