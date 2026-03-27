'use client';

import { useState, useEffect } from 'react';
import { Check, CheckCheck, XCircle, Trash2, X } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { cn } from '@/lib/utils';

interface BulkActionsProps {
  selectedIds: string[];
  onClear: () => void;
  onBulkAction: (action: 'confirmed' | 'completed' | 'cancelled' | 'delete') => void;
  loading?: boolean;
}

export function BulkActions({ selectedIds, onClear, onBulkAction, loading = false }: BulkActionsProps) {
  const [visible, setVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancelled' | 'delete' | null>(null);

  const count = selectedIds.length;
  const isOpen = count > 0;

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleDestructive(action: 'cancelled' | 'delete') {
    setConfirmAction(action);
  }

  function handleConfirmDestructive() {
    if (confirmAction) {
      onBulkAction(confirmAction);
      setConfirmAction(null);
    }
  }

  const confirmConfig = {
    cancelled: {
      title: `Annuler ${count} rendez-vous ?`,
      description: `${count} rendez-vous seront marqués comme annulés.`,
      confirmLabel: 'Annuler les RDV',
      variant: 'warning' as const,
    },
    delete: {
      title: `Supprimer ${count} rendez-vous ?`,
      description: `${count} rendez-vous seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      variant: 'danger' as const,
    },
  };

  return (
    <>
      {/* Floating bar */}
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl',
          'px-4 sm:px-6 py-3',
          'flex items-center gap-2 sm:gap-3 flex-wrap justify-center',
          'transition-all duration-300 ease-out',
          visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4',
        )}
      >
        {/* Count */}
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {count} sélectionné{count > 1 ? 's' : ''}
        </span>

        <div className="w-px h-5 bg-gray-700 hidden sm:block" />

        {/* Confirm */}
        <button
          onClick={() => onBulkAction('confirmed')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-colors disabled:opacity-50"
        >
          <Check size={13} />
          Confirmer
        </button>

        {/* Complete */}
        <button
          onClick={() => onBulkAction('completed')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
        >
          <CheckCheck size={13} />
          Terminer
        </button>

        {/* Cancel */}
        <button
          onClick={() => handleDestructive('cancelled')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
        >
          <XCircle size={13} />
          Annuler
        </button>

        {/* Delete */}
        <button
          onClick={() => handleDestructive('delete')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/15 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          Supprimer
        </button>

        <div className="w-px h-5 bg-gray-700 hidden sm:block" />

        {/* Deselect all */}
        <button
          onClick={onClear}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X size={13} />
          <span className="hidden sm:inline">Tout désélectionner</span>
          <span className="sm:hidden">Tout</span>
        </button>
      </div>

      {/* Destructive action confirmation modal */}
      {confirmAction && (
        <ConfirmModal
          open={Boolean(confirmAction)}
          title={confirmConfig[confirmAction].title}
          description={confirmConfig[confirmAction].description}
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          variant={confirmConfig[confirmAction].variant}
          loading={loading}
          onConfirm={handleConfirmDestructive}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
