// Re-export environment variables for easy access
export { env as clientEnv } from './client';
export { env as serverEnv } from './server';

// Combined type-safe environment access
import { env as client } from './client';
import { env as server } from './server';

export const env = {
  ...client,
  ...server,
} as const;

export default env;
