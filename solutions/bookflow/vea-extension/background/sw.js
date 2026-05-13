/**
 * Vea Connect — Background Service Worker
 *
 * Routes messages between the FB content script and the popup.
 * Stores the most recently detected token so the popup can pick it up
 * even if it was closed when the token was generated.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "TOKEN_DETECTED" && typeof message.token === "string") {
    handleTokenDetected(message.token);
    sendResponse({ ok: true });
    return false;
  }
  return false;
});

async function handleTokenDetected(token) {
  // Persist for popup retrieval (in case it's closed)
  await chrome.storage.local.set({
    lastDetectedToken: token,
    lastDetectedAt: Date.now(),
  });

  // Try to forward to an open popup. If popup is closed, this throws — ignore.
  try {
    await chrome.runtime.sendMessage({ type: "TOKEN_DETECTED", token });
  } catch {
    // Popup not open — no problem, popup will pick it up on open via storage
  }

  // Show a notification badge on the action icon
  try {
    await chrome.action.setBadgeText({ text: "!" });
    await chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 60_000);
  } catch {
    /* badge API may not be available everywhere */
  }
}

// Reset badge when popup is opened
chrome.action.onClicked?.addListener?.(() => {
  chrome.action.setBadgeText({ text: "" });
});

// Clear stale tokens after 10 minutes — security hygiene
chrome.alarms?.create?.("clear-stale", { periodInMinutes: 5 });
chrome.alarms?.onAlarm?.addListener?.(async (alarm) => {
  if (alarm.name !== "clear-stale") return;
  const data = await chrome.storage.local.get(["lastDetectedAt"]);
  if (data.lastDetectedAt && Date.now() - data.lastDetectedAt > 10 * 60 * 1000) {
    await chrome.storage.local.remove(["lastDetectedToken", "lastDetectedAt"]);
  }
});
