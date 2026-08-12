import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  highContrast: boolean;
  reducedMotion: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleContrast: () => void;
  toggleReducedMotion: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      highContrast: false,
      reducedMotion: false,
      setMode: (mode) => set({ mode }),

      toggleContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: 'astroid-theme' },
  ),
);
