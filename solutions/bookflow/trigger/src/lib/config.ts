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
  // Google Calendar
  gcalRefreshToken: z.string().optional(),
  gcalCalendarId: z.string().optional(),
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
    name: (name ?? "Service").trim(),
    duration: Math.max(1, parseInt(durationStr ?? "30", 10) || 30),
    price: Math.max(0, parseInt(priceStr ?? "0", 10) || 0),
    raw,
  };
}

export function parseAllServices(services: string[]): ParsedService[] {
  return services.map(parseService);
}

/** Row shape from bookbot_businesses query */
export interface BusinessRow {
  id: string;
  name: string;
  config: Record<string, unknown> | null;
  phone?: string;
  twilio_sid?: string;
  twilio_token?: string;
  twilio_from?: string;
  phone_number_id?: string;
  meta_access_token?: string;
  timezone?: string;
  booking_slug?: string;
}

/** Convert a DB business row to BusinessConfig */
export function buildBusinessConfig(biz: BusinessRow): BusinessConfig {
  const cfg = (biz.config ?? {}) as Record<string, unknown>;
  return {
    businessId: biz.id,
    businessName: biz.name ?? "",
    services: [],
    openingHours: {},
    timezone: biz.timezone ?? "Pacific/Tahiti",
    humanPhone: (cfg.human_phone as string) ?? (biz.phone as string) ?? "",
    provider: biz.phone_number_id ? "meta" : "twilio",
    twilioSid: biz.twilio_sid,
    twilioToken: biz.twilio_token,
    twilioFrom: biz.twilio_from,
    metaPhoneNumberId: biz.phone_number_id,
    metaAccessToken: biz.meta_access_token,
    chatbotConfig: cfg,
  };
}
