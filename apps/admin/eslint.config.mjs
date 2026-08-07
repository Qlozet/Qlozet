// eslint-config-next ships a flat config in Next 16, so it's spread directly.
// The previous FlatCompat/eslintrc bridge crashed on load ("Converting circular
// structure to JSON"), which meant `pnpm lint` never actually linted anything.
import nextConfig from 'eslint-config-next';

const eslintConfig = [
  {
    // node_modules is already in ESLint 9's default ignores; it's repeated here
    // so this list reads as the complete picture of what is skipped.
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      'next-env.d.ts',
    ],
  },
  ...nextConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // React Compiler rules, newly surfaced by the config fix above — they had
      // never actually run against this codebase. They flag real issues worth
      // fixing, but as warnings so the existing backlog doesn't block every
      // commit. Promote them back to 'error' once the count reaches zero.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
];

export default eslintConfig;
