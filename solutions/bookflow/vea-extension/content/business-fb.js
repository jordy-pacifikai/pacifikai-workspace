/**
 * Vea Connect — Content Script
 * Runs on business.facebook.com/* and watches for the "Generated Token" modal
 * that appears after a System User generates a Page Access Token.
 *
 * When detected, the token is forwarded to the background SW which posts it
 * to vea.pacifikai.com/api/auth/facebook/byo-token.
 */

(() => {
  // Permanent Page Access Tokens always start with "EAA" and are 200+ chars.
  // We use a strict regex to avoid false positives (any random text on the page
  // that happens to look like a token).
  const TOKEN_RE = /\bEAA[A-Za-z0-9]{180,}\b/;

  let lastSentToken = null;
  let cooldownUntil = 0;

  function isLikelyTokenContext(el) {
    // Only treat as a token if it's inside a textarea, code block, or
    // an input/element that the user is likely meant to copy.
    const tag = el?.tagName?.toLowerCase();
    if (tag === "textarea" || tag === "input") return true;
    if (tag === "code" || tag === "pre") return true;
    // Check if any ancestor has aria-label or text suggesting a token context
    let p = el;
    for (let i = 0; i < 5 && p; i++, p = p.parentElement) {
      const aria = (p.getAttribute?.("aria-label") || "").toLowerCase();
      const txt = (p.textContent || "").toLowerCase().slice(0, 200);
      if (
        aria.includes("token") ||
        aria.includes("jeton") ||
        txt.includes("access token") ||
        txt.includes("jeton d'acces") ||
        txt.includes("jeton d’acces") ||
        txt.includes("page access token")
      ) {
        return true;
      }
    }
    return false;
  }

  function extractTokenFromEl(el) {
    if (!el) return null;
    const tag = el.tagName?.toLowerCase();
    let value = "";
    if (tag === "textarea" || tag === "input") {
      value = el.value || el.getAttribute("value") || "";
    } else {
      value = el.textContent || "";
    }
    const match = value.match(TOKEN_RE);
    if (match && isLikelyTokenContext(el)) {
      return match[0];
    }
    return null;
  }

  function scanDocument() {
    if (Date.now() < cooldownUntil) return;

    // Priority 1: textareas (FB usually renders generated tokens in a readonly textarea)
    const textareas = document.querySelectorAll("textarea, input[type='text']");
    for (const el of textareas) {
      const token = extractTokenFromEl(el);
      if (token && token !== lastSentToken) {
        sendToken(token);
        return;
      }
    }

    // Priority 2: code/pre blocks
    const codeEls = document.querySelectorAll("code, pre");
    for (const el of codeEls) {
      const token = extractTokenFromEl(el);
      if (token && token !== lastSentToken) {
        sendToken(token);
        return;
      }
    }
  }

  function sendToken(token) {
    lastSentToken = token;
    cooldownUntil = Date.now() + 5000; // 5s cooldown to avoid double-sends
    showVisualConfirmation();
    try {
      chrome.runtime.sendMessage({
        type: "TOKEN_DETECTED",
        token,
        url: location.href,
      });
    } catch (err) {
      console.warn("[Vea Connect] sendMessage failed:", err);
    }
  }

  function showVisualConfirmation() {
    if (document.getElementById("__vea-toast")) return;
    const toast = document.createElement("div");
    toast.id = "__vea-toast";
    toast.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: #10B981;
      color: #03110a;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: __veaSlideIn 0.25s ease-out;
    `;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Token detecte ! Envoi vers Ve'a...
    `;
    const style = document.createElement("style");
    style.textContent = `@keyframes __veaSlideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Initial scan
  scanDocument();

  // MutationObserver — watches for the token modal appearing
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.type === "childList" && m.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
      if (m.type === "characterData") {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      // Throttle: scan at most every 250ms
      clearTimeout(observer._t);
      observer._t = setTimeout(scanDocument, 250);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Also re-scan on focus/visibility change (when user comes back from Vea tab)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scanDocument();
  });
})();
