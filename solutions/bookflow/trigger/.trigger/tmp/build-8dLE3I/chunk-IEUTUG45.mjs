import {
  __name,
  init_esm
} from "./chunk-VMIWEUEA.mjs";

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
    chatbotConfig: b.config ?? {}
  };
}
__name(loadBusinessConfig, "loadBusinessConfig");
async function createAppointment(params) {
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
      source: "whatsapp"
    })
  });
}
__name(createAppointment, "createAppointment");
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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bookbot_search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      p_business_id: businessId,
      p_query: query,
      p_limit: 5
    })
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
__name(searchKnowledgeBase, "searchKnowledgeBase");
async function cancelActiveAppointment(phone, businessId) {
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
      body: JSON.stringify({ status: "cancelled" })
    }
  );
  return {
    found: true,
    details: `${appt.appointment_date} a ${appt.time_slot}`
  };
}
__name(cancelActiveAppointment, "cancelActiveAppointment");

export {
  loadOrCreateSession,
  updateSession,
  loadBusinessConfig,
  createAppointment,
  getBookingsForDate,
  searchKnowledgeBase,
  cancelActiveAppointment
};
//# sourceMappingURL=chunk-IEUTUG45.mjs.map
