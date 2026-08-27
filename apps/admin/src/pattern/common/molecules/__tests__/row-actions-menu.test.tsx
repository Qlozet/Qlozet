import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye, Trash2 } from 'lucide-react';
import { RowActionsMenu } from '../row-actions-menu';

const open = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Customer actions' }));
  return user;
};

describe('RowActionsMenu', () => {
  it('hides its actions behind one trigger', async () => {
    const onSelect = vi.fn();
    render(
      <RowActionsMenu
        title="Customer actions"
        actions={[{ label: 'View details', icon: <Eye />, onSelect }]}
      />
    );

    // Nothing is visible until the menu is opened — the column stays a fixed
    // width however many actions a row has.
    expect(screen.queryByText('View details')).not.toBeInTheDocument();

    await open();
    expect(
      screen.getByRole('menuitem', { name: 'View details' })
    ).toBeInTheDocument();
  });

  it('runs the selected action', async () => {
    const onSelect = vi.fn();
    render(
      <RowActionsMenu
        title="Customer actions"
        actions={[{ label: 'View details', icon: <Eye />, onSelect }]}
      />
    );

    const user = await open();
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('groups destructive actions last, behind a separator', async () => {
    // So a mis-click on the common action cannot land on the dangerous one.
    render(
      <RowActionsMenu
        title="Customer actions"
        actions={[
          {
            label: 'Delete',
            icon: <Trash2 />,
            onSelect: vi.fn(),
            destructive: true,
          },
          { label: 'View details', icon: <Eye />, onSelect: vi.fn() },
        ]}
      />
    );

    await open();
    const items = screen.getAllByRole('menuitem').map((el) => el.textContent);
    expect(items).toEqual(['View details', 'Delete']);
  });

  it('disables an action rather than hiding it', async () => {
    // A menu that changes shape row to row is harder to use than one with a
    // greyed-out item.
    render(
      <RowActionsMenu
        title="Customer actions"
        actions={[
          {
            label: 'Copy email',
            icon: <Eye />,
            onSelect: vi.fn(),
            disabled: true,
          },
        ]}
      />
    );

    await open();
    expect(
      screen.getByRole('menuitem', { name: 'Copy email' })
    ).toHaveAttribute('data-disabled');
  });

  it('does not trigger the row underneath when opened', async () => {
    // Rows are often clickable; opening the menu must not also navigate.
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <RowActionsMenu
          title="Customer actions"
          actions={[
            { label: 'View details', icon: <Eye />, onSelect: vi.fn() },
          ]}
        />
      </div>
    );

    await open();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('names the trigger for screen readers', async () => {
    render(
      <RowActionsMenu
        title="Customer actions"
        triggerLabel="Actions for Ada Obi"
        actions={[{ label: 'View details', icon: <Eye />, onSelect: vi.fn() }]}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Actions for Ada Obi' })
    ).toBeInTheDocument();
  });
});
