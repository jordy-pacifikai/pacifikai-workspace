'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// ─── Store (mini pub/sub, no external deps) ─────────────────────────────────

type Listener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function addToast(message: string, type: ToastType, duration = 3000) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ToastItem = { id, message, type, duration };
  toasts = [...toasts, item];
  notify();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function getToasts(): ToastItem[] {
  return toasts;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const toast = {
  success: (message: string, duration?: number) => addToast(message, 'success', duration),
  error: (message: string, duration?: number) => addToast(message, 'error', duration),
  info: (message: string, duration?: number) => addToast(message, 'info', duration),
};

// ─── Icons ──────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M8 7v4M8 5.5v.01" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Single Toast ────────────────────────────────────────────────────────────

function ToastEntry({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
  };

  const borderColorMap: Record<ToastType, string> = {
    success: 'rgb(34 197 94 / 0.3)',
    error: 'rgb(239 68 68 / 0.3)',
    info: 'rgb(59 130 246 / 0.3)',
  };

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl bg-gray-900 border px-4 py-3 shadow-lg transition-all duration-300 ease-out"
      style={{
        borderColor: borderColorMap[item.type],
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        opacity: visible ? 1 : 0,
        minWidth: '260px',
        maxWidth: '380px',
      }}
    >
      <div className="flex-shrink-0">{iconMap[item.type]}</div>
      <p className="flex-1 text-sm text-gray-200 leading-tight">{item.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-0.5"
        aria-label="Fermer"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ─── Container ──────────────────────────────────────────────────────────────

export function ToastContainer() {
  const [, setTick] = useState(0);

  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, [rerender]);

  const currentToasts = getToasts();

  if (currentToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-auto"
      role="status"
      aria-live="polite"
    >
      {currentToasts.map((t) => (
        <ToastEntry key={t.id} item={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
