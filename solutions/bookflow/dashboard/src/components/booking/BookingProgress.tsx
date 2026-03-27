'use client';

// ─── BookingProgress ─────────────────────────────────────────────────────────
// Compact 3-step progress indicator for the public booking page.
// Steps: Service → Date & Heure → Vos infos
// Active step = green (#25D366). Completed = checkmark.
// ─────────────────────────────────────────────────────────────────────────────

interface BookingProgressProps {
  /** 0-based index of the current step (0=service, 1=date+time, 2=info) */
  currentStep: number;
  accent?: string;
}

const STEPS = ['Service', 'Date & Heure', 'Vos infos'];

export default function BookingProgress({ currentStep, accent = '#25D366' }: BookingProgressProps) {
  return (
    <div
      className="flex items-center justify-center gap-0 px-2 py-3"
      role="progressbar"
      aria-label="Progression de la réservation"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-valuetext={`Étape ${currentStep + 1} sur ${STEPS.length} : ${STEPS[currentStep]}`}
    >
      {STEPS.map((label, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* Step bubble + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                style={{
                  backgroundColor: isDone || isActive ? accent : '#e5e7eb',
                  color: isDone || isActive ? '#000' : '#9ca3af',
                }}
                aria-label={
                  isDone
                    ? `${label} — complété`
                    : isActive
                    ? `${label} — en cours`
                    : label
                }
              >
                {isDone ? (
                  // Checkmark
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>

              <span
                className="text-[10px] font-medium whitespace-nowrap transition-colors duration-200"
                style={{
                  color: isDone || isActive ? accent : '#9ca3af',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="w-8 h-0.5 mx-1 mb-4 transition-all duration-300"
                aria-hidden="true"
                style={{
                  backgroundColor: isDone ? accent : '#e5e7eb',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
