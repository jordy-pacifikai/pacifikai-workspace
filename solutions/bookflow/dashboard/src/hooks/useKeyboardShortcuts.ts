'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    function handler(e: KeyboardEvent) {
      // Skip if typing in input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Cmd+K / Ctrl+K → handled by useCommandPalette (command palette)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Let useCommandPalette handle it — don't intercept here
        return;
      }

      // Escape → close help
      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      // ? → toggle help modal
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      // g + key combos for navigation
      if (e.key === 'g') {
        gPressed = true;
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 500);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimeout);
        switch (e.key) {
          case 'h':
            router.push('/');
            break;
          case 'a':
            router.push('/appointments');
            break;
          case 'c':
            router.push('/conversations');
            break;
          case 's':
            router.push('/stats');
            break;
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimeout);
    };
  }, [router]);

  return { showHelp, setShowHelp };
}
