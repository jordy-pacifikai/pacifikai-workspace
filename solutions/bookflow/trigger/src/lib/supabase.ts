import type { BusinessConfig } from "./config.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface Session {
  id: string;
  phone: string;
  business_id: string;
  state: string;
  selected_service: string | null;
  selected_date: string | null;
  selected_time: string | null;
  client_name: string | null;
  context: Record<string, unknown>;
}

export async function loadOrCreateSession(
  phone: string,
  businessId: string
): Promise<Session> {
  // Try to load existing session first
  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_sessions?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&limit=1`,
    { headers: headers() }
  );
  const existing = await getRes.json();

  if (Array.isArray(existing) && existing.length > 0) {
    const s = existing[0];
    return {
      id: s.id,
      phone: s.phone,
      business_id: s.business_id,
      state: s.state ?? "idle",
      selected_service: s.selected_service,
      selected_date: s.selected_date,
      selected_time: s.selected_time,
      client_name: s.client_name,
      context: typeof s.context === "string" ? JSON.parse(s.context) : (s.context ?? {}),
    };
  }

  // No session exists — create one
  const postRes = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_sessions`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({
      phone,
      business_id: businessId,
      state: "idle",
      context: {},
    }),
  });

  const created = await postRes.json();
  const session = Array.isArray(created) ? created[0] : created;

  return {
    id: session.id,
    phone: session.phone,
    business_id: session.business_id,
    state: session.state ?? "idle",
    selected_service: session.selected_service,
    selected_date: session.selected_date,
    selected_time: session.selected_time,
    client_name: session.client_name,
    context: session.context ?? {},
  };
}

export async function updateSession(
  phone: string,
  businessId: string,
  newState: string,
  updates: Record<string, unknown> = {}
): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_sessions?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        state: newState,
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }
  );
}

export async function loadBusinessConfig(
  businessId: string
): Promise<BusinessConfig | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&limit=1`,
    { headers: headers() }
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const b = data[0];

  // Convert services from Supabase JSON objects to "name|duration|price" format
  const rawServices: unknown[] = b.services ?? [];
  const services = rawServices.map((s: unknown) => {
    if (typeof s === "string") return s; // already pipe-delimited
    const obj = s as { name: string; duration: number; price: number };
    return `${obj.name}|${obj.duration}|${obj.price}`;
  });

  // hours field in DB (not opening_hours)
  const hours = b.hours ?? b.opening_hours ?? {};

  // human_phone can be top-level or inside config object
  const humanPhone =
    b.human_phone ?? b.config?.human_phone ?? b.phone ?? "";

  return {
    businessId: b.id,
    businessName: b.name,
    services,
    openingHours: hours,
    timezone: b.timezone ?? "Pacific/Tahiti",
    humanPhone,
    provider: b.phone_number_id ? "meta" : "twilio",
    twilioSid: b.twilio_sid,
    twilioToken: b.twilio_token,
    twilioFrom: b.twilio_from,
    metaPhoneNumberId: b.phone_number_id,
    metaAccessToken: b.meta_access_token,
    chatbotConfig: b.config ?? {},
  };
}

export async function createAppointment(params: {
  businessId: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
}): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      business_id: params.businessId,
      client_name: params.clientPhone,
      client_phone: params.clientPhone,
      service: params.service,
      appointment_date: params.date,
      time_slot: params.time,
      status: "confirmed",
      source: "whatsapp",
    }),
  });
}

export async function getBookingsForDate(
  businessId: string,
  date: string
): Promise<{ time_slot: string; service: string }[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&status=eq.confirmed&select=time_slot,service`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function searchKnowledgeBase(
  businessId: string,
  query: string
): Promise<{ chunk_text: string; title: string; category: string; score: number }[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bookbot_search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      p_business_id: businessId,
      p_query: query,
      p_limit: 5,
    }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function cancelActiveAppointment(
  phone: string,
  businessId: string
): Promise<{ found: boolean; details?: string }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&status=eq.confirmed&order=appointment_date.asc&limit=1`,
    { headers: headers() }
  );
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return { found: false };
  }

  const appt = data[0];
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appt.id}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ status: "cancelled" }),
    }
  );

  return {
    found: true,
    details: `${appt.appointment_date} a ${appt.time_slot}`,
  };
}
