import {
  external_exports
} from "./chunk-ZBYIOW2V.mjs";
import {
  __name,
  init_esm
} from "./chunk-VMIWEUEA.mjs";

// src/lib/config.ts
init_esm();
var BusinessConfigSchema = external_exports.object({
  businessId: external_exports.string().uuid(),
  businessName: external_exports.string(),
  services: external_exports.array(external_exports.string()),
  // format: "nom|duree_min|prix_xpf"
  openingHours: external_exports.record(external_exports.string()),
  // { mon: "08:00-17:00", ... }
  timezone: external_exports.string().default("Pacific/Tahiti"),
  humanPhone: external_exports.string(),
  // WhatsApp provider
  provider: external_exports.enum(["twilio", "meta"]).default("twilio"),
  // Twilio
  twilioSid: external_exports.string().optional(),
  twilioToken: external_exports.string().optional(),
  twilioFrom: external_exports.string().optional(),
  // Meta Cloud API
  metaPhoneNumberId: external_exports.string().optional(),
  metaAccessToken: external_exports.string().optional(),
  // Business config (tone, language, greeting, etc.)
  chatbotConfig: external_exports.record(external_exports.unknown()).default({})
});
function parseService(raw) {
  const [name, durationStr, priceStr] = raw.split("|");
  return {
    name: name ?? "Service",
    duration: parseInt(durationStr ?? "30", 10),
    price: parseInt(priceStr ?? "0", 10),
    raw
  };
}
__name(parseService, "parseService");
function parseAllServices(services) {
  return services.map(parseService);
}
__name(parseAllServices, "parseAllServices");

export {
  BusinessConfigSchema,
  parseService,
  parseAllServices
};
//# sourceMappingURL=chunk-U33HWRQN.mjs.map
