import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface HealthCheck {
  status: "healthy" | "degraded" | "down";
  checks: {
    supabase: boolean;
  };
  timestamp: string;
}

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vea.pacifikai.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, max-age=0",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const result: HealthCheck = {
    status: "healthy",
    checks: {
      supabase: false,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const supabase = supabaseAdmin();
    const TIMEOUT = 3_000; // 3s max per check

    const withTimeout = <T>(p: PromiseLike<T>): Promise<T> =>
      Promise.race([
        Promise.resolve(p),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), TIMEOUT),
        ),
      ]);

    // Check: Supabase connectivity (simple select)
    const { error: selectError } = await withTimeout(
      supabase.from("bookbot_businesses").select("id").limit(1),
    );
    result.checks.supabase = !selectError;

    if (!result.checks.supabase) {
      result.status = "down";
    }
  } catch {
    result.status = "down";
  }

  return NextResponse.json(result, {
    status: result.status === "down" ? 503 : 200,
    headers: CORS_HEADERS,
  });
}
