'use client';

import { useState } from 'react';
import { Mail, Phone, Globe, Facebook, Instagram, Copy, Check } from 'lucide-react';
import type { Prospect } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContactSectionProps {
  prospect: Prospect;
}

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  href?: string;
}

function ContactRow({ icon, label, value, href }: ContactRowProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
      <span className="flex-shrink-0 text-[#0D9488]">{icon}</span>
      <div className="flex flex-1 flex-col min-w-0">
        <span className="text-[10px] text-[#888] uppercase tracking-wider">{label}</span>
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-[#e0e0e0] hover:text-[#0D9488] transition-colors"
            >
              {value}
            </a>
          ) : (
            <span className="truncate text-sm text-[#e0e0e0]">{value}</span>
          )
        ) : (
          <span className="text-sm text-[#888]">—</span>
        )}
      </div>
      {value && (
        <button
          onClick={handleCopy}
          className={cn(
            'flex-shrink-0 rounded-md p-1 transition-colors',
            copied ? 'text-green-400' : 'text-[#888] hover:text-[#e0e0e0]'
          )}
          aria-label={`Copier ${label}`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}

export function ContactSection({ prospect }: ContactSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <ContactRow
        icon={<Mail size={14} />}
        label="Email"
        value={prospect.email}
        href={prospect.email ? `mailto:${prospect.email}` : undefined}
      />
      <ContactRow
        icon={<Phone size={14} />}
        label="Téléphone"
        value={prospect.phone}
        href={prospect.phone ? `tel:${prospect.phone}` : undefined}
      />
      <ContactRow
        icon={<Globe size={14} />}
        label="Site web"
        value={prospect.website}
        href={prospect.website ?? undefined}
      />
      <ContactRow
        icon={<Facebook size={14} />}
        label="Facebook"
        value={prospect.facebook_url}
        href={prospect.facebook_url ?? undefined}
      />
      <ContactRow
        icon={<Instagram size={14} />}
        label="Instagram"
        value={prospect.instagram_url}
        href={prospect.instagram_url ?? undefined}
      />

      {/* Additional info */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#888]">Ville</p>
          <p className="text-sm text-[#e0e0e0]">{prospect.city || '—'}</p>
        </div>
        <div className="rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#888]">Île</p>
          <p className="text-sm text-[#e0e0e0]">{prospect.island || '—'}</p>
        </div>
        {prospect.subsector && (
          <div className="col-span-2 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#888]">Sous-secteur</p>
            <p className="text-sm text-[#e0e0e0]">{prospect.subsector}</p>
          </div>
        )}
        {prospect.description && (
          <div className="col-span-2 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#888]">Description</p>
            <p className="text-sm text-[#e0e0e0] leading-relaxed">{prospect.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
