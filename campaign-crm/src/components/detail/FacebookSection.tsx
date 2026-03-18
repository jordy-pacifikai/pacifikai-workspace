'use client';

import { Facebook, ExternalLink, MessageCircle, Search, ThumbsUp } from 'lucide-react';
import type { Prospect } from '@/lib/types';

interface FacebookSectionProps {
  prospect: Prospect;
}

export function FacebookSection({ prospect }: FacebookSectionProps) {
  const { facebook_url, facebook_page_name, facebook_page_likes, facebook_messenger_sent } = prospect;

  if (!facebook_url) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Facebook size={36} className="text-[#333]" />
        <div>
          <p className="text-sm text-[#888]">Page Facebook non trouvée</p>
          <p className="text-xs text-[#666] mt-1">
            Aucune page Facebook associée à ce prospect
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/30 px-4 py-2 text-sm text-[#1877F2] transition-colors hover:bg-[#1877F2]/30">
          <Search size={14} />
          Rechercher
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Page card */}
      <a
        href={facebook_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-[#1877F2]/20 bg-[#0a0a18] px-4 py-3 transition-colors hover:border-[#1877F2]/40 group"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1877F2]">
          <Facebook size={18} className="text-white" />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="truncate text-sm font-medium text-[#e0e0e0]">
            {facebook_page_name ?? 'Page Facebook'}
          </span>
          <span className="truncate text-xs text-[#888]">{facebook_url}</span>
        </div>
        <ExternalLink
          size={14}
          className="flex-shrink-0 text-[#888] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {facebook_page_likes !== null && (
          <div className="flex items-center gap-2 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
            <ThumbsUp size={14} className="text-[#1877F2]" />
            <div>
              <p className="text-xs text-[#888]">Likes</p>
              <p className="text-sm font-semibold text-[#e0e0e0]">
                {facebook_page_likes.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
          <MessageCircle size={14} className={facebook_messenger_sent ? 'text-green-400' : 'text-[#888]'} />
          <div>
            <p className="text-xs text-[#888]">Messenger</p>
            <p className={`text-sm font-semibold ${facebook_messenger_sent ? 'text-green-400' : 'text-[#888]'}`}>
              {facebook_messenger_sent ? 'Envoyé' : 'Non envoyé'}
            </p>
          </div>
        </div>
      </div>

      {/* Open in Messenger */}
      {prospect.facebook_url && (
        <a
          href={`https://m.me/${facebook_page_name ?? ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 px-4 py-2 text-sm text-[#1877F2] transition-colors hover:bg-[#1877F2]/20"
        >
          <MessageCircle size={14} />
          Ouvrir Messenger
        </a>
      )}
    </div>
  );
}
