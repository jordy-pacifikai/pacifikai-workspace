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
    gcalRefreshToken: b.gcal_refresh_token ?? undefined,
    gcalCalendarId: b.gcal_calendar_id ?? undefined,
  };
}

export async function createAppointment(params: {
  businessId: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
}): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
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
  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : data;
  return row?.id ?? null;
}

export async function updateAppointmentGCalId(
  appointmentId: string,
  gcalEventId: string
): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ gcal_event_id: gcalEventId }),
    }
  );
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
  const mistralKey = process.env.MISTRAL_API_KEY;

  // If we have a Mistral key, do vector search (proper RAG)
  if (mistralKey) {
    try {
      // Generate embedding for the query
      const embRes = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mistralKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-embed",
          input: query,
        }),
      });
      const embData = await embRes.json();
      const queryEmbedding = embData?.data?.[0]?.embedding;

      if (queryEmbedding) {
        // Call bookbot_search RPC with the vector
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bookbot_search`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            query_embedding: queryEmbedding,
            p_business_id: businessId,
            match_threshold: 0.3,
            match_count: 5,
          }),
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((r: { id: string; content: string; similarity: number }) => ({
            chunk_text: r.content,
            title: "",
            category: "",
            score: r.similarity,
          }));
        }
      }
    } catch (err) {
      console.warn("[RAG] Vector search failed, falling back to FTS:", String(err));
    }
  }

  // Fallback: full-text search on bookbot_embeddings.fts
  const ftsQuery = query.split(/\s+/).filter(Boolean).join(" & ");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_embeddings?business_id=eq.${businessId}&fts=fts.${encodeURIComponent(ftsQuery)}&select=chunk_text&limit=5`,
    { headers: headers() }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data.map((r: { chunk_text: string }) => ({
      chunk_text: r.chunk_text,
      title: "",
      category: "",
      score: 0.5,
    }));
  }

  // Last fallback: direct text search on bookbot_knowledge
  const kRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_knowledge?business_id=eq.${businessId}&content=ilike.*${encodeURIComponent(query.slice(0, 50))}*&select=title,content,category&limit=5`,
    { headers: headers() }
  );
  const kData = await kRes.json();
  return Array.isArray(kData)
    ? kData.map((r: { title: string; content: string; category: string }) => ({
        chunk_text: r.content,
        title: r.title,
        category: r.category,
        score: 0.3,
      }))
    : [];
}

export async function getBlockedSlotsForDate(
  businessId: string,
  date: string
): Promise<{ time_from: string | null; time_to: string | null; all_day: boolean }[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&date=eq.${date}&select=time_from,time_to,all_day`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Get all dates with all-day blocked slots (next 14 days) for suggestion filtering */
export async function getAllDayBlockedDates(
  businessId: string
): Promise<Set<string>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&all_day=eq.true&select=date`,
    { headers: headers() }
  );
  const data = await res.json();
  const dates = new Set<string>();
  if (Array.isArray(data)) {
    for (const row of data) {
      dates.add(row.date);
    }
  }
  return dates;
}

/** Convert a Date to HH:MM in a given timezone */
function toLocalTime(date: Date, tz: string): string {
  const parts = date.toLocaleString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h = "00", m = "00"] = parts.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

/**
 * On-demand refresh of GCal blocked slots for a specific date.
 * Called during check_availability to get fresh data for near-future dates.
 */
export async function refreshGCalBlockedSlots(
  businessId: string,
  date: string,
  events: { id: string; summary: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string }; status: string }[],
  timezone: string
): Promise<void> {
  // Get existing gcal blocked slots + appointments for this date
  const [existingRes, existingApptRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&date=eq.${date}&source=eq.gcal&select=id,gcal_event_id`, { headers: headers() }),
    fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&source=eq.gcal&select=id,gcal_event_id`, { headers: headers() }),
  ]);
  const existingSlots = await existingRes.json();
  const existingAppts = await existingApptRes.json();
  const existingSlotIds = new Set((Array.isArray(existingSlots) ? existingSlots : []).map((s: { gcal_event_id: string }) => s.gcal_event_id));
  const existingApptIds = new Set((Array.isArray(existingAppts) ? existingAppts : []).map((a: { gcal_event_id: string }) => a.gcal_event_id));

  const gcalEventIds = new Set<string>();

  for (const event of events) {
    if (event.status === "cancelled") continue;
    gcalEventIds.add(event.id);

    const startDT = event.start.dateTime;
    const startDate = event.start.date;
    const endDT = event.end.dateTime;
    let timeFrom: string | null = null;
    let timeTo: string | null = null;
    let allDay = false;

    if (startDate && !startDT) {
      allDay = true;
    } else if (startDT && endDT) {
      timeFrom = toLocalTime(new Date(startDT), timezone);
      timeTo = toLocalTime(new Date(endDT), timezone);
    } else {
      continue;
    }

    if (!existingSlotIds.has(event.id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=minimal" },
        body: JSON.stringify({ business_id: businessId, date, time_from: timeFrom, time_to: timeTo, all_day: allDay, reason: event.summary ?? "Google Calendar", source: "gcal", gcal_event_id: event.id }),
      });
    }

    if (!allDay && timeFrom && !existingApptIds.has(event.id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=minimal" },
        body: JSON.stringify({ business_id: businessId, client_name: event.summary ?? "Google Calendar", service: "Google Calendar", appointment_date: date, time_slot: timeFrom, end_time: timeTo, status: "confirmed", source: "gcal", gcal_event_id: event.id }),
      });
    }
  }

  // Remove stale gcal blocked slots
  for (const existing of Array.isArray(existingSlots) ? existingSlots : []) {
    if (!gcalEventIds.has(existing.gcal_event_id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?id=eq.${existing.id}`, { method: "DELETE", headers: headers() });
    }
  }
  // Cancel stale gcal appointments
  for (const existing of Array.isArray(existingAppts) ? existingAppts : []) {
    if (!gcalEventIds.has(existing.gcal_event_id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${existing.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status: "cancelled" }) });
    }
  }
}

export async function cancelActiveAppointment(
  phone: string,
  businessId: string
): Promise<{ found: boolean; details?: string; gcalEventId?: string }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&status=eq.confirmed&order=appointment_date.asc&limit=1&select=id,appointment_date,time_slot,gcal_event_id`,
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
    gcalEventId: appt.gcal_event_id ?? undefined,
  };
}
