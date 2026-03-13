import {
  defineConfig
} from "../../../../../../../chunk-G5XPZL6L.mjs";
import "../../../../../../../chunk-LQDRVYE2.mjs";
import "../../../../../../../chunk-ALSC375A.mjs";
import {
  init_esm
} from "../../../../../../../chunk-DB4FHRYB.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
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
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 3e4
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
