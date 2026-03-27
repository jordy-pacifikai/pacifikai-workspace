import { logger } from "@trigger.dev/sdk";
import type { BusinessConfig } from "./config.js";
import { supaHeaders as headers } from "./supabase-headers.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const context = typeof s.context === "string" ? JSON.parse(s.context) : (s.context ?? {});

    // Detect stale sessions: if last activity > 2 hours ago, reset conversation
    // but preserve client_name so we don't re-ask for it
    const STALE_MS = 2 * 60 * 60 * 1000; // 2 hours
    const updatedAt = s.updated_at ? new Date(s.updated_at).getTime() : 0;
    const isStale = Date.now() - updatedAt > STALE_MS;

    if (isStale && context.messages && (context.messages as unknown[]).length > 0) {
      logger.info("[Session] Stale session detected, resetting conversation", {
        phone, lastActivity: s.updated_at,
      });
      // Reset context + booking state, keep client_name
      await fetch(
        `${SUPABASE_URL}/rest/v1/bookbot_sessions?id=eq.${s.id}`,
        {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({
            state: "idle",
            selected_service: null,
            selected_date: null,
            selected_time: null,
            context: {},
            updated_at: new Date().toISOString(),
          }),
        },
      );
      return {
        id: s.id,
        phone: s.phone,
        business_id: s.business_id,
        state: "idle",
        selected_service: null,
        selected_date: null,
        selected_time: null,
        client_name: s.client_name,
        context: {},
      };
    }

    return {
      id: s.id,
      phone: s.phone,
      business_id: s.business_id,
      state: s.state ?? "idle",
      selected_service: s.selected_service,
      selected_date: s.selected_date,
      selected_time: s.selected_time,
      client_name: s.client_name,
      context,
    };
  }

  // No session exists — upsert to handle concurrent race (UNIQUE on phone+business_id)
  const postRes = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_sessions`, {
    method: "POST",
    headers: {
      ...headers(),
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      phone,
      business_id: businessId,
      state: "idle",
      context: {},
    }),
  });

  // If upsert returned empty (duplicate ignored), re-fetch the existing session
  const created = await postRes.json();
  let session = Array.isArray(created) && created.length > 0 ? created[0] : null;
  if (!session) {
    const refetchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_sessions?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&limit=1`,
      { headers: headers() },
    );
    const refetched = await refetchRes.json();
    session = Array.isArray(refetched) && refetched.length > 0 ? refetched[0] : { phone, business_id: businessId, state: "idle", context: {} };
  }

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
  clientName?: string;
  clientEmail?: string;
  clientNotes?: string;
  service: string;
  date: string;
  time: string;
  endTime?: string;
  source?: string;
}): Promise<string | null> {
  const source = params.source
    ?? (params.clientPhone.startsWith("messenger_") ? "messenger"
      : params.clientPhone.startsWith("instagram_") ? "instagram"
      : "whatsapp");

  // Atomic booking via RPC — prevents TOCTOU race condition
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_appointment_atomic`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      p_business_id: params.businessId,
      p_service: params.service,
      p_appointment_date: params.date,
      p_time_slot: params.time,
      p_end_time: params.endTime || params.time,
      p_client_name: params.clientName || params.clientPhone,
      p_client_phone: params.clientPhone,
      p_client_email: params.clientEmail || null,
      p_price: 0,
      p_source: source,
      p_client_notes: params.clientNotes || null,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (errText.includes("BOOKING_CONFLICT")) {
      logger.warn("[createAppointment] Booking conflict (atomic)", { date: params.date, time: params.time });
      return null;
    }
    logger.error("[createAppointment] RPC failed", { status: res.status, error: errText });
    return null;
  }

  // RPC returns the UUID directly as a JSON string
  const appointmentId = await res.json();
  return typeof appointmentId === "string" ? appointmentId : null;
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
): Promise<{ time_slot: string; end_time: string | null; service: string }[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&status=in.(confirmed,pending)&source=neq.test&select=time_slot,end_time,service`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function searchKnowledgeBase(
  businessId: string,
  query: string
): Promise<{ chunk_text: string; title: string; category: string; score: number }[]> {
  // Validate businessId to prevent PostgREST injection
  if (!UUID_RE.test(businessId)) return [];

  const mistralKey = process.env.MISTRAL_API_KEY;

  // If we have a Mistral key, do vector search (proper RAG)
  if (mistralKey) {
    try {
      // Generate embedding for the query (5s timeout to avoid blocking chatbot)
      const embController = new AbortController();
      const embTimeout = setTimeout(() => embController.abort(), 5000);
      const embRes = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        signal: embController.signal,
        headers: {
          Authorization: `Bearer ${mistralKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-embed",
          input: query,
        }),
      });
      clearTimeout(embTimeout);
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
      logger.warn("[RAG] Vector search failed, falling back to FTS", { error: String(err) });
    }
  }

  // Fallback: full-text search on bookbot_embeddings.fts
  const sanitizeToken = (w: string) => w.replace(/[!&|():*%_'"\\]/g, "");
  const ftsQuery = query.split(/\s+/).map(sanitizeToken).filter(Boolean).join(" & ");
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
  const safeQuery = query.slice(0, 50).replace(/[*%_]/g, "");
  const kRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_knowledge?business_id=eq.${businessId}&content=ilike.*${encodeURIComponent(safeQuery)}*&select=title,content,category&limit=5`,
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

export async function getClientAppointments(
  phone: string,
  businessId: string
): Promise<{ id: string; service: string; appointment_date: string; time_slot: string; status: string }[]> {
  const todayISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Tahiti",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&appointment_date=gte.${todayISO}&status=in.(confirmed,pending)&order=appointment_date.asc&limit=5&select=id,service,appointment_date,time_slot,status`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function cancelActiveAppointment(
  phone: string,
  businessId: string
): Promise<{ found: boolean; details?: string; gcalEventId?: string }> {
  const todayISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Tahiti",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&status=eq.confirmed&appointment_date=gte.${todayISO}&order=appointment_date.asc&limit=1&select=id,appointment_date,time_slot,gcal_event_id`,
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

export async function rescheduleAppointment(
  phone: string,
  businessId: string,
  newDate: string,
  newTime: string,
  durationMin: number,
  services?: Array<{ name: string; duration: number }>,
): Promise<{ found: boolean; details?: string; gcalEventId?: string; appointmentId?: string; service?: string }> {
  const todayISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Tahiti",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?client_phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&status=eq.confirmed&appointment_date=gte.${todayISO}&order=appointment_date.asc&limit=1&select=id,appointment_date,time_slot,service,gcal_event_id`,
    { headers: headers() }
  );
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return { found: false };
  }

  const appt = data[0];
  // Use actual appointment's service duration if available, fallback to caller-provided default
  let actualDuration = durationMin;
  if (appt.service && services) {
    const matchedSvc = services.find(
      (s) => s.name.toLowerCase() === appt.service.toLowerCase(),
    );
    if (matchedSvc) actualDuration = matchedSvc.duration;
  }
  const endH = Math.floor((parseInt(newTime.split(":")[0]!) * 60 + parseInt(newTime.split(":")[1]!) + actualDuration) / 60);
  const endM = (parseInt(newTime.split(":")[0]!) * 60 + parseInt(newTime.split(":")[1]!) + actualDuration) % 60;
  const endTime = `${String(Math.min(endH, 23)).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appt.id}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        appointment_date: newDate,
        time_slot: newTime,
        end_time: endTime,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  return {
    found: true,
    details: `ancien: ${appt.appointment_date} à ${appt.time_slot} → nouveau: ${newDate} à ${newTime}`,
    gcalEventId: appt.gcal_event_id ?? undefined,
    appointmentId: appt.id,
    service: appt.service ?? undefined,
  };
}

export async function setMarketingOptOut(
  phone: string,
  businessId: string,
  optOut: boolean,
): Promise<boolean> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_clients?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ marketing_opt_out: optOut }),
    },
  );
  return res.ok;
}

/**
 * Get client hints for returning customers (last_service, last_visit, visit count).
 * Returns null if client not found.
 */
export async function getClientHints(
  phone: string,
  businessId: string,
): Promise<{ lastService: string | null; lastVisit: string | null; totalVisits: number } | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_clients?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}&select=last_service,last_visit,total_visits`,
    { headers: headers() },
  );
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const r = rows[0];
  return {
    lastService: r.last_service ?? null,
    lastVisit: r.last_visit ?? null,
    totalVisits: r.total_visits ?? 0,
  };
}
