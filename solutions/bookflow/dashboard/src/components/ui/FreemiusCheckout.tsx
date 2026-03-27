'use client';

// ─── FreemiusCheckout — Bouton d'achat via popup Freemius ───────────────────
// Charge le SDK @freemius/checkout de façon lazy (pas de SSR).
// Usage: <FreemiusCheckoutButton pricingId={57672} label="Essayer 14 jours" />

import { useCallback, useEffect, useRef } from 'react';
import type { Checkout } from '@freemius/checkout';

interface FreemiusCheckoutButtonProps {
  pricingId: number;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  userEmail?: string;
  trial?: boolean;
  onSuccess?: () => void;
}

// Singleton — on réutilise la même instance sur toute la page
let checkoutInstance: Checkout | null = null;
let sdkLoading = false;
const sdkCallbacks: Array<(instance: Checkout) => void> = [];

async function getCheckout(): Promise<Checkout> {
  if (checkoutInstance) return checkoutInstance;

  return new Promise((resolve) => {
    sdkCallbacks.push(resolve);
    if (sdkLoading) return;
    sdkLoading = true;

    import('@freemius/checkout').then(({ Checkout: CheckoutClass }) => {
      checkoutInstance = new CheckoutClass({
        product_id: Number(process.env.NEXT_PUBLIC_FREEMIUS_PRODUCT_ID ?? '26616'),
        public_key: process.env.NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY ?? 'pk_0b2518d9571f17af2139bbc31e43f',
      });
      sdkCallbacks.forEach((cb) => cb(checkoutInstance!));
      sdkCallbacks.length = 0;
    });
  });
}

export function FreemiusCheckoutButton({
  pricingId,
  label,
  className,
  style,
  userEmail,
  trial = true,
  onSuccess,
}: FreemiusCheckoutButtonProps) {
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  // Précharger le SDK dès que le composant monte
  useEffect(() => {
    getCheckout().catch(console.error);
  }, []);

  const handleClick = useCallback(async () => {
    const checkout = await getCheckout();
    checkout.open({
      pricing_id: pricingId,
      trial: trial ? 'free' : undefined,
      ...(userEmail ? { user: { email: userEmail } } : {}),
      success: () => {
        successRef.current?.();
      },
    });
  }, [pricingId, trial, userEmail]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={style}
    >
      {label}
    </button>
  );
}
