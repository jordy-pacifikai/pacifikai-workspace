'use client';

import { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Phone, Mail, Calendar, Star, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useClients, useClientHistory, useCreateClient } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Client } from '@/types/database';

// ─── Tag badge ───────────────────────────────────────────────────────────────

const TAG_COLORS: string[] = [
  'bg-violet-900/60 text-violet-300 border-violet-700',
  'bg-blue-900/60 text-blue-300 border-blue-700',
  'bg-amber-900/60 text-amber-300 border-amber-700',
  'bg-rose-900/60 text-rose-300 border-rose-700',
  'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  'bg-pink-900/60 text-pink-300 border-pink-700',
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs border', tagColor(tag))}>
      {tag}
    </span>
  );
}

// ─── Client row expanded panel ────────────────────────────────────────────────

function ClientExpandedPanel({ clientPhone }: { clientPhone: string | null }) {
  const { data: history, isLoading } = useClientHistory(clientPhone);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <p className="px-6 py-4 text-sm text-gray-500 italic">Aucun rendez-vous enregistre.</p>
    );
  }

  return (
    <div className="px-6 py-4 space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Historique des rendez-vous
      </p>
      {history.map((appt) => (
        <div
          key={appt.id}
          className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-300">
              {appt.appointment_date
                ? `${format(new Date(appt.appointment_date), 'd MMM yyyy', { locale: fr })}${appt.time_slot ? ` - ${appt.time_slot.slice(0, 5)}` : ''}`
                : '—'}
            </span>
            {appt.service != null && (
              <span className="text-sm text-gray-400">{appt.service}</span>
            )}
          </div>
          {appt.status && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                appt.status === 'completed' && 'bg-emerald-900/50 text-emerald-400',
                appt.status === 'confirmed' && 'bg-blue-900/50 text-blue-400',
                appt.status === 'cancelled' && 'bg-red-900/50 text-red-400',
                appt.status === 'no_show' && 'bg-amber-900/50 text-amber-400',
                appt.status === 'pending' && 'bg-gray-800 text-gray-400',
              )}
            >
              {appt.status === 'completed' && 'Termine'}
              {appt.status === 'confirmed' && 'Confirme'}
              {appt.status === 'cancelled' && 'Annule'}
              {appt.status === 'no_show' && 'No-show'}
              {appt.status === 'pending' && 'En attente'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Create client modal ──────────────────────────────────────────────────────

type CreateClientModalProps = {
  businessId: string;
  onClose: () => void;
};

function CreateClientModal({ businessId, onClose }: CreateClientModalProps) {
  const { mutate: createClient, isPending } = useCreateClient(businessId);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    tags: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createClient(
      { name: form.name, phone: form.phone || undefined, email: form.email || undefined, notes: form.notes || undefined, tags: tags.length ? tags : undefined },
      { onSuccess: () => onClose() },
    );
  }

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-lg px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Nouveau client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nom *</label>
            <input
              className={inputClass}
              placeholder="Jean Dupont"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Telephone</label>
              <input
                className={inputClass}
                placeholder="+689 87 00 00 00"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="jean@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tags (separes par virgule)</label>
            <input
              className={inputClass}
              placeholder="VIP, Regulier, Abonne"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Notes internes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="flex-1 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creation...' : 'Creer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { businessId, businessName } = useAppStore();
  const { data: clients, isLoading } = useClients(businessId);

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = (clients ?? []).filter((c: Client) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    );
  });

  function toggleRow(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <DashboardLayout title="Clients" businessName={businessName ?? undefined}>
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-lg pl-9 pr-3 py-2 text-sm"
              placeholder="Rechercher par nom, telephone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </button>
        </div>

        {/* Count */}
        {!isLoading && (
          <p className="text-sm text-gray-400">
            <span className="text-white font-medium">{filtered.length}</span>
            {search ? ` resultat${filtered.length !== 1 ? 's' : ''} pour "${search}"` : ` client${filtered.length !== 1 ? 's' : ''} au total`}
          </p>
        )}

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_80px_100px_130px_1fr] gap-4 px-6 py-3 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Nom</span>
            <span>Telephone</span>
            <span>Email</span>
            <span>Visites</span>
            <span>Fidelite</span>
            <span>Derniere visite</span>
            <span>Tags</span>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="divide-y divide-gray-800">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <SkeletonRow />
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          {!isLoading && filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-500 text-sm">
                {search ? 'Aucun client ne correspond a votre recherche.' : 'Aucun client enregistre.'}
              </p>
            </div>
          )}

          {!isLoading && filtered.map((client: Client) => (
            <div key={client.id} className="divide-y divide-gray-800/50">
              {/* Main row */}
              <button
                type="button"
                onClick={() => toggleRow(client.id)}
                className="w-full text-left hover:bg-gray-800/40 transition-colors"
              >
                <div className="grid md:grid-cols-[2fr_1.5fr_1.5fr_80px_100px_130px_1fr] gap-4 px-6 py-4 items-center">
                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] text-sm font-semibold shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium text-sm truncate">{client.name}</span>
                    {expandedId === client.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-300 min-w-0">
                    {client.phone ? (
                      <>
                        <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-300 min-w-0">
                    {client.email ? (
                      <>
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </div>

                  {/* Visits */}
                  <span className="text-sm text-gray-300 font-medium">
                    {client.total_visits ?? 0}
                  </span>

                  {/* Loyalty */}
                  <div className="flex items-center gap-1 text-sm text-amber-400">
                    <Star className="w-3.5 h-3.5" />
                    <span>{client.loyalty_points ?? 0} pts</span>
                  </div>

                  {/* Last visit */}
                  <span className="text-sm text-gray-400">
                    {client.last_visit_at
                      ? format(new Date(client.last_visit_at), 'd MMM yyyy', { locale: fr })
                      : <span className="text-gray-600">Jamais</span>}
                  </span>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {(client.tags ?? []).map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === client.id && (
                <div className="bg-gray-900/50 border-t border-gray-800/50">
                  {/* Client meta */}
                  <div className="px-6 pt-4 grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Total depense</p>
                      <p className="text-white font-medium">
                        {client.total_spent != null
                          ? `${client.total_spent.toLocaleString('fr-FR')} XPF`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">No-shows</p>
                      <p className="text-white font-medium">{client.no_show_count ?? 0}</p>
                    </div>
                    {client.notes && (
                      <div className="sm:col-span-1">
                        <p className="text-gray-500 text-xs mb-0.5">Notes</p>
                        <p className="text-gray-300">{client.notes}</p>
                      </div>
                    )}
                  </div>
                  <ClientExpandedPanel clientPhone={client.phone ?? null} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showModal && businessId && (
        <CreateClientModal businessId={businessId} onClose={() => setShowModal(false)} />
      )}
    </DashboardLayout>
  );
}
