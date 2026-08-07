/**
 * Lint-Staged Configuration — repo root
 *
 * ESLint lives inside each app (apps/admin, apps/vendor) and its flat config
 * only resolves when eslint runs from that app's directory. So each app carries
 * its own .lintstagedrc.mjs; lint-staged picks the closest config to each
 * staged file and runs it with that directory as the cwd.
 *
 * This root config therefore only covers files OUTSIDE the apps — build config,
 * scripts and stylesheets.
 */

import { chunked } from './scripts/lint-staged-chunk.mjs';

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx,mjs,cjs}': (files) => chunked('prettier --write', files),
  '*.{css,scss}': (files) => chunked('prettier --write', files),
};

export default lintStagedConfig;
