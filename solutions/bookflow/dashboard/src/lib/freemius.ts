// ─── Freemius SDK — serveur uniquement ──────────────────────────────────────
// Ne jamais importer ce fichier cote client ('use client').
// Credentials charges depuis les variables d'environnement.

import { Freemius } from '@freemius/sdk';

let _freemius: Freemius | null = null;

export function getFreemius(): Freemius {
  if (!_freemius) {
    _freemius = new Freemius({
      productId: process.env.FREEMIUS_PRODUCT_ID!,
      apiKey: process.env.FREEMIUS_API_KEY!,
      secretKey: process.env.FREEMIUS_SECRET_KEY!,
      publicKey: process.env.FREEMIUS_PUBLIC_KEY!,
    });
  }
  return _freemius;
}

// ─── Mapping plan interne → Freemius pricing IDs ─────────────────────────────

export const FREEMIUS_PRICING: Record<string, { planId: number; pricingId: number }> = {
  starter: { planId: 44081, pricingId: 57672 },
  pro: { planId: 44082, pricingId: 57674 },
  business: { planId: 44083, pricingId: 57676 },
};

// ─── Rang des plans pour comparaison upgrade/downgrade ───────────────────────

export const PLAN_RANK: Record<string, number> = {
  decouverte: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

export function isUpgrade(from: string, to: string): boolean {
  return (PLAN_RANK[to] ?? 0) > (PLAN_RANK[from] ?? 0);
}
