'use client';

import { useMemo } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import type { Appointment } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

type InsightType = 'success' | 'warning' | 'info';

interface Insight {
  type: InsightType;
  icon: React.ElementType;
  text: string;
}

interface SmartInsightsProps {
  appointments: Appointment[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function groupBy<T>(items: T[], keyFn: (item: T) => string | number): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = String(keyFn(item));
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function maxEntry(grouped: Record<string, unknown[]>): [string, number] | null {
  let best: [string, number] | null = null;
  for (const [key, arr] of Object.entries(grouped)) {
    if (!best || arr.length > best[1]) best = [key, arr.length];
  }
  return best;
}

function minEntry(grouped: Record<string, unknown[]>): [string, number] | null {
  let best: [string, number] | null = null;
  for (const [key, arr] of Object.entries(grouped)) {
    if (!best || arr.length < best[1]) best = [key, arr.length];
  }
  return best;
}

// ─── Insight generator ───────────────────────────────────────────────────────

function generateInsights(appointments: Appointment[]): Insight[] {
  if (!appointments || appointments.length === 0) return [];

  const insights: Insight[] = [];

  // 1. Jour le plus charge
  const byDay = groupBy(appointments, (a) => new Date(a.appointment_date).getDay());
  const busiest = maxEntry(byDay);
  if (busiest) {
    const dayName = DAY_NAMES[Number(busiest[0])] ?? busiest[0];
    insights.push({
      type: 'info',
      icon: Star,
      text: `Votre jour le plus charge est le ${dayName} (${busiest[1]} RDV).`,
    });
  }

  // 2. Taux de no-show
  const noShowCount = appointments.filter((a) => a.status === 'no_show').length;
  const noShowRate = noShowCount / appointments.length;
  if (noShowRate > 0.15) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      text: `Taux de no-show eleve (${Math.round(noShowRate * 100)}%). Activez les rappels H-2.`,
    });
  } else if (noShowRate > 0 && noShowRate <= 0.05) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      text: `Excellent taux de no-show (${Math.round(noShowRate * 100)}%). Vos rappels fonctionnent !`,
    });
  }

  // 3. Creneau sous-utilise
  const byHour = groupBy(appointments, (a) => parseInt(a.time_slot, 10));
  // Only consider if we have at least 3 different hours to compare
  if (Object.keys(byHour).length >= 3) {
    const quiet = minEntry(byHour);
    if (quiet) {
      const hour = Number(quiet[0]);
      insights.push({
        type: 'info',
        icon: Lightbulb,
        text: `Vos creneaux de ${hour}h-${hour + 1}h sont peu remplis (${quiet[1]} RDV). Lancez une promo ?`,
      });
    }
  }

  // 4. Service star
  const byService = groupBy(
    appointments.filter((a) => a.service),
    (a) => a.service ?? 'Inconnu',
  );
  const topService = maxEntry(byService);
  if (topService && appointments.length > 0) {
    const pct = Math.round((topService[1] / appointments.length) * 100);
    insights.push({
      type: 'success',
      icon: Star,
      text: `${topService[0]} represente ${pct}% de vos reservations (${topService[1]} RDV).`,
    });
  }

  // 5. Tendance mois en cours vs mois precedent
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = appointments.filter((a) => {
    const d = new Date(a.appointment_date);
    return d >= thisMonthStart;
  });
  const lastMonth = appointments.filter((a) => {
    const d = new Date(a.appointment_date);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });

  if (lastMonth.length > 0 && thisMonth.length > lastMonth.length * 1.1) {
    const growth = Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100);
    insights.push({
      type: 'success',
      icon: TrendingUp,
      text: `+${growth}% de RDV vs le mois dernier ! La tendance est bonne.`,
    });
  } else if (lastMonth.length > 0 && thisMonth.length < lastMonth.length * 0.9) {
    const drop = Math.round(((lastMonth.length - thisMonth.length) / lastMonth.length) * 100);
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      text: `-${drop}% de RDV vs le mois dernier. Pensez a relancer vos clients.`,
    });
  }

  return insights.slice(0, 4);
}

// ─── Style config ────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<InsightType, { bg: string; border: string; iconColor: string }> = {
  success: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  info: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SmartInsights({ appointments }: SmartInsightsProps) {
  const insights = useMemo(() => generateInsights(appointments), [appointments]);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {insights.map((insight, idx) => {
        const style = TYPE_STYLES[insight.type];
        const Icon = insight.icon;
        return (
          <div
            key={idx}
            className={`${style.bg} ${style.border} border rounded-xl px-4 py-3.5 flex items-start gap-3`}
          >
            <div className="shrink-0 mt-0.5">
              <Icon className={`w-4.5 h-4.5 ${style.iconColor}`} />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
