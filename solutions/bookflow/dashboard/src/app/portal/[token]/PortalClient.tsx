'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PortalAppointment {
  id: string;
  business_id: string;
  service: string | null;
  appointment_date: string;
  time_slot: string;
  end_time: string | null;
  status: string;
}

interface PortalClient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  loyalty_points?: number;
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
}

interface PortalData {
  client: PortalClient;
  businessName: string;
  businessId: string;
  accent: string;
  upcomingAppointments: PortalAppointment[];
  pastAppointments: PortalAppointment[];
  loyaltyEnabled: boolean;
  loyaltyTransactions: LoyaltyTransaction[];
  token: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatApptDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function statusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'confirmed': return { label: 'Confirmé', color: '#22c55e' };
    case 'pending':   return { label: 'En attente', color: '#f59e0b' };
    case 'cancelled': return { label: 'Annulé', color: '#ef4444' };
    case 'completed': return { label: 'Terminé', color: '#6b7280' };
    case 'no_show':   return { label: 'Absent', color: '#f97316' };
    default:          return { label: status, color: '#6b7280' };
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AppointmentCard({
  appt,
  accent,
  businessId,
  token,
  upcoming,
  onCancelRequest,
}: {
  appt: PortalAppointment;
  accent: string;
  businessId: string;
  token: string;
  upcoming: boolean;
  onCancelRequest?: (id: string) => void;
}) {
  const { label, color } = statusLabel(appt.status);
  const dateLabel = formatApptDate(appt.appointment_date);
  const startTime = formatTime(appt.time_slot);
  const endTime = appt.end_time ? formatTime(appt.end_time) : null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
      {/* Service + status */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white leading-tight">
          {appt.service ?? 'Rendez-vous'}
        </p>
        <span
          className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {label}
        </span>
      </div>

      {/* Date + time */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="capitalize">{dateLabel}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span>
          {startTime}{endTime ? ` — ${endTime}` : ''}
        </span>
      </div>

      {/* Actions — only for upcoming & non-cancelled */}
      {upcoming && appt.status !== 'cancelled' && (
        <div className="flex gap-2 pt-1">
          <Link
            href={`/book/${businessId}/reschedule?id=${appt.id}`}
            className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg border transition-colors"
            style={{ borderColor: `${accent}50`, color: accent }}
          >
            Reprogrammer
          </Link>
          <button
            onClick={() => onCancelRequest?.(appt.id)}
            className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

function CancelModal({
  appointmentId,
  token,
  accent,
  onConfirmed,
  onClose,
}: {
  appointmentId: string;
  token: string;
  accent: string;
  onConfirmed: (id: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, appointmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue');
        return;
      }
      onConfirmed(appointmentId);
      onClose();
    } catch {
      setError('Erreur réseau, réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 id="cancel-modal-title" className="text-base font-bold text-white">
              Annuler le rendez-vous
            </h2>
            <p className="text-sm text-gray-400">Cette action est irréversible.</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            Retour
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Annulation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = 'appointments' | 'profile' | 'loyalty';

function TabBar({
  active,
  onChange,
  accent,
  loyaltyEnabled,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  accent: string;
  loyaltyEnabled: boolean;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'appointments', label: 'Mes rendez-vous' },
    { id: 'profile', label: 'Mon profil' },
    ...(loyaltyEnabled ? [{ id: 'loyalty' as Tab, label: 'Mes points' }] : []),
  ];

  return (
    <div role="tablist" className="flex border-b border-gray-800 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className="shrink-0 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap"
          style={active === tab.id ? { color: accent } : { color: '#9ca3af' }}
        >
          {tab.label}
          {active === tab.id && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Portal Client Component ──────────────────────────────────────────────────

export default function PortalClient({ data }: { data: PortalData }) {
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());

  const { client, businessName, businessId, accent, token, loyaltyEnabled } = data;

  const upcoming = data.upcomingAppointments.filter((a) => !cancelledIds.has(a.id));
  const past = data.pastAppointments;

  const handleCancelConfirmed = (id: string) => {
    setCancelledIds((prev) => new Set(Array.from(prev).concat(id)));
  };

  const initials = (client.name ?? '')
    .split(' ')
    .map((p) => p[0] ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">Ve&#x02BB;a</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>
          <span className="text-sm text-gray-400 truncate max-w-[160px]">{businessName}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-16">

        {/* Client identity card */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">{client.name}</p>
              <p className="text-sm text-gray-400">{businessName}</p>
              {client.phone && (
                <p className="text-xs text-gray-500 mt-0.5">{client.phone}</p>
              )}
            </div>
            {loyaltyEnabled && (client.loyalty_points ?? 0) > 0 && (
              <div
                className="ml-auto shrink-0 flex flex-col items-center px-3 py-2 rounded-xl"
                style={{ backgroundColor: '#92400e20', border: '1px solid #92400e50' }}
              >
                <span className="text-lg font-black" style={{ color: '#fbbf24' }}>
                  {client.loyalty_points}
                </span>
                <span className="text-xs text-amber-500">points</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            accent={accent}
            loyaltyEnabled={loyaltyEnabled}
          />

          <div className="p-4">

            {/* ── Appointments tab ─────────────────────────────────────────── */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">

                {/* Upcoming */}
                <section>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    A venir ({upcoming.length})
                  </h2>
                  {upcoming.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      Aucun rendez-vous a venir.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appt={appt}
                          accent={accent}
                          businessId={businessId}
                          token={token}
                          upcoming={true}
                          onCancelRequest={(id) => setCancelTargetId(id)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Past */}
                <section>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Historique
                  </h2>
                  {past.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      Aucun rendez-vous passé.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {past.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appt={appt}
                          accent={accent}
                          businessId={businessId}
                          token={token}
                          upcoming={false}
                        />
                      ))}
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* ── Profile tab ──────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Informations personnelles
                </h2>

                <ProfileField label="Nom" value={client.name} />
                <ProfileField label="Téléphone" value={client.phone} />
                <ProfileField label="Email" value={client.email} />
                {client.birthday && (
                  <ProfileField
                    label="Date de naissance"
                    value={format(parseISO(client.birthday), 'd MMMM yyyy', { locale: fr })}
                  />
                )}

                <p className="text-xs text-gray-600 pt-2">
                  Pour modifier vos informations, contactez directement {businessName}.
                </p>
              </div>
            )}

            {/* ── Loyalty tab ──────────────────────────────────────────────── */}
            {activeTab === 'loyalty' && loyaltyEnabled && (
              <div className="space-y-5">

                {/* Balance hero */}
                <div
                  className="rounded-xl p-5 text-center"
                  style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}25` }}
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solde actuel</p>
                  <p className="text-4xl font-black" style={{ color: accent }}>
                    {client.loyalty_points ?? 0}
                  </p>
                  <p className="text-sm text-gray-400">points de fidélité</p>
                </div>

                {/* Transactions */}
                {data.loyaltyTransactions.length > 0 && (
                  <section>
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Historique des points
                    </h2>
                    <div className="space-y-2">
                      {data.loyaltyTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0"
                        >
                          <div>
                            <p className="text-sm text-gray-300">{tx.reason ?? 'Points ajoutés'}</p>
                            <p className="text-xs text-gray-600">
                              {format(parseISO(tx.created_at), 'd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: tx.points >= 0 ? '#22c55e' : '#ef4444' }}
                          >
                            {tx.points >= 0 ? '+' : ''}{tx.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {data.loyaltyTransactions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune transaction pour l&apos;instant.
                  </p>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Book new CTA */}
        <div className="mt-6">
          <Link
            href={`/book/${businessId}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: accent }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Prendre un nouveau rendez-vous
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 pt-2">
        <p className="text-xs text-gray-700">
          Propulsé par{' '}
          <a
            href="https://vea.pacifikai.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accent }}
            className="hover:opacity-80 transition-opacity"
          >
            Ve&#x02BB;a
          </a>
        </p>
      </footer>

      {/* Cancel modal */}
      {cancelTargetId && (
        <CancelModal
          appointmentId={cancelTargetId}
          token={token}
          accent={accent}
          onConfirmed={handleCancelConfirmed}
          onClose={() => setCancelTargetId(null)}
        />
      )}
    </>
  );
}

// ─── ProfileField ─────────────────────────────────────────────────────────────

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-white font-medium">{value ?? '—'}</span>
    </div>
  );
}
