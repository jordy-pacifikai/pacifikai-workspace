'use client';

import { useState, useEffect, useRef } from 'react';

interface InlineNotesProps {
  appointmentId: string;
  initialNotes: string | null;
  businessId: string;
}

export function InlineNotes({ appointmentId, initialNotes, businessId }: InlineNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialNotes ?? '');
  const [saved, setSaved] = useState(initialNotes ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    if (value === saved) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await fetch('/api/appointments/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, businessId, notes: value || null }),
      });
      if (res.ok) setSaved(value);
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, isEditing, appointmentId, businessId, saved]);

  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Flush save on blur
    if (value !== saved) {
      fetch('/api/appointments/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, businessId, notes: value || null }),
      }).then((res) => { if (res.ok) setSaved(value); });
    }
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <textarea
        autoFocus
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Ajouter une note..."
        className="w-full bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 px-2 py-1.5 resize-none focus:outline-none focus:border-gray-600"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-left w-full"
    >
      {saved ? (
        <span className="text-xs text-gray-500 truncate block max-w-xs">
          {saved.length > 60 ? saved.slice(0, 60) + '…' : saved}
        </span>
      ) : (
        <span className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
          + Ajouter une note
        </span>
      )}
    </button>
  );
}
