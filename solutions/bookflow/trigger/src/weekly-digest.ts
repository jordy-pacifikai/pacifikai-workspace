import { logger } from "@trigger.dev/sdk";
import { supaHeaders } from "./lib/supabase-headers.js";
import { sendBrevoEmail } from "./lib/brevo.js";
import { escapeHtml } from "./utils/html.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface DigestBusiness {
  id: string;
  name: string;
  email: string | null;
  timezone: string | null;
}

interface AppointmentRow {
  service: string;
  status: string;
  price: number | null;
  appointment_date: string;
}

interface WeekStats {
  rdv_count: number;
  revenue: number;
  completion_rate: number | null;
  top_service: string | null;
}

/**
 * Weekly digest logic — callable from trial-expiration (Monday check).
 * Previously a standalone schedules.task("weekly-digest", cron: "0 18 * * 1").
 * Merged into trial-expiration to free a Trigger.dev schedule slot.
 */
export async function runWeeklyDigest(runAt?: Date): Promise<{ sent: number; skipped: number; weekStart?: string; weekEnd?: string }> {
    const effectiveRunAt = runAt ?? new Date();

    // Week range: last Monday 00:00 to last Sunday 23:59 (Tahiti time = UTC-10)
    // runAt is Monday. "Last week" = the 7 days ending yesterday (Sunday).
    const runDay = new Date(effectiveRunAt);
    // Go back 7 days to get last Monday (start of last week)
    const lastMonday = new Date(runDay);
    lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
    lastMonday.setUTCHours(10, 0, 0, 0); // Monday 00:00 Tahiti = Monday 10:00 UTC

    // Last Sunday = last Monday + 6 days at 23:59 Tahiti = +6 days at 09:59 UTC next day
    const lastSunday = new Date(lastMonday);
    lastSunday.setUTCDate(lastSunday.getUTCDate() + 6);
    lastSunday.setUTCHours(9, 59, 59, 999); // Sunday 23:59:59 Tahiti = Monday 09:59:59 UTC

    // ISO date strings (YYYY-MM-DD) in Tahiti timezone for the range
    const weekStart = toTahitiDate(lastMonday); // YYYY-MM-DD
    const weekEnd = toTahitiDate(lastSunday);   // YYYY-MM-DD

    const labelStart = formatFrDate(lastMonday);
    const labelEnd = formatFrDate(lastSunday);

    logger.info(`Weekly digest: fetching businesses`, { weekStart, weekEnd });

    // 1. Get all businesses with digest_email = true and a contact email
    const bizRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookbot_businesses?digest_email=eq.true&email=not.is.null&select=id,name,email,timezone`,
      { headers: supaHeaders() }
    );
    const businesses: DigestBusiness[] = await bizRes.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      logger.info("No businesses opted in for digest");
      return { sent: 0, skipped: 0 };
    }

    logger.info(`Sending digest to ${businesses.length} businesses`, { weekStart, weekEnd });

    let sent = 0;
    let skipped = 0;

    for (const biz of businesses) {
      if (!biz.email) { skipped++; continue; }

      try {
        const stats = await fetchWeekStats(biz.id, weekStart, weekEnd);
        await sendDigestEmail(biz, stats, labelStart, labelEnd);
        sent++;
        logger.info(`Digest sent to ${biz.email}`, { businessId: biz.id, stats });
      } catch (err) {
        skipped++;
        logger.error(`Failed to send digest for business ${biz.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info(`Weekly digest complete: ${sent} sent, ${skipped} skipped`);
    return { sent, skipped, weekStart, weekEnd };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

async function fetchWeekStats(businessId: string, weekStart: string, weekEnd: string): Promise<WeekStats> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookbot_appointments?business_id=eq.${businessId}&appointment_date=gte.${weekStart}&appointment_date=lte.${weekEnd}&status=neq.cancelled&select=service,status,price,appointment_date`,
    { headers: supaHeaders() }
  );
  const rows: AppointmentRow[] = await res.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return { rdv_count: 0, revenue: 0, completion_rate: null, top_service: null };
  }

  // rdv_count: all non-cancelled
  const rdv_count = rows.length;

  // revenue: sum of price where status = completed
  const completed = rows.filter((r) => r.status === "completed");
  const revenue = completed.reduce((sum, r) => sum + (r.price ?? 0), 0);

  // completion_rate: completed / (completed + no_show) * 100
  const noShows = rows.filter((r) => r.status === "no_show");
  const completion_rate =
    completed.length + noShows.length > 0
      ? Math.round((completed.length / (completed.length + noShows.length)) * 100)
      : null;

  // Top service: most booked
  const serviceCounts: Record<string, number> = {};
  for (const r of rows) {
    if (r.service) {
      serviceCounts[r.service] = (serviceCounts[r.service] ?? 0) + 1;
    }
  }
  const top_service =
    Object.keys(serviceCounts).length > 0
      ? (Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null)
      : null;

  return { rdv_count, revenue, completion_rate, top_service };
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendDigestEmail(
  biz: DigestBusiness,
  stats: WeekStats,
  labelStart: string,
  labelEnd: string
): Promise<void> {
  const subject = `Ve'a — Votre semaine du ${labelStart} au ${labelEnd}`;
  const htmlContent = buildEmailHtml(biz.name, stats, labelStart, labelEnd);

  await sendBrevoEmail({
    to: [{ email: biz.email! }],
    subject,
    htmlContent,
    headers: {
      "List-Unsubscribe": "<https://vea.pacifikai.com/dashboard/settings>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

function buildEmailHtml(businessName: string, stats: WeekStats, labelStart: string, labelEnd: string): string {
  const accent = "#25D366";
  const completionRow =
    stats.completion_rate !== null
      ? `<tr>
          <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#aaa;font-size:14px;">Taux de completion</td>
          <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:600;color:#fff;">${stats.completion_rate}%</td>
        </tr>`
      : "";

  const topServiceRow =
    stats.top_service
      ? `<tr>
          <td style="padding:10px 16px;color:#aaa;font-size:14px;">Service top</td>
          <td style="padding:10px 16px;text-align:right;font-size:14px;font-weight:600;color:#fff;">${escapeHtml(stats.top_service)}</td>
        </tr>`
      : "";

  const noActivity =
    stats.rdv_count === 0
      ? `<p style="color:#aaa;font-size:14px;margin:24px 0;">Aucun rendez-vous cette semaine.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#fff;">Ve&apos;a</p>
            <p style="margin:0;font-size:14px;color:#aaa;">Rapport hebdomadaire</p>
          </td>
        </tr>

        <!-- Period banner -->
        <tr>
          <td style="background:${accent};padding:12px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#fff;text-align:center;">
              Semaine du ${labelStart} au ${labelEnd}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:none;padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#fff;">
              Bonjour <strong>${escapeHtml(businessName)}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
              Voici le resume de votre activite sur Ve&apos;a pour la semaine ecoulee.
            </p>

            ${noActivity}

            ${stats.rdv_count > 0 ? `
            <!-- Stats table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#222;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#aaa;font-size:14px;">Rendez-vous pris</td>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:20px;font-weight:700;color:${accent};">${stats.rdv_count}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;color:#aaa;font-size:14px;">Chiffre d&apos;affaires</td>
                <td style="padding:10px 16px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:600;color:#fff;">${stats.revenue.toLocaleString("fr-FR")} XPF</td>
              </tr>
              ${completionRow}
              ${topServiceRow}
            </table>
            ` : ""}

            <!-- CTA -->
            <div style="text-align:center;margin-top:8px;">
              <a href="https://vea.pacifikai.com/dashboard" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                Voir le tableau de bord
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#161616;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#555;">
              Vous recevez ce mail car vous avez active le digest hebdomadaire dans vos parametres Ve&apos;a.
            </p>
            <p style="margin:0;font-size:12px;color:#555;">
              <a href="https://vea.pacifikai.com/dashboard/settings" style="color:${accent};text-decoration:none;">Se desabonner</a>
              &nbsp;|&nbsp;
              <a href="mailto:support@vea.pacifikai.com" style="color:#555;text-decoration:none;">support@vea.pacifikai.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD in Tahiti timezone (UTC-10) */
function toTahitiDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Pacific/Tahiti" });
}

/** Returns "lundi 17 mars 2026" style in French */
function formatFrDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    timeZone: "Pacific/Tahiti",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// escapeHtml imported from utils/html.ts
