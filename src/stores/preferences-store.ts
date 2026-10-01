import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useThemeStore, type ThemeMode } from './theme-store';

export type OrgId = string;

/** Dashboard layout density — controls table/card compactness app-wide. */
export type DashboardDensity = 'comfortable' | 'compact';

/** Channel-level notification toggles. */
export interface NotificationPreferences {
  proposals: boolean;
  budgetAlerts: boolean;
  riskAlerts: boolean;
  weeklyDigest: boolean;
}

interface PreferencesState {
  /** Active organization for the workspace switcher. */
  activeOrgId: OrgId;
  /** Theme mode mirrored from the canonical theme store for quick reads. */
  themeMode: ThemeMode;
  /** UI density for tables and card grids. */
  density: DashboardDensity;
  /** Notification channel toggles. */
  notifications: NotificationPreferences;
  /** True once the persisted snapshot has rehydrated from localStorage. */
  hasHydrated: boolean;
  setActiveOrg: (id: OrgId) => void;
  /** Updates the canonical theme store and mirrors the mode here. */
  setThemeMode: (mode: ThemeMode) => void;
  setDensity: (density: DashboardDensity) => void;
  toggleNotification: (channel: keyof NotificationPreferences) => void;
  setHasHydrated: (value: boolean) => void;
}


export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      activeOrgId: 'org_nova',
      themeMode: 'light',
      density: 'comfortable',
      notifications: {
        proposals: true,
        budgetAlerts: true,
        riskAlerts: true,
        weeklyDigest: false,
      },
      hasHydrated: false,
      setActiveOrg: (id) => set({ activeOrgId: id }),
      setThemeMode: (mode) => {
        // Keep the canonical theme store in sync; the ThemeProvider applies
        // `data-theme` from there, so preferences only hold a mirror.
        useThemeStore.getState().setMode(mode);
        set({ themeMode: mode });
      },
      setDensity: (density) => set({ density }),
      toggleNotification: (channel) =>
        set((s) => ({
          notifications: { ...s.notifications, [channel]: !s.notifications[channel] },
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'astroid-preferences',
      version: 2,
      // Only user-facing preferences persist; hydration bookkeeping stays out.
      partialize: (state) => ({
        activeOrgId: state.activeOrgId,
        themeMode: state.themeMode,
        density: state.density,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
