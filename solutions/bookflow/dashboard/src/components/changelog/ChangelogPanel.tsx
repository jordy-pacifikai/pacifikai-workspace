'use client';

import { useEffect, useRef } from 'react';
import { X, Sparkles, Zap, Wrench } from 'lucide-react';
import { changelog, type ChangelogEntry } from '@/lib/changelog';

const STORAGE_KEY = 'vea_changelog_last_seen';

function formatDateFr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

function getTypeBadge(type: ChangelogEntry['type']) {
  switch (type) {
    case 'feature':
      return {
        label: 'Nouveau',
        className: 'bg-emerald-500/15 text-emerald-400',
        Icon: Sparkles,
      };
    case 'improvement':
      return {
        label: 'Amelioration',
        className: 'bg-blue-500/15 text-blue-400',
        Icon: Zap,
      };
    case 'fix':
      return {
        label: 'Correction',
        className: 'bg-amber-500/15 text-amber-400',
        Icon: Wrench,
      };
  }
}

interface ChangelogPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ChangelogPanel({ open, onClose }: ChangelogPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastSeen = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null;

  // Mark all as seen when panel opens
  useEffect(() => {
    if (open && changelog.length > 0) {
      localStorage.setItem(STORAGE_KEY, changelog[0].date);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-screen w-full max-w-[400px] z-[70] bg-gray-900 border-l border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Nouveautes</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {changelog.map((entry) => {
            const badge = getTypeBadge(entry.type);
            const isNew = lastSeen ? entry.date > lastSeen : false;

            return (
              <div
                key={entry.version}
                className="relative p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                {/* New indicator dot */}
                {isNew && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}

                {/* Top row: badge + version + date */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}
                  >
                    <badge.Icon size={11} />
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    v{entry.version}
                  </span>
                  <span className="ml-auto text-[11px] text-gray-500">
                    {formatDateFr(entry.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-100 mb-1">
                  {entry.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  {entry.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
