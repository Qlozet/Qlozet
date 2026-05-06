interface CustomXAxisTickPayload {
    value: string;
}

interface CustomXAxisTickProps {
    x?: number;
    y?: number;
    payload?: CustomXAxisTickPayload;
}

export const CustomXAxisTick = ({ x = 0, y = 0, payload }: CustomXAxisTickProps) => {
    if (!payload) return null;
    return (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="hanging" fontSize={10} fill="#00">
            {payload.value}
        </text>
    );
};