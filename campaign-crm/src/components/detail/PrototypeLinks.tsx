'use client';

import { ExternalLink, Globe } from 'lucide-react';
import type { Prospect } from '@/lib/types';

const PROTOTYPE_LABELS = ['Style sombre', 'Style gold', 'Style clair'];

interface PrototypeLinksProps {
  prospect: Prospect;
}

export function PrototypeLinks({ prospect }: PrototypeLinksProps) {
  const { prototype_urls } = prospect;

  if (!prototype_urls || prototype_urls.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Globe size={32} className="text-[#333]" />
        <p className="text-sm text-[#888]">Aucun prototype disponible</p>
        <p className="text-xs text-[#666]">Les sites prototypes seront générés automatiquement</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {prototype_urls.map((url, i) => {
        const label = PROTOTYPE_LABELS[i] ?? `Prototype ${i + 1}`;

        const accent =
          i === 0
            ? { border: 'border-[#222233] hover:border-gray-600', dot: 'bg-gray-400', text: 'text-gray-300' }
            : i === 1
            ? { border: 'border-[#3a2e00] hover:border-amber-700', dot: 'bg-amber-400', text: 'text-amber-300' }
            : { border: 'border-[#1a2a1a] hover:border-teal-700', dot: 'bg-teal-400', text: 'text-teal-300' };

        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-lg border bg-[#0a0a12] px-4 py-3 transition-all ${accent.border} group`}
          >
            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${accent.dot}`} />
            <div className="flex flex-1 flex-col min-w-0">
              <span className={`text-sm font-medium ${accent.text}`}>{label}</span>
              <span className="truncate text-xs text-[#888]">{url}</span>
            </div>
            <ExternalLink
              size={14}
              className="flex-shrink-0 text-[#888] opacity-0 transition-opacity group-hover:opacity-100"
            />
          </a>
        );
      })}
    </div>
  );
}
