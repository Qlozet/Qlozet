/**
 * Lint-Staged Configuration — repo root
 *
 * ESLint lives inside each app (apps/admin, apps/vendor) and its flat config
 * only resolves when eslint runs from that app's directory. So each app carries
 * its own .lintstagedrc.mjs; lint-staged picks the closest config to each
 * staged file and runs it with that directory as the cwd.
 *
 * This root config therefore only covers files OUTSIDE the apps — build config,
 * workspace manifests and docs. Nothing here reformats app source; see the
 * per-app configs for why.
 */

const lintStagedConfig = {
  '*.{css,scss}': ['prettier --write'],
};

export default lintStagedConfig;
