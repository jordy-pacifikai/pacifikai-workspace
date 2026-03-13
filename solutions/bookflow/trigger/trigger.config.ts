import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_fsojxjgkghmjundzloso",
  runtime: "node",
  logLevel: "log",
  maxDuration: 180,
  dirs: ["./src"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
    },
  },
});
