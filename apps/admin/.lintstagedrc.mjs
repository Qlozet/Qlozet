/**
 * Lint-Staged Configuration — admin app
 *
 * lint-staged runs this from apps/admin, which is where eslint.config.mjs
 * lives — running eslint from the repo root would fail to resolve it.
 *
 * Every task goes through `chunked()` so a wide commit can't overflow the
 * Windows command-line limit; see scripts/lint-staged-chunk.mjs.
 */

import { chunked } from '../../scripts/lint-staged-chunk.mjs';

const ESLINT =
  'eslint --fix --cache --cache-location node_modules/.cache/eslint/';

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx}': (files) => [
    ...chunked(ESLINT, files),
    ...chunked('prettier --write', files),
  ],
  '*.{css,scss}': (files) => chunked('prettier --write', files),
};

export default lintStagedConfig;
