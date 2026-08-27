import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// recharts measures its container, which jsdom reports as 0x0.
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

import { ProductsStats } from '../products-stats';

const base = {
  salesTitle: 'Sales By Product Category',
};

describe('ProductsStats', () => {
  it('renders both counts', () => {
    render(<ProductsStats {...base} totalProducts={10} archivedProducts={2} />);
    expect(screen.getByText('Total products')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    // The Figma labels this card "Achieved products"; the number it shows is
    // the archived count, so the caption says Archived.
    expect(screen.getByText('Archived products')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('badges the 30-day movement on each card', () => {
    const { container } = render(
      <ProductsStats
        {...base}
        totalProducts={10}
        archivedProducts={2}
        changes={{ total_products: 2.5, archived_products: -12 }}
      />
    );
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('-12%')).toBeInTheDocument();
    expect(container.querySelector('.lucide-arrow-up')).toBeInTheDocument();
    expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument();
  });

  it('shows no badge when the previous window had nothing to compare against', () => {
    // The API sends null there rather than 0 — "unknown", not "flat".
    const { container } = render(
      <ProductsStats
        {...base}
        totalProducts={10}
        archivedProducts={0}
        changes={{ total_products: null, archived_products: null }}
      />
    );
    expect(container.querySelector('.lucide-arrow-up')).not.toBeInTheDocument();
    expect(
      container.querySelector('.lucide-arrow-down')
    ).not.toBeInTheDocument();
  });

  it('shows skeletons while the stats query is in flight', () => {
    const { container } = render(<ProductsStats {...base} isLoading />);
    expect(screen.queryByText('Total products')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });
});
