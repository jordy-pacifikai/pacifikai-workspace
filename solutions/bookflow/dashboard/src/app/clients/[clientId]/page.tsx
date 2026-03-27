'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, Calendar, Star, Cake, Tag, Link2, Copy, Check, Package, Plus, X, CheckCircle2, Clock, Trophy, Minus, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { TagEditor } from '@/components/clients/TagEditor';
import { ClientStatsCards, ClientStatsCardsSkeleton } from '@/components/clients/ClientStatsCards';
import { AppointmentTimeline } from '@/components/clients/AppointmentTimeline';
import { ClientNotes } from '@/components/clients/ClientNotes';
import { useClientStats } from '@/hooks/useClientStats';
import { SegmentBadges } from '@/components/clients/SegmentBadges';
import { getClientSegments } from '@/lib/segments';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Client } from '@/types/database';
import {
  useClientPackages,
  usePackages,
  useAssignPackage,
  type Package as PackageType,
  type ClientPackage,
} from '@/hooks/usePackages';
import { cn } from '@/lib/utils';
import {
  useClientLoyalty,
  useLoyaltyConfig,
  useAddLoyaltyPoints,
  type LoyaltyTransactionType,
} from '@/hooks/useLoyalty';

// ─── Portal Link Button ──────────────────────────────────────────────────────

function PortalLinkButton({ clientId }: { clientId: string }) {
  const [copied, setCopied] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchAndCopy() {
    setLoading(true);
    try {
      if (!portalUrl) {
        const res = await fetch(`/api/portal/token?clientId=${encodeURIComponent(clientId)}`);
        const data = await res.json();
        if (!res.ok) { toast.error('Erreur lors de la génération du lien'); return; }
        setPortalUrl(data.portalUrl);
        await navigator.clipboard.writeText(data.portalUrl);
      } else {
        await navigator.clipboard.writeText(portalUrl);
      }
      setCopied(true);
      toast.success('Lien portail copié');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={fetchAndCopy}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
      title="Copier le lien portail client"
    >
      <Link2 className="w-3.5 h-3.5" />
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Copié</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Lien portail client</span>
        </>
      )}
    </button>
  );
}


// ─── Assign Package Modal ─────────────────────────────────────────────────────

function AssignPackageModal({ businessId, clientId, packages, onClose }: {
  businessId: string;
  clientId: string;
  packages: PackageType[];
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string>('');
  const assignMutation = useAssignPackage();
  const activePackages = packages.filter((p) => p.is_active);
  const selected = activePackages.find((p) => p.id === selectedId);

  async function handleAssign() {
    if (!selected) return;
    try {
      await assignMutation.mutateAsync({ businessId, clientId, packageId: selected.id, pkg: selected });
      toast.success(`Forfait "${selected.name}" attribue`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'attribution");
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="client-detail-modal-title">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 id="client-detail-modal-title" className="text-white font-semibold">Attribuer un forfait</h2>
            <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {activePackages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun forfait actif.{" "}
                <Link href="/packages" className="text-[#25D366] hover:underline">Creer un forfait</Link>
              </p>
            ) : (
              <div className="space-y-2">
                {activePackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedId(pkg.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-colors",
                      selectedId === pkg.id ? "border-[#25D366]/50 bg-[#25D366]/10" : "border-gray-800 bg-gray-800/40 hover:border-gray-700",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{pkg.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {pkg.total_sessions} seance{pkg.total_sessions > 1 ? "s" : ""} · {pkg.valid_days ? `${pkg.valid_days}j` : "Sans expiration"}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <p className="text-xs text-gray-600 line-through">{pkg.original_price.toLocaleString("fr-FR")} XPF</p>
                        )}
                        <p className="text-sm font-bold text-white">{pkg.price.toLocaleString("fr-FR")} XPF</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedId || assignMutation.isPending}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "#25D366" }}
              >
                {assignMutation.isPending ? "Attribution..." : "Attribuer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Client Package Card ──────────────────────────────────────────────────────

function ClientPackageCard({ cp }: { cp: ClientPackage }) {
  const pct = cp.sessions_total > 0 ? Math.round(((cp.sessions_total - cp.sessions_remaining) / cp.sessions_total) * 100) : 0;
  const isExpired = cp.expires_at && new Date(cp.expires_at) < new Date();
  const statusLabel = cp.status === "completed" ? "Termine" : isExpired ? "Expire" : "Actif";
  const statusColor = cp.status === "completed" || isExpired ? "text-gray-500" : "text-emerald-400";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{cp.package?.name ?? "Forfait supprime"}</p>
          {cp.expires_at && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Expire le {format(new Date(cp.expires_at), "d MMM yyyy", { locale: fr })}
            </p>
          )}
        </div>
        <span className={cn("text-xs font-medium shrink-0", statusColor)}>{statusLabel}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{cp.sessions_total - cp.sessions_remaining} / {cp.sessions_total} seances utilisees</span>
          <span className="text-gray-500">{cp.sessions_remaining} restante{cp.sessions_remaining !== 1 ? "s" : ""}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", cp.status === "completed" || isExpired ? "bg-gray-600" : "bg-[#25D366]")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {cp.package?.services && cp.package.services.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cp.package.services.map((svc) => (
            <span key={svc} className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-400">{svc}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchClient(clientId: string, businessId: string): Promise<Client> {
  const { data, error } = await supabase
    .from('bookbot_clients')
    .select('*')
    .eq('id', clientId)
    .eq('business_id', businessId)
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { businessId, businessName } = useAppStore();

  const { data: client, isLoading: loadingClient, error: clientError } = useQuery({
    queryKey: ['bookbot_clients', 'detail', clientId, businessId],
    queryFn: () => fetchClient(clientId, businessId!),
    enabled: Boolean(clientId) && Boolean(businessId),
  });

  // useClientStats: replaces raw appointments query + inline useMemo
  const { data: clientStats, isLoading: loadingStats } = useClientStats({
    clientId,
    businessId,
    clientPhone: client?.phone,
    clientName: client?.name,
    noShowCount: client?.no_show_count ?? 0,
  });

  const queryClient = useQueryClient();
  const [birthdaySaving, setBirthdaySaving] = useState(false);
  const [notesValue, setNotesValue] = useState<string | null>(null);

  // ── Loyalty ─────────────────────────────────────────────────────────────────
  const { data: loyaltyConfig } = useLoyaltyConfig(businessId);
  const { data: loyaltyData } = useClientLoyalty(clientId, businessId, loyaltyConfig ?? undefined);
  const { mutateAsync: addPoints, isPending: addingPoints } = useAddLoyaltyPoints();
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<'earn' | 'redeem' | null>(null);
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState('');
  const [loyaltyDesc, setLoyaltyDesc] = useState('');
  const { data: allPackages } = usePackages(businessId);
  const { data: clientPkgs } = useClientPackages(clientId, businessId);
  const [showAssignModal, setShowAssignModal] = useState(false);



  async function handleAddPoints(type: LoyaltyTransactionType) {
    const pts = parseInt(loyaltyPointsInput, 10);
    if (!pts || pts <= 0 || !businessId) return;
    try {
      await addPoints({
        clientId,
        businessId,
        points: pts,
        type,
        description: loyaltyDesc || (type === 'earn' ? 'Points ajoutés' : 'Points utilisés'),
      });
      toast.success(type === 'earn' ? `+${pts} points ajoutés` : `${pts} points utilisés`);
      setShowLoyaltyModal(null);
      setLoyaltyPointsInput('');
      setLoyaltyDesc('');
    } catch {
      toast.error('Erreur lors de la mise à jour des points');
    }
  }

  // Fetch all unique tags across business clients for suggestions
  const { data: tagSuggestions } = useQuery({
    queryKey: ['bookbot_clients', 'all_tags', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookbot_clients')
        .select('tags')
        .eq('business_id', businessId!);
      if (error) throw new Error(error.message);
      const allTags = new Set<string>();
      for (const row of data ?? []) {
        for (const tag of row.tags ?? []) allTags.add(tag);
      }
      return Array.from(allTags).sort();
    },
    enabled: Boolean(businessId),
  });

  async function saveBirthday(value: string) {
    if (!client) return;
    setBirthdaySaving(true);
    try {
      await supabase
        .from('bookbot_clients')
        .update({ birthday: value || null })
        .eq('id', client.id);
      queryClient.invalidateQueries({ queryKey: ['bookbot_clients', 'detail', clientId, businessId] });
    } finally {
      setBirthdaySaving(false);
    }
  }

  const handleTagUpdate = useCallback(
    async (newTags: string[]) => {
      if (!client) return;
      const { error } = await supabase
        .from('bookbot_clients')
        .update({ tags: newTags })
        .eq('id', client.id);
      if (error) {
        toast.error('Erreur lors de la mise a jour des tags');
        return;
      }
      toast.success('Tags mis a jour');
      queryClient.invalidateQueries({ queryKey: ['bookbot_clients', 'detail', clientId, businessId] });
      queryClient.invalidateQueries({ queryKey: ['bookbot_clients', 'all_tags', businessId] });
    },
    [client, clientId, businessId, queryClient],
  );

  const initials = client?.name
    ? client.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const firstVisit = clientStats?.firstVisit ?? null;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadingClient) {
    return (
      <DashboardLayout title="Client" businessName={businessName ?? undefined}>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </DashboardLayout>
    );
  }

  if (clientError || !client) {
    return (
      <DashboardLayout title="Client" businessName={businessName ?? undefined}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-gray-400 text-sm">Client introuvable.</p>
          <Link href="/clients" className="text-[#0d9488] hover:underline text-sm">
            ← Retour aux clients
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={client.name} businessName={businessName ?? undefined}>
      <div className="space-y-8">

        {/* Back */}
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Clients
        </Link>

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[#0d9488]/20 border border-[#0d9488]/30 flex items-center justify-center text-[#0d9488] text-2xl font-bold shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{client.name}</h1>

              {/* Automatic segments */}
              {(() => {
                const segs = getClientSegments(client);
                return segs.length > 0 ? (
                  <div className="mt-2">
                    <SegmentBadges segmentIds={segs} />
                  </div>
                ) : null;
              })()}

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    {client.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-300">
                  <Cake className="w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    className="bg-transparent border-b border-gray-700 text-sm text-gray-300 focus:border-[#0d9488] focus:outline-none px-1 py-0.5 transition-colors"
                    value={client.birthday ?? ''}
                    onChange={(e) => saveBirthday(e.target.value)}
                    disabled={birthdaySaving}
                    title="Date de naissance"
                    placeholder="Date de naissance"
                  />
                </span>
                {firstVisit && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Première visite&nbsp;
                    {format(new Date(firstVisit), 'd MMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>

              {/* Tags — editable */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tags</span>
                </div>
                <TagEditor
                  tags={client.tags ?? []}
                  onUpdate={handleTagUpdate}
                  suggestions={tagSuggestions ?? []}
                />
              </div>

              {/* Portal link */}
              <div className="mt-3">
                <PortalLinkButton clientId={client.id} />
              </div>
            </div>

            {/* Loyalty */}
            {(client.loyalty_points ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-800/30 rounded-lg px-3 py-2 shrink-0">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-300">{client.loyalty_points} pts</span>
              </div>
            )}
          </div>

        </div>

        {/* ── Stats cards ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Statistiques
          </h2>
          {loadingStats ? (
            <ClientStatsCardsSkeleton />
          ) : clientStats ? (
            <ClientStatsCards stats={clientStats} clientTotalSpent={client.total_spent} />
          ) : null}
        </div>

        {/* ── Points de fidélité ───────────────────────────────────────────── */}
        {loyaltyConfig?.enabled && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Points de fidélité</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLoyaltyModal('earn')}
                  className="flex items-center gap-1.5 text-xs font-medium text-green-400 hover:text-green-300 border border-green-800/50 hover:border-green-700 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Plus size={13} />
                  Ajouter
                </button>
                <button
                  onClick={() => setShowLoyaltyModal('redeem')}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-800/50 hover:border-amber-700 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Minus size={13} />
                  Utiliser
                </button>
              </div>
            </div>

            {/* Balance + progress */}
            <div className="px-6 py-5">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl font-bold text-amber-400">
                  {loyaltyData?.totalPoints ?? 0}
                </span>
                <span className="text-sm text-gray-500 mb-1">points</span>
                {loyaltyData?.currentTier && (
                  <span className="ml-auto text-xs font-medium text-amber-500/80 bg-amber-500/10 rounded-full px-2.5 py-0.5">
                    {loyaltyData.currentTier.reward}
                  </span>
                )}
              </div>

              {loyaltyData?.nextTier && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Prochain palier : {loyaltyData.nextTier.reward}</span>
                    <span>
                      {loyaltyData.nextTier.points - (loyaltyData.totalPoints)} pts restants
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${loyaltyData.progressToNext}%` }}
                    />
                  </div>
                </div>
              )}
              {!loyaltyData?.nextTier && loyaltyData?.currentTier && (
                <p className="text-xs text-amber-500/70">Palier maximum atteint</p>
              )}
            </div>

            {/* Transaction history */}
            {loyaltyData && loyaltyData.transactions.length > 0 && (
              <div className="border-t border-gray-800">
                <p className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Historique (10 derniers)
                </p>
                <div className="divide-y divide-gray-800/60">
                  {loyaltyData.transactions.slice(0, 10).map((tx) => {
                    const isPositive = tx.points > 0;
                    return (
                      <div key={tx.id} className="flex items-center gap-3 px-6 py-3">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                          isPositive ? 'bg-green-900/20' : 'bg-red-900/20',
                        )}>
                          {tx.type === 'bonus' ? (
                            <Zap size={13} className="text-amber-400" />
                          ) : isPositive ? (
                            <ArrowUpRight size={13} className="text-green-400" />
                          ) : (
                            <ArrowDownRight size={13} className="text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 truncate">{tx.description}</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(tx.created_at), 'd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <span className={cn(
                          'text-sm font-semibold shrink-0',
                          isPositive ? 'text-green-400' : 'text-red-400',
                        )}>
                          {isPositive ? '+' : ''}{tx.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inline modal: add/redeem points */}
            {showLoyaltyModal && (
              <div className="border-t border-gray-800 px-6 py-5 bg-gray-900/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">
                    {showLoyaltyModal === 'earn' ? 'Ajouter des points' : 'Utiliser des points'}
                  </h3>
                  <button
                    onClick={() => { setShowLoyaltyModal(null); setLoyaltyPointsInput(''); setLoyaltyDesc(''); }}
                    className="text-gray-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="number"
                    min={1}
                    placeholder="Nombre de points"
                    value={loyaltyPointsInput}
                    onChange={(e) => setLoyaltyPointsInput(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder={showLoyaltyModal === 'earn' ? 'Motif (ex: visite du 20 mars)' : 'Motif (ex: remise appliquée)'}
                    value={loyaltyDesc}
                    onChange={(e) => setLoyaltyDesc(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleAddPoints(showLoyaltyModal)}
                    disabled={addingPoints || !loyaltyPointsInput}
                    className={cn(
                      'w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50',
                      showLoyaltyModal === 'earn'
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-black',
                    )}
                  >
                    {addingPoints ? 'En cours...' : showLoyaltyModal === 'earn' ? 'Confirmer l\'ajout' : 'Confirmer l\'utilisation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Appointment timeline ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Historique des rendez-vous
            </h2>
            {clientStats && (
              <span className="text-xs text-gray-500">
                {clientStats.totalAppointments} au total
              </span>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <AppointmentTimeline
              items={clientStats?.appointmentHistory ?? []}
              isLoading={loadingStats}
            />
          </div>
        </div>


        {/* ── Forfaits actifs ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Forfaits actifs
            </h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <Plus size={13} />
              Attribuer un forfait
            </button>
          </div>
          {clientPkgs && clientPkgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clientPkgs.map((cp) => (
                <ClientPackageCard key={cp.id} cp={cp} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <Package size={22} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucun forfait attribue</p>
            </div>
          )}
        </div>

        {/* ── Notes internes ───────────────────────────────────────────────── */}
        <ClientNotes
          clientId={client.id}
          businessId={businessId!}
          initialNotes={notesValue !== null ? notesValue : (client.notes ?? null)}
          onSaved={(notes) => {
            setNotesValue(notes);
            queryClient.invalidateQueries({
              queryKey: ['bookbot_clients', 'detail', clientId, businessId],
            });
          }}
        />

      </div>

      {/* Assign Package Modal */}
      {showAssignModal && businessId && (
        <AssignPackageModal
          businessId={businessId}
          clientId={clientId}
          packages={allPackages ?? []}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
