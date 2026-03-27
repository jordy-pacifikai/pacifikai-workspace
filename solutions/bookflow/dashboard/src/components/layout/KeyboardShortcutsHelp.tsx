'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Cmd', 'K'], description: 'Recherche globale' },
  { keys: ['/'], description: 'Focus recherche' },
  { keys: ['Escape'], description: 'Fermer / Blur' },
  { keys: ['?'], description: 'Aide raccourcis' },
  { keys: ['g', 'h'], description: 'Accueil' },
  { keys: ['g', 'a'], description: 'Rendez-vous' },
  { keys: ['g', 'c'], description: 'Conversations' },
  { keys: ['g', 's'], description: 'Statistiques' },
];

export function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md mx-4 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 id="shortcuts-title" className="text-sm font-semibold text-white">Raccourcis clavier</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div className="px-5 py-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between py-1.5"
            >
              <span className="text-sm text-gray-400">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border border-gray-700 bg-gray-800 text-xs text-gray-300 font-mono">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-gray-600 text-xs mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Appuie sur <kbd className="px-1 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400 font-mono text-[10px]">?</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  );
}
