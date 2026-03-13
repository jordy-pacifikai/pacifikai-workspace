import {
  __name,
  init_esm
} from "./chunk-DB4FHRYB.mjs";

// src/lib/supabase.ts
init_esm();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
}
__name(headers, "headers");
async function loadOrCreateSession(phone, businessId) {
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
      context: typeof s.context === "string" ? JSON.parse(s.context) : s.context ?? {}
    };
  }
  const postRes = await fetch(`${SUPABASE_URL}/rest/v1/bookbot_sessions`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({
      phone,
      business_id: businessId,
      state: "idle",
      context: {}
    })
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
    context: session.context ?? {}
  };
}
__name(loadOrCreateSession, "loadOrCreateSession");
async function updateSession(phone, businessId, newState, updates = {}) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_sessions?phone=eq.${encodeURIComponent(phone)}&business_id=eq.${businessId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        state: newState,
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }
  );
}
__name(updateSession, "updateSession");
async function loadBusinessConfig(businessId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_businesses?id=eq.${businessId}&limit=1`,
    { headers: headers() }
  );
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const b = data[0];
  const rawServices = b.services ?? [];
  const services = rawServices.map((s) => {
    if (typeof s === "string") return s;
    const obj = s;
    return `${obj.name}|${obj.duration}|${obj.price}`;
  });
  const hours = b.hours ?? b.opening_hours ?? {};
  const humanPhone = b.human_phone ?? b.config?.human_phone ?? b.phone ?? "";
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
    gcalRefreshToken: b.gcal_refresh_token ?? void 0,
    gcalCalendarId: b.gcal_calendar_id ?? void 0
  };
}
__name(loadBusinessConfig, "loadBusinessConfig");
async function createAppointment(params) {
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
      source: "whatsapp"
    })
  });
  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : data;
  return row?.id ?? null;
}
__name(createAppointment, "createAppointment");
async function updateAppointmentGCalId(appointmentId, gcalEventId) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${appointmentId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ gcal_event_id: gcalEventId })
    }
  );
}
__name(updateAppointmentGCalId, "updateAppointmentGCalId");
async function getBookingsForDate(businessId, date) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&status=eq.confirmed&select=time_slot,service`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
__name(getBookingsForDate, "getBookingsForDate");
async function searchKnowledgeBase(businessId, query) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const embRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          dimensions: 1024,
          input: query
        })
      });
      const embData = await embRes.json();
      const queryEmbedding = embData?.data?.[0]?.embedding;
      if (queryEmbedding) {
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bookbot_search`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            query_embedding: queryEmbedding,
            p_business_id: businessId,
            match_threshold: 0.3,
            match_count: 5
          })
        });
        const data2 = await res2.json();
        if (Array.isArray(data2) && data2.length > 0) {
          return data2.map((r) => ({
            chunk_text: r.content,
            title: "",
            category: "",
            score: r.similarity
          }));
        }
      }
    } catch {
    }
  }
  const ftsQuery = query.split(/\s+/).filter(Boolean).join(" & ");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_embeddings?business_id=eq.${businessId}&fts=fts.${encodeURIComponent(ftsQuery)}&select=chunk_text&limit=5`,
    { headers: headers() }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data.map((r) => ({
      chunk_text: r.chunk_text,
      title: "",
      category: "",
      score: 0.5
    }));
  }
  const kRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_knowledge?business_id=eq.${businessId}&content=ilike.*${encodeURIComponent(query.slice(0, 50))}*&select=title,content,category&limit=5`,
    { headers: headers() }
  );
  const kData = await kRes.json();
  return Array.isArray(kData) ? kData.map((r) => ({
    chunk_text: r.content,
    title: r.title,
    category: r.category,
    score: 0.3
  })) : [];
}
__name(searchKnowledgeBase, "searchKnowledgeBase");
async function getBlockedSlotsForDate(businessId, date) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&date=eq.${date}&select=time_from,time_to,all_day`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
__name(getBlockedSlotsForDate, "getBlockedSlotsForDate");
async function getAllDayBlockedDates(businessId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&all_day=eq.true&select=date`,
    { headers: headers() }
  );
  const data = await res.json();
  const dates = /* @__PURE__ */ new Set();
  if (Array.isArray(data)) {
    for (const row of data) {
      dates.add(row.date);
    }
  }
  return dates;
}
__name(getAllDayBlockedDates, "getAllDayBlockedDates");
function toLocalTime(date, tz) {
  const parts = date.toLocaleString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const [h = "00", m = "00"] = parts.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}
__name(toLocalTime, "toLocalTime");
async function refreshGCalBlockedSlots(businessId, date, events, timezone) {
  const [existingRes, existingApptRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?business_id=eq.${businessId}&date=eq.${date}&source=eq.gcal&select=id,gcal_event_id`, { headers: headers() }),
    fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=eq.${date}&source=eq.gcal&select=id,gcal_event_id`, { headers: headers() })
  ]);
  const existingSlots = await existingRes.json();
  const existingAppts = await existingApptRes.json();
  const existingSlotIds = new Set((Array.isArray(existingSlots) ? existingSlots : []).map((s) => s.gcal_event_id));
  const existingApptIds = new Set((Array.isArray(existingAppts) ? existingAppts : []).map((a) => a.gcal_event_id));
  const gcalEventIds = /* @__PURE__ */ new Set();
  for (const event of events) {
    if (event.status === "cancelled") continue;
    gcalEventIds.add(event.id);
    const startDT = event.start.dateTime;
    const startDate = event.start.date;
    const endDT = event.end.dateTime;
    let timeFrom = null;
    let timeTo = null;
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
        body: JSON.stringify({ business_id: businessId, date, time_from: timeFrom, time_to: timeTo, all_day: allDay, reason: event.summary ?? "Google Calendar", source: "gcal", gcal_event_id: event.id })
      });
    }
    if (!allDay && timeFrom && !existingApptIds.has(event.id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=minimal" },
        body: JSON.stringify({ business_id: businessId, client_name: event.summary ?? "Google Calendar", service: "Google Calendar", appointment_date: date, time_slot: timeFrom, end_time: timeTo, status: "confirmed", source: "gcal", gcal_event_id: event.id })
      });
    }
  }
  for (const existing of Array.isArray(existingSlots) ? existingSlots : []) {
    if (!gcalEventIds.has(existing.gcal_event_id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_blocked_slots?id=eq.${existing.id}`, { method: "DELETE", headers: headers() });
    }
  }
  for (const existing of Array.isArray(existingAppts) ? existingAppts : []) {
    if (!gcalEventIds.has(existing.gcal_event_id)) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookbot_appointments?id=eq.${existing.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status: "cancelled" }) });
    }
  }
}
__name(refreshGCalBlockedSlots, "refreshGCalBlockedSlots");
async function cancelActiveAppointment(phone, businessId) {
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
      body: JSON.stringify({ status: "cancelled" })
    }
  );
  return {
    found: true,
    details: `${appt.appointment_date} a ${appt.time_slot}`,
    gcalEventId: appt.gcal_event_id ?? void 0
  };
}
__name(cancelActiveAppointment, "cancelActiveAppointment");

export {
  loadOrCreateSession,
  updateSession,
  loadBusinessConfig,
  createAppointment,
  updateAppointmentGCalId,
  getBookingsForDate,
  searchKnowledgeBase,
  getBlockedSlotsForDate,
  getAllDayBlockedDates,
  refreshGCalBlockedSlots,
  cancelActiveAppointment
};
//# sourceMappingURL=chunk-UNIV7FH3.mjs.map
