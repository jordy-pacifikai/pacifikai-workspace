import { z } from "zod";

export const BusinessConfigSchema = z.object({
  businessId: z.string().uuid(),
  businessName: z.string(),
  services: z.array(z.string()), // format: "nom|duree_min|prix_xpf"
  openingHours: z.record(z.string()), // { mon: "08:00-17:00", ... }
  timezone: z.string().default("Pacific/Tahiti"),
  humanPhone: z.string(),
  // WhatsApp provider
  provider: z.enum(["twilio", "meta"]).default("twilio"),
  // Twilio
  twilioSid: z.string().optional(),
  twilioToken: z.string().optional(),
  twilioFrom: z.string().optional(),
  // Meta Cloud API
  metaPhoneNumberId: z.string().optional(),
  metaAccessToken: z.string().optional(),
  // Business config (tone, language, greeting, etc.)
  chatbotConfig: z.record(z.unknown()).default({}),
});

export type BusinessConfig = z.infer<typeof BusinessConfigSchema>;

export interface ParsedService {
  name: string;
  duration: number;
  price: number;
  raw: string;
}

export function parseService(raw: string): ParsedService {
  const [name, durationStr, priceStr] = raw.split("|");
  return {
    name: name ?? "Service",
    duration: parseInt(durationStr ?? "30", 10),
    price: parseInt(priceStr ?? "0", 10),
    raw,
  };
}

export function parseAllServices(services: string[]): ParsedService[] {
  return services.map(parseService);
}
