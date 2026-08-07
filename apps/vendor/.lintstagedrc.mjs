/**
 * Lint-Staged Configuration — vendor app
 *
 * lint-staged runs this from apps/vendor, which is where eslint.config.mjs
 * lives — running eslint from the repo root would fail to resolve it.
 *
 * Every task goes through `chunked()` so a wide commit can't overflow the
 * Windows command-line limit; see scripts/lint-staged-chunk.mjs.
 */

import { chunked } from '../../scripts/lint-staged-chunk.mjs';

// --no-warn-ignored: staging a file that lives in an ignored path (a generated
// bundle, anything under .next) would otherwise print a confusing "File
// ignored" warning in the middle of a commit.
const ESLINT =
  'eslint --fix --no-warn-ignored --cache --cache-location node_modules/.cache/eslint/';

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx}': (files) => [
    ...chunked(ESLINT, files),
    ...chunked('prettier --write', files),
  ],
  '*.{css,scss}': (files) => chunked('prettier --write', files),
};

export default lintStagedConfig;
