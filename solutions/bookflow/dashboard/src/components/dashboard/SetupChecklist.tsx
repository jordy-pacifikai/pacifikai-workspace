'use client';

import { useState, useEffect, useCallback } from 'react';
import { Rocket, CheckCircle2, Circle, Hourglass, ArrowRight, X, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSetupProgress, type StepStatus } from '@/hooks/useSetupProgress';

// ─── Constants ─────────────────────────────────────────────────────────────────

const GREEN = '#25D366';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SetupChecklistProps {
  businessId: string | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SetupChecklist({ businessId }: SetupChecklistProps) {
  const { steps, isLoading, completedCount, totalCount, isComplete } = useSetupProgress(businessId);

  const dismissedKey = businessId ? `vea_setup_dismissed_${businessId}` : null;

  const [dismissed, setDismissed] = useState(false);
  // Compact mode: auto-collapse completed steps when more than 3 are done
  const [showCompleted, setShowCompleted] = useState(false);

  // Read localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (!dismissedKey) return;
    const raw = localStorage.getItem(dismissedKey);
    if (!raw) return;
    try {
      const { dismissedAt } = JSON.parse(raw) as { dismissedAt: number };
      if (Date.now() - dismissedAt < DISMISS_DURATION_MS) {
        setDismissed(true);
      } else {
        // Expired — clear
        localStorage.removeItem(dismissedKey);
      }
    } catch {
      localStorage.removeItem(dismissedKey);
    }
  }, [dismissedKey]);

  const handleDismiss = useCallback(() => {
    if (!dismissedKey) return;
    localStorage.setItem(dismissedKey, JSON.stringify({ dismissedAt: Date.now() }));
    setDismissed(true);
  }, [dismissedKey]);

  if (!businessId || dismissed) return null;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 bg-gray-800 rounded" />
            <div className="h-2.5 w-24 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full mb-5" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── All-done success banner ────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PartyPopper size={18} style={{ color: GREEN }} className="shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-400">
              Votre espace est prêt !
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Toutes les étapes de configuration sont complètes.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const progressPct = Math.round((completedCount / totalCount) * 100);
  const completedSteps = steps.filter((s) => s.completed);
  const pendingSteps = steps.filter((s) => !s.completed);
  const useCompactMode = completedCount > 3;

  // ── Checklist card ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
          >
            <Rocket size={16} style={{ color: GREEN }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-100 leading-none">
              Configuration de votre espace
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount}/{totalCount} étapes complétées
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-600 hover:text-gray-400 transition-colors"
          aria-label="Masquer"
          title="Masquer pendant 7 jours"
        >
          <X size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%`, backgroundColor: GREEN }}
          />
        </div>
      </div>

      {/* Pending steps */}
      <ul className="space-y-1">
        {pendingSteps.map((step) => (
          <li key={step.id}>
            <a
              href={step.href}
              className={cn(
                'flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-gray-800/60 group',
              )}
            >
              <StepStatusIcon status={step.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {step.label}
                  </span>
                  {step.status === 'in_progress' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                      en cours
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700 shrink-0">
                    {step.estimatedTime}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 mt-1"
              />
            </a>
          </li>
        ))}
      </ul>

      {/* Completed steps — collapsible in compact mode */}
      {completedSteps.length > 0 && (
        <div className="mt-1">
          {useCompactMode ? (
            <>
              <button
                type="button"
                onClick={() => setShowCompleted((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full"
              >
                {showCompleted ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
                {showCompleted
                  ? 'Masquer les étapes complètes'
                  : `${completedSteps.length} étape${completedSteps.length > 1 ? 's' : ''} complète${completedSteps.length > 1 ? 's' : ''}`}
              </button>

              {showCompleted && (
                <ul className="space-y-1 mt-1">
                  {completedSteps.map((step) => (
                    <CompletedStepRow key={step.id} label={step.label} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <ul className="space-y-1 mt-1">
              {completedSteps.map((step) => (
                <CompletedStepRow key={step.id} label={step.label} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Completed step row ────────────────────────────────────────────────────────

function CompletedStepRow({ label }: { label: string }) {
  return (
    <li>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
        <CheckCircle2 size={18} style={{ color: GREEN }} className="shrink-0" />
        <span className="text-sm text-gray-600 line-through">{label}</span>
      </div>
    </li>
  );
}

// ─── Step status icon ─────────────────────────────────────────────────────────

function StepStatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={18} style={{ color: GREEN }} className="shrink-0 mt-0.5" />;
    case 'in_progress':
      return <Hourglass size={18} className="text-orange-400 shrink-0 mt-0.5" />;
    case 'not_started':
    default:
      return <Circle size={18} className="text-gray-600 shrink-0 mt-0.5" />;
  }
}
