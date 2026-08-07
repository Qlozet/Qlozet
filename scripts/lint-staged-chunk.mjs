/**
 * Batch a lint-staged command so it can't overflow the OS command-line limit.
 *
 * lint-staged interpolates every matched path into a single command string. On
 * Windows a binary like `eslint` resolves to `eslint.CMD`, which is launched
 * through cmd.exe — and cmd.exe caps a command line at 8191 characters. A wide
 * commit (a repo-wide format, a big rename) blows past that and the hook dies
 * with "The command line is too long" before linting anything.
 *
 * Returning several commands instead of one keeps each invocation under the
 * cap. lint-staged runs the commands for a glob in series, so tools that share
 * a cache file (eslint --cache) don't race each other.
 */

// Well under cmd.exe's 8191 so there's room for the resolved shim path and the
// wrapper cmd.exe adds around it.
const MAX_COMMAND_LENGTH = 5000;

/**
 * @param {string} command  e.g. "eslint --fix"
 * @param {string[]} files  absolute paths, as lint-staged supplies them
 * @returns {string[]} one or more full command strings
 */
export const chunked = (command, files) => {
  const batches = [];
  let current = [];
  let length = command.length;

  for (const file of files) {
    // +3 for the surrounding quotes and the separating space.
    const cost = file.length + 3;
    if (current.length > 0 && length + cost > MAX_COMMAND_LENGTH) {
      batches.push(current);
      current = [];
      length = command.length;
    }
    current.push(`"${file}"`);
    length += cost;
  }
  if (current.length > 0) batches.push(current);

  return batches.map((batch) => `${command} ${batch.join(' ')}`);
};
