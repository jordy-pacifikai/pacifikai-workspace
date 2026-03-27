'use client';

// ─── useBookingPersist ────────────────────────────────────────────────────────
// Persists booking form state to sessionStorage.
// Restores on page load (useful if user refreshes mid-flow).
// Clear with clearBookingState() on successful booking.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';

export interface BookingState {
  step: string;
  serviceName: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

const DEFAULT_STATE: BookingState = {
  step: 'service',
  serviceName: null,
  selectedDate: null,
  selectedTime: null,
  clientName: '',
  clientPhone: '',
  clientEmail: '',
};

function getStorageKey(businessId: string) {
  return `vea_booking_${businessId}`;
}

function readFromStorage(businessId: string): BookingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getStorageKey(businessId));
    if (!raw) return null;
    return JSON.parse(raw) as BookingState;
  } catch {
    return null;
  }
}

function writeToStorage(businessId: string, state: BookingState) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getStorageKey(businessId), JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

export function clearBookingState(businessId: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(getStorageKey(businessId));
  } catch {
    // ignore
  }
}

/**
 * Returns [state, setState] with automatic sessionStorage persistence.
 * On mount, restores previously saved state for the given businessId.
 */
export function useBookingPersist(businessId: string) {
  const [state, setStateRaw] = useState<BookingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount (client-only)
  useEffect(() => {
    const saved = readFromStorage(businessId);
    if (saved) {
      setStateRaw(saved);
    }
    setHydrated(true);
  }, [businessId]);

  const setState = useCallback(
    (update: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => {
      setStateRaw((prev) => {
        const patch = typeof update === 'function' ? update(prev) : update;
        const next = { ...prev, ...patch };
        writeToStorage(businessId, next);
        return next;
      });
    },
    [businessId],
  );

  return { state, setState, hydrated };
}
