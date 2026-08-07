import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../metric-card';

const icon = <svg data-testid="icon" />;

describe('MetricCard', () => {
  it('renders the title, value and icon', () => {
    render(<MetricCard title="Total Vendors" value="1,200" icon={icon} />);
    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders a rising change in green with an up arrow', () => {
    const { container } = render(
      <MetricCard title="Orders" value="10" change="+2.5%" icon={icon} />
    );
    const change = screen.getByText('+2.5%').parentElement!;
    expect(change.className).toContain('text-green-600');
    expect(container.querySelector('.lucide-arrow-up')).toBeInTheDocument();
  });

  it('renders a falling change in red with a down arrow', () => {
    const { container } = render(
      <MetricCard title="Orders" value="10" change="-2.5%" icon={icon} />
    );
    const change = screen.getByText('-2.5%').parentElement!;
    expect(change.className).toContain('text-destructive');
    expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument();
  });

  // Omitting `change` must leave the row empty rather than printing a
  // placeholder that reads as a real (negative) delta.
  it('renders no change indicator when none is given', () => {
    const { container } = render(
      <MetricCard title="Orders" value="10" icon={icon} />
    );
    expect(container.querySelector('.lucide-arrow-up')).not.toBeInTheDocument();
    expect(
      container.querySelector('.lucide-arrow-down')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('renders the sub-label only when provided', () => {
    const { rerender } = render(
      <MetricCard title="Orders" value="10" subLabel="Today" icon={icon} />
    );
    expect(screen.getByText('Today')).toBeInTheDocument();

    rerender(<MetricCard title="Orders" value="10" icon={icon} />);
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('renders a View All link only when a target is given', () => {
    const { rerender } = render(
      <MetricCard title="Orders" value="10" viewAllLink="/orders" icon={icon} />
    );
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute(
      'href',
      '/orders'
    );

    rerender(<MetricCard title="Orders" value="10" icon={icon} />);
    expect(
      screen.queryByRole('link', { name: /view all/i })
    ).not.toBeInTheDocument();
  });

  it('renders an honest dash value without pretending it is a number', () => {
    render(<MetricCard title="Gross Sales" value="—" icon={icon} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
