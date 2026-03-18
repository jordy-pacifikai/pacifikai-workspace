import type { ColorPalette, FontPair } from '../types';
import type { TemplateVariant } from '../types';

// ── 8 Color Palettes ────────────────────────────────────────────────

export const PALETTES: Record<string, ColorPalette> = {
  dark_red: {
    name: 'dark_red',
    bg: '#0A0A0A',
    bg2: '#1A1A1A',
    bg3: '#2A2020',
    accent: '#C45D3E',
    text: '#E8E0D4',
    dim: 'rgba(232,224,212,.5)',
    border: 'rgba(232,224,212,.08)',
  },
  dark_blue: {
    name: 'dark_blue',
    bg: '#0A0A12',
    bg2: '#14142A',
    bg3: '#1E1E3A',
    accent: '#4A7BF7',
    text: '#E8EAF0',
    dim: 'rgba(232,234,240,.5)',
    border: 'rgba(232,234,240,.08)',
  },
  dark_green: {
    name: 'dark_green',
    bg: '#0A120A',
    bg2: '#142A14',
    bg3: '#1E3A1E',
    accent: '#3DA87A',
    text: '#E0E8E4',
    dim: 'rgba(224,232,228,.5)',
    border: 'rgba(224,232,228,.08)',
  },
  warm_amber: {
    name: 'warm_amber',
    bg: '#121009',
    bg2: '#1a1610',
    bg3: '#231e16',
    accent: '#E8A838',
    text: '#F5F0E8',
    dim: '#9a917f',
    border: 'rgba(245,240,232,.08)',
  },
  warm_coral: {
    name: 'warm_coral',
    bg: '#120A09',
    bg2: '#1E1210',
    bg3: '#2A1A16',
    accent: '#E85D3A',
    text: '#F5EDE8',
    dim: 'rgba(245,237,232,.5)',
    border: 'rgba(245,237,232,.08)',
  },
  light_teal: {
    name: 'light_teal',
    bg: '#FAF7F2',
    bg2: '#F0EDE8',
    bg3: '#E8E5E0',
    accent: '#0D9488',
    text: '#1A1A1A',
    dim: '#6B7280',
    border: 'rgba(26,26,26,.08)',
  },
  light_blue: {
    name: 'light_blue',
    bg: '#F5F7FA',
    bg2: '#EDF0F5',
    bg3: '#E5E8ED',
    accent: '#3B82F6',
    text: '#111827',
    dim: '#6B7280',
    border: 'rgba(17,24,39,.08)',
  },
  light_plum: {
    name: 'light_plum',
    bg: '#FAF5F7',
    bg2: '#F0EBF0',
    bg3: '#E8E0E5',
    accent: '#9B4D7A',
    text: '#1A1015',
    dim: '#7A6B75',
    border: 'rgba(26,16,21,.08)',
  },
};

// ── 6 Google Fonts Pairings ─────────────────────────────────────────

export const FONT_PAIRS: FontPair[] = [
  {
    display: 'Abril Fatface',
    body: 'Inter',
    display_family: "'Abril Fatface',serif",
    body_family: "'Inter',sans-serif",
  },
  {
    display: 'Playfair Display',
    body: 'DM Sans',
    display_family: "'Playfair Display',Georgia,serif",
    body_family: "'DM Sans',sans-serif",
  },
  {
    display: 'Instrument Serif',
    body: 'Inter',
    display_family: "'Instrument Serif',serif",
    body_family: "'Inter',sans-serif",
  },
  {
    display: 'Bebas Neue',
    body: 'DM Sans',
    display_family: "'Bebas Neue',sans-serif",
    body_family: "'DM Sans',sans-serif",
  },
  {
    display: 'Cormorant Garamond',
    body: 'Montserrat',
    display_family: "'Cormorant Garamond',serif",
    body_family: "'Montserrat',sans-serif",
  },
  {
    display: 'Space Grotesk',
    body: 'Inter',
    display_family: "'Space Grotesk',sans-serif",
    body_family: "'Inter',sans-serif",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

const VARIANT_PALETTE_MAP: Record<TemplateVariant, string[]> = {
  'dark-bold': ['dark_red', 'dark_blue', 'dark_green'],
  'warm-amber': ['warm_amber', 'warm_coral'],
  'light-elegant': ['light_teal', 'light_blue', 'light_plum'],
};

export function getPalettesForVariant(variant: TemplateVariant): ColorPalette[] {
  const keys = VARIANT_PALETTE_MAP[variant] || [];
  return keys.map((k) => PALETTES[k]).filter(Boolean);
}

export function getGoogleFontsUrl(fonts: FontPair): string {
  const families = [fonts.display, fonts.body]
    .map((f) => f.replace(/\s+/g, '+'))
    .map((f) => `family=${f}:wght@400;500;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
