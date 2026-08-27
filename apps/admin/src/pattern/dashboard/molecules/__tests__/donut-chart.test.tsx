import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// recharts measures its container, which jsdom reports as 0x0 — <ResponsiveContainer>
// then renders nothing and no chart assertion would ever hold. Give it a size.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <actual.ResponsiveContainer width={600} height={300}>
        {children as never}
      </actual.ResponsiveContainer>
    ),
  };
});

import { DonutChart } from '../donut-chart';

const COLORS = ['#111', '#222', '#333', '#444'];

const DATA = [
  { name: 'T-Shirt', value: 12 },
  { name: 'Kaftan', value: 8 },
];

describe('DonutChart — right legend layout', () => {
  it('draws the slices and the real legend when there is data', () => {
    const { container } = render(
      <DonutChart
        title="Sales By Product Category"
        data={DATA}
        colors={COLORS}
        legendPosition="right"
      />
    );

    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Kaftan')).toBeInTheDocument();
    expect(screen.queryByText('No sales yet')).not.toBeInTheDocument();
    // The real chart, not the placeholder ring.
    expect(container.querySelector('.recharts-pie')).toBeInTheDocument();
  });

  it('keeps the ring and the legend on screen when there is nothing to plot', () => {
    // The blank card this replaces: an empty <Pie> and an empty <ul> left the
    // card showing its title and nothing else, which read as broken.
    const { container } = render(
      <DonutChart
        title="Sales By Product Category"
        data={[]}
        colors={COLORS}
        legendPosition="right"
      />
    );

    expect(screen.getByText('Sales By Product Category')).toBeInTheDocument();
    expect(screen.getByText('No sales yet')).toBeInTheDocument();

    // The donut outline is still drawn — as a plain SVG track, not a recharts
    // pie fed a synthetic slice (which would carry a tooltip reading "1").
    expect(container.querySelector('.recharts-pie')).not.toBeInTheDocument();
    expect(container.querySelector('svg circle')).toBeInTheDocument();

    // The legend keeps its four slots so nothing jumps when data lands.
    expect(container.querySelectorAll('li')).toHaveLength(4);
  });

  it('treats all-zero data as empty', () => {
    render(
      <DonutChart
        title="Sales By Product Category"
        data={[{ name: 'T-Shirt', value: 0 }]}
        colors={COLORS}
        legendPosition="right"
      />
    );
    expect(screen.getByText('No sales yet')).toBeInTheDocument();
    expect(screen.queryByText('T-Shirt')).not.toBeInTheDocument();
  });

  it('lets the caller word the empty line', () => {
    render(
      <DonutChart
        title="Sales By Product Type"
        data={[]}
        colors={COLORS}
        legendPosition="right"
        emptyMessage="No orders in this period"
      />
    );
    expect(screen.getByText('No orders in this period')).toBeInTheDocument();
  });
});
