
import type { ReactNode } from 'react';

interface CustomChartLegendEntry {
    value: string | number | ReactNode;
    [key: string]: any;
}

interface CustomChartLegendProps {
    payload: CustomChartLegendEntry[];
}

export const CustomChartLegend = (props: CustomChartLegendProps) => {
    const { payload } = props;

    return (
        <ul className='flex items-center gap-x-8'>
            {
                payload.map((entry, index) => (
                    <li key={`item-${index}`} className='text-black'>{entry.value}</li>
                ))
            }
        </ul>
    );
}