'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { changelog } from '@/lib/changelog';
import { ChangelogPanel } from './ChangelogPanel';

const STORAGE_KEY = 'vea_changelog_last_seen';

export function ChangelogButton() {
  const [open, setOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (!lastSeen && changelog.length > 0) {
      setHasUnseen(true);
    } else if (lastSeen && changelog.length > 0 && changelog[0].date > lastSeen) {
      setHasUnseen(true);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setHasUnseen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-150 relative"
      >
        <Sparkles size={17} className="shrink-0 text-amber-400" />
        Nouveautes
        {hasUnseen && (
          <span className="absolute top-2 left-[22px] w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      <ChangelogPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
