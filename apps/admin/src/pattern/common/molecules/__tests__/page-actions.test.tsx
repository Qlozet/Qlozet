import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PageActions } from '../page-actions';

/**
 * Two full-width buttons beside a page title do not fit a phone — on the
 * Administrators page they pushed the heading off one edge and the second
 * button off the other. Below `lg` they collapse behind one trigger.
 */
const setup = () => {
  const manageRoles = vi.fn();
  const addAdmin = vi.fn();

  render(
    <PageActions
      label="Administrator actions"
      actions={[
        {
          label: 'Manage Roles',
          icon: <svg data-testid="key-icon" />,
          variant: 'outline',
          onSelect: manageRoles,
        },
        { label: 'Add Admin', onSelect: addAdmin },
      ]}
    />
  );

  return { manageRoles, addAdmin };
};

describe('PageActions', () => {
  it('renders the actions inline for wide screens', () => {
    setup();

    // Rendered, and hidden below lg by the class rather than by unmounting —
    // the two layouts must not disagree about what the actions are.
    expect(
      screen.getByRole('button', { name: 'Manage Roles' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Admin' })
    ).toBeInTheDocument();
  });

  it('collapses behind one trigger, stacking the actions in a popover', async () => {
    const user = userEvent.setup();
    const { addAdmin } = setup();

    await user.click(
      screen.getByRole('button', { name: 'Administrator actions' })
    );

    const menu = screen.getByRole('dialog', { name: 'Administrator actions' });
    const items = within(menu).getAllByRole('button');
    expect(items.map((item) => item.textContent)).toEqual([
      'Manage Roles',
      'Add Admin',
    ]);

    // Labels only in the menu: the icons distinguish buttons sitting side by
    // side, which these no longer are.
    expect(within(menu).queryByTestId('key-icon')).toBeNull();

    await user.click(items[1]);
    expect(addAdmin).toHaveBeenCalledTimes(1);
  });

  it('closes the popover once an action is taken', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(
      screen.getByRole('button', { name: 'Administrator actions' })
    );
    const menu = screen.getByRole('dialog', { name: 'Administrator actions' });
    await user.click(within(menu).getByText('Manage Roles'));

    // Left open, it would sit over whatever the action navigated to.
    expect(
      screen.queryByRole('dialog', { name: 'Administrator actions' })
    ).toBeNull();
  });
});
