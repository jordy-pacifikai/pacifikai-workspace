'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tag color palette (same hash as clients page) ──────────────────────────

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

interface TagEditorProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  suggestions?: string[];
}

const MAX_TAGS = 10;

// ─── Component ──────────────────────────────────────────────────────────────

export function TagEditor({ tags, onUpdate, suggestions = [] }: TagEditorProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions: match input, not already in tags
  const filtered = input.trim()
    ? suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase().trim()))
        .filter((s) => !tags.includes(s))
        .slice(0, 8)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (tags.includes(trimmed)) return;
      if (tags.length >= MAX_TAGS) return;
      onUpdate([...tags, trimmed]);
      setInput('');
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [tags, onUpdate],
  );

  const removeTag = useCallback(
    (tag: string) => {
      onUpdate(tags.filter((t) => t !== tag));
    },
    [tags, onUpdate],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        addTag(filtered[highlightIndex]);
      } else {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Tag badges + input */}
      <div
        className="flex flex-wrap items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 focus-within:border-[#0d9488] transition-colors cursor-text min-h-[40px]"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
              tagColor(tag),
            )}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-red-400 transition-colors leading-none"
              aria-label={`Supprimer ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            placeholder={tags.length === 0 ? 'Ajouter un tag...' : 'Ajouter...'}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
        )}

        {tags.length >= MAX_TAGS && (
          <span className="text-xs text-gray-500 italic">Max {MAX_TAGS} tags</span>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((suggestion, idx) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2',
                idx === highlightIndex
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white',
              )}
              onMouseEnter={() => setHighlightIndex(idx)}
              onClick={() => addTag(suggestion)}
            >
              <span
                className={cn(
                  'inline-block w-2 h-2 rounded-full border',
                  tagColor(suggestion),
                )}
              />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
