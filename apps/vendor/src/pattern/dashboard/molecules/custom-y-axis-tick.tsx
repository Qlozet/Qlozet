interface CustomYAxisTickPayload {
    value: number;
}

interface CustomYAxisTickProps {
    x?: number;
    y?: number;
    payload?: CustomYAxisTickPayload;
}

function formatAxisValue(value: number): string {
    if (value === 0) return '0';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1_000_000) {
        const m = abs / 1_000_000;
        return sign + (Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, '')) + 'M';
    }
    if (abs >= 1_000) {
        const k = abs / 1_000;
        return sign + (Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, '')) + 'K';
    }
    return sign + String(abs);
}

export const CustomYAxisTick = ({ x = 0, y = 0, payload }: CustomYAxisTickProps) => {
    if (!payload) return null;
    return <text x={x} y={y} textAnchor="end" fontSize={10} fill="var(--foreground)">{formatAxisValue(payload.value)}</text>;
};