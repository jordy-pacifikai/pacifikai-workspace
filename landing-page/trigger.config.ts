import { defineConfig } from '@trigger.dev/sdk';

export default defineConfig({
  project: 'proj_oyhmfgvwsiyzhstkrcjj',
  dirs: ['./trigger'],
  runtime: 'node',
  maxDuration: 300,
  retries: {
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30_000,
      randomize: true,
    },
  },
});
