/**
 * Vea Connect — Popup
 * Drives the multi-state UI: loading → unauth | businesses → waiting → connecting → success | error
 *
 * Auth model: relies on vea.pacifikai.com session cookies (the user must already be logged
 * into Vea in their browser). All Vea API calls use credentials: 'include'.
 */

const VEA_BASE = "https://vea.pacifikai.com";
const FB_BUSINESS_SETTINGS = "https://business.facebook.com/settings/system-users";

const states = ["loading", "unauth", "businesses", "waiting", "connecting", "success", "error"];

function showState(name) {
  for (const s of states) {
    const el = document.getElementById(`state-${s}`);
    if (el) el.classList.toggle("hidden", s !== name);
  }
}

async function veaFetch(path, init = {}) {
  const res = await fetch(`${VEA_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, data };
}

async function checkAuthAndLoadBusinesses() {
  showState("loading");

  // 1. Check Vea auth status — try /api/business which requires auth
  // Falls through any redirect to /login if unauthenticated
  const authCheck = await veaFetch("/api/business");

  if (authCheck.status === 401 || authCheck.status === 403) {
    return showState("unauth");
  }

  if (!authCheck.ok) {
    return showError(
      "Impossible de joindre Ve'a",
      `HTTP ${authCheck.status} sur /api/business`,
    );
  }

  // 2. The /api/business endpoint returns the current business; for multi-business
  // we need /api/businesses (list). If that fails, fall back to single business mode.
  const list = await veaFetch("/api/businesses");
  let businesses = [];
  if (list.ok && Array.isArray(list.data?.businesses)) {
    businesses = list.data.businesses;
  } else if (authCheck.data?.id) {
    // Single-business fallback
    businesses = [
      {
        id: authCheck.data.id,
        name: authCheck.data.name ?? "Mon business",
        plan: authCheck.data.plan ?? null,
      },
    ];
  }

  if (businesses.length === 0) {
    return showError(
      "Aucun business trouve",
      "Cree d'abord un business sur Ve'a, puis reviens ici.",
    );
  }

  renderBusinesses(businesses);
  showState("businesses");
}

let activeBusinessId = null;
let activeBusinessName = null;

function renderBusinesses(businesses) {
  const list = document.getElementById("business-list");
  list.innerHTML = "";
  for (const b of businesses) {
    const item = document.createElement("div");
    item.className = "business-item";
    item.dataset.id = b.id;
    item.innerHTML = `
      <span class="check"></span>
      <span class="name">${escapeHtml(b.name)}</span>
      ${b.plan ? `<span class="plan">${escapeHtml(b.plan)}</span>` : ""}
    `;
    item.addEventListener("click", () => selectBusiness(b.id, b.name));
    list.appendChild(item);
  }
  // Auto-select if single business
  if (businesses.length === 1) {
    selectBusiness(businesses[0].id, businesses[0].name);
  }
}

function selectBusiness(id, name) {
  activeBusinessId = id;
  activeBusinessName = name;
  document.querySelectorAll(".business-item").forEach((el) => {
    el.classList.toggle("selected", el.dataset.id === id);
  });
  document.getElementById("btn-start").disabled = false;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = String(s ?? "");
  return div.innerHTML;
}

async function startWaiting() {
  if (!activeBusinessId) return;
  await chrome.storage.local.set({
    activeBusinessId,
    activeBusinessName,
    waitingSince: Date.now(),
  });
  document.getElementById("active-business-name").textContent = activeBusinessName;
  showState("waiting");

  // Open the FB Business Settings tab
  await chrome.tabs.create({ url: FB_BUSINESS_SETTINGS, active: true });
}

async function backToBusinesses() {
  await chrome.storage.local.remove(["activeBusinessId", "activeBusinessName", "waitingSince"]);
  await checkAuthAndLoadBusinesses();
}

async function onTokenDetected(token) {
  showState("connecting");

  if (!activeBusinessId) {
    return showError("Pas de business actif", "Recommence depuis l'etape 1.");
  }

  const res = await veaFetch("/api/auth/facebook/byo-token", {
    method: "POST",
    body: JSON.stringify({ businessId: activeBusinessId, pageToken: token }),
  });

  if (res.ok && res.data?.ok) {
    document.getElementById("success-title").textContent =
      `${res.data.page?.name ?? "Ta Page"} connectee !`;
    const permanent = res.data.token?.permanent;
    document.getElementById("success-detail").textContent = permanent
      ? "Token permanent. Ton agent IA Ve'a peut maintenant repondre aux messages de cette Page."
      : "Token long-lived. Ton agent IA Ve'a peut maintenant repondre. (Pense a regenerer un token permanent expiration=Jamais pour la prod.)";
    showState("success");
    // Cleanup
    await chrome.storage.local.remove([
      "activeBusinessId",
      "activeBusinessName",
      "waitingSince",
      "lastDetectedToken",
    ]);
    return;
  }

  showError(
    res.data?.error ?? "Erreur de validation",
    res.data?.detail ??
      `Vea n'a pas pu valider le token (HTTP ${res.status}).`,
  );
}

function showError(message, detail) {
  document.getElementById("error-message").textContent = message;
  document.getElementById("error-detail").textContent = detail || "";
  showState("error");
}

// Wire up buttons
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-open-vea").addEventListener("click", () => {
    chrome.tabs.create({ url: `${VEA_BASE}/login` });
  });
  document.getElementById("btn-start").addEventListener("click", startWaiting);
  document.getElementById("btn-back").addEventListener("click", backToBusinesses);
  document.getElementById("btn-retry").addEventListener("click", checkAuthAndLoadBusinesses);
  document.getElementById("btn-open-channels").addEventListener("click", () => {
    chrome.tabs.create({ url: `${VEA_BASE}/channels` });
  });
  document.getElementById("btn-connect-another").addEventListener("click", backToBusinesses);

  // If a token was detected while popup was closed, pick it up immediately
  chrome.storage.local.get(["lastDetectedToken", "activeBusinessId", "activeBusinessName"]).then(
    (data) => {
      if (data.lastDetectedToken && data.activeBusinessId) {
        activeBusinessId = data.activeBusinessId;
        activeBusinessName = data.activeBusinessName ?? null;
        document.getElementById("active-business-name").textContent = activeBusinessName ?? "";
        return onTokenDetected(data.lastDetectedToken);
      }
      return checkAuthAndLoadBusinesses();
    },
  );
});

// Listen for token detection from background SW
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "TOKEN_DETECTED" && msg.token) {
    onTokenDetected(msg.token);
  }
});
