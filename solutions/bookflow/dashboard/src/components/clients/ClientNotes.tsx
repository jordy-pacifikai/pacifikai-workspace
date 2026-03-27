'use client';

import { useState, useRef, useCallback } from 'react';
import { NotebookPen, Check, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientNotesProps {
  clientId: string;
  businessId: string;
  initialNotes: string | null;
  /** Called after a successful save so the parent can update its query cache */
  onSaved?: (notes: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientNotes({ clientId, businessId, initialNotes, onSaved }: ClientNotesProps) {
  const [value, setValue] = useState(initialNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    // Nothing to do if unchanged
    if (value === (initialNotes ?? '')) return;

    setSaving(true);
    setSaved(false);

    const res = await fetch('/api/clients/notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, businessId, notes: value || null }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error('Erreur lors de la sauvegarde des notes');
      return;
    }

    setSaved(true);
    onSaved?.(value);

    // Reset saved indicator after 2.5s
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2500);
  }, [value, initialNotes, clientId, businessId, onSaved]);

  const handleBlur = () => {
    save();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S / Cmd+S — save immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0d9488]/10 border border-[#0d9488]/20 flex items-center justify-center">
            <NotebookPen className="w-3.5 h-3.5 text-[#0d9488]" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Notes internes
          </p>
        </div>

        {/* Save indicator */}
        <div className="flex items-center gap-1.5 h-5">
          {saving && (
            <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
          )}
          {saved && !saving && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              Sauvegardé
            </span>
          )}
          {!saving && !saved && value !== (initialNotes ?? '') && (
            <span className="text-xs text-gray-600">Non sauvegardé</span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={4}
        placeholder="Notes sur ce client (allergies, préférences, informations importantes...)&#10;Sauvegarde automatique à la perte du focus."
        className={cn(
          'w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3',
          'text-sm text-gray-200 placeholder:text-gray-600',
          'resize-none focus:outline-none focus:border-[#0d9488]/50 focus:ring-1 focus:ring-[#0d9488]/20',
          'transition-colors',
        )}
      />

      <p className="text-xs text-gray-700">
        Sauvegarde automatique à la perte du focus · Cmd+S pour sauvegarder immédiatement
      </p>
    </div>
  );
}
