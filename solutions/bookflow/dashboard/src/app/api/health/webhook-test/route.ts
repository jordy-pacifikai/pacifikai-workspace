import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { z } from 'zod';
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

type ChannelName = "whatsapp" | "messenger" | "instagram" | "chatbot" | "gcal";

interface ChannelStatus {
  channel: ChannelName;
  lastActivity: string | null;
  isActive: boolean;
}

interface WebhookTestResult {
  ok: boolean;
  channels: ChannelStatus[];
  totalAppointments24h: number;
  totalConversations24h: number;
  timestamp: string;
}

const CHANNELS: ChannelName[] = ["whatsapp", "messenger", "instagram", "chatbot", "gcal"];

const bodySchema = z.object({
  secret: z.string().optional(),
}).passthrough();

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`webhook-test:${ip}`, { interval: 60_000, limit: 10 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Verify secret
  const secret = process.env.HEALTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "HEALTH_SECRET not configured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  const body = parsed.success ? parsed.data : {};
  const providedSecret = authHeader?.replace("Bearer ", "") ?? body.secret;

  if (typeof providedSecret !== 'string' || providedSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = supabaseAdmin();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Get last activity per channel (parallel instead of sequential N+1)
    const channelResults = await Promise.all(
      CHANNELS.map((channel) =>
        supabase
          .from("bookbot_appointments")
          .select("created_at")
          .eq("source", channel)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      )
    );

    const channelStatuses: ChannelStatus[] = CHANNELS.map((channel, i) => {
      const lastActivity = channelResults[i]?.data?.created_at ?? null;
      const isActive = lastActivity
        ? new Date(lastActivity).getTime() > new Date(twentyFourHoursAgo).getTime()
        : false;
      return { channel, lastActivity, isActive };
    });

    // Count appointments in last 24h
    const { count: apptCount } = await supabase
      .from("bookbot_appointments")
      .select("id", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo);

    // Count conversations in last 24h
    const { count: convoCount } = await supabase
      .from("bookbot_conversations")
      .select("id", { count: "exact", head: true })
      .gte("updated_at", twentyFourHoursAgo);

    const result: WebhookTestResult = {
      ok: true,
      channels: channelStatuses,
      totalAppointments24h: apptCount ?? 0,
      totalConversations24h: convoCount ?? 0,
      timestamp: now.toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    logger.error('Webhook test error', { action: 'health_webhook_test', error: String(err) });
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 },
    );
  }
}
