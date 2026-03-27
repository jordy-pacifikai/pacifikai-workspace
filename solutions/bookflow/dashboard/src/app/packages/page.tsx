'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Tag,
  Hash,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { useServices } from '@/hooks/useServices';
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  type Package as PackageType,
  type PackageInput,
} from '@/hooks/usePackages';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Form Modal ────────────────────────────────────────────────────────────────

interface PackageFormData {
  name: string;
  description: string;
  services: string[];
  total_sessions: string;
  price: string;
  original_price: string;
  valid_days: string;
  is_active: boolean;
}

const EMPTY_FORM: PackageFormData = {
  name: '',
  description: '',
  services: [],
  total_sessions: '5',
  price: '',
  original_price: '',
  valid_days: '365',
  is_active: true,
};

interface PackageFormModalProps {
  businessId: string;
  availableServices: string[];
  pkg?: PackageType;
  onClose: () => void;
}

function PackageFormModal({ businessId, availableServices, pkg, onClose }: PackageFormModalProps) {
  const isEdit = Boolean(pkg);
  const createMutation = useCreatePackage(businessId);
  const updateMutation = useUpdatePackage(businessId);

  const [form, setForm] = useState<PackageFormData>({
    name: pkg?.name ?? '',
    description: pkg?.description ?? '',
    services: pkg?.services ?? [],
    total_sessions: String(pkg?.total_sessions ?? 5),
    price: pkg?.price != null ? String(pkg.price) : '',
    original_price: pkg?.original_price != null ? String(pkg.original_price) : '',
    valid_days: String(pkg?.valid_days ?? 365),
    is_active: pkg?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof PackageFormData>(key: K, value: PackageFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(name: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(name)
        ? prev.services.filter((s) => s !== name)
        : [...prev.services, name],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    const price = parseInt(form.price, 10);
    if (isNaN(price) || price < 0) { setError('Le prix doit être un nombre valide.'); return; }
    const sessions = parseInt(form.total_sessions, 10);
    if (isNaN(sessions) || sessions < 1) { setError('Le nombre de séances doit être supérieur à 0.'); return; }

    const input: PackageInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      services: form.services,
      total_sessions: sessions,
      price,
      original_price: form.original_price ? parseInt(form.original_price, 10) : null,
      valid_days: parseInt(form.valid_days, 10) || 365,
      is_active: form.is_active,
    };

    try {
      if (isEdit && pkg) {
        await updateMutation.mutateAsync({ id: pkg.id, input });
        toast.success('Forfait mis a jour');
      } else {
        await createMutation.mutateAsync(input);
        toast.success('Forfait cree');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl my-auto" role="dialog" aria-modal="true" aria-labelledby="package-modal-title">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 id="package-modal-title" className="text-white font-semibold">
              {isEdit ? 'Modifier le forfait' : 'Nouveau forfait'}
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
                placeholder="Ex: Pack 10 séances"
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
                placeholder="Description du forfait..."
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            {/* Services inclus */}
            <div>
              <label className={labelCls}>Services inclus</label>
              {availableServices.length === 0 ? (
                <p className="text-gray-600 text-xs italic">Aucun service configuré.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableServices.map((svc) => {
                    const active = form.services.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                          active
                            ? 'bg-[#25D366]/15 text-[#25D366] border-[#25D366]/40'
                            : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600',
                        )}
                      >
                        {svc}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Séances + Validité */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nombre de séances *</label>
                <input
                  type="number"
                  value={form.total_sessions}
                  onChange={(e) => setField('total_sessions', e.target.value)}
                  min="1"
                  max="999"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Validité (jours)</label>
                <input
                  type="number"
                  value={form.valid_days}
                  onChange={(e) => setField('valid_days', e.target.value)}
                  min="1"
                  max="3650"
                  placeholder="365"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Prix + Prix barré */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Prix (XPF) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Prix d'origine (XPF)</label>
                <input
                  type="number"
                  value={form.original_price}
                  onChange={(e) => setField('original_price', e.target.value)}
                  min="0"
                  step="100"
                  placeholder="Optionnel"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Actif toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-800">
              <span className="text-sm text-gray-400">Forfait actif</span>
              <button
                type="button"
                onClick={() => setField('is_active', !form.is_active)}
                className={cn(
                  'transition-colors',
                  form.is_active ? 'text-[#25D366]' : 'text-gray-600',
                )}
              >
                {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
              </button>
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

// ─── Package Card ──────────────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: PackageType;
  onEdit: (pkg: PackageType) => void;
  onDelete: (pkg: PackageType) => void;
  onToggle: (pkg: PackageType) => void;
  isToggling: boolean;
}

function PackageCard({ pkg, onEdit, onDelete, onToggle, isToggling }: PackageCardProps) {
  const discount = pkg.original_price && pkg.original_price > pkg.price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
    : null;

  return (
    <div
      className={cn(
        'rounded-xl bg-gray-900 border p-5 flex flex-col gap-3 transition-opacity',
        pkg.is_active ? 'border-gray-800' : 'border-gray-800/50 opacity-60',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gray-800 text-gray-400 shrink-0">
            <Package size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{pkg.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {discount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              -{discount}%
            </span>
          )}
          <button
            onClick={() => onEdit(pkg)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(pkg)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Services inclus */}
      {pkg.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pkg.services.map((svc) => (
            <span
              key={svc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-gray-800 text-gray-400"
            >
              <Tag size={9} />
              {svc}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sessions */}
        <div className="flex items-center gap-1 text-gray-400">
          <Hash size={13} />
          <span className="text-xs font-medium">{pkg.total_sessions} séance{pkg.total_sessions > 1 ? 's' : ''}</span>
        </div>

        {/* Validity */}
        {pkg.valid_days && (
          <div className="flex items-center gap-1 text-gray-500">
            <CalendarDays size={12} />
            <span className="text-xs">{pkg.valid_days} jours</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-1.5 ml-auto">
          {pkg.original_price && pkg.original_price > pkg.price && (
            <span className="text-xs text-gray-600 line-through">
              {pkg.original_price.toLocaleString('fr-FR')} XPF
            </span>
          )}
          <span className="text-sm font-bold text-white">
            {pkg.price.toLocaleString('fr-FR')} XPF
          </span>
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          {pkg.is_active ? 'Actif' : 'Inactif'}
        </span>
        <button
          onClick={() => onToggle(pkg)}
          disabled={isToggling}
          className={cn(
            'transition-colors disabled:opacity-50',
            pkg.is_active ? 'text-[#25D366] hover:text-[#25D366]/80' : 'text-gray-600 hover:text-gray-400',
          )}
          title={pkg.is_active ? 'Désactiver' : 'Activer'}
        >
          {pkg.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  const { businessId, businessName } = useAppStore();

  const { data: packages, isLoading } = usePackages(businessId);
  const { data: services } = useServices(businessId);
  const updateMutation = useUpdatePackage(businessId);
  const deleteMutation = useDeletePackage(businessId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageType | null>(null);
  const [deletingPkg, setDeletingPkg] = useState<PackageType | null>(null);

  const availableServiceNames = (services ?? [])
    .filter((s) => s.is_active !== false)
    .map((s) => s.name);

  function handleToggle(pkg: PackageType) {
    const willActivate = !pkg.is_active;
    updateMutation.mutate(
      { id: pkg.id, input: { is_active: willActivate } },
      {
        onSuccess: () => toast.success(willActivate ? 'Forfait active' : 'Forfait desactive'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise a jour'),
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingPkg) return;
    deleteMutation.mutate(deletingPkg.id, {
      onSuccess: () => {
        toast.success('Forfait supprime');
        setDeletingPkg(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression'),
    });
  }

  const activeCount = (packages ?? []).filter((p) => p.is_active).length;
  const totalCount = packages?.length ?? 0;

  return (
    <DashboardLayout title="Forfaits" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">Forfaits & Packs</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">
                {activeCount} actif{activeCount !== 1 ? 's' : ''} · {totalCount} au total
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Créer un forfait
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
                <Package size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Aucun forfait créé</p>
              <p className="text-gray-600 text-sm mt-1">
                Créez des packs prépayés pour fidéliser vos clients.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#25D366' }}
              >
                <Plus size={16} />
                Créer un forfait
              </button>
            </div>
          )}

          {!isLoading && packages?.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={(p) => setEditingPkg(p)}
              onDelete={(p) => setDeletingPkg(p)}
              onToggle={handleToggle}
              isToggling={updateMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <PackageFormModal
          businessId={businessId}
          availableServices={availableServiceNames}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingPkg && businessId && (
        <PackageFormModal
          businessId={businessId}
          availableServices={availableServiceNames}
          pkg={editingPkg}
          onClose={() => setEditingPkg(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deletingPkg)}
        title="Supprimer le forfait ?"
        description={`Le forfait "${deletingPkg?.name ?? ''}" sera supprime. Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPkg(null)}
      />
    </DashboardLayout>
  );
}
