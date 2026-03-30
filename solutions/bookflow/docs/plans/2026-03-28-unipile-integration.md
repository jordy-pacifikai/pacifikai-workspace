# Unipile Integration — Ve'a (BookFlow) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Unipile as a messaging proxy for Messenger/Instagram DMs, allowing Ve'a clients to connect their Facebook pages without Meta App Review.

**Architecture:** Unipile acts as a session-based proxy. Each client connects via Hosted Auth (30s onboarding). Unipile forwards incoming messages to our webhook. We send replies via Unipile REST API. Existing bookbot-handler stays channel-agnostic — only the edges change (webhook in, send out).

**Tech Stack:** Next.js 14 API routes (webhook + auth), Trigger.dev v4 tasks (send), Supabase (state), TanStack Query (dashboard)

---

## Key References

| File | Role | Path (from bookflow/) |
|------|------|-----------------------|
| Messenger webhook | Pattern for new Unipile webhook | `dashboard/src/app/api/webhook/messenger/route.ts` |
| Facebook OAuth | Pattern for new Unipile connect | `dashboard/src/app/api/auth/facebook/route.ts` |
| Channel router | Where to add `sendViaUnipile` | `trigger/src/lib/whatsapp.ts` |
| Bookbot handler | Channel-agnostic task (no changes needed) | `trigger/src/bookbot-handler.ts` |
| DLQ helper | Reuse for Unipile events | `dashboard/src/lib/webhook-dlq.ts` |
| Channels page | Add Unipile card | `dashboard/src/app/channels/page.tsx` |
| Channels hooks | Add Unipile hooks | `dashboard/src/hooks/useChannels.ts` |
| Trigger config | Verify env vars reach tasks | `trigger/trigger.config.ts` |

## Unipile API Reference

- **Base URL:** `https://api24.unipile.com:15416`
- **Auth header:** `X-API-KEY: Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04=`
- **Docs:** https://docs.unipile.com

### Key Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List accounts | GET | `/api/v1/accounts` |
| Create hosted auth link | POST | `/api/v1/hosted/accounts/link` |
| List chats | GET | `/api/v1/chats` |
| Send message | POST | `/api/v1/chats/{chat_id}/messages` |
| Get messages | GET | `/api/v1/chats/{chat_id}/messages` |
| Register webhook | POST | `/api/v1/webhooks` |

### Webhook Payload (incoming message)

```json
{
  "event": "message_received",
  "data": {
    "account_id": "abc123",
    "chat_id": "chat_xyz",
    "message": {
      "id": "msg_001",
      "text": "Bonjour, je voudrais un RDV",
      "sender": {
        "id": "sender_456",
        "name": "Marie Dupont"
      },
      "timestamp": "2026-03-28T10:30:00Z"
    },
    "provider": "MESSENGER"
  }
}
```

---

### Task 1: Environment Variables

**Files:**
- Modify: `dashboard/.env.local`
- Modify: Vercel env vars (via CLI)
- Modify: Trigger.dev env vars (via dashboard or CLI)

**Step 1: Add env vars to .env.local**

Add these lines at the end of `dashboard/.env.local`:

```bash
# Unipile — messaging proxy (Messenger/Instagram without Meta App Review)
UNIPILE_DSN=https://api24.unipile.com:15416
UNIPILE_API_KEY=Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04=
```

**Step 2: Set Vercel env vars**

```bash
cd "PACIFIK'AI/solutions/bookflow/dashboard"
vercel env add UNIPILE_DSN production preview development <<< "https://api24.unipile.com:15416"
vercel env add UNIPILE_API_KEY production preview development <<< "Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04="
```

**Step 3: Set Trigger.dev env vars**

In the Trigger.dev dashboard (`proj_fsojxjgkghmjundzloso`), set:
- `UNIPILE_DSN` = `https://api24.unipile.com:15416`
- `UNIPILE_API_KEY` = `Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04=`

Or via API:
```bash
# Use Trigger.dev MCP envvars tools
```

**Step 4: Commit**

```bash
# .env.local is gitignored — no commit needed for env vars
```

---

### Task 2: Database Migration — Add Unipile Columns

**Files:**
- Create: Supabase migration (via MCP)

**Step 1: Add columns to bookbot_businesses**

Run via Supabase MCP `execute_sql` on project `aaitnegjnhjwnthcmsnr`:

```sql
-- Add Unipile integration columns to bookbot_businesses
ALTER TABLE bookbot_businesses
  ADD COLUMN IF NOT EXISTS unipile_account_id TEXT,
  ADD COLUMN IF NOT EXISTS unipile_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS unipile_connected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unipile_provider TEXT; -- 'MESSENGER', 'INSTAGRAM', or both

-- Index for webhook routing (lookup by unipile_account_id)
CREATE INDEX IF NOT EXISTS idx_bookbot_businesses_unipile_account
  ON bookbot_businesses (unipile_account_id)
  WHERE unipile_account_id IS NOT NULL;

COMMENT ON COLUMN bookbot_businesses.unipile_account_id IS 'Unipile account ID linked to this business (from hosted auth callback)';
COMMENT ON COLUMN bookbot_businesses.unipile_enabled IS 'Whether Unipile messaging proxy is active for this business';
COMMENT ON COLUMN bookbot_businesses.unipile_provider IS 'Connected provider via Unipile: MESSENGER, INSTAGRAM, or both';
```

**Step 2: Verify migration**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookbot_businesses'
  AND column_name LIKE 'unipile%';
```

Expected: 4 rows (unipile_account_id, unipile_enabled, unipile_connected_at, unipile_provider).

**Step 3: Commit** (migration is in Supabase, no local file)

---

### Task 3: Unipile Webhook Endpoint

**Files:**
- Create: `dashboard/src/app/api/webhook/unipile/route.ts`

This follows the exact same pattern as the Messenger webhook: validate → lookup business → normalize → DLQ → trigger task.

**Step 1: Create the webhook route**

Create file `dashboard/src/app/api/webhook/unipile/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { triggerTask } from "@/lib/trigger";
import { logger } from "@/lib/logger";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { insertWebhookEvent, markWebhookProcessed, markWebhookFailed } from "@/lib/webhook-dlq";

const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";

// Zod schema for Unipile webhook payload
const unipileMessageSchema = z.object({
  event: z.string(),
  data: z.object({
    account_id: z.string(),
    chat_id: z.string(),
    message: z.object({
      id: z.string().optional(),
      text: z.string().optional(),
      body: z.string().optional(), // Unipile uses "body" in some versions
      sender: z.object({
        id: z.string(),
        name: z.string().optional(),
      }).passthrough().optional(),
      timestamp: z.string().optional(),
    }).passthrough(),
    provider: z.string().optional(), // "MESSENGER", "INSTAGRAM"
  }).passthrough(),
}).passthrough();

/**
 * POST /api/webhook/unipile
 *
 * Receives incoming messages from Unipile (Messenger/Instagram proxy).
 * Routes to the correct business by unipile_account_id, then triggers
 * the same bookbot-whatsapp-handler task used for all channels.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success: rlOk } = await rateLimitAsync(`webhook-unipile:${ip}`, {
    interval: 60_000,
    limit: 200,
  });
  if (!rlOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.text();

    // Optional: verify Unipile webhook signature if they provide one
    // (check X-Unipile-Signature header — add later if needed)

    const body = JSON.parse(rawBody);
    const parsed = unipileMessageSchema.safeParse(body);
    if (!parsed.success) {
      logger.error("Invalid Unipile webhook payload", {
        action: "unipile_webhook",
        errors: parsed.error.flatten(),
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { event, data } = parsed.data;

    // Only process incoming messages
    if (event !== "message_received" && event !== "message.received") {
      return NextResponse.json({ ok: true, skipped: event });
    }

    const { account_id, chat_id, message, provider } = data;
    const messageText = message.text || message.body || "";

    if (!messageText.trim()) {
      return NextResponse.json({ ok: true, skipped: "empty_message" });
    }

    // Lookup business by unipile_account_id
    const { data: business } = await supabaseAdmin()
      .from("bookbot_businesses")
      .select("id, meta_page_token, unipile_enabled")
      .eq("unipile_account_id", account_id)
      .eq("unipile_enabled", true)
      .limit(1)
      .single();

    if (!business) {
      logger.warn("No business found for Unipile account", {
        action: "unipile_webhook",
        account_id,
      });
      return NextResponse.json({ ok: true, skipped: "no_business" });
    }

    // Normalize to bookbot-handler format
    // Use "unipile_" prefix + chat_id as the "from" address so the handler
    // routes replies back through Unipile (not Graph API)
    const senderId = message.sender?.id ?? chat_id;
    const senderName = message.sender?.name ?? undefined;
    const channel = (provider ?? "MESSENGER").toLowerCase(); // "messenger" | "instagram"

    const taskPayload = {
      from: `unipile_${chat_id}`,
      message: messageText,
      buttonPayload: null,
      messageType: "text" as const,
      businessId: business.id,
      channel: `unipile_${channel}` as string,
      senderName,
      // Pass chat_id for reply routing via Unipile API
      unipileChatId: chat_id,
      unipileAccountId: account_id,
    };

    // DLQ: persist event before triggering
    const eventId = await insertWebhookEvent(business.id, `unipile_${channel}`, taskPayload);

    try {
      const idempotencyKey = message.id ?? `unipile_${chat_id}_${Date.now()}`;
      const triggered = await triggerTask("bookbot-whatsapp-handler", taskPayload, {
        idempotencyKey,
      });
      if (triggered && eventId) {
        await markWebhookProcessed(eventId);
      } else if (eventId) {
        await markWebhookFailed(eventId, "triggerTask returned false");
      }
    } catch (triggerErr) {
      if (eventId) {
        await markWebhookFailed(eventId, String(triggerErr));
      }
      logger.error("Trigger task failed for Unipile event", {
        action: "unipile_webhook",
        eventId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile webhook error", {
      action: "unipile_webhook",
      error: String(err),
    });
    // Always return 200 to prevent Unipile from retrying
    return NextResponse.json({ ok: true });
  }
}
```

**Step 2: Verify it compiles**

```bash
cd "PACIFIK'AI/solutions/bookflow/dashboard"
npx tsc --noEmit src/app/api/webhook/unipile/route.ts 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/app/api/webhook/unipile/route.ts
git commit -m "feat(vea): add Unipile webhook endpoint for Messenger/Instagram proxy"
```

---

### Task 4: Send via Unipile (Trigger.dev)

**Files:**
- Modify: `trigger/src/lib/whatsapp.ts` (add sendViaUnipile + routing)

**Step 1: Add sendViaUnipile function and routing**

In `trigger/src/lib/whatsapp.ts`, add the Unipile route in `sendWhatsApp()` function (after the Instagram check, before WhatsApp):

```typescript
// In sendWhatsApp(), after the instagram_ check (line ~39) and before WhatsApp:

  // Detect Unipile channel (Messenger/Instagram via Unipile proxy)
  if (to.startsWith("unipile_")) {
    const chatId = to.replace("unipile_", "");
    await sendViaUnipile(chatId, message);
    return;
  }
```

Then add the `sendViaUnipile` function (after `sendViaInstagram`, around line 287):

```typescript
/**
 * Send via Unipile messaging proxy.
 * Used when channel prefix is "unipile_" — routes through Unipile API
 * instead of direct Graph API (no Meta App Review needed).
 */
async function sendViaUnipile(
  chatId: string,
  message: string,
): Promise<void> {
  const dsn = process.env.UNIPILE_DSN;
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!dsn || !apiKey) {
    throw new Error("Unipile credentials not configured (UNIPILE_DSN, UNIPILE_API_KEY)");
  }

  const res = await fetch(`${dsn}/api/v1/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: message }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    throw new Error(`Unipile send error ${res.status}: ${body}`);
  }
}
```

Also update `sendTypingIndicator` to handle Unipile channels (no-op for now):

```typescript
// In sendTypingIndicator(), add before the WhatsApp comment:
    // Unipile channels — no typing indicator API available
    if (to.startsWith("unipile_")) return;
```

**Step 2: Verify compilation**

```bash
cd "PACIFIK'AI/solutions/bookflow/trigger"
npx tsc --noEmit src/lib/whatsapp.ts 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/lib/whatsapp.ts
git commit -m "feat(vea): add sendViaUnipile channel routing in trigger tasks"
```

---

### Task 5: Unipile Connect API (Hosted Auth)

**Files:**
- Create: `dashboard/src/app/api/unipile/connect/route.ts`
- Create: `dashboard/src/app/api/unipile/disconnect/route.ts`

**Step 1: Create connect endpoint**

Create `dashboard/src/app/api/unipile/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAccess } from "@/lib/auth";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const UNIPILE_DSN = process.env.UNIPILE_DSN ?? "";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vea.pacifikai.com";

const connectSchema = z.object({
  businessId: z.string().uuid(),
  provider: z.enum(["MESSENGER", "INSTAGRAM"]).default("MESSENGER"),
});

/**
 * POST /api/unipile/connect
 *
 * Generates a Unipile Hosted Auth link for a client to connect
 * their Messenger or Instagram account. The client clicks the link,
 * logs into Facebook in Unipile's hosted page, and Unipile calls
 * our webhook with the new account_id.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`unipile-connect:${ip}`, {
    interval: 60_000,
    limit: 10,
  });
  if (!success) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = connectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { businessId, provider } = parsed.data;

    // Auth: verify caller owns this business
    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UNIPILE_DSN || !UNIPILE_API_KEY) {
      logger.error("Unipile credentials not configured", { action: "unipile_connect" });
      return NextResponse.json(
        { error: "Unipile non configure sur ce serveur" },
        { status: 500 },
      );
    }

    // Generate Hosted Auth link via Unipile API
    const res = await fetch(`${UNIPILE_DSN}/api/v1/hosted/accounts/link`, {
      method: "POST",
      headers: {
        "X-API-KEY": UNIPILE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "create",
        api_url: UNIPILE_DSN,
        providers: [provider],
        success_redirect_url: `${SITE_URL}/channels?unipile_connected=true&business_id=${businessId}`,
        failure_redirect_url: `${SITE_URL}/channels?unipile_error=connection_failed`,
        notify_url: `${SITE_URL}/api/unipile/callback?business_id=${businessId}`,
        name: `vea_${businessId}`,
        expiresOn: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      logger.error("Unipile hosted auth link failed", {
        action: "unipile_connect",
        status: res.status,
        data,
      });
      return NextResponse.json(
        { error: "Impossible de generer le lien de connexion Unipile" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    logger.error("Unipile connect error", {
      action: "unipile_connect",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Create callback endpoint**

Create `dashboard/src/app/api/unipile/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

const UNIPILE_DSN = process.env.UNIPILE_DSN ?? "";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";

/**
 * POST /api/unipile/callback
 *
 * Called by Unipile after a client completes Hosted Auth.
 * Receives the new account_id and stores it in bookbot_businesses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessId = new URL(req.url).searchParams.get("business_id");

    if (!businessId) {
      logger.error("Unipile callback missing business_id", { action: "unipile_callback" });
      return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
    }

    // Unipile sends: { account_id: "...", status: "CONNECTED", provider: "MESSENGER" }
    const accountId = body.account_id ?? body.id;
    const provider = body.provider ?? "MESSENGER";

    if (!accountId) {
      logger.error("Unipile callback missing account_id", {
        action: "unipile_callback",
        body,
      });
      return NextResponse.json({ error: "Missing account_id" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Store the Unipile account_id on the business
    const { error } = await supabase
      .from("bookbot_businesses")
      .update({
        unipile_account_id: accountId,
        unipile_enabled: true,
        unipile_connected_at: new Date().toISOString(),
        unipile_provider: provider,
      })
      .eq("id", businessId);

    if (error) {
      logger.error("Unipile callback DB update failed", {
        action: "unipile_callback",
        error: error.message,
      });
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    logger.info("Unipile account connected", {
      action: "unipile_callback",
      businessId,
      accountId,
      provider,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile callback error", {
      action: "unipile_callback",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 3: Create disconnect endpoint**

Create `dashboard/src/app/api/unipile/disconnect/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireBusinessAccess } from "@/lib/auth";
import { rateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const UNIPILE_DSN = process.env.UNIPILE_DSN ?? "";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY ?? "";

const disconnectSchema = z.object({ businessId: z.string().uuid() });

/**
 * POST /api/unipile/disconnect
 *
 * Disconnects the Unipile account from a business.
 * Deletes the account in Unipile and clears local DB fields.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimitAsync(`unipile-disconnect:${ip}`, {
    interval: 60_000,
    limit: 10,
  });
  if (!success) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const parsed = disconnectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { businessId } = parsed.data;

    try {
      await requireBusinessAccess(businessId);
    } catch (authError) {
      if (authError instanceof NextResponse) return authError;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    // Get current Unipile account to delete it
    const { data: business } = await supabase
      .from("bookbot_businesses")
      .select("unipile_account_id")
      .eq("id", businessId)
      .single();

    // Best effort: delete account in Unipile
    if (business?.unipile_account_id && UNIPILE_DSN && UNIPILE_API_KEY) {
      await fetch(`${UNIPILE_DSN}/api/v1/accounts/${business.unipile_account_id}`, {
        method: "DELETE",
        headers: { "X-API-KEY": UNIPILE_API_KEY },
      }).catch(() => {});
    }

    // Clear DB fields
    const { error } = await supabase
      .from("bookbot_businesses")
      .update({
        unipile_account_id: null,
        unipile_enabled: false,
        unipile_connected_at: null,
        unipile_provider: null,
      })
      .eq("id", businessId);

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la deconnexion" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Unipile disconnect error", {
      action: "unipile_disconnect",
      error: String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 4: Commit**

```bash
git add src/app/api/unipile/
git commit -m "feat(vea): add Unipile connect/callback/disconnect API endpoints"
```

---

### Task 6: Register Webhook in Unipile

**Files:** None (API call only)

**Step 1: Register the webhook URL in Unipile**

```bash
curl -X POST "https://api24.unipile.com:15416/api/v1/webhooks" \
  -H "X-API-KEY: Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04=" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://vea.pacifikai.com/api/webhook/unipile",
    "events": ["message_received"],
    "active": true
  }'
```

**Step 2: Verify webhook is registered**

```bash
curl -X GET "https://api24.unipile.com:15416/api/v1/webhooks" \
  -H "X-API-KEY: Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04="
```

Expected: Array with our webhook URL listed, status active.

---

### Task 7: Dashboard UI — Unipile Card

**Files:**
- Modify: `dashboard/src/hooks/useChannels.ts` (add Unipile hooks)
- Modify: `dashboard/src/app/channels/page.tsx` (add Unipile card)

**Step 1: Add Unipile types and hooks to useChannels.ts**

Add after the existing types and hooks:

```typescript
// ─── Unipile Types ─────────────────────────────────────────────────────────

export interface UnipileConnection {
  accountId: string | null;
  enabled: boolean;
  connectedAt: string | null;
  provider: string | null;
}

// ─── Unipile Hooks ─────────────────────────────────────────────────────────

async function fetchUnipileStatus(businessId: string): Promise<UnipileConnection | null> {
  const { data, error } = await supabase
    .from('bookbot_businesses')
    .select('unipile_account_id, unipile_enabled, unipile_connected_at, unipile_provider')
    .eq('id', businessId)
    .single();

  if (error || !data) return null;

  return {
    accountId: data.unipile_account_id,
    enabled: data.unipile_enabled ?? false,
    connectedAt: data.unipile_connected_at,
    provider: data.unipile_provider,
  };
}

export function useUnipileStatus(businessId: string | null) {
  return useQuery({
    queryKey: ['unipile', 'status', businessId],
    queryFn: () => fetchUnipileStatus(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useConnectUnipile(businessId: string | null) {
  return useMutation({
    mutationFn: async (provider: 'MESSENGER' | 'INSTAGRAM' = 'MESSENGER') => {
      const res = await fetch('/api/unipile/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate connect link');
      return data as { url: string };
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la connexion Unipile');
    },
  });
}

export function useDisconnectUnipile(businessId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/unipile/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to disconnect');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unipile', 'status', businessId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la deconnexion Unipile');
    },
  });
}
```

**Step 2: Add Unipile card to channels page**

In `dashboard/src/app/channels/page.tsx`, add imports at the top:

```typescript
import {
  useUnipileStatus,
  useConnectUnipile,
  useDisconnectUnipile,
} from '@/hooks/useChannels';
```

Add the `UnipileCard` component (before the `ChannelsPage` export):

```typescript
// ─── Unipile Card (Messenger/Instagram via proxy) ──────────────────────────

function UnipileCard({ businessId }: { businessId: string }) {
  const { data: status, isLoading } = useUnipileStatus(businessId);
  const connectUnipile = useConnectUnipile(businessId);
  const disconnectUnipile = useDisconnectUnipile(businessId);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle OAuth callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('unipile_connected') === 'true') {
      setSuccessMsg('Messenger/Instagram connecte via Unipile !');
      window.history.replaceState({}, '', '/channels');
    }
    const unipileError = params.get('unipile_error');
    if (unipileError) {
      setSuccessMsg('');
      window.history.replaceState({}, '', '/channels');
    }
  }, []);

  async function handleConnect(provider: 'MESSENGER' | 'INSTAGRAM') {
    const result = await connectUnipile.mutateAsync(provider);
    if (result?.url) {
      window.location.href = result.url;
    }
  }

  if (isLoading) return <SkeletonCard />;

  const isConnected = status?.enabled && status?.accountId;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10">
            <Plug size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Messenger & Instagram
              <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                via Unipile
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Connexion rapide sans validation Meta — ideal pour demarrer
            </p>
          </div>
        </div>
        {isConnected && (
          <span className="flex items-center gap-2 text-sm text-[#25D366]">
            <CheckCircle2 size={18} />
            Connecte
          </span>
        )}
      </div>

      {/* Success */}
      {successMsg && (
        <div className="mb-4 p-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={16} className="text-[#25D366] shrink-0 mt-0.5" />
          <p className="text-xs text-[#25D366]">{successMsg}</p>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-3">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Compte Unipile</p>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {status.accountId}</p>
              </div>
              <div className="flex items-center gap-2">
                {(status.provider === 'MESSENGER' || !status.provider) && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#0084FF]/10 text-[#0084FF]">
                    Messenger
                  </span>
                )}
                {(status.provider === 'INSTAGRAM' || status.provider?.includes('INSTAGRAM')) && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#E4405F]/10 text-[#E4405F]">
                    Instagram
                  </span>
                )}
              </div>
            </div>
            {status.connectedAt && (
              <p className="text-xs text-gray-600 mt-2">
                Connecte le {new Date(status.connectedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          <button
            onClick={() => disconnectUnipile.mutate()}
            disabled={disconnectUnipile.isPending}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition disabled:opacity-40"
          >
            {disconnectUnipile.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            Deconnecter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => handleConnect('MESSENGER')}
            disabled={connectUnipile.isPending}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#1877F2' }}
          >
            {connectUnipile.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Connecter Messenger
          </button>
          <button
            onClick={() => handleConnect('INSTAGRAM')}
            disabled={connectUnipile.isPending}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium text-white rounded-lg transition hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
          >
            {connectUnipile.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Instagram size={18} />
            )}
            Connecter Instagram
          </button>
          <p className="text-xs text-gray-600 text-center">
            Connexion en 30 secondes — aucune validation Meta requise
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Insert UnipileCard in the page layout**

In the `ChannelsPage` component, add the Unipile card after the Google Calendar section and BEFORE the Facebook card:

```tsx
{/* Unipile — Messenger/Instagram proxy (no App Review) */}
{businessId && <UnipileCard businessId={businessId} />}

{/* Messenger & Instagram — OAuth direct (needs App Review) */}
{businessId && (
  <FacebookConnectedCard
    businessId={businessId}
    dashboardUrl={dashboardUrl}
  />
)}
```

**Step 4: Commit**

```bash
git add src/hooks/useChannels.ts src/app/channels/page.tsx
git commit -m "feat(vea): add Unipile card in channels dashboard UI"
```

---

### Task 8: Deploy & Register Webhook

**Step 1: Build**

```bash
cd "PACIFIK'AI/solutions/bookflow/dashboard"
npm run build
```

**Step 2: Deploy to Vercel**

```bash
vercel --prod --yes
```

**Step 3: Register Unipile webhook (Task 6)**

```bash
curl -X POST "https://api24.unipile.com:15416/api/v1/webhooks" \
  -H "X-API-KEY: Gw3alu6u.eJmzlfhP4AsA7nkd+bJ9qm5PrmPuXkHkDg5jxx/Mn04=" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://vea.pacifikai.com/api/webhook/unipile","events":["message_received"],"active":true}'
```

**Step 4: Deploy Trigger.dev tasks**

```bash
cd "PACIFIK'AI/solutions/bookflow/trigger"
npx trigger.dev@latest deploy
```

**Step 5: Smoke test**

```bash
# Test webhook endpoint accepts POST
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://vea.pacifikai.com/api/webhook/unipile" \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{}}'
# Expected: 400 (invalid payload — correct, endpoint is live)

# Test connect endpoint requires auth
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://vea.pacifikai.com/api/unipile/connect" \
  -H "Content-Type: application/json" \
  -d '{"businessId":"00000000-0000-0000-0000-000000000000"}'
# Expected: 401 (unauthorized — correct)
```

---

### Task 9: End-to-End Test

**Step 1: Connect a test Facebook page via Unipile**

1. Go to `vea.pacifikai.com/channels`
2. Click "Connecter Messenger" in the Unipile card
3. Complete the Hosted Auth flow (login to Facebook, select page)
4. Verify the card shows "Connecte" with the account ID

**Step 2: Send a test message**

1. From a personal Facebook account, send a DM to the connected Page
2. Check Supabase `bookbot_webhook_events` table for a new `unipile_messenger` event
3. Check Trigger.dev dashboard for a `bookbot-whatsapp-handler` run
4. Verify the chatbot responds via Unipile → Messenger

**Step 3: Verify disconnect**

1. Click "Deconnecter" in the Unipile card
2. Verify `unipile_account_id` is null in `bookbot_businesses`
3. Verify the card shows connect buttons again

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Env vars | `.env.local`, Vercel, Trigger.dev |
| 2 | DB migration | SQL via Supabase MCP |
| 3 | Webhook endpoint | `api/webhook/unipile/route.ts` (new) |
| 4 | Send function | `trigger/src/lib/whatsapp.ts` (modify) |
| 5 | Connect/callback/disconnect | `api/unipile/connect/`, `callback/`, `disconnect/` (new) |
| 6 | Register webhook | Unipile API call |
| 7 | Dashboard UI | `channels/page.tsx` + `useChannels.ts` (modify) |
| 8 | Deploy & smoke test | Vercel + Trigger.dev |
| 9 | E2E test | Manual via real Facebook page |

**Total new files:** 4
**Total modified files:** 3
**Estimated implementation time:** 9 tasks, each 2-10 minutes
