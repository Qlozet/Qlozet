# Testing & Git Hooks

Both apps run [Vitest](https://vitest.dev) with React Testing Library and jsdom.
The setup mirrors the arrangement used on `bitnob-hedge-ui`.

## Running tests

```bash
pnpm test          # watch mode, both apps (turbo)
pnpm test:run      # single run, both apps — this is what CI should call
pnpm test:vendor   # watch mode, vendor only
pnpm test:admin    # watch mode, admin only

# From inside an app:
pnpm --filter vendor test:run
pnpm --filter vendor exec vitest run src/pattern/orders   # one directory
pnpm --filter vendor exec vitest -t "bespoke"             # one test by name
```

## Layout

Tests live in a `__tests__/` folder next to the code they cover, named
`<subject>.test.ts(x)`. Only `src/**` is collected — `node_modules` and `.next`
are excluded.

```
src/pattern/orders/lib/order-fields.ts
src/pattern/orders/lib/__tests__/order-fields.test.ts
```

Per app there is a `vitest.config.ts` (jsdom, `@/…` aliases via
`vite-tsconfig-paths`, public env vars stubbed) and a `vitest.setup.ts`.

## What the setup file handles

`vitest.setup.ts` papers over the gaps between jsdom and the browser so tests
fail on their assertions rather than on the environment:

- `next/image` is mocked to a plain `<img>`, so `src` in the DOM is the original
  URL instead of a `/_next/image?url=…` string.
- `hasPointerCapture` / `setPointerCapture` / `scrollIntoView` — Radix
  primitives (Dialog, Sheet, Select, Dropdown) call these on open.
- `ResizeObserver` — Recharts' `ResponsiveContainer` measures itself on mount.
- `matchMedia` — `next-themes` and the responsive hooks read it on mount.

## What to test

In rough priority order:

1. **Pure helpers** — field readers, formatters, badge maps, filters, metrics.
   These are where the API's loose shapes get normalised, so they carry most of
   the regression risk for the least test cost. See
   `apps/admin/src/lib/__tests__/orders.test.ts`.
2. **Validation schemas** — every form rule is enforced only on the client.
3. **Components with real behaviour** — drawers, modals, tables. Mock the
   RTK Query hooks and the redux store; let the pure helpers run for real. See
   `apps/vendor/src/pattern/orders/organisms/__tests__/order-details-drawer.test.tsx`.

When fixing a regression, add the test that would have caught it and say so in a
comment — several tests here carry a `// Regression:` note explaining the bug
they pin down.

### Testing components that use nice-modal-react

```tsx
render(<NiceModal.Provider><div /></NiceModal.Provider>);
await act(async () => {
  NiceModal.show(OrderDetailsDrawer, { order });
});
```

Two things to know about Radix modals in jsdom:

- Anything rendered **outside** `SheetContent`/`DialogContent` (e.g. the order
  media panel) gets `aria-hidden` from Radix, so `getByRole` needs
  `{ hidden: true }`.
- Radix puts `pointer-events: none` on `<body>`; elements that opt back in with
  a Tailwind class still look blocked to jsdom, which has no CSS. Use
  `fireEvent.click` for those rather than `userEvent`.

## Git hooks (Husky)

Installed via the root `prepare` script, so a plain `pnpm install` sets them up.

| Hook         | Runs                                                        |
| ------------ | ----------------------------------------------------------- |
| `pre-commit` | `lint-staged` — `eslint --fix` on staged files              |
| `pre-push`   | every test affected by the branch, vs `origin/main`          |

`pre-push` diffs against the **base branch**, not `HEAD`. `vitest --changed`
with no ref only looks at uncommitted files, so a test broken by an earlier
commit on the branch would never re-run and would reach CI unnoticed.

To skip a hook in an emergency: `git commit --no-verify` / `git push --no-verify`.

### lint-staged and the monorepo

ESLint's flat config only resolves when eslint runs from the app directory, so
each app carries its own `.lintstagedrc.mjs`. lint-staged picks the closest
config to each staged file and runs it with that directory as the cwd.

### Two things deliberately left out

- **`prettier --write` on ts/tsx.** This codebase has never been
  Prettier-formatted and the two apps disagree on JSX quote style, so formatting
  on commit rewrites whole files that a change merely touched. Normalise once
  with `pnpm format` in a dedicated commit, then add `'prettier --write'` to the
  per-app lint-staged arrays.
- **`type-check` and `lint` in `pre-push`.** Both fail today on pre-existing
  issues: legacy components under `apps/vendor/src/components/**` don't compile,
  and there are ~415 lint warnings (mostly React Compiler rules that had never
  actually run — see below). The lines are in `.husky/pre-push`, commented, ready
  to enable once those are cleared.

### Note on the ESLint config

`pnpm lint` was silently broken before this setup: `next lint` was removed in
Next 16, and the `FlatCompat` bridge in each app's `eslint.config.mjs` crashed
on load. Both apps now spread `eslint-config-next`'s flat config directly.

That switch surfaced ~80 errors from React Compiler rules that had never run
(`react-hooks/set-state-in-effect` and friends). They're set to `warn` for now,
with a comment in each config saying to promote them back to `error` once the
backlog is cleared.
