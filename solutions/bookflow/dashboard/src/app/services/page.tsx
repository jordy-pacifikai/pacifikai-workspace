'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Clock, Tag, ToggleLeft, ToggleRight, Scissors } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  type ServiceInput,
  type ServiceItem,
} from '@/hooks/useServices';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────────

// Category color palette — cycles through for any custom category
const CATEGORY_PALETTE: { bg: string; text: string }[] = [
  { bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  { bg: 'bg-[#25D366]/15',  text: 'text-[#25D366]'  },
  { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  { bg: 'bg-cyan-500/15',   text: 'text-cyan-400'   },
  { bg: 'bg-pink-500/15',   text: 'text-pink-400'   },
  { bg: 'bg-amber-500/15',  text: 'text-amber-400'  },
];

const DEFAULT_STYLE = { bg: 'bg-gray-500/15', text: 'text-gray-400' };

function getCategoryStyle(category: string | undefined | null) {
  if (!category) return DEFAULT_STYLE;
  // Stable color based on string hash
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
}

// ─── Form Modal ────────────────────────────────────────────────────────────────

interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  description: '',
  duration: '30',
  price: '',
  category: '',
};

interface ServiceFormModalProps {
  businessId: string;
  service?: ServiceItem;
  serviceIndex?: number;
  existingCategories?: string[];
  onClose: () => void;
}

function ServiceFormModal({ businessId, service, serviceIndex, existingCategories = [], onClose }: ServiceFormModalProps) {
  const isEdit = service !== undefined && serviceIndex !== undefined;
  const createMutation = useCreateService(businessId);
  const updateMutation = useUpdateService(businessId);

  const [form, setForm] = useState<ServiceFormData>({
    name: service?.name ?? '',
    description: service?.description ?? '',
    duration: String(service?.duration ?? 30),
    price: service?.price != null ? String(service.price) : '',
    category: service?.category ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    const duration = parseInt(form.duration, 10);
    if (isNaN(duration) || duration <= 0) { setError('La durée doit être un nombre positif.'); return; }

    const input: ServiceInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      duration,
      price: form.price ? parseFloat(form.price) : undefined,
      category: form.category || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ index: serviceIndex, input });
        toast.success('Service mis a jour');
      } else {
        await createMutation.mutateAsync(input);
        toast.success('Service cree');
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(msg);
      toast.error(msg);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-colors';
  const labelCls = 'block text-xs text-gray-400 mb-1.5';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 id="service-modal-title" className="text-white font-semibold">
              {isEdit ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className={labelCls}>Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ex: Coupe femme"
                required
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                placeholder="Description du service..."
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            {/* Duration + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Durée (min) *</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setField('duration', e.target.value)}
                  min="5"
                  max="480"
                  step="5"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Prix (XPF)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Catégorie</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {existingCategories.map((cat) => {
                  const style = getCategoryStyle(cat);
                  const active = form.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setField('category', active ? '' : cat)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                        active
                          ? cn(style.bg, style.text, 'border-current')
                          : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600',
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                placeholder="Ou saisir une catégorie..."
                className={inputCls}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#25D366' }}
              >
                {isPending ? 'Sauvegarde...' : isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Service Card ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  onEdit: (s: ServiceItem, i: number) => void;
  onDelete: (s: ServiceItem, i: number) => void;
  onToggle: (s: ServiceItem, i: number) => void;
  isToggling: boolean;
}

function ServiceCard({ service, index, onEdit, onDelete, onToggle, isToggling }: ServiceCardProps) {
  const catStyle = getCategoryStyle(service.category);
  const isActive = service.is_active !== false;

  return (
    <div
      className={cn(
        'rounded-xl bg-gray-900 border p-5 flex flex-col gap-3 transition-opacity',
        isActive ? 'border-gray-800' : 'border-gray-800/50 opacity-60',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gray-800 text-gray-400 shrink-0">
            <Scissors size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{service.name}</h3>
            {service.description && (
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{service.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(service, index)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(service, index)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Duration */}
        <div className="flex items-center gap-1 text-gray-500">
          <Clock size={13} />
          <span className="text-xs">{service.duration} min</span>
        </div>

        {/* Price */}
        {service.price != null && service.price > 0 && (
          <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded-md">
            {service.price.toLocaleString('fr-FR')} XPF
          </span>
        )}

        {/* Category */}
        {service.category && (
          <div className="flex items-center gap-1">
            <Tag size={11} className="text-gray-600" />
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', catStyle.bg, catStyle.text)}>
              {service.category}
            </span>
          </div>
        )}
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          {isActive ? 'Actif' : 'Inactif'}
        </span>
        <button
          onClick={() => onToggle(service, index)}
          disabled={isToggling}
          className={cn(
            'transition-colors disabled:opacity-50',
            isActive ? 'text-[#25D366] hover:text-[#25D366]/80' : 'text-gray-600 hover:text-gray-400',
          )}
          title={isActive ? 'Désactiver' : 'Activer'}
        >
          {isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { businessId, businessName } = useAppStore();

  const { data: services, isLoading } = useServices(businessId);
  const updateMutation = useUpdateService(businessId ?? '');
  const deleteMutation = useDeleteService(businessId ?? '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<{ service: ServiceItem; index: number } | null>(null);
  const [deletingService, setDeletingService] = useState<{ service: ServiceItem; index: number } | null>(null);

  function handleToggle(service: ServiceItem, index: number) {
    const willActivate = service.is_active === false;
    updateMutation.mutate(
      { index, input: { is_active: willActivate } },
      {
        onSuccess: () => toast.success(willActivate ? 'Service active' : 'Service desactive'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise a jour'),
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingService) return;
    deleteMutation.mutate(deletingService.index, {
      onSuccess: () => {
        toast.success('Service supprime');
        setDeletingService(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression'),
    });
  }

  const activeServices = services?.filter((s) => s.is_active !== false) ?? [];
  const totalCount = services?.length ?? 0;

  // Derive unique categories from existing services
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    services?.forEach((s) => { if (s.category) cats.add(s.category); });
    return Array.from(cats).sort();
  }, [services]);

  return (
    <DashboardLayout title="Services" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">Catalogue de services</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">
                {activeServices.length} actif{activeServices.length !== 1 ? 's' : ''} · {totalCount} au total
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Ajouter un service
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}

          {!isLoading && totalCount === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
                <Scissors size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Aucun service créé</p>
              <p className="text-gray-600 text-sm mt-1">
                Ajoutez vos premiers services pour activer les réservations.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#25D366' }}
              >
                <Plus size={16} />
                Ajouter un service
              </button>
            </div>
          )}

          {!isLoading && services?.map((service, index) => (
            <ServiceCard
              key={`${service.name}-${index}`}
              service={service}
              index={index}
              onEdit={(s, i) => setEditingService({ service: s, index: i })}
              onDelete={(s, i) => setDeletingService({ service: s, index: i })}
              onToggle={handleToggle}
              isToggling={updateMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <ServiceFormModal
          businessId={businessId}
          existingCategories={existingCategories}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingService && businessId && (
        <ServiceFormModal
          businessId={businessId}
          service={editingService.service}
          serviceIndex={editingService.index}
          existingCategories={existingCategories}
          onClose={() => setEditingService(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deletingService)}
        title="Supprimer le service ?"
        description={`Le service "${deletingService?.service.name ?? ''}" sera supprime du catalogue. Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingService(null)}
      />
    </DashboardLayout>
  );
}
