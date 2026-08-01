'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores';

/**
 * Applies theme state to the document root as data attributes consumed by the
 * token layer. Resolves `system` against the OS preference and keeps it live.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const highContrast = useThemeStore((s) => s.highContrast);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
      root.setAttribute('data-theme', resolved);
    };

    apply();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    if (mode === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
    return undefined;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-motion', reducedMotion ? 'reduced' : 'full');
  }, [reducedMotion]);

  return <>{children}</>;
}
