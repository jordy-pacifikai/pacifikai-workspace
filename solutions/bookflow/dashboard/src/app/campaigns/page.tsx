'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Clock,
  Users,
  ChevronRight,
  X,
  Eye,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useCampaigns, useCreateCampaign, useSegmentCount } from '@/hooks/useCampaigns';
import type { Campaign } from '@/hooks/useCampaigns';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Constants ───────────────────────────────────────────────────────────────

const SEGMENTS = [
  { value: 'all', label: 'Tous les clients' },
  { value: 'inactive_30d', label: 'Inactifs 30 jours' },
  { value: 'inactive_60d', label: 'Inactifs 60 jours' },
  { value: 'no_show', label: 'No-shows' },
  { value: 'new_clients', label: 'Nouveaux clients' },
  { value: 'custom_tag', label: 'Tag specifique' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-700/50', text: 'text-gray-300' },
  sending: { label: 'Envoi en cours', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  sent: { label: 'Envoyee', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  failed: { label: 'Echouee', bg: 'bg-red-500/20', text: 'text-red-400' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      {status === 'sending' && <Loader2 size={12} className="mr-1 animate-spin" />}
      {cfg.label}
    </span>
  );
}

function segmentLabel(type: string): string {
  return SEGMENTS.find((s) => s.value === type)?.label ?? type;
}

// ─── Campaign Card ───────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = campaign.total_recipients > 0
    ? Math.round((campaign.sent_count / campaign.total_recipients) * 100)
    : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-medium text-sm truncate">{campaign.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{segmentLabel(campaign.segment_type)}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Progress bar for sending/sent */}
      {campaign.total_recipients > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{campaign.sent_count} / {campaign.total_recipients} envoyes</span>
            {campaign.failed_count > 0 && (
              <span className="text-red-400">{campaign.failed_count} echecs</span>
            )}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: campaign.failed_count === campaign.total_recipients ? '#ef4444' : '#25D366',
              }}
            />
          </div>
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Clock size={12} />
        {campaign.sent_at
          ? format(new Date(campaign.sent_at), "d MMM yyyy 'a' HH:mm", { locale: fr })
          : format(new Date(campaign.created_at), "d MMM yyyy 'a' HH:mm", { locale: fr })
        }
      </div>
    </div>
  );
}

// ─── New Campaign Form ───────────────────────────────────────────────────────

interface NewCampaignFormProps {
  businessId: string;
  businessName: string;
  onClose: () => void;
}

function NewCampaignForm({ businessId, businessName, onClose }: NewCampaignFormProps) {
  const [name, setName] = useState('');
  const [segmentType, setSegmentType] = useState('all');
  const [segmentValue, setSegmentValue] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(
    'Bonjour {nom}, un message de {business}. Reservez ici : {lien_booking}',
  );
  const [showPreview, setShowPreview] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);

  const createCampaign = useCreateCampaign(businessId);

  const { data: recipientCount, isLoading: countLoading } = useSegmentCount(
    businessId,
    segmentType,
    segmentType === 'custom_tag' ? segmentValue : undefined,
  );

  const previewMessage = useMemo(() => {
    return messageTemplate
      .replace(/\{nom\}/g, 'Marie')
      .replace(/\{business\}/g, businessName)
      .replace(/\{lien_booking\}/g, 'https://vea.pacifikai.com/book/...');
  }, [messageTemplate, businessName]);

  const canSubmit = name.trim() && messageTemplate.trim() && (segmentType !== 'custom_tag' || segmentValue.trim());

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSend = useCallback(async () => {
    setConfirmSend(false);
    setSending(true);

    try {
      const campaign = await createCampaign.mutateAsync({
        name: name.trim(),
        message_template: messageTemplate.trim(),
        segment_type: segmentType,
        segment_value: segmentType === 'custom_tag' ? segmentValue.trim() : null,
      });

      // Trigger sending via API route
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          businessId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to trigger campaign');
      }

      toast.success(`Campagne "${name}" lancee avec succes`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du lancement');
    } finally {
      setSending(false);
    }
  }, [name, messageTemplate, segmentType, segmentValue, businessId, createCampaign, onClose]);

  const handleSaveDraft = useCallback(async () => {
    setSending(true);
    try {
      await createCampaign.mutateAsync({
        name: name.trim(),
        message_template: messageTemplate.trim(),
        segment_type: segmentType,
        segment_value: segmentType === 'custom_tag' ? segmentValue.trim() : null,
      });
      toast.success('Brouillon sauvegarde');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSending(false);
    }
  }, [name, messageTemplate, segmentType, segmentValue, createCampaign, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
        <div
          className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}>
                <Megaphone size={16} style={{ color: '#25D366' }} />
              </div>
              <h2 className="text-white font-semibold text-base">Nouvelle campagne</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom de la campagne</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Relance clients inactifs mars"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#25D366] transition-colors"
              />
            </div>

            {/* Segment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Segment cible</label>
              <div className="grid grid-cols-2 gap-2">
                {SEGMENTS.map((seg) => (
                  <button
                    key={seg.value}
                    onClick={() => setSegmentType(seg.value)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left',
                      segmentType === seg.value
                        ? 'border-[#25D366] bg-[#25D366]/10 text-[#25D366]'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>

              {/* Tag input */}
              {segmentType === 'custom_tag' && (
                <input
                  type="text"
                  value={segmentValue}
                  onChange={(e) => setSegmentValue(e.target.value)}
                  placeholder="Nom du tag (ex: VIP)"
                  className="mt-2 w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#25D366] transition-colors"
                />
              )}

              {/* Recipient count */}
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Users size={12} className="text-gray-500" />
                {countLoading ? (
                  <span className="text-gray-500">Calcul en cours...</span>
                ) : (
                  <span style={{ color: '#25D366' }}>
                    ~{recipientCount ?? 0} client{(recipientCount ?? 0) > 1 ? 's' : ''} cible{(recipientCount ?? 0) > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Message template */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Message
                <span className="text-gray-600 font-normal ml-2">Variables: {'{nom}'} {'{business}'} {'{lien_booking}'}</span>
              </label>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#25D366] transition-colors resize-none"
                placeholder="Votre message avec des variables..."
              />
              <div className="mt-1 text-right">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
                >
                  <Eye size={12} />
                  {showPreview ? 'Masquer' : 'Apercu'}
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Apercu du message :</p>
                <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg px-3.5 py-2.5">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{previewMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-800">
            <button
              onClick={handleSaveDraft}
              disabled={!canSubmit || sending}
              className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sauvegarder brouillon
            </button>
            <button
              onClick={() => setConfirmSend(true)}
              disabled={!canSubmit || sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#25D366' }}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmSend}
        onConfirm={handleSend}
        onCancel={() => setConfirmSend(false)}
        title="Lancer la campagne ?"
        description={`Cela enverra un message WhatsApp a ~${recipientCount ?? 0} client${(recipientCount ?? 0) > 1 ? 's' : ''}. Cette action est irreversible.`}
        confirmLabel="Envoyer"
        cancelLabel="Annuler"
        variant="default"
        loading={sending}
      />
    </>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}
      >
        <Megaphone size={24} style={{ color: '#25D366' }} />
      </div>
      <h3 className="text-white font-medium text-base mb-1">Aucune campagne</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6">
        Envoyez des messages cibles a vos clients par WhatsApp pour les relancer ou les fideliser.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:brightness-110"
        style={{ backgroundColor: '#25D366' }}
      >
        <Plus size={16} />
        Nouvelle campagne
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { businessId, businessName } = useAppStore();
  const { data: campaigns, isLoading } = useCampaigns(businessId);
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout title="Campagnes">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Campagnes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Messages WhatsApp cibles par segment</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Nouvelle campagne
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-1/3 mb-4" />
                <div className="h-1.5 bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!campaigns || campaigns.length === 0) && (
          <EmptyState onNew={() => setShowForm(true)} />
        )}

        {/* Campaign list */}
        {!isLoading && campaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* New campaign modal */}
      {showForm && businessId && (
        <NewCampaignForm
          businessId={businessId}
          businessName={businessName || 'Mon Business'}
          onClose={() => setShowForm(false)}
        />
      )}
    </DashboardLayout>
  );
}
