"use client";

import { useEffect, useState, useCallback } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface HealthData {
  status: "healthy" | "degraded" | "down";
  checks: {
    supabase: boolean;
    lastConversation: string | null;
    lastAppointment: string | null;
  };
  timestamp: string;
}

interface Indicator {
  label: string;
  status: "operational" | "degraded" | "down" | "loading";
  detail: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "a l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function dotColor(status: Indicator["status"]): string {
  switch (status) {
    case "operational":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "down":
      return "bg-red-500";
    case "loading":
      return "bg-gray-300 animate-pulse";
  }
}

function statusLabel(status: Indicator["status"]): string {
  switch (status) {
    case "operational":
      return "Operationnel";
    case "degraded":
      return "Degrade";
    case "down":
      return "Hors ligne";
    case "loading":
      return "Verification...";
  }
}

function overallBanner(indicators: Indicator[]): {
  text: string;
  bg: string;
  border: string;
} {
  const hasDown = indicators.some((i) => i.status === "down");
  const hasDegraded = indicators.some((i) => i.status === "degraded");
  const isLoading = indicators.some((i) => i.status === "loading");

  if (isLoading) {
    return {
      text: "Verification en cours...",
      bg: "bg-gray-50",
      border: "border-gray-200",
    };
  }
  if (hasDown) {
    return {
      text: "Incident en cours",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  }
  if (hasDegraded) {
    return {
      text: "Performance degradee",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  }
  return {
    text: "Tous les systemes sont operationnels",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  };
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data: HealthData = await res.json();
      setHealth(data);
      setLastCheck(new Date().toISOString());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  /* Build indicators from health data */
  const indicators: Indicator[] = (() => {
    if (!health && !error) {
      return [
        { label: "Systeme", status: "loading", detail: "" },
        { label: "WhatsApp", status: "loading", detail: "" },
        { label: "Reservations", status: "loading", detail: "" },
      ];
    }

    if (error || !health) {
      return [
        { label: "Systeme", status: "down", detail: "Impossible de joindre le serveur" },
        { label: "WhatsApp", status: "down", detail: "Verification impossible" },
        { label: "Reservations", status: "down", detail: "Verification impossible" },
      ];
    }

    const systemStatus: Indicator["status"] = health.checks.supabase
      ? health.status === "healthy"
        ? "operational"
        : "degraded"
      : "down";

    const whatsappStatus: Indicator["status"] = (() => {
      if (!health.checks.lastConversation) return "degraded";
      const age = Date.now() - new Date(health.checks.lastConversation).getTime();
      if (age < 24 * 60 * 60 * 1000) return "operational";
      if (age < 72 * 60 * 60 * 1000) return "degraded";
      return "down";
    })();

    const bookingStatus: Indicator["status"] = (() => {
      if (!health.checks.lastAppointment) return "degraded";
      const age = Date.now() - new Date(health.checks.lastAppointment).getTime();
      if (age < 24 * 60 * 60 * 1000) return "operational";
      if (age < 72 * 60 * 60 * 1000) return "degraded";
      return "down";
    })();

    return [
      {
        label: "Systeme",
        status: systemStatus,
        detail: health.checks.supabase
          ? "Base de donnees connectee"
          : "Base de donnees inaccessible",
      },
      {
        label: "WhatsApp",
        status: whatsappStatus,
        detail: health.checks.lastConversation
          ? `Derniere conversation: ${timeAgo(health.checks.lastConversation)}`
          : "Aucune conversation recente",
      },
      {
        label: "Reservations",
        status: bookingStatus,
        detail: health.checks.lastAppointment
          ? `Derniere reservation: ${timeAgo(health.checks.lastAppointment)}`
          : "Aucune reservation recente",
      },
    ];
  })();

  const banner = overallBanner(indicators);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: "#25D366" }}
            >
              V
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Ve&apos;a Status
            </h1>
          </div>
          {lastCheck && (
            <span className="text-xs text-gray-400">
              Mis a jour {timeAgo(lastCheck)}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Overall banner */}
        <div
          className={`rounded-xl border px-6 py-4 text-center font-medium ${banner.bg} ${banner.border}`}
        >
          {banner.text}
        </div>

        {/* Indicators */}
        <section className="space-y-3">
          {indicators.map((ind) => (
            <div
              key={ind.label}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor(ind.status)}`} />
                <span className="font-medium text-gray-800">{ind.label}</span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    ind.status === "operational"
                      ? "text-emerald-600"
                      : ind.status === "degraded"
                        ? "text-amber-600"
                        : ind.status === "down"
                          ? "text-red-600"
                          : "text-gray-400"
                  }`}
                >
                  {statusLabel(ind.status)}
                </span>
                {ind.detail && (
                  <p className="text-xs text-gray-400 mt-0.5">{ind.detail}</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Timeline section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Dernieres 24h
          </h2>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-5 py-4">
            {!health ? (
              <p className="text-sm text-gray-400">Chargement...</p>
            ) : (
              <div className="space-y-3">
                {health.checks.lastAppointment && (
                  <TimelineEntry
                    time={health.checks.lastAppointment}
                    label="Derniere reservation creee"
                    color="emerald"
                  />
                )}
                {health.checks.lastConversation && (
                  <TimelineEntry
                    time={health.checks.lastConversation}
                    label="Derniere conversation"
                    color="blue"
                  />
                )}
                {!health.checks.lastAppointment &&
                  !health.checks.lastConversation && (
                    <p className="text-sm text-gray-400">
                      Aucune activite dans les dernieres 24h
                    </p>
                  )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>
            Propulse par{" "}
            <a
              href="https://pacifikai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              PACIFIK&apos;AI
            </a>
          </span>
          <span>Actualisation automatique toutes les 30s</span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Timeline Entry ──────────────────────────────────────────────────────── */

function TimelineEntry({
  time,
  label,
  color,
}: {
  time: string;
  label: string;
  color: "emerald" | "blue" | "amber";
}) {
  const dotColors = {
    emerald: "bg-emerald-400",
    blue: "bg-blue-400",
    amber: "bg-amber-400",
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center mt-1.5">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="w-px h-full bg-gray-200 min-h-[16px]" />
      </div>
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{timeAgo(time)}</p>
      </div>
    </div>
  );
}
