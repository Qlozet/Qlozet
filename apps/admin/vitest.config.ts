import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vitest config for component + unit tests.
// - jsdom gives React Testing Library a DOM to render into.
// - tsconfigPaths resolves the "@/..." aliases from tsconfig.json so tests
//   import modules exactly the way app code does.
// - Only our own src tests are picked up; node_modules is excluded so the
//   vendored *.test.ts files don't run.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    clearMocks: true,
    restoreMocks: true,
    // The app validates its public env at import time (src/env/client.ts), so
    // anything that pulls in an RTK Query slice would throw without these.
    env: {
      NEXT_PUBLIC_BASE_URL: 'http://localhost:4000/api',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
    },
    // userEvent-driven tests that open Radix portals (Dialog, Sheet, Select)
    // take a couple of seconds on their own and several more when the workers
    // are all busy, so the 5s default trips on a full run even though nothing
    // is actually stuck.
    testTimeout: 30000,
  },
});
