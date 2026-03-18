'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Modal({ open, onClose, title, children, actions, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Trap focus
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 flex flex-col rounded-xl border border-[#222233] bg-[#141420] shadow-2xl',
          size === 'sm' && 'w-full max-w-sm',
          size === 'md' && 'w-full max-w-md',
          size === 'lg' && 'w-full max-w-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222233] px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-[#e0e0e0]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#1a1a2e] hover:text-[#e0e0e0]"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex justify-end gap-2 border-t border-[#222233] px-6 py-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
