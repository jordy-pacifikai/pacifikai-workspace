'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tag color palette (same hash) ──────────────────────────────────────────

const TAG_COLORS: string[] = [
  'bg-violet-900/60 text-violet-300 border-violet-700',
  'bg-blue-900/60 text-blue-300 border-blue-700',
  'bg-amber-900/60 text-amber-300 border-amber-700',
  'bg-rose-900/60 text-rose-300 border-rose-700',
  'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  'bg-pink-900/60 text-pink-300 border-pink-700',
  'bg-cyan-900/60 text-cyan-300 border-cyan-700',
  'bg-indigo-900/60 text-indigo-300 border-indigo-700',
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface TagFilterBarProps {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TagFilterBar({ allTags, selectedTags, onToggle, onClear }: TagFilterBarProps) {
  if (allTags.length === 0) return null;

  return (
    <div className="bg-gray-900/50 rounded-lg p-2 flex items-center gap-2">
      <span className="text-xs text-gray-500 font-medium shrink-0 pl-1">Tags :</span>

      <div className="flex-1 overflow-x-auto flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-gray-700">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs border whitespace-nowrap transition-all shrink-0',
                isSelected
                  ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-900/30 text-emerald-300'
                  : tagColor(tag) + ' opacity-70 hover:opacity-100',
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
          Effacer filtres
        </button>
      )}
    </div>
  );
}
