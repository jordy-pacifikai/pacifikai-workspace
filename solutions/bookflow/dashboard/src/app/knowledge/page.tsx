'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, FileText, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import {
  useKnowledge,
  useCreateKnowledge,
  useUpdateKnowledge,
  useDeleteKnowledge,
  type KnowledgeDoc,
  type KnowledgeInput,
} from '@/hooks/useKnowledge';
import { cn } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ['general', 'faq', 'politique', 'paiement', 'service', 'info'];

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Général',
  faq: 'FAQ',
  politique: 'Politique',
  paiement: 'Paiement',
  service: 'Service',
  info: 'Info pratique',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general:   { bg: 'bg-gray-500/15',    text: 'text-gray-400'   },
  faq:       { bg: 'bg-blue-500/15',    text: 'text-blue-400'   },
  politique: { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  paiement:  { bg: 'bg-[#25D366]/15',   text: 'text-[#25D366]'  },
  service:   { bg: 'bg-purple-500/15',  text: 'text-purple-400' },
  info:      { bg: 'bg-cyan-500/15',    text: 'text-cyan-400'   },
};

function getCategoryStyle(category: string | null) {
  if (!category) return { bg: 'bg-gray-500/15', text: 'text-gray-400' };
  return CATEGORY_COLORS[category] ?? { bg: 'bg-gray-500/15', text: 'text-gray-400' };
}

// ─── Form Modal ────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  category: string;
  content: string;
}

const EMPTY_FORM: FormData = { title: '', category: 'general', content: '' };

interface KnowledgeFormModalProps {
  businessId: string;
  doc?: KnowledgeDoc;
  onClose: () => void;
}

function KnowledgeFormModal({ businessId, doc, onClose }: KnowledgeFormModalProps) {
  const isEdit = Boolean(doc);
  const [form, setForm] = useState<FormData>(
    doc
      ? { title: doc.title, category: doc.category ?? 'general', content: doc.content }
      : EMPTY_FORM
  );

  const createMut = useCreateKnowledge(businessId);
  const updateMut = useUpdateKnowledge(businessId);

  const saving = createMut.isPending || updateMut.isPending;

  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;

    const input: KnowledgeInput = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
    };

    if (isEdit && doc) {
      updateMut.mutate({ id: doc.id, input }, { onSuccess: onClose });
    } else {
      createMut.mutate(input, { onSuccess: onClose });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {isEdit ? 'Modifier le document' : 'Nouveau document'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Politique d'annulation"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#25D366]/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#25D366]/50"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contenu</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Écris ici les informations que le chatbot doit connaître..."
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#25D366]/50 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              {form.content.length} caractères — le chatbot utilise ce contenu pour répondre aux clients
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.content.trim()}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-40"
            style={{ backgroundColor: '#25D366' }}
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  doc: KnowledgeDoc;
  businessId: string;
  onClose: () => void;
}

function DeleteConfirm({ doc, businessId, onClose }: DeleteConfirmProps) {
  const deleteMut = useDeleteKnowledge(businessId);

  function handleDelete() {
    deleteMut.mutate(doc.id, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Supprimer ?</h3>
        <p className="text-sm text-gray-400 mb-6">
          Le document &quot;{doc.title}&quot; sera supprimé définitivement. Le chatbot ne pourra plus utiliser ces informations.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMut.isPending}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition disabled:opacity-40"
          >
            {deleteMut.isPending ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const businessId = useAppStore((s) => s.businessId);
  const { data: docs, isLoading } = useKnowledge(businessId);

  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | undefined>();
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeDoc | undefined>();

  function openCreate() {
    setEditDoc(undefined);
    setShowForm(true);
  }

  function openEdit(doc: KnowledgeDoc) {
    setEditDoc(doc);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditDoc(undefined);
  }

  return (
    <DashboardLayout title="Base de connaissances">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen size={24} style={{ color: '#25D366' }} />
            Base de connaissances
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Informations utilisées par le chatbot pour répondre aux clients
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: '#25D366' }}
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !docs?.length ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-2">Aucun document</p>
          <p className="text-gray-600 text-sm mb-6">
            Ajoute des informations (FAQ, politiques, horaires spéciaux...) pour que ton chatbot puisse répondre aux questions de tes clients.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Créer ton premier document
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {docs.map((doc) => {
            const style = getCategoryStyle(doc.category);
            return (
              <div
                key={doc.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-white truncate">{doc.title}</h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0',
                          style.bg,
                          style.text,
                        )}
                      >
                        {CATEGORY_LABELS[doc.category ?? ''] ?? doc.category ?? 'Général'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{doc.content}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {doc.content.length} caractères
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => openEdit(doc)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition"
                      title="Modifier"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteDoc(doc)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && businessId && (
        <KnowledgeFormModal
          businessId={businessId}
          doc={editDoc}
          onClose={closeForm}
        />
      )}
      {deleteDoc && businessId && (
        <DeleteConfirm
          doc={deleteDoc}
          businessId={businessId}
          onClose={() => setDeleteDoc(undefined)}
        />
      )}
    </DashboardLayout>
  );
}
