import { defineConfig } from "@trigger.dev/sdk/v3";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { config } from "dotenv";
import { resolve } from "path";

export default defineConfig({
  project: "proj_fsojxjgkghmjundzloso",
  runtime: "node",
  logLevel: "log",
  maxDuration: 60,
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
  build: {
    extensions: [
      syncEnvVars(async () => {
        const result = config({ path: resolve(process.cwd(), ".env") });
        const vars = result.parsed ?? {};
        return Object.entries(vars).map(([name, value]) => ({
          name,
          value,
        }));
      }),
    ],
  },
});
