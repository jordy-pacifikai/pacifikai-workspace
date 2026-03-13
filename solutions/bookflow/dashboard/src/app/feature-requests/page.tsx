'use client';

import { useState } from 'react';
import { Lightbulb, Plus, Send, Clock, CheckCircle2, XCircle, ArrowUpCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FeatureRequest {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  votes: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'chatbot', label: 'Chatbot / IA' },
  { value: 'booking', label: 'Reservations' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'integration', label: 'Integrations' },
  { value: 'other', label: 'Autre' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  new: { label: 'Nouveau', icon: Clock, color: 'text-gray-400 bg-gray-800' },
  reviewed: { label: 'En revue', icon: ArrowUpCircle, color: 'text-blue-400 bg-blue-900/30' },
  planned: { label: 'Planifie', icon: CheckCircle2, color: 'text-amber-400 bg-amber-900/30' },
  done: { label: 'Fait', icon: CheckCircle2, color: 'text-green-400 bg-green-900/30' },
  declined: { label: 'Decline', icon: XCircle, color: 'text-red-400 bg-red-900/30' },
};

// ─── Input styles ──────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-lg px-3 py-2 text-sm transition-colors';

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FeatureRequestsPage() {
  const { businessId, businessName } = useAppStore();
  const sb = getSupabaseBrowser();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: requests, isLoading } = useQuery<FeatureRequest[]>({
    queryKey: ['feature-requests', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await sb
        .from('bookbot_feature_requests')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FeatureRequest[];
    },
    enabled: Boolean(businessId),
  });

  // ── Create ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from('bookbot_feature_requests').insert({
        business_id: businessId,
        title,
        description: description || null,
        category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests', businessId] });
      setTitle('');
      setDescription('');
      setCategory('general');
      setShowForm(false);
    },
  });

  const canSubmit = title.trim().length >= 3 && !createMutation.isPending;

  return (
    <DashboardLayout title="Suggestions & demandes" businessName={businessName ?? undefined}>
      <div className="max-w-2xl space-y-6">

        {/* ── Header + CTA ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Proposez des idees, signalez des problemes ou demandez de nouvelles fonctionnalites.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle idee
          </button>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-[#25D366]" />
              <h3 className="text-white font-semibold text-sm">Soumettre une idee</h3>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">Titre</label>
              <input
                className={inputClass}
                placeholder="Ex: Pouvoir envoyer des promotions aux clients"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">Description (optionnel)</label>
              <textarea
                className={cn(inputClass, 'resize-none')}
                rows={3}
                placeholder="Decrivez votre idee en detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">Categorie</label>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-5 py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>
        )}

        {/* ── List ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <Skeleton className="h-4 w-2/3 mb-3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : !requests?.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Lightbulb className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucune suggestion pour le moment.</p>
            <p className="text-gray-600 text-xs mt-1">Cliquez sur &quot;Nouvelle idee&quot; pour en soumettre une.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.new;
              const StatusIcon = statusCfg.icon;
              const catLabel = CATEGORIES.find((c) => c.value === req.category)?.label ?? req.category;

              return (
                <div
                  key={req.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">{req.title}</h4>
                      {req.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{req.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] text-gray-600 uppercase tracking-wide font-medium">
                          {catLabel}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(req.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                        statusCfg.color,
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
