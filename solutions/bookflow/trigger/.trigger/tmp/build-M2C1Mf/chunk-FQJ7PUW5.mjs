import {
  __commonJS,
  __require,
  init_esm
} from "./chunk-DB4FHRYB.mjs";

// ../../../../../../../.npm/_npx/4329e48d85b72ec6/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/execAsync.js
var require_execAsync = __commonJS({
  "../../../../../../../.npm/_npx/4329e48d85b72ec6/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/execAsync.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execAsync = void 0;
    var child_process = __require("child_process");
    var util = __require("util");
    exports.execAsync = util.promisify(child_process.exec);
  }
});

export {
  require_execAsync
};
//# sourceMappingURL=chunk-FQJ7PUW5.mjs.map
