'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface TourStep {
  title: string;
  description: string;
  targetSelector: string;
  position: 'right' | 'bottom' | 'left';
}

interface GuidedTourProps {
  businessId: string;
  onComplete: () => void;
}

// ─── Steps ──────────────────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
  {
    title: 'Bienvenue sur Ve\'a !',
    description: 'Commençons par ajouter vos services pour que vos clients puissent réserver.',
    targetSelector: 'a[href="/services"]',
    position: 'right',
  },
  {
    title: 'Définissez vos horaires',
    description: 'Configurez vos horaires d\'ouverture pour chaque jour de la semaine.',
    targetSelector: 'a[href="/hours"]',
    position: 'right',
  },
  {
    title: 'Partagez votre page',
    description: 'Dans les paramètres, retrouvez le lien de votre page de réservation à partager.',
    targetSelector: 'a[href="/settings"]',
    position: 'right',
  },
  {
    title: 'Testez votre chatbot',
    description: 'Essayez votre assistant IA en conditions réelles avant de le mettre en ligne.',
    targetSelector: 'a[href="/chat-test"]',
    position: 'right',
  },
  {
    title: 'C\'est parti !',
    description: 'Votre chatbot est prêt. Vos clients peuvent maintenant réserver via WhatsApp.',
    targetSelector: '',
    position: 'bottom',
  },
];

// ─── Spotlight rect helper ──────────────────────────────────────────────────────

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(selector: string): SpotlightRect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const pad = 6;
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

// ─── Tooltip position helper ────────────────────────────────────────────────────

function getTooltipStyle(
  rect: SpotlightRect | null,
  position: TourStep['position'],
): React.CSSProperties {
  // Final step (no target) — center the tooltip
  if (!rect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const gap = 14;

  switch (position) {
    case 'right':
      return {
        top: rect.top,
        left: rect.left + rect.width + gap,
      };
    case 'bottom':
      return {
        top: rect.top + rect.height + gap,
        left: rect.left,
      };
    case 'left':
      return {
        top: rect.top,
        left: rect.left - 320 - gap,
      };
    default:
      return {};
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function GuidedTour({ businessId, onComplete }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // ── Compute spotlight position ──────────────────────────────────────────────

  const updateRect = useCallback(() => {
    const rect = getTargetRect(current.targetSelector);
    setSpotlightRect(rect);
  }, [current.targetSelector]);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Update rect on step change + resize + scroll
  useEffect(() => {
    updateRect();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateRect]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const tooltipStyle = getTooltipStyle(spotlightRect, current.position);

  return (
    <div
      className="fixed inset-0 z-[200] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/70 z-[200]" onClick={handleSkip} />

      {/* Spotlight cutout (box-shadow trick) */}
      {spotlightRect && (
        <div
          className="fixed z-[201] rounded-lg pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.70)',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[202] w-80 animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={tooltipStyle}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-5">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Fermer le tour"
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.12)' }}
          >
            {isLast ? (
              <CheckCircle2 size={18} style={{ color: '#25D366' }} />
            ) : (
              <Sparkles size={18} style={{ color: '#25D366' }} />
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white mb-1.5">
            {current.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Footer: progress dots + actions */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: i === step ? '#25D366' : 'rgba(255,255,255,0.15)',
                    transform: i === step ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isLast && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Passer
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-950 transition-all hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: '#25D366' }}
              >
                {isLast ? 'Terminer' : 'Suivant'}
                {!isLast && <ArrowRight size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
