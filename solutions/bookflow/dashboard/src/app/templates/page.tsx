'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import {
  MessageSquareText,
  CheckCircle2,
  Clock,
  Bell,
  Heart,
  Star,
  XCircle,
  CalendarClock,
  Pencil,
  X,
  RotateCcw,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import {
  useMessageTemplates,
  useUpdateTemplate,
  useResetTemplate,
  DEFAULT_TEMPLATES,
  type TemplateType,
  type MessageTemplate,
} from '@/hooks/useMessageTemplates';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const TEMPLATE_CONFIGS: Record<
  TemplateType,
  { label: string; icon: React.ElementType; description: string; color: string }
> = {
  confirmation: {
    label: 'Confirmation',
    icon: CheckCircle2,
    description: "Envoy\u00e9 d\u00e8s qu'un rendez-vous est pris",
    color: '#25D366',
  },
  reminder_24h: {
    label: 'Rappel 24h',
    icon: Bell,
    description: 'Rappel automatique la veille du rendez-vous',
    color: '#3b82f6',
  },
  reminder_1h: {
    label: 'Rappel 1h',
    icon: Clock,
    description: 'Rappel une heure avant le rendez-vous',
    color: '#8b5cf6',
  },
  followup: {
    label: 'Suivi',
    icon: Heart,
    description: 'Message envoy\u00e9 apr\u00e8s la prestation',
    color: '#ec4899',
  },
  birthday: {
    label: 'Anniversaire',
    icon: Star,
    description: 'Message automatique le jour J',
    color: '#f59e0b',
  },
  review_request: {
    label: "Demande d'avis",
    icon: Star,
    description: 'Invitation \u00e0 laisser un avis apr\u00e8s la visite',
    color: '#f97316',
  },
  cancellation: {
    label: 'Annulation',
    icon: XCircle,
    description: "Confirmation d'annulation de rendez-vous",
    color: '#ef4444',
  },
  reschedule: {
    label: 'Reprogrammation',
    icon: CalendarClock,
    description: "Notification de d\u00e9placement d'un rendez-vous",
    color: '#06b6d4',
  },
};

const TEMPLATE_ORDER: TemplateType[] = [
  'confirmation',
  'reminder_24h',
  'reminder_1h',
  'followup',
  'birthday',
  'review_request',
  'cancellation',
  'reschedule',
];

const VARIABLES = [
  { key: '{nom}', description: 'Pr\u00e9nom du client' },
  { key: '{service}', description: 'Nom du service' },
  { key: '{date}', description: 'Date du rendez-vous' },
  { key: '{heure}', description: 'Heure du rendez-vous' },
  { key: '{business}', description: 'Nom de votre \u00e9tablissement' },
  { key: '{lien_booking}', description: 'Lien de r\u00e9servation' },
  { key: '{lien_avis}', description: 'Lien avis Google' },
];

const SAMPLE_DATA: Record<string, string> = {
  '{nom}': 'Marie',
  '{service}': 'Coupe + Brushing',
  '{date}': 'lundi 24 mars',
  '{heure}': '14h30',
  '{business}': 'Studio Belleza',
  '{lien_booking}': 'https://vea.app/book/...',
  '{lien_avis}': 'https://g.page/r/...',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applyPreview(message: string): string {
  return Object.entries(SAMPLE_DATA).reduce(
    (msg, [key, val]) => msg.replaceAll(key, val),
    message,
  );
}

function isCustom(templates: MessageTemplate[], type: TemplateType): boolean {
  return templates.some((t) => t.type === type);
}

function getActiveState(templates: MessageTemplate[], type: TemplateType): boolean {
  return templates.find((t) => t.type === type)?.is_active ?? true;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TemplateSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-800" />
          <div>
            <div className="h-4 bg-gray-800 rounded w-28 mb-1.5" />
            <div className="h-3 bg-gray-800 rounded w-40" />
          </div>
        </div>
        <div className="w-10 h-5 bg-gray-800 rounded-full" />
      </div>
      <div className="h-3 bg-gray-800 rounded w-full mb-2" />
      <div className="h-3 bg-gray-800 rounded w-4/5" />
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  loading?: boolean;
}

function Toggle({ enabled, onChange, loading }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={loading}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none disabled:opacity-50',
        enabled ? 'bg-[#25D366]' : 'bg-gray-700',
      )}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
          enabled ? 'translate-x-4.5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  type: TemplateType;
  templates: MessageTemplate[];
  onEdit: (type: TemplateType) => void;
  onToggle: (type: TemplateType, active: boolean) => void;
  toggling: boolean;
}

function TemplateCard({ type, templates, onEdit, onToggle, toggling }: TemplateCardProps) {
  const cfg = TEMPLATE_CONFIGS[type];
  const Icon = cfg.icon;
  const custom = isCustom(templates, type);
  const active = getActiveState(templates, type);
  const message = templates.find((t) => t.type === type)?.message ?? DEFAULT_TEMPLATES[type];
  const preview = message.length > 100 ? message.slice(0, 100) + '…' : message;

  return (
    <div
      className={cn(
        'bg-gray-900 border rounded-xl p-5 transition-all duration-150 hover:border-gray-700 group',
        active ? 'border-gray-800' : 'border-gray-800/50 opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${cfg.color}18` }}
          >
            <Icon size={17} style={{ color: cfg.color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium">{cfg.label}</p>
              {custom && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#25D366]/10 text-[#25D366]">
                  Modifi\u00e9
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{cfg.description}</p>
          </div>
        </div>
        <Toggle enabled={active} onChange={(val) => onToggle(type, val)} loading={toggling} />
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{preview}</p>

      <button
        onClick={() => onEdit(type)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors group-hover:text-gray-400"
      >
        <Pencil size={12} />
        Modifier
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  type: TemplateType;
  templates: MessageTemplate[];
  businessId: string;
  onClose: () => void;
}

function EditModal({ type, templates, businessId, onClose }: EditModalProps) {
  const cfg = TEMPLATE_CONFIGS[type];
  const Icon = cfg.icon;
  const existing = templates.find((t) => t.type === type);
  const [message, setMessage] = useState(existing?.message ?? DEFAULT_TEMPLATES[type]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateTemplate = useUpdateTemplate(businessId);
  const resetTemplate = useResetTemplate(businessId);

  const preview = useMemo(() => applyPreview(message), [message]);
  const isDirty = message !== (existing?.message ?? DEFAULT_TEMPLATES[type]);
  const isCustomized = Boolean(existing);

  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMessage);
    // Restore cursor after variable
    requestAnimationFrame(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    });
  }, [message]);

  const handleSave = useCallback(async () => {
    if (!message.trim()) return;
    try {
      await updateTemplate.mutateAsync({ type, message: message.trim() });
      toast.success('Mod\u00e8le enregistr\u00e9');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  }, [message, type, updateTemplate, onClose]);

  const handleReset = useCallback(async () => {
    try {
      await resetTemplate.mutateAsync(type);
      setMessage(DEFAULT_TEMPLATES[type]);
      toast.success('Mod\u00e8le r\u00e9initialis\u00e9');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la r\u00e9initialisation');
    }
  }, [type, resetTemplate, onClose]);

  const saving = updateTemplate.isPending;
  const resetting = resetTemplate.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
        <div
          className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cfg.color}18` }}
              >
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">{cfg.label}</h2>
                <p className="text-gray-500 text-xs">{cfg.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left — Editor */}
              <div className="space-y-4">
                {/* Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={7}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#25D366] transition-colors resize-none leading-relaxed"
                    placeholder="Votre message..."
                  />
                  <p className="mt-1 text-right text-xs text-gray-600">
                    {message.length} caract\u00e8res
                  </p>
                </div>

                {/* Variables panel */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">
                    Variables disponibles — cliquez pour ins\u00e9rer
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map(({ key, description }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => insertVariable(key)}
                        title={description}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 hover:border-[#25D366]/50 hover:text-[#25D366] hover:bg-[#25D366]/5 transition-all"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — Live preview */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Aper\u00e7u</p>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 min-h-[180px]">
                  {/* WhatsApp-style bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-[#005c4b] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                      <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
                        {preview || <span className="text-gray-500 italic">Tapez votre message...</span>}
                      </p>
                      <p className="text-[10px] text-[#8ebeaf] text-right mt-1">14:32 \u2713\u2713</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-600 text-center">
                    Donn\u00e9es d\u2019exemple : Marie \u2022 Coupe + Brushing \u2022 lundi 24 mars
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              {isCustomized && (
                <button
                  onClick={handleReset}
                  disabled={resetting || saving}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  {resetting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  R\u00e9initialiser
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || saving || !message.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: '#25D366' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const { businessId } = useAppStore();
  const { data: templates = [], isLoading } = useMessageTemplates(businessId);
  const updateTemplate = useUpdateTemplate(businessId);
  const [editingType, setEditingType] = useState<TemplateType | null>(null);
  const [togglingType, setTogglingType] = useState<TemplateType | null>(null);

  const handleToggle = useCallback(
    async (type: TemplateType, active: boolean) => {
      if (!businessId) return;
      setTogglingType(type);
      try {
        const existing = templates.find((t) => t.type === type);
        await updateTemplate.mutateAsync({
          type,
          message: existing?.message ?? DEFAULT_TEMPLATES[type],
          is_active: active,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setTogglingType(null);
      }
    },
    [businessId, templates, updateTemplate],
  );

  return (
    <DashboardLayout title="Mod\u00e8les de messages">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <MessageSquareText size={20} className="text-[#25D366]" />
              <h1 className="text-xl font-bold text-white">Mod\u00e8les de messages</h1>
            </div>
            <p className="text-sm text-gray-500">
              Personnalisez les messages envoy\u00e9s automatiquement \u00e0 vos clients
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_ORDER.map((t) => (
              <TemplateSkeleton key={t} />
            ))}
          </div>
        )}

        {/* Template grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATE_ORDER.map((type) => (
              <TemplateCard
                key={type}
                type={type}
                templates={templates}
                onEdit={setEditingType}
                onToggle={handleToggle}
                toggling={togglingType === type}
              />
            ))}
          </div>
        )}

        {/* Info footer */}
        {!isLoading && (
          <div className="mt-6 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-xs text-gray-500">
              <span className="text-gray-400 font-medium">Variables disponibles</span> \u2014{' '}
              {VARIABLES.map((v) => (
                <code
                  key={v.key}
                  className="text-[#25D366] bg-[#25D366]/8 px-1 py-0.5 rounded text-[11px] font-mono mx-0.5"
                >
                  {v.key}
                </code>
              ))}
            </p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingType && businessId && (
        <EditModal
          type={editingType}
          templates={templates}
          businessId={businessId}
          onClose={() => setEditingType(null)}
        />
      )}
    </DashboardLayout>
  );
}
