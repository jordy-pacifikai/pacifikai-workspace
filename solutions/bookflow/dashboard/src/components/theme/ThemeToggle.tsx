'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEMES = ['light', 'dark', 'system'] as const;

const ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Avoid hydration mismatch — render placeholder
    return <div className="w-8 h-8" />;
  }

  const cycle = () => {
    const idx = THEMES.indexOf(theme as (typeof THEMES)[number]);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
  };

  const Icon = ICONS[theme ?? 'dark'] ?? Moon;
  const label =
    theme === 'light' ? 'Clair' : theme === 'system' ? 'Systeme' : 'Sombre';

  return (
    <button
      onClick={cycle}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60 transition-all duration-200"
      title={`Theme : ${label}`}
      aria-label={`Changer le theme (actuel : ${label})`}
    >
      <Icon size={16} className="transition-transform duration-200" />
    </button>
  );
}
