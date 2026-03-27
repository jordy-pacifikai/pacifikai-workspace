'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Plus,
  Minus,
  Star,
  ChevronRight,
  Gift,
  TrendingUp,
  Users,
  Zap,
  Edit3,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import {
  useLoyaltyConfig,
  useUpdateLoyaltyConfig,
  useLoyaltyLeaderboard,
  DEFAULT_LOYALTY_CONFIG,
  type LoyaltyConfig,
  type RewardTier,
} from '@/hooks/useLoyalty';
import { toast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-amber-500' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Editable number field ────────────────────────────────────────────────────

function EditableNumber({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function commit() {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) onChange(n);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</label>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="number"
            min={0}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-24 bg-gray-800 border border-amber-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button onClick={commit} aria-label="Confirmer" className="text-amber-400 hover:text-amber-300">
            <Check size={14} />
          </button>
          <button onClick={() => setEditing(false)} aria-label="Annuler" className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(String(value)); setEditing(true); }}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl font-bold text-white">{value}</span>
          {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
          <Edit3 size={13} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
        </button>
      )}
    </div>
  );
}

// ─── Reward tier row ─────────────────────────────────────────────────────────

function TierRow({
  tier,
  index,
  onUpdate,
  onDelete,
}: {
  tier: RewardTier;
  index: number;
  onUpdate: (i: number, t: RewardTier) => void;
  onDelete: (i: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RewardTier>({ ...tier });

  function save() {
    onUpdate(index, draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-b border-gray-800">
        <td className="px-4 py-2">
          <input
            type="number"
            min={1}
            value={draft.points}
            onChange={(e) => setDraft({ ...draft, points: parseInt(e.target.value) || 0 })}
            className="w-20 bg-gray-800 border border-amber-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
          />
        </td>
        <td className="px-4 py-2">
          <input
            value={draft.reward}
            onChange={(e) => setDraft({ ...draft, reward: e.target.value })}
            className="w-full bg-gray-800 border border-amber-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="number"
            min={0}
            max={100}
            value={draft.discount_percent}
            onChange={(e) => setDraft({ ...draft, discount_percent: parseInt(e.target.value) || 0 })}
            className="w-16 bg-gray-800 border border-amber-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
          />
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <button onClick={save} aria-label="Sauvegarder" className="text-amber-400 hover:text-amber-300">
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} aria-label="Annuler" className="text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/30 group">
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
          <Star size={13} className="fill-amber-400" />
          {tier.points} pts
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-200">{tier.reward}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{tier.discount_percent}%</td>
      <td className="px-4 py-3">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} aria-label="Modifier" className="text-gray-500 hover:text-amber-400">
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(index)} aria-label="Supprimer" className="text-gray-500 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Transaction type icon + color ────────────────────────────────────────────

function TxIcon({ type }: { type: string }) {
  if (type === 'earn') return <ArrowUpRight size={14} className="text-green-400" />;
  if (type === 'redeem') return <ArrowDownRight size={14} className="text-red-400" />;
  if (type === 'bonus') return <Zap size={14} className="text-amber-400" />;
  return <Clock size={14} className="text-gray-400" />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoyaltyPage() {
  const { businessId, businessName } = useAppStore();
  const { data: config, isLoading: loadingConfig } = useLoyaltyConfig(businessId);
  const { mutateAsync: saveConfig, isPending: saving } = useUpdateLoyaltyConfig(businessId);
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLoyaltyLeaderboard(businessId);

  const [localConfig, setLocalConfig] = useState<LoyaltyConfig | null>(null);
  const effective = localConfig ?? config ?? DEFAULT_LOYALTY_CONFIG;

  function patch(partial: Partial<LoyaltyConfig>) {
    setLocalConfig({ ...effective, ...partial });
  }

  function updateTier(index: number, tier: RewardTier) {
    const thresholds = [...effective.reward_thresholds];
    thresholds[index] = tier;
    patch({ reward_thresholds: thresholds.sort((a, b) => a.points - b.points) });
  }

  function deleteTier(index: number) {
    const thresholds = [...effective.reward_thresholds];
    thresholds.splice(index, 1);
    patch({ reward_thresholds: thresholds });
  }

  function addTier() {
    const max = effective.reward_thresholds.reduce((m, t) => Math.max(m, t.points), 0);
    patch({
      reward_thresholds: [
        ...effective.reward_thresholds,
        { points: max + 100, reward: 'Nouveau palier', discount_percent: 0 },
      ],
    });
  }

  async function handleSave() {
    if (!localConfig) return;
    try {
      await saveConfig(localConfig);
      setLocalConfig(null);
      toast.success('Programme de fidélité mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  }

  async function handleToggle(enabled: boolean) {
    const next = { ...effective, enabled };
    setLocalConfig(next);
    try {
      await saveConfig(next);
      setLocalConfig(null);
      toast.success(enabled ? 'Programme activé' : 'Programme désactivé');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  // Max points for leaderboard progress bars
  const maxPoints = leaderboard?.[0]?.total_points ?? 1;

  return (
    <DashboardLayout title="Fidélité" businessName={businessName ?? undefined}>
      <div className="space-y-8 max-w-4xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Programme de fidélité</h1>
              <p className="text-sm text-gray-500">Récompensez vos clients réguliers</p>
            </div>
          </div>

          {loadingConfig ? (
            <div className="w-11 h-6 bg-gray-800 rounded-full animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${effective.enabled ? 'text-amber-400' : 'text-gray-500'}`}>
                {effective.enabled ? 'Actif' : 'Inactif'}
              </span>
              <Toggle enabled={effective.enabled} onChange={handleToggle} />
            </div>
          )}
        </div>

        {/* ── Empty state (programme not yet activated) ───────────────────── */}
        {!loadingConfig && !effective.enabled && (!leaderboard || leaderboard.length === 0) && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
              <Gift size={28} className="text-[#25D366]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Programme de fidélité</h2>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Récompensez vos clients fidèles et augmentez vos réservations récurrentes.
                Configurez votre programme en quelques clics.
              </p>
            </div>
            <button
              onClick={() => {
                handleToggle(true);
                setTimeout(() => {
                  document.getElementById('config-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#22c45d] text-black text-sm font-semibold rounded-xl transition-colors"
            >
              <Zap size={15} />
              Activer le programme
            </button>
          </div>
        )}

        {/* ── Config section (shown when enabled) ─────────────────────────── */}
        {effective.enabled && (
          <>
            {/* Points config */}
            <div id="config-section" className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Configuration des points
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <EditableNumber
                  label="Points / visite"
                  value={effective.points_per_visit}
                  suffix="pts"
                  onChange={(v) => patch({ points_per_visit: v })}
                />
                <EditableNumber
                  label="Points / 100 XPF"
                  value={effective.points_per_xpf}
                  suffix="pts"
                  onChange={(v) => patch({ points_per_xpf: v })}
                />
                <EditableNumber
                  label="Bonus bienvenue"
                  value={effective.welcome_bonus}
                  suffix="pts"
                  onChange={(v) => patch({ welcome_bonus: v })}
                />
                <EditableNumber
                  label="Bonus anniversaire"
                  value={effective.birthday_bonus}
                  suffix="pts"
                  onChange={(v) => patch({ birthday_bonus: v })}
                />
              </div>

              {localConfig && (
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-gray-800">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
                  >
                    {saving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => setLocalConfig(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>

            {/* Reward tiers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">Paliers de récompenses</h2>
                </div>
                <button
                  onClick={addTier}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Plus size={14} />
                  Ajouter un palier
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Seuil
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Récompense
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Remise
                    </th>
                    <th className="px-4 py-2 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {effective.reward_thresholds.map((tier, i) => (
                    <TierRow
                      key={i}
                      tier={tier}
                      index={i}
                      onUpdate={(idx, t) => { updateTier(idx, t); }}
                      onDelete={(idx) => { deleteTier(idx); }}
                    />
                  ))}
                  {effective.reward_thresholds.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        Aucun palier défini — ajoutez-en un
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {localConfig && (
                <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-800">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
                  >
                    {saving ? 'Sauvegarde...' : 'Enregistrer les paliers'}
                  </button>
                  <button
                    onClick={() => setLocalConfig(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Leaderboard ──────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
            <TrendingUp size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Top 10 clients</h2>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} />
              Classement par points
            </span>
          </div>

          {loadingLeaderboard ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Trophy size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucun point attribué pour le moment</p>
              <p className="text-xs text-gray-600 mt-1">
                Les points s&apos;afficheront ici une fois le programme activé
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {leaderboard.map((entry, index) => {
                const thresholds = [...effective.reward_thresholds].sort(
                  (a, b) => a.points - b.points,
                );
                const nextTier = thresholds.find((t) => t.points > entry.total_points);
                const currentTier = [...thresholds]
                  .reverse()
                  .find((t) => t.points <= entry.total_points);
                const pct = Math.round((entry.total_points / maxPoints) * 100);

                return (
                  <Link
                    key={entry.client_id}
                    href={`/clients/${entry.client_id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* Rank */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0
                          ? 'bg-amber-500/20 text-amber-400'
                          : index === 1
                          ? 'bg-gray-600/30 text-gray-300'
                          : index === 2
                          ? 'bg-orange-900/20 text-orange-400'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Name + tier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {entry.client_name}
                        </span>
                        {currentTier && (
                          <span className="text-xs text-amber-500/80 font-medium shrink-0">
                            {currentTier.reward}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {nextTier && (
                          <span className="text-[10px] text-gray-600 shrink-0">
                            {nextTier.points - entry.total_points} pts → {nextTier.reward}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-amber-400">
                        {entry.total_points}
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
