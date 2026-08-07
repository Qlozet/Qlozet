/**
 * Lint-Staged Configuration — admin app
 *
 * lint-staged runs this from apps/admin, which is where eslint.config.mjs
 * lives — running eslint from the repo root would fail to resolve it.
 *
 * Deliberately NOT running `prettier --write` on ts/tsx. This codebase has
 * never been Prettier-formatted, and the two apps don't even agree on JSX quote
 * style, so formatting on commit rewrites entire files that a change merely
 * touched — burying the real diff. Normalise the repo once with `pnpm format`
 * in a dedicated commit, then add `'prettier --write'` to the array below.
 */

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --cache --cache-location node_modules/.cache/eslint/',
  ],
  '*.{css,scss}': ['prettier --write'],
};

export default lintStagedConfig;
